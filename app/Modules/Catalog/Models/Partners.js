'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Partners extends Model {
  static boot() {
    super.boot();
    this.addTrait("@provider:Auditable");
  }

  products() {
    return this.hasMany('App/Modules/Catalog/Models/Product', 'partnerId', 'id')
  }

  static get table () {
    return 'partners'
  }
}

module.exports = Partners
