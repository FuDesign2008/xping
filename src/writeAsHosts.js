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

  _.forEach(domainNames, (domainName) => {
    const ipInfo = data[domainName]
    let isFirst = true
    _.forEach(ipInfo, (isAlive, ip) => {
      if (isAlive) {
        if (isFirst) {
          lines.push(`${ip} ${domainName}`)
          isFirst = false
        } else {
          lines.push(`# ${ip} ${domainName}`)
        }
      } else {
        lines.push(`# ${ip} ${domainName} # off`)
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

