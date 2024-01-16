const Request = require('supertest');
const QS = require('qs');
const _ = require('lodash');

const db = require('../../models');
const GeneralHelper = require('../../server/helpers/generalHelper');
const BlogPlugin = require('../../server/api/blog');
const MockBlogWithAssocList = require('../fixtures/database/blogsWithAssoc.json');

let apiUrl;
let server;
let query;
let mockBlogWithAssocList;
let getBlogList

describe('Blog', () => {
  beforeAll(() => {
    server = GeneralHelper.createTestServer('/blog', BlogPlugin);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('List', () => {
    beforeEach(() => {
      apiUrl = '/blog/list';
      query = { 
        offset: 0,
        limit: 20
      };

      mockBlogWithAssocList = _.cloneDeep(MockBlogWithAssocList);

      getBlogList = jest.spyOn(db.Blog, 'findAll');
    });

    test('Should Return 200: Get Blog List with Query Param', async () => {
      getBlogList.mockResolvedValue(mockBlogWithAssocList);
      
      await Request(server)
        .get(`${apiUrl}?${QS.stringify(query)}`)
        .expect(200)
        .then((res) => {
          expect(!_.isEmpty(res.body)).toBeTruthy();
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    test('Should Return 200: Get Blog List without Query Param', async () => {
      getBlogList.mockResolvedValue(mockBlogWithAssocList);
      
      await Request(server)
        .get(apiUrl)
        .expect(200)
        .then((res) => {
          expect(!_.isEmpty(res.body)).toBeTruthy();
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    test('Should Return 400: Invalid Query Param', async () => {
      query = {
        randomKey: 'randomVal'
      };

      await Request(server)
        .get(`${apiUrl}?${QS.stringify(query)}`)
        .expect(400);
    });

    test('Should Return 500: Something Went Wrong with Database', async () => {
      getBlogList.mockRejectedValue('Something Went Wrong');

      await Request(server)
        .get(`${apiUrl}?${QS.stringify(query)}`)
        .expect(500);
    });
  });
});