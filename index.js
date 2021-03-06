const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const readFile = require('./src/readFile')
const fetchPing = require('./src/fetchPing')
const writeAsHosts = require('./src/writeAsHosts')
const ping = require('./src/ping')


console.log('progress argv', process.argv)
const args = process.argv.slice(2)
const configName = _.first(args)

if (!configName) {
  console.error('no config name, arguments are not valid', args)
  process.exit(0)
}

const configPathFromConfig = path.resolve(__dirname, './src/domain-config/', `${configName}.conf`)
const configPathFromCurrent = path.join(__dirname, `${configName}.conf`)
let configPath = ''

console.log('path from current/config', configPathFromCurrent, configPathFromConfig)

if (fs.existsSync(configPathFromConfig)) {
  configPath = configPathFromConfig
} else if (fs.existsSync(configPathFromCurrent)) {
  configPath = configPathFromCurrent
}

const domainNames = readFile(configPath)
if (!domainNames || !domainNames.length) {
  console.error('no domain names', domainNames)
}

console.log('domain names', domainNames)

const data = {
  configName,
  pings: {}
}

// eslint-disable-next-line
const promiseList = _.map(domainNames, (domain) => {
  return fetchPing(domain).then((ipInfoMap) => {
    console.log('fetchPing', ipInfoMap)
    data.pings[domain] = ipInfoMap
  })
})

Promise.all(promiseList).then(() => {
  console.log(data)
  ping(data.pings).then((result) => {
    console.log(result)
    writeAsHosts(data.configName, result, __dirname)
    process.exit(0)
  })
})
