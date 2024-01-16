const Joi = require('joi');
const Boom = require('boom');

const pokemonListDatabaseValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().optional().description('Pokemon name; i.e. Bulbasaur')
  });

  if (schema.validate(data).error) {
    throw Boom.badRequest(schema.validate(data).error);
  }
};

const pokemonAddDatabaseValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().description('Pokemon name; i.e. Bulbasaur'),
    url: Joi.string().required().description('https://pokeapi.co/api/v2/pokemon/4')
  });

  if (schema.validate(data).error) {
    throw Boom.badRequest(schema.validate(data).error);
  }
};

module.exports = {
  pokemonListDatabaseValidation,
  pokemonAddDatabaseValidation
};
