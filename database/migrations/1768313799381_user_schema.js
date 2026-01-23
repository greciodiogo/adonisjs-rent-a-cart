'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('username', 80).unique()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.boolean('is_actived').notNullable().defaultTo(true).after("default_payment");
      table.boolean('is_logged').defaultTo(0).nullable().after("is_actived")
      table.boolean('is_deleted').notNullable().defaultTo(false).after("is_logged");
      table
        .enu('role', ['ADMIN', 'PARTNER', 'MANAGER', 'CUSTOMER'])
        .notNullable()
        .defaultTo('CUSTOMER')
      table.string("telefone", 255).nullable().after('password')
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
