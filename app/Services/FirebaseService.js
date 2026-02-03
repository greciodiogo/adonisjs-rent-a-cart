'use strict'

const Firebase = require('../../config/firebase')
const PartnerService = use('App/Modules/Catalog/Services/PartnerService')
const UsersService = use('App/Modules/Authentication/Services/UsersService')
const Database = use("Database");



class FirebaseService {
  /**
   * Envia notificação quando um novo pedido é criado
   * Notifica tanto o cliente quanto os parceiros (partners)
   */
  async notifyNewOrder(order, orderItems) {
    try {
      // Buscar cliente usando Database em vez de Service (mais rápido)
      const customer = await Database.table('users').where('id', order.userId).first()
      if (!customer) {
        return
      }

      // Notificação para o cliente
      const customerNotification = {
        title: 'Pedido Confirmado',
        body: `Seu pedido #${order.id} foi recebido e está sendo preparado.`
      }

      const customerData = {
        type: 'new_order',
        orderId: order.id.toString(),
        orderStatus: order.status || 'PENDING'
      }

      await this.notifyUser(customer.id, customerNotification, customerData)

      // Otimizar: Buscar todos os partnerIds em uma única query
      if (orderItems && orderItems.length > 0) {
        const productIds = orderItems.map(item => item.product_id)
        
        // Uma única query para pegar todos os partners
        const partnerProducts = await Database
          .table('products')
          .whereIn('id', productIds)
          .distinct('partnerId')
          .select('partnerId')
        
        // Extrair partnerIds únicos
        const partnerIds = [...new Set(partnerProducts.map(p => p.partnerId).filter(id => id))]

        // Notificar para cada partner em paralelo
        await Promise.all(
          partnerIds.map(async (partnerId) => {
            try {
              const partnerNotification = {
                title: 'Novo Pedido',
                body: `Você recebeu um novo pedido #${order.id}`
              }

        const partnerData = {
          type: 'new_order_partner',
          orderId: order.id.toString(),
          customerId: order.userId.toString(),
          orderStatus: order.status || 'PENDING'
        }

        await this.notifyPartnerUsers(partnerId, partnerNotification, partnerData)
            } catch (error) {
              console.error(`Error notifying partner ${partnerId}:`, error.message)
            }
          })
        )
      }

    } catch (error) {
      console.error('Error sending order notifications:', error.message)
    }
  }

  /**
   * Envia notificação para um usuário específico
   */
  async notifyUser(userId, notification, data = {}) {
    try {
      const tokens = await Database.table('device_tokens').where('user_id', userId).where('is_active', true).select('token');
      
      if (!tokens || tokens.length === 0) {
        console.log(`No tokens found for user ${userId}`)
        return
      }

      const tokenList = tokens.map(t => t.token)
      
      if (tokenList.length === 1) {
        await Firebase.sendNotification(tokenList[0], notification, data)
      } else {
        await Firebase.sendMulticast(tokenList, notification, data)
      }
    } catch (error) {
      console.error('Error notifying user:', error.message)
    }
  }

  /**
   * Envia notificação para todos os usuários de uma loja
   */
  async notifyPartnerUsers(partnerId, notification, data = {}) {
    try {
      // Buscar todos os usuários que trabalham na loja
      const partnerUsers = await Database.table('partners').innerJoin('users', 'users.id', 'partners.userId')
        .where('partners.id', partnerId)
        .where('users.role', 'sales')
        .select('users.id')

      for (const user of partnerUsers) {
        await this.notifyUser(user.id, notification, data)
      }
    } catch (error) {
      console.error('Error notifying partner users:', error.message)
    }
  }

  /**
   * Notifica múltiplos usuários
   */
  async notifyUsers(userIds, notification, data = {}) {
    try {
      const tokens = await Database.table('device_tokens').whereIn('user_id', userIds).where('is_active', true).select('token');
      if (!tokens || tokens.length === 0) {
        console.log('No tokens found for users')
        return
      }

      const tokenList = tokens.map(t => t.token)
      await Firebase.sendMulticast(tokenList, notification, data)
    } catch (error) {
      console.error('Error notifying multiple users:', error.message)
    }
  }

  /**
   * Notifica via tópico (melhor para broadcast)
   */
  async notifyTopic(topic, notification, data = {}) {
    try {
      await Firebase.sendToTopic(topic, notification, data)
    } catch (error) {
      console.error('Error sending topic notification:', error.message)
    }
  }

  /**
   * Inscreve usuário em um tópico
   */
  async subscribeUserToTopic(userId, topic) {
    try {
      const tokens = await Database.table('device_tokens').where('user_id', userId).where('is_active', true).select('token');

      if (!tokens || tokens.length === 0) {
        console.log(`No tokens found for user ${userId}`)
        return
      }

      const tokenList = tokens.map(t => t.token)
      await Firebase.subscribeToTopic(tokenList, topic)
    } catch (error) {
      console.error('Error subscribing to topic:', error.message)
    }
  }

  /**
   * Remove inscrição de usuário de um tópico
   */
  async unsubscribeUserFromTopic(userId, topic) {
    try {
      const tokens = await Database.table('device_tokens').where('user_id', userId).where('is_active', true).select('token');

      if (!tokens || tokens.length === 0) {
        console.log(`No tokens found for user ${userId}`)
        return
      }

      const tokenList = tokens.map(t => t.token)
      await Firebase.unsubscribeFromTopic(tokenList, topic)
    } catch (error) {
      console.error('Error unsubscribing from topic:', error.message)
    }
  }

  /**
   * Notifica atualização de status do pedido
   */
  async notifyOrderStatusUpdate(order, newStatus, message) {
    try {
      const customer = await Database.table('users').where('id', order.userId).first();

      if (!customer) return

      const notification = {
        title: 'Atualização de Pedido',
        body: message || `Seu pedido #${order.id} foi atualizado para ${newStatus}`
      }

      const data = {
        type: 'order_status_update',
        orderId: order.id.toString(),
        orderStatus: newStatus
      }

      await this.notifyUser(customer.id, notification, data)
    } catch (error) {
      console.error('Error notifying order status update:', error.message)
    }
  }

  /**
   * Notifica cancellação de pedido
   */
  async notifyOrderCancelled(order, reason = '') {
    try {
      const customer = await new UsersService().findUsersById(order.userId)

      if (!customer) return

      const notification = {
        title: 'Pedido Cancelado',
        body: `Seu pedido #${order.id} foi cancelado. ${reason}`
      }

      const data = {
        type: 'order_cancelled',
        orderId: order.id.toString(),
        reason: reason
      }

      await this.notifyUser(customer.id, notification, data)
    } catch (error) {
      console.error('Error notifying order cancellation:', error.message)
    }
  }
}

module.exports = FirebaseService
