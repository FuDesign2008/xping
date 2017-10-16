const fs = require('fs')


/**
 *
 * @param {String} path
 * @return {Array<string>}
 */
module.exports = (path) => {
  console.log('read file', path)
  if (!path) {
    return []
  }
  let content = ''

  try {
    content = fs.readFileSync(path, {
      encoding: 'utf-8'
    })
  } catch (ex) {
    console.error('Failed to read file', path, ex)
  }

  const arr = content.split(/[\r\n]/)
  const domainList = []
  arr.forEach((item) => {
    let lineContent = item || ''
    lineContent = lineContent.trim()
    // use # as comment
    if (lineContent.length > 0 &&
        /^#/.test(lineContent) === false &&
        domainList.indexOf(lineContent) === -1) {
      domainList.push(lineContent)
    }
  })

  return domainList
}

