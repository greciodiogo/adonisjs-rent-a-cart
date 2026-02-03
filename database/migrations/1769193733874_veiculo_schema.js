"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class VeiculoSchema extends Schema {
  up() {
    this.create("veiculos", (table) => {
      table.increments();
      table
        .integer("partner_id")
        .unsigned()
        .references("id")
        .inTable("partners")
        .onDelete("CASCADE");
      table.string("marca").notNullable();
      table.string("modelo").notNullable();
      table.integer("ano");
      table.string("matricula").unique();
      table.integer("kilometragem").defaultTo(0);
      table
        .enu("status", ["AVAILABLE", "RESERVED", "RENTED", "MAINTENANCE"])
        .defaultTo("AVAILABLE");
      table.timestamps();
    });
  }

  down() {
    this.drop("veiculos");
  }
}

module.exports = VeiculoSchema;
