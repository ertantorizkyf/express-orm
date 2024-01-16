const Request = require('supertest');
const QS = require('qs');
const _ = require('lodash');

const GeneralHelper = require('../../server/helpers/generalHelper');
const DatabaseService = require('../../server/services/database');
const PokemonDatabasePlugin = require('../../server/api/pokemonDatabase');
const MockDatabaseList = require('../fixtures/database/pokemonList.json');
const MockDatabaseDetail = require('../fixtures/database/pokemonDetail.json');

let apiUrl;
let server;
let payload;
let query;
let mockDatabaseList;
let mockDatabaseDetail;
let mockDatabaseAdd;
let getAllPokemonDB;
let getPokemonByNameDB;
let addPokemonDB;

describe('Pokemon Database', () => {
  beforeAll(() => {
    server = GeneralHelper.createTestServer('/pokemon-database', PokemonDatabasePlugin);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('List', () => {
    beforeEach(() => {
      apiUrl = '/pokemon-database/list';
      query = { 
        name: "bulbasaur"
      };

      mockDatabaseList = _.cloneDeep(MockDatabaseList);
      mockDatabaseDetail = _.cloneDeep(MockDatabaseDetail);

      getAllPokemonDB = jest.spyOn(DatabaseService, 'getAllPokemon');
      getPokemonByNameDB = jest.spyOn(DatabaseService, 'getPokemonByName');
    });

    test('Should Return 200: Get Pokemon List from Database', async () => {
      getAllPokemonDB.mockResolvedValue(mockDatabaseList);

      await Request(server)
        .get(apiUrl)
        .expect(200)
        .then((res) => {
          expect(!_.isEmpty(res.body)).toBeTruthy();
          expect(res.body.length).toBeGreaterThan(0);
          const bulbasaur = _.find(res.body, (item) => item.name.toLowerCase() === 'bulbasaur');
          expect(!_.isEmpty(bulbasaur)).toBeTruthy();
        });
    });

    test('Should Return 200: Get Pokemon Detail from Database with Matching Result', async () => {
      getPokemonByNameDB.mockResolvedValue(mockDatabaseDetail);

      await Request(server)
        .get(`${apiUrl}?${QS.stringify(query)}`)
        .expect(200)
        .then((res) => {
          expect(!_.isEmpty(res.body)).toBeTruthy();
          expect(res.body.length).toBe(1);
          const bulbasaur = _.find(res.body, (item) => item.name.toLowerCase() === 'bulbasaur');
          expect(!_.isEmpty(bulbasaur)).toBeTruthy();
        });
    });

    test('Should Return 200: Get Pokemon Detail from Database without Matching Result', async () => {
      getPokemonByNameDB.mockResolvedValue([]);

      await Request(server)
        .get(`${apiUrl}?${QS.stringify(query)}`)
        .expect(200)
        .then((res) => {
          expect(_.isEmpty(res.body)).toBeTruthy();
        });
    });

    test('Should Return 400: Invalid Database Query Param', async () => {
      query = {
        randomKey: 'randomVal'
      };

      await Request(server)
        .get(`${apiUrl}?${QS.stringify(query)}`)
        .expect(400);
    });

    test('Should Return 500: Something Went Wrong with Database', async () => {
      getAllPokemonDB.mockRejectedValue('Something Went Wrong');

      await Request(server)
        .get(apiUrl)
        .expect(500);
    });
  });

  describe('Add', () => {
    beforeEach(() => {
      apiUrl = '/pokemon-database/add';
      payload = { 
        name: "charmander",
        url: 'https://pokeapi.co/api/v2/pokemon/4/'
      };

      mockDatabaseAdd = 'SUCCESS';
      
      addPokemonDB = jest.spyOn(DatabaseService, 'addPokemon');
    });

    test('Should Return 200: Add Pokemon to Database', async () => {
      addPokemonDB.mockResolvedValue(mockDatabaseAdd);

      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });

    test('Should Return 400: Invalid Database Payload', async () => {
      payload = {
        randomKey: 'randomVal'
      };

      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
    });

    test('Should Return 500: Something Went Wrong with Database', async () => {
      addPokemonDB.mockRejectedValue('Something Went Wrong');

      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(500);
    });
  });
});