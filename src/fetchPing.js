const phantom = require('phantom')
const _ = require('lodash')

const isDebugMode = false

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
        function isPingResponse(response) {
          return /\?t=ping&/.test(response.url)
        }

        function isValidIP(ip) {
          return /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(ip)
        }

        const validIPMap = {}
        let parseTimeoutId = null

        function parsePingResponse() {
          // eslint-disable-next-line
          page.evaluate(function() {
            /* eslint-disable */
            function _isValidIP(ip) {
              return /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(ip)
            }

            function _isUnvalidContent(str) {
              str = str || ''

              if (str.indexOf('超时') > -1) {
                return true
              }

              str = str.trim()
              str = str.replace(/-/g, '')
              return str.length === 0
            }

            function parseResponseLi(li) {
              if (!li || !li.querySelector) {
                return
              }
              var map = {
                city: 'span[name=city]',
                ip: 'span[name=ip]',
                ipAddress: 'span[name=ipaddress]',
                time: 'span[name=responsetime]',
                ttl: 'span[name=ttl]',
              }

              var keys = Object.keys(map)
              var response = {}
              var maxTime = 100000
              var isUnvalid = keys.some(function (key) {
                var selector = map[key]
                var el = li.querySelector(selector)
                var text = ''
                if (el) {
                  text = el.innerText
                }
                if (_isUnvalidContent(text)) {
                  return true
                }
                response[key] = text.trim()
              })

              if (isUnvalid) {
                return
              }

              // <1ms  -->  1ms
              if (response.time && /^</.test(response.time)) {
                response.time = response.time.substring(1)
              }

              if (response.time && /^\d+ms$/.test(response.time)) {
                response.time = parseInt(response.time, 10)
              } else {
                response.time = maxTime
              }

              if (response.ttl && /^\d+$/.test(response.ttl)) {
                response.ttl = parseInt(response.ttl, 10)
              } else {
                response.ttl = maxTime
              }
              return response
            }

            var ul = document.getElementById('speedlist')
            var ipInfoList = []

            if (!ul) {
              return {
                  ipInfoList: ipInfoList,
                  message: 'no ul'
              }
            }

            var liElements = ul.getElementsByTagName('li')
            var len = liElements.length
            var index
            var theLi
            var id
            var liInfo
            var message = []

            for (index = 0; index < len; index += 1) {
              theLi = liElements[index]
              id = theLi.getAttribute('id')
              message.push('id ' + id )
              if (id) {
                liInfo = parseResponseLi(theLi)
                message.push(window.JSON.stringify(liInfo))
                if (liInfo && _isValidIP(liInfo.ip) && liInfo.city) {
                  ipInfoList.push(liInfo)
                }
              }
            }

            var uniqueIpList = []
            var uniqueIpInfoList = []
            ipInfoList.forEach(function (ipInfo) {
              if (uniqueIpList.indexOf(ipInfo.ip) === -1) {
                uniqueIpList.push(ipInfo.ip)
                uniqueIpInfoList.push(ipInfo)
              }
            })

            return {
              ipInfoList: uniqueIpInfoList,
              message: message.join('\n')
            }
            /* eslint-enable */
          }).then((data) => {
            console.log('ipInfoList', data)
            _.forEach(data.ipInfoList, (ipInfo) => {
              console.log('for each ip', ipInfo)
              if (isValidIP(ipInfo.ip) && !validIPMap[ipInfo.ip]) {
                validIPMap[ipInfo.ip] = ipInfo
              }
            })

            resolve(validIPMap)
            page.off('onResourceReceived')
            page.close()
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
          // console.log('receive ...', response)
          if (isPingResponse(response)) {
            pingCount += 1
            console.log(`on receive ping ${domain}`, pingCount)
            if (isDebugMode) {
              if (pingCount < 10) {
                clearTimeout(parseTimeoutId)
                parseTimeoutId = setTimeout(parsePingResponse, 1000 * 5)
              }
            } else {
              clearTimeout(parseTimeoutId)
              parseTimeoutId = setTimeout(parsePingResponse, 1000 * 20)
            }
          }
        })
        const url = `http://ping.chinaz.com/${domain}`
        console.log('to open url', url)
        page.open(url)
      }).catch((error) => {
        console.log('error =>', error)
        ph.exit()
        reject()
      })
    })
  })
}
