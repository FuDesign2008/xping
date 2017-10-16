const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const LINE_BREAK = '\n'

/**
 *
 * @param {String} data.configName
 * @param {Object} data.pings  - key is domain name, value is an array of ip
 */
module.exports = (data, directoryPath) => {
  if (!data || !data.configName || !data.pings) {
    console.warn('No pings', data)
    return
  }

  const lines = [`# { ${data.configName}`]
  const wholeInfoLines = []

  _.forEach(data.pings, (ipList, domainName) => {
    const ip = _.first(ipList)
    lines.push(`${ip} ${domainName}`)
    wholeInfoLines.push(`# { ${domainName}`)
    wholeInfoLines.push(ipList.join(LINE_BREAK))
    wholeInfoLines.push('# }')
  })

  lines.push('# }')
  const hostFilePath = path.join(directoryPath, `host-${data.configName}.txt`)
  // const wholeInfoFilePath = path.join(directoryPath, `${data.configName}-all.text`)

  fs.writeFileSync(hostFilePath, lines.join(LINE_BREAK))
  // fs.writeFileSync(wholeInfoFilePath, wholeInfoLines.join(LINE_BREAK))
  console.log('write as host ok')
}

