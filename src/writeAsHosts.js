const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const LINE_BREAK = '\n'

/**
 *
 * @param {String} configName
 * @param {Object} data  - key is domain name, value is an array of ip
 */
module.exports = (configName, data, directoryPath) => {
  if (!configName || !data) {
    console.warn('No pings', configName, data)
    return
  }

  const now = new Date()
  const nowStr = now.toString()
  const lines = [`# { ${configName} ${nowStr}`]
  lines.push('')
  const domainNames = _.keys(data)
  domainNames.sort()
  const sortedData = {}

  _.forEach(domainNames, (domainName) => {
    const ipInfoMap = data[domainName]
    if (!sortedData[domainName]) {
      sortedData[domainName] = []
    }
    _.each(ipInfoMap, (ipInfo) => {
      sortedData[domainName].push(ipInfo)
    })
  })

  _.forEach(domainNames, (domainName) => {
    const ipInfoList = sortedData[domainName]
    ipInfoList.sort((a, b) => (a.time - b.time))
    let isFirst = true
    _.forEach(ipInfoList, (ipInfo) => {
      let aliveMessage
      let timeMessage
      if (ipInfo.isAlive && ipInfo.time < 10000) {
        aliveMessage = 'on'
        if (isFirst) {
          lines.push(`${ipInfo.ip} ${domainName} # ${aliveMessage} ${ipInfo.city} -- ${ipInfo.time} --> ${ipInfo.ipAddress}`)
          isFirst = false
        } else {
          lines.push(`# ${ipInfo.ip} ${domainName} # ${aliveMessage} ${ipInfo.city} -- ${ipInfo.time} --> ${ipInfo.ipAddress}`)
        }
      } else {
        aliveMessage = 'off'
        if (ipInfo.time < 10000) {
          timeMessage = ipInfo.time
        } else {
          timeMessage = '超时'
        }
        lines.push(`# ${ipInfo.ip} ${domainName} # ${aliveMessage} ${ipInfo.city} -- ${timeMessage} --> ${ipInfo.ipAddress}`)
      }
    })
    lines.push('')
  })

  lines.push('')
  lines.push('# }')
  const hostFilePath = path.join(directoryPath, `host-${configName}.txt`)

  fs.writeFileSync(hostFilePath, lines.join(LINE_BREAK))
  console.log('write as host ok')
}

