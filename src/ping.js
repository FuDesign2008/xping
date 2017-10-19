const ping = require('ping')
const _ = require('lodash')


module.exports = function pingAll(domainMap) {
  return new Promise((resolve) => {
    const data = {}
    const promiseList = []
    _.forEach(domainMap, (ipInfoMap, domain) => {
      _.forEach(ipInfoMap, (ipInfo) => {
        const promise = new Promise((_resolve) => {
          ping.sys.probe(ipInfo.ip, (isAlive) => {
            if (!data[domain]) {
              data[domain] = {}
            }
            data[domain][ipInfo.ip] = _.extend({
              isAlive
            }, ipInfo)
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
