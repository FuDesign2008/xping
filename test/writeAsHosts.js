const writeAsHosts = require('../src/writeAsHosts')

const data = {
  'block.dropbox.com': {
    '162.125.33.2': true,
    '162.125.34.2': true,
    '162.125.32.131': true,
    '162.125.16.5': true,
    '162.125.17.132': true,
    '162.125.17.5': true,
    '162.125.18.6': true,
    '162.125.32.2': false,
    '162.125.34.133': false
  },
  'bolt.dropbox.com': {
    '162.125.18.133': false,
    '162.125.34.129': false
  }
}

writeAsHosts('dropbox', data, __dirname)
process.exit(0)

