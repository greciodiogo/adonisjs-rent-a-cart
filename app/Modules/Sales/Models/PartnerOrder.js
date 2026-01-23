'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PartnerOrder extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

  orderItems() {
    return this.hasMany('App/Modules/Sales/Models/PartnerOrderItem', 'partner_order_id', 'id')
  }

  static get table () {
    return 'partner_orders'
  }

}

module.exports = PartnerOrder
