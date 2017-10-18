const ping = require('ping')
const _ = require('lodash')


module.exports = function pingAll(domainMap) {
  return new Promise((resolve) => {
    const data = {}
    const promiseList = []
    _.forEach(domainMap, (ipList, domain) => {
      _.forEach(ipList, (ip) => {
        const promise = new Promise((_resolve) => {
          ping.sys.probe(ip, (isAlive) => {
            if (!data[domain]) {
              data[domain] = {}
            }
            data[domain][ip] = isAlive
            _resolve({})
          })
        })
        promiseList.push(promise)
      })
    })

    Promise.all(promiseList).then(() => {
      resolve(data)
    })
  })
}
