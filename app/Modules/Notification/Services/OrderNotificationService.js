'use strict'

const Notification = use('App/Modules/Notification/Models/Notification')
const User = use('App/Modules/Authentication/Models/User')
const Env = use('Env')

class OrderNotificationService {
  /**
   * Send new order notification to partner owner, admins and managers
   * @param {Object} order - The created order
   * @param {Object} trx - Database transaction
   */
  async sendNewOrderNotification(order, trx = null) {
    try {
      // Get partner owner
      const partnerOwner = await this._getPartnerOwner(order.partner_id)
      
      // Get all admins and managers
      const adminsAndManagers = await this._getAdminsAndManagers()
      
      // Combine all recipients
      const recipients = [partnerOwner, ...adminsAndManagers]
        .filter(user => user) // Remove null/undefined
        .filter((user, index, self) => 
          index === self.findIndex(u => u.id === user.id) // Remove duplicates
        )
      
      // Create notifications
      const notifications = recipients.map(user => ({
        user_id: user.id,
        title: 'Novo Pedido Recebido',
        message: `Novo pedido #${order.id} recebido no valor de ${order.total_amount} MZN`,
        type: 'new_order',
        metadata: JSON.stringify({
          order_id: order.id,
          partner_id: order.partner_id,
          amount: order.total_amount
        })
      }))
      
      // Save notifications in bulk
      await Notification.createMany(notifications, trx)
      
      // Here you could add real-time notification logic (e.g., WebSocket, push notification)
      // this._sendRealTimeNotification(notifications)
      
      return notifications
    } catch (error) {
      console.error('Error sending order notification:', error)
      // Don't throw to avoid breaking the order creation flow
      return []
    }
  }
  
  /**
   * Get partner owner by partner ID
   * @private
   */
  async _getPartnerOwner(partnerId) {
    const partner = await Database
      .from('partners')
      .where('id', partnerId)
      .first()
      
    if (!partner) return null
    
    return Database
      .from('users')
      .where('id', partner.user_id)
      .first()
  }
  
  /**
   * Get all users with admin or manager role
   * @private
   */
  async _getAdminsAndManagers() {
    return Database
      .select('users.*')
      .from('users')
      .whereIn('role', ['admin', 'manager'])
  }
  
  /**
   * Send real-time notification (WebSocket example)
   * @private
   */
  // async _sendRealTimeNotification(notifications) {
  //   const io = use('Socket')
  //   notifications.forEach(notification => {
  //     io.to(`user:${notification.user_id}`).emit('new_notification', notification)
  //   })
  // }
}

module.exports = OrderNotificationService
