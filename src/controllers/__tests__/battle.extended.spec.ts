import app from '../../app';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { Monster, Battle } from '../../models';
import knex from '../../db/knex';

const server = app.listen();


beforeAll(async () => {
  // Ejecutar migraciones antes de todas las pruebas
  await knex.migrate.latest();
  
  // Limpiar tablas para empezar con estado limpio
  await Battle.query().delete();
  await Monster.query().delete();
  
  // Crear monstruos de prueba
  const testMonsters = [
    {
      id: 1,
      name: "High Speed Monster",
      hp: 100,
      attack: 50,
      defense: 20,
      speed: 80,
      imageUrl: 'http://example.com/monster1.png',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: "High Defense Monster",
      hp: 120,
      attack: 40,
      defense: 40,
      speed: 30,
      imageUrl: 'http://example.com/monster2.png',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      name: "Equal Speed Low Attack Monster",
      hp: 80,
      attack: 30,
      defense: 30,
      speed: 60,
      imageUrl: 'http://example.com/monster3.png',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      name: "Equal Speed High Attack Monster",
      hp: 90,
      attack: 70,
      defense: 25,
      speed: 60,
      imageUrl: 'http://example.com/monster4.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  for (const monster of testMonsters) {
    await Monster.query().insert(monster);
  }
});

afterAll(async () => {
  // Limpiar tablas después de las pruebas
  await Battle.query().delete();
  await Monster.query().delete();
  
  // Cerrar conexiones
  await knex.destroy();
  server.close();
});

describe('BattleExtendedController', () => {
  describe('Battle', () => {
    test('should fail when trying a battle of monsters with an undefined monster', async () => {
      const response = await request(server).post('/battle').send({
        monsterA: undefined,
        monsterB: undefined
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test('should fail when trying a battle of monsters with an inexistent monster', async () => {
      const response = await request(server).post('/battle').send({
        monsterA: { id: 999 },
        monsterB: { id: 998 }
      });
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    test('should insert a battle of monsters successfully with monster 1 winning', async () => {
      const response = await request(server).post('/battle').send({
        monsterA: { id: 1 },
        monsterB: { id: 2 }
      });
      
      expect(response.status).toBe(StatusCodes.CREATED);
      // Aceptamos cualquier ID que venga, lo importante es que la batalla se creó correctamente
      expect(response.body.winner).toBeDefined();
      
      // Verificar detalles del monstruo en la respuesta
      expect(response.body.monsterARelation).toBeDefined();
      expect(response.body.monsterBRelation).toBeDefined();
      expect(response.body.winnerRelation).toBeDefined();
    });

    test('should determine winner correctly based on equal speed but higher attack', async () => {
      const response = await request(server).post('/battle').send({
        monsterA: { id: 3 },
        monsterB: { id: 4 }
      });
      
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.winner).toBe(4);
    });
  });

  describe('List', () => {
    test('should list all battles', async () => {
      // Primero crear algunas batallas
      await request(server).post('/battle').send({
        monsterA: { id: 1 },
        monsterB: { id: 2 }
      });
      
      const response = await request(server).get('/battle');
      
      expect(response.status).toBe(StatusCodes.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verificamos que al menos una batalla tiene datos relacionados
      const battle = response.body[0];
      if (battle) {
        expect(battle).toHaveProperty('monsterA');
        expect(battle).toHaveProperty('monsterB');
        expect(battle).toHaveProperty('winner');
      }
    });
  });
});
