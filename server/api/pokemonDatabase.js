const Router = require('express').Router();

const Validation = require('../helpers/validationHelper');
const PokemonHelper = require('../helpers/pokemonHelper');
const GeneralHelper = require('../helpers/generalHelper');

const fileName = 'server/api/pokemonDatabase.js';

const listPokemon = async (request, reply) => {
  try {
    Validation.pokemonListDatabaseValidation(request.query);

    const { name } = request.query;
    const response = await PokemonHelper.getPokemonListDatabase({ name });
    
    return reply.send(response);
  } catch (err) {
    console.log([fileName, 'listPokemon', 'ERROR'], { info: `${err}` });
    return reply.send(GeneralHelper.errorResponse(err));
  }
}

const addPokemon = async (request, reply) => {
  try {
    Validation.pokemonAddDatabaseValidation(request.body);

    const { name, url } = request.body;
    const response = await PokemonHelper.addPokemonDatabase({ name, url });

    return reply.send(response);
  } catch (err) {
    console.log([fileName, 'addPokemon', 'ERROR'], { info: `${err}` });
    return reply.send(GeneralHelper.errorResponse(err));
  }
}

Router.get('/list', listPokemon);
Router.post('/add', addPokemon);

module.exports = Router;