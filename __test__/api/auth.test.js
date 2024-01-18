const Request = require('supertest');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const db = require('../../models');
const GeneralHelper = require('../../server/helpers/generalHelper');
const AuthPlugin = require('../../server/api/auth');
const MockUser = require('../fixtures/database/user.json');

let apiUrl;
let server;
let payload;
let header;
let mockUser;
let getUser;
let createUser;
let jwtVerify;
let mockJsonWebTokenData;

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
        email: 'janedoe@gmail.com',
        password: '12345678',
        confirmPassword: '12345678'
      };

      mockUser = _.cloneDeep(MockUser);

      getUser = jest.spyOn(db.User, 'findOne');
      createUser = jest.spyOn(db.User, 'create');
    });

    test('Should Return 200: Register Success', async () => {
      getUser.mockResolvedValue({});
      createUser.mockResolvedValue('SUCCESS');
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeTruthy();
        });
    });

    test('Should Return 400: Email Already Exists', async () => {
      payload.email = 'janedoe@acme.com';
      getUser.mockResolvedValue(mockUser);
      createUser.mockResolvedValue('SUCCESS');
      
      await Request(server)
        .post(apiUrl)
        .send(payload)
        .expect(400);
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
          expect(!_.isEmpty(res.body)).toBeTruthy();
          expect(!_.isEmpty(res.body.token)).toBeTruthy();
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

  describe('JWT Middleware', () => {
    beforeEach(() => {
      apiUrl = '/hello';
      header = {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmFuZSBEb2UiLCJwYXNzd29yZCI6IiQyYSQxMCRtR2Y2dTZXYkpUZFNCbzZHQ1FOOC9lTG5SQWlTc2ZMZXNsVnN1aWZtbS53akVBcWZZTzI3aSIsImlhdCI6MTcwNTQ3NzQ0MywiZXhwIjoxNzA1NTYzODQzfQ.MKSb_hkLJxmIvpI-bLc3vJQIVNAcnxtzRmKTzHXZTUg'
      }

      mockJsonWebTokenData = {
        name: "Jane Doe",
        password: "$2a$10$mGf6u6WbJTdSBo6GCQN8/eLnRAiSsfLeslVsuifmm.wjEAqfYO27i",
        iat: 1705477443,
        exp: 4070908800
      };

      jwtVerify = jest.spyOn(jwt, 'verify');
      jwtVerify.mockImplementation(() => mockJsonWebTokenData);
    });

    test('Should Return 200: JWT Verify Sucess', async () => {
      await Request(server)
        .get(apiUrl)
        .set(header)
        .expect(200);
    });

    test('Should Return 401: JWT Does Not Contain Expiry Epoch', async () => {
      delete mockJsonWebTokenData.exp;
      jwtVerify.mockImplementation(() => mockJsonWebTokenData);

      await Request(server)
        .get(apiUrl)
        .set(header)
        .expect(401);
    });

    test('Should Return 401: JWT Expired', async () => {
      mockJsonWebTokenData.exp = 946684800;
      jwtVerify.mockImplementation(() => mockJsonWebTokenData);

      await Request(server)
        .get(apiUrl)
        .set(header)
        .expect(401);
    });

    test('Should Return 401: JWT Empty', async () => {
      mockJsonWebTokenData = {};
      jwtVerify.mockImplementation(() => mockJsonWebTokenData);

      await Request(server)
        .get(apiUrl)
        .set(header)
        .expect(401);
    });

    test('Should Return 401: JWT Empty', async () => {
      mockJsonWebTokenData = {};
      jwtVerify.mockImplementation(() => mockJsonWebTokenData);

      await Request(server)
        .get(apiUrl)
        .set(header)
        .expect(401);
    });

    test('Should Return 401: Invalid JWT Secret', async () => {
      header.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      jwtVerify.mockImplementation(() => new Error('Invalid Secret'));

      await Request(server)
        .get(apiUrl)
        .set(header)
        .expect(401);
    });

    test('Should Return 401: Malformed Token', async () => {
      header.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      jwtVerify.mockImplementation(() => new Error('Malformed Token'));

      await Request(server)
        .get(apiUrl)
        .set(header)
        .expect(401);
    });

    test('Should Return 401: Header Not Sent', async () => {
      await Request(server)
        .get(apiUrl)
        .expect(401);
    });
  });
});