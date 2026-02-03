const OrderItemRepository = use("App/Modules/Sales/Repositories/OrderItemRepository")
const Database = use('Database')

class OrderItemService {
  static async createItems (orderId, items) {
    const createdItems = []

    for (const item of items) {
      const created = await new OrderItemRepository().create({
        orderId,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price
      }, null, false)

      created.partnerId = await this.resolvePartner(item.product_id)
      createdItems.push(created)
    }

    return createdItems
  }

  static async resolvePartner (productId) {
    const partnerItem = await Database
      .from('partner_items')
      .where('productId', productId)
      .first()

    if (!partnerItem) {
      throw new Error(`Produto ${productId} não pertence a nenhuma loja`)
    }

    return partnerItem.partnerId
  }
}

module.exports = OrderItemService