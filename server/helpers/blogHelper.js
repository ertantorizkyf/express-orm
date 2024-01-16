const db = require('../../models');
const GeneralHelper = require('./generalHelper');

const fileName = 'server/helpers/blogHelper.js';

const getBlogList = async (dataObject) => {
  const { limit, offset } = dataObject;

  try {
    const blogs = await db.Blog.findAll({
      limit,
      offset,
      include: 'posts'
    });
    
    return Promise.resolve(blogs);
  } catch (err) {
    console.log([fileName, 'getBlogList', 'ERROR'], { info: `${err}` });
    return Promise.reject(GeneralHelper.errorResponse(err));
  }
}

module.exports = {
  getBlogList
}