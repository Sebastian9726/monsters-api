import { Id, RelationMappings } from 'objection';
import Base from './base';
import { Monster } from './monster.extended.model';

export class Battle extends Base {
  id!: Id;
  monsterA!: number;
  monsterB!: number;
  winner!: number;

  static tableName = 'battle';

  static get relationMappings(): RelationMappings {
    return {
      monsterARelation: {
        relation: Base.BelongsToOneRelation,
        modelClass: Monster,
        join: {
          from: `${Battle.tableName}.monsterA`,
          to: `${Monster.tableName}.id`
        }
      },
      monsterBRelation: {
        relation: Base.BelongsToOneRelation,
        modelClass: Monster,
        join: {
          from: `${Battle.tableName}.monsterB`,
          to: `${Monster.tableName}.id`
        }
      },
      winnerRelation: {
        relation: Base.BelongsToOneRelation,
        modelClass: Monster,
        join: {
          from: `${Battle.tableName}.winner`,
          to: `${Monster.tableName}.id`
        }
      }
    };
  }
}
