'use strict'

const Database = use('Database')
const PartnerOrderRepository = use('App/Modules/Sales/Repositories/PartnerOrderRepository')
const PartnerOrderItemRepository = use('App/Modules/Sales/Repositories/PartnerOrderItemRepository')


class PartnerOrderFactory {
  async createFromOrder (order, trx) {
     
    const orderItems = await Database
      .table('order_items')
      .transacting(trx)
      .where('orderId', order.id)

    if (!orderItems.length) {
      throw new Error(`Order ${order.id} sem items`)
    }

    const itemsByPartner = {}

    for (const item of orderItems) {
      const partnerItem = await Database
        .table('products')
        .where('id', item.productId)
        .first()
        // .transacting(trx)

      if (!partnerItem) {
        throw new Error(`Produto ${item.productId} sem loja`)
      }

      const partnerId = partnerItem.partnerId

      itemsByPartner[partnerId] ||= []
      itemsByPartner[partnerId].push(item)
    }

    for (const partnerId in itemsByPartner) {
      const partnerItems = itemsByPartner[partnerId]

      const total = partnerItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      )

      const partnerOrder = await new PartnerOrderRepository().create({
        order_id: order.id,
        partner_id: partnerId,
        status: 'PENDING',
        total_amount: total
      })

      for (const item of partnerItems) {
        await new PartnerOrderItemRepository().create({
          partner_order_id: partnerOrder.id,
          order_item_id: item.id
        })
      }
    }
  }
}

module.exports = PartnerOrderFactory
