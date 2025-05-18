import { Knex } from 'knex';
import { Battle, Monster } from '../../src/models';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable(Battle.tableName, (table) => {
    table
      .foreign('monsterA')
      .references('id')
      .inTable(Monster.tableName)
      .onDelete('CASCADE');

    table
      .foreign('monsterB')
      .references('id')
      .inTable(Monster.tableName)
      .onDelete('CASCADE');

    table
      .foreign('winner')
      .references('id')
      .inTable(Monster.tableName)
      .onDelete('SET NULL');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable(Battle.tableName, (table) => {
    table.dropForeign(['monsterA']);
    table.dropForeign(['monsterB']);
    table.dropForeign(['winner']);
  });
};
