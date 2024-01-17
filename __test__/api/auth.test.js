const Request = require('supertest');
const _ = require('lodash');

const db = require('../../models');
const GeneralHelper = require('../../server/helpers/generalHelper');
const AuthPlugin = require('../../server/api/auth');
const MockUser = require('../fixtures/database/user.json');

let apiUrl;
let server;
let payload;
let mockUser;
let getUser;
let createUser;

describe('Auth', () => {
  beforeAll(() => {
    server = GeneralHelper.createTestServer('/', AuthPlugin);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Register', () => {
    beforeEach(() => {
      apiUrl = '/register';
      payload = { 
        name: 'Jane Doe',
        email: 'janedoe@acme.com',
        password: '12345678',
        confirmPassword: '12345678'
      };

      createUser = jest.spyOn(db.User, 'create');
    });

    test('Should Return 200: Register Success', async () => {
      createUser.mockResolvedValue('SUCCESS');
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });

    test('Should Return 400: Missing Required Payload', async () => {
      payload = {};
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
    });

    test('Should Return 400: Invalid Payload', async () => {
      payload.randomKey = 'randomVal';
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
    });

    test('Should Return 400: Confirm Password Mismatched', async () => {
      payload.confirmPassword = 'randomVal';
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
    });

    test('Should Return 500: Something Went Wrong with Database', async () => {
      createUser.mockRejectedValue('Something Went Wrong');

      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(500);
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      apiUrl = '/login';
      payload = { 
        email: 'janedoe@acme.com',
        password: '12345678'
      };

      mockUser = _.cloneDeep(MockUser);

      getUser = jest.spyOn(db.User, 'findOne');
    });

    test('Should Return 200: Login Success', async () => {
      getUser.mockResolvedValue(mockUser);
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });

    test('Should Return 400: Missing Required Payload', async () => {
      payload = {};
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
    });

    test('Should Return 400: Invalid Payload', async () => {
      payload.randomKey = 'randomVal';
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
    });

    test('Should Return 400: Wrong Password', async () => {
      payload.password = 'wrong_password';
      getUser.mockResolvedValue(mockUser);
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
    });

    test('Should Return 404: User Not Found', async () => {
      getUser.mockResolvedValue({});
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(404);
    });

    test('Should Return 500: Something Went Wrong with Database', async () => {
      getUser.mockRejectedValue('Something Went Wrong');

      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(500);
    });
  });
});