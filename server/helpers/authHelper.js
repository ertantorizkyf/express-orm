const Boom = require('boom');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const db = require('../../models');
const GeneralHelper = require('./generalHelper');

const jwtSecretToken = process.env.JWT_SECRET_TOKEN || 'super_strong_key';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
const fileName = 'server/helpers/authHelper.js';
const salt = bcrypt.genSaltSync(10);

// eslint-disable-next-line arrow-body-style
const __hashPassword = (password) => {
  return bcrypt.hashSync(password, salt);
}

// eslint-disable-next-line arrow-body-style
const __comparePassword = (payloadPass, dbPass) => {
  return bcrypt.compareSync(payloadPass, dbPass);
}

// eslint-disable-next-line arrow-body-style
const __generateToken = (data) => {
  return jwt.sign(data, jwtSecretToken, { expiresIn: jwtExpiresIn });
}

const registerUser = async (dataObject) => {
  const { name, email, password } = dataObject;

  try {
    const user = await db.User.findOne({
      where: { email }
    });
    if (!_.isEmpty(user)) {
      return Promise.reject(Boom.badRequest('EMAIL_HAS_BEEN_USED'));
    }

    const hashedPass = __hashPassword(password)
    await db.User.create({ name, email, password: hashedPass });
    
    return Promise.resolve(true);
  } catch (err) {
    console.log([fileName, 'registerUser', 'ERROR'], { info: `${err}` });
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
}

const login = async (dataObject) => {
  const { email, password } = dataObject;

  try {
    const user = await db.User.findOne({
      where: { email }
    });
    if (_.isEmpty(user)) {
      return Promise.reject(Boom.notFound('USER_NOT_FOUND'));
    }
    
    const isPassMatched = __comparePassword(password, user.password)
    if(!isPassMatched) {
      return Promise.reject(Boom.badRequest('WRONG_CREDENTIALS'));
    }

    const token = __generateToken({
      name: user.name,
      password: user.password
    });
    
    return Promise.resolve({ token });
  } catch (err) {
    console.log([fileName, 'login', 'ERROR'], { info: `${err}` });
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
}

module.exports = {
  registerUser,
  login
}