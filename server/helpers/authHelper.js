const Boom = require('boom');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const db = require('../../models');
const GeneralHelper = require('./generalHelper');

const fileName = 'server/helpers/authHelper.js';
const salt = bcrypt.genSaltSync(10);

const __hashPassword = (password) => bcrypt.hashSync(password, salt);

const __comparePassword = (payloadPass, dbPass) => bcrypt.compareSync(payloadPass, dbPass);

const registerUser = async (dataObject) => {
  const { name, email, password } = dataObject;

  try {
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
    
    return Promise.resolve(true);
  } catch (err) {
    console.log([fileName, 'login', 'ERROR'], { info: `${err}` });
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
}

module.exports = {
  registerUser,
  login
}