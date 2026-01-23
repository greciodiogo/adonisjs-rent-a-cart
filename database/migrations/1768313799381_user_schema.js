'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table
        .enu('role', ['ADMIN', 'PARTNER', 'MANAGER', 'CUSTOMER'])
        .notNullable()
        .defaultTo('CUSTOMER')
      table.string("default_phone", 255).nullable().after('password')
      table.string("default_address", 255).nullable().after('password')
      table.string("default_city", 255).nullable().after('password')
      table.string("default_payment", 255).nullable().after('password')

      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
