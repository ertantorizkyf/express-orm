const Router = require('express').Router();

const Validation = require('../helpers/validationHelper');
const BlogHelper = require('../helpers/blogHelper');
const GeneralHelper = require('../helpers/generalHelper');

const fileName = 'server/api/blog.js';

const list = async (request, reply) => {
  try {
    Validation.blogListValidation(request.query);

    const { limit, offset } = request.query;
    const response = await BlogHelper.getBlogList({ limit, offset });
    
    return reply.send(response);
  } catch (err) {
    console.log([fileName, 'list', 'ERROR'], { info: `${err}` });
    return reply.send(GeneralHelper.errorResponse(err));
  }
}

Router.get('/list', list);

module.exports = Router;