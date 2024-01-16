const _ = require('lodash');

const GeneralHelper = require('./generalHelper');
const DatabaseService = require('../services/database');

const fileName = 'server/helpers/pokemonHelper.js';

const getPokemonListDatabase = async (dataObject) => {
  const { name } = dataObject;

  try {
    let pokemon;
    if (!_.isEmpty(name)) {
      pokemon = await DatabaseService.getPokemonByName({ name });
    } else {
      pokemon = await DatabaseService.getAllPokemon();
    }

    return Promise.resolve(pokemon);
  } catch (err) {
    console.log([fileName, 'getPokemonListDatabase', 'ERROR'], { info: `${err}` });
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
}

const addPokemonDatabase = async (dataObject) => {
  const { name, url } = dataObject;

  try {
    await DatabaseService.addPokemon({ name, url });

    return Promise.resolve(true);
  } catch (err) {
    console.log([fileName, 'addPokemonDatabase', 'ERROR'], { info: `${err}` });
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
}

module.exports = {
  getPokemonListDatabase,
  addPokemonDatabase
}