import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Battle, Monster } from '../models';
import { PartialModelObject } from 'objection';

const create = async (req: Request, res: Response): Promise<Response> => {
  const { monster1Id, monster2Id } = req.body;

  // Check if monsters are provided
  if (!monster1Id || !monster2Id) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: 'Both monsters must be defined',
    });
  }
  const monsterARecord = await Monster.query().findById(monster1Id);
  const monsterBRecord = await Monster.query().findById(monster2Id);

  if (!monsterARecord || !monsterBRecord) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: 'One or both monsters do not exist',
    });
  }
  //shallow copy
  const monsterAData = {
    id: monsterARecord.id,
    hp: monsterARecord.hp,
    attack: monsterARecord.attack,
    defense: monsterARecord.defense,
    speed: monsterARecord.speed,
    name: monsterARecord.name,
  };

  const monsterBData = {
    id: monsterBRecord.id,
    hp: monsterBRecord.hp,
    attack: monsterBRecord.attack,
    defense: monsterBRecord.defense,
    speed: monsterBRecord.speed,
    name: monsterBRecord.name,
  };

  let firstAttacker, secondAttacker;
  if (monsterAData.speed > monsterBData.speed) {
    firstAttacker = monsterAData;
    secondAttacker = monsterBData;
  } else if (monsterBData.speed > monsterAData.speed) {
    firstAttacker = monsterBData;
    secondAttacker = monsterAData;
  } else {
    // Equal speed, check attack
    if (monsterAData.attack >= monsterBData.attack) {
      firstAttacker = monsterAData;
      secondAttacker = monsterBData;
    } else {
      firstAttacker = monsterBData;
      secondAttacker = monsterAData;
    }
  }

  // Make copies for the battle simulation
  const monsterACopy = { ...monsterAData };
  const monsterBCopy = { ...monsterBData };

  // Battle simulation
  let currentAttacker =
    firstAttacker === monsterAData ? monsterACopy : monsterBCopy;
  let currentDefender =
    currentAttacker === monsterACopy ? monsterBCopy : monsterACopy;

  // Battle until one monster's HP reaches 0
  while (monsterACopy.hp > 0 && monsterBCopy.hp > 0) {
    // Calculate damage (attack - defense, minimum 1)
    const damage = Math.max(
      1,
      currentAttacker.attack - currentDefender.defense
    );

    // Apply damage
    currentDefender.hp -= damage;

    // Switch roles for next turn
    const temp = currentAttacker;
    currentAttacker = currentDefender;
    currentDefender = temp;
  }

  // Ensure HP doesn't go below 0
  monsterACopy.hp = Math.max(0, monsterACopy.hp);
  monsterBCopy.hp = Math.max(0, monsterBCopy.hp);

  // Determine the winner
  const winnerId = monsterACopy.hp > 0 ? monsterAData.id : monsterBData.id;

  try {
    // Create a timestamp for created_at and updated_at
    const now = new Date();

    // Create the battle record with explicit type casting
    const battleData: { [key: string]: any } = {
      monsterA: monsterAData.id,
      monsterB: monsterBData.id,
      winner: winnerId,
      createdAt: now,
      updatedAt: now,
    };

    await Battle.query().insert(
      battleData as unknown as PartialModelObject<Battle>
    );

    const response = {
      winner: winnerId === monsterAData.id ? monsterAData : monsterBData,
      isTie: monsterACopy.hp === 0 && monsterBCopy.hp === 0,
    };

    return res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    console.error('Error creating battle:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create battle',
    });
  }
};

export const BattleExtendedController = {
  create,
};
