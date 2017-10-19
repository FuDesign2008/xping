const writeAsHosts = require('../src/writeAsHosts')
const data = require('./writeData')

writeAsHosts('dropbox', data, __dirname)
process.exit(0)

