'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PartnersSchema extends Schema {
  up () {
    this.create('partners', (table) => {
      table.increments()
      table.string('company_name').notNullable()
      table.string('nif')
      table.string('contact_phone')
      table.string('address')
      table.timestamps()
    })
  }

  down () {
    this.drop('partners')
  }
}

module.exports = PartnersSchema
