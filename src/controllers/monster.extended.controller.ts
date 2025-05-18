import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Monster } from '../models/monster.extended.model';
import { Battle } from '../models/battle.extended.model';

export const list = async (req: Request, res: Response): Promise<Response> => {
  try {
    const monsters = await Monster.query();
    const monsterIds = monsters.map((m) => String(m.id)).join(',');
    
    // Use raw query with SQL IN clause to avoid type issues
    const battles = await Battle.query()
      .whereRaw(`"monsterA" IN (${monsterIds})`)
      .orWhereRaw(`"monsterB" IN (${monsterIds})`)
      .orWhereRaw(`"winner" IN (${monsterIds})`);

    const monstersWithBattles = monsters.map((monster) => {
      const relatedBattles = battles.filter(
        (b) =>
          String(b.monsterA) === String(monster.id) ||
          String(b.monsterB) === String(monster.id) ||
          String(b.winner) === String(monster.id)
      );

      return {
        ...monster,
        battles: relatedBattles,
      };
    });

    return res.status(StatusCodes.OK).json(monstersWithBattles);
  } catch (error) {
    console.error('Error fetching monsters:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch monsters' });
  }
};

export const MonsterExtendedController = {
  list,
};
