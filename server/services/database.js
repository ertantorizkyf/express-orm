const _ = require('lodash');
const MySQL = require('promise-mysql2');

const fileName = 'server/services/database.js';
const POKEMON_TABLE = 'pokemon';

const ConnectionPool = MySQL.createPool({
  host: process.env.MYSQL_CONFIG_HOST,
  user: process.env.MYSQL_CONFIG_USER,
  password: process.env.MYSQL_CONFIG_PASSWORD,
  database: process.env.MYSQL_CONFIG_DATABASE,
  port: process.env.MYSQL_CONFIG_PORT,
  connectionLimit: process.env.MYSQL_CONFIG_CONNECTION_LIMIT
});

/*
 * PRIVATE FUNCTION
 */
const __constructQueryResult = (query) => {
  const result = [];
  if (!_.isEmpty(query[0])) {
    query[0].forEach((item) => {
      const key = Object.keys(item);

      // Reconstruct query result
      const object = {};
      key.forEach((data) => {
        object[data] = item[data];
      });

      result.push(object);
    });
  }

  return result;
};

/*
 * PUBLIC FUNCTION
 */

const getAllPokemon = async () => {
  try {
    const timeStart = process.hrtime();
    const poolConnection = await ConnectionPool.getConnection();
    const query = await poolConnection.query(
      `SELECT * FROM ${POKEMON_TABLE};`
    );
    await poolConnection.connection.release();
    const result = __constructQueryResult(query);

    const timeDiff = process.hrtime(timeStart);
    const timeTaken = Math.round((timeDiff[0] * 1e9 + timeDiff[1]) / 1e6);

    console.log([fileName, 'Get All Pokemon', 'INFO'], {
      message: { timeTaken }
    });

    return Promise.resolve(result);
  } catch (err) {
    console.log([fileName, 'Get All Pokemon', 'ERROR'], {
      message: { info: `${err}` }
    });
    return Promise.resolve([]);
  }
};

const getPokemonByName = async (dataObject) => {
  const { name } = dataObject;

  try {
    const timeStart = process.hrtime();
    const poolConnection = await ConnectionPool.getConnection();
    const query = await poolConnection.query(
      `SELECT * FROM ${POKEMON_TABLE} WHERE name = '${name}';`
    );
    await poolConnection.connection.release();
    const result = __constructQueryResult(query);

    const timeDiff = process.hrtime(timeStart);
    const timeTaken = Math.round((timeDiff[0] * 1e9 + timeDiff[1]) / 1e6);

    console.log([fileName, 'Get Pokemon By Name', 'INFO'], {
      message: { timeTaken }
    });

    return Promise.resolve(result);
  } catch (err) {
    console.log([fileName, 'Get Pokemon By Name', 'ERROR'], {
      message: { info: `${err}` }
    });
    return Promise.resolve([]);
  }
};

const addPokemon = async (dataObject) => {
  const { name, url } = dataObject;
  
  try {
    const timeStart = process.hrtime();
    const poolConnection = await ConnectionPool.getConnection();
    await poolConnection.query(
      `INSERT INTO ${POKEMON_TABLE} (name, url) VALUES ('${name}', '${url}');`
    );

    await poolConnection.connection.release();

    const timeDiff = process.hrtime(timeStart);
    const timeTaken = Math.round((timeDiff[0] * 1e9 + timeDiff[1]) / 1e6);

    console.log([fileName, 'Add Pokemon', 'INFO'], {
      message: { timeTaken }
    });

    return Promise.resolve(true);
  } catch (err) {
    console.log([fileName, 'Add Pokemon', 'ERROR'], {
      message: { info: `${err}` }
    });
    return Promise.resolve(false);
  }
};

module.exports = {
  getAllPokemon,
  getPokemonByName,
  addPokemon
};
