const Router = require('express').Router();

const Middleware = require('../middlewares/authMiddleware');
const Validation = require('../helpers/validationHelper');
const AuthHelper = require('../helpers/authHelper');
const GeneralHelper = require('../helpers/generalHelper');

const fileName = 'server/api/auth.js';

const register = async (request, reply) => {
  try {
    Validation.registerValidation(request.body);

    const { name, email, password } = request.body;
    const response = await AuthHelper.registerUser({ name, email, password });
    
    return reply.send(response);
  } catch (err) {
    console.log([fileName, 'register', 'ERROR'], { info: `${err}` });
    return reply.send(GeneralHelper.errorResponse(err));
  }
}

const login = async (request, reply) => {
  try {
    Validation.loginValidation(request.body);

    const { email, password } = request.body;
    const response = await AuthHelper.login({ email, password });
    
    return reply.send(response);
  } catch (err) {
    console.log([fileName, 'login', 'ERROR'], { info: `${err}` });
    return reply.send(GeneralHelper.errorResponse(err));
  }
}

// eslint-disable-next-line arrow-body-style
const hello = async (request, reply) => {
  // SAMPLE API WITH JWT MIDDLEWARE 
  return reply.send('HELLO');
}

Router.post('/register', register);
Router.post('/login', login);
Router.get('/hello', Middleware.validateToken, hello);

module.exports = Router;