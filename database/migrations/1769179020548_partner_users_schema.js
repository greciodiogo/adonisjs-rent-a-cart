"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class PartnerUsersSchema extends Schema {
  up() {
    this.create("partner_users", (table) => {
      table.increments();
      table
        .integer("partner_id")
        .unsigned()
        .references("id")
        .inTable("partners")
        .onDelete("CASCADE");
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .enu("role", ["OWNER", "MANAGER", "OPERATOR", "FINANCE", "SUPPORT"])
        .notNullable();

      table.boolean("is_active").defaultTo(true);
      table.timestamps();
      table.unique(["partner_id", "user_id"]);
    });
  }

  down() {
    this.drop("partner_users");
  }
}

module.exports = PartnerUsersSchema;
