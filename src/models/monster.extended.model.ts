import { Id, RelationMappings, ref } from 'objection';
import Base from './base';
import { Battle } from './battle.extended.model';

export class Monster extends Base {
  id!: Id;
  name!: string;
  attack!: number;
  defense!: number;
  hp!: number;
  speed!: number;
  imageUrl!: string;
  battles?: Battle[];

  static tableName = 'monster';

  static get relationMappings(): RelationMappings {
    return {
      // Relación que combina todas las batallas donde participó el monstruo
      battles: {
        relation: Base.HasManyRelation,
        modelClass: Battle,
        join: {
          from: `${Monster.tableName}.id`,
          to: `${Battle.tableName}.monsterA`
        },
        filter: (qb) => {
          qb.orWhere(`${Battle.tableName}.monsterB`, ref(`${Monster.tableName}.id`))
            .orWhere(`${Battle.tableName}.winner`, ref(`${Monster.tableName}.id`));
        }
      }
    };
  }
}
