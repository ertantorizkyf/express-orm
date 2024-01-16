const Joi = require('joi');
const Boom = require('boom');

const blogListValidation = (data) => {
  const schema = Joi.object({
    offset: Joi.number().optional().description('Starting position in which data will be shown'),
    limit: Joi.number().optional().description('Number of data to be shown')
  });

  if (schema.validate(data).error) {
    throw Boom.badRequest(schema.validate(data).error);
  }
};

module.exports = {
  blogListValidation
};
