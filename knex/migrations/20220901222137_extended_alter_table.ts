import { Knex } from 'knex';
import { Battle, Monster } from '../../src/models';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable(Monster.tableName, (table: Knex.TableBuilder) => {
    table.string('name').notNullable();
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable(Monster.tableName, (table: Knex.TableBuilder) => {
    table.dropColumn('name');
  });
};
