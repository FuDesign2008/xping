const phantom = require('phantom')
const ping = require('ping')
const _ = require('lodash')

/**
 * @param {String} domain
 * @param {boolean} [fastMode=false]
 * @return {Promise}
 */
module.exports = function fetchPing(domain) {
  return new Promise((resolve, reject) => {
    phantom.create([], {
      // logLevel: 'debug'
    }).then((ph) => {
      ph.createPage().then((page) => {
        // page.property('onResourceRequested', function(requestData, networkRequest, debug) {
        // }, process.env.DEBUG);

        // request url:
        // http://ping.chinaz.com/iframe.ashx?t=ping&callback=jQuery1113029412193011663734_1506837802741
        // response body: jQuery1113007332989590840855_1506838141753(
        // {state:1,
        //  msg:'',
        //  result:{ip:'162.125.82.3',ipaddress:'美国  ',
        //  responsetime:'3毫秒',ttl:'58',bytes:'32'}
        // })
        function isPingResponse(responese) {
          return /\?t=ping&/.test(responese.url)
        }

        function isValidIP(ip) {
          return /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(ip)
        }

        const validIPList = []

        function parsePingResponse() {
          // eslint-disable-next-line
          page.evaluate(function() {
            /* eslint-disable */
            var el = document.body.querySelector('.PClist')
            var ipList = []

            if (!el) {
              return ipList
            }

            var links = el.querySelectorAll('a')
            var len = links.length
            var index
            var theElement

            for (index = 0; index < len; index += 1) {
              theElement = links[index]
              ipList.push(theElement.innerText)
            }
            return ipList
            /* eslint-enable */
          }).then((ipList) => {
            _.forEach(ipList, (ip) => {
              if (isValidIP(ip) && validIPList.indexOf(ip) === -1) {
                console.log('ping ip', ip)
                ping.sys.probe(ip, (isAlive) => {
                  console.log('ip / isAlive', ip, isAlive)
                  if (isAlive) {
                    page.off('onResourceReceived')
                    page.close()
                    console.log('resolve domain', domain)
                    resolve([ip])
                  }
                })
                validIPList.push(ip)
              }
            })
          })
        }

        let pingCount = 0

        // jQuery1113007332989590840855_1506838141753({
        // state:1,msg:'',result:{
        // ip:'162.125.82.3',ipaddress:'美国  ',
        // responsetime:'3毫秒',ttl:'58',bytes:'32'}})
        //
        // @see http://phantomjs.org/api/webpage/handler/on-resource-received.html
        page.on('onResourceReceived', (response) => {
          // console.log('response arguments', arguments[1].toString())
          if (isPingResponse(response)) {
            pingCount += 1
            console.log(`on receive ping ${domain}`, pingCount)
            // wait render page
            setTimeout(parsePingResponse, 100)
          }
        })
        const url = `http://ping.chinaz.com/${domain}`
        page.open(url)
      }).catch((error) => {
        console.log('error =>', error)
        ph.exit()
        reject()
      })
    })
  })
}
