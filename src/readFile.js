const fs = require('fs');


/**
 *
 * @param {String} path
 * @return {Array<string>}
 */
module.exports = function(path) {
  console.log('read file', path);
  if (!path) {
    return;
  }
  let content = '';

  try {
    content = fs.readFileSync(path, {
      encoding: 'utf-8'
    })
  } catch (ex) {
    console.error('Failed to read file', path, ex);
  }

  let arr = content.split(/[\r\n]/);
  arr = arr.filter(function (item) {
    let lineContent = item || '';
    lineContent = lineContent.trim();
    // use # as comment
    return lineContent.length > 0 && /^#/.test(lineContent) === false;
  });

  return arr;
};

