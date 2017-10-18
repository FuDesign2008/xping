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
        function isPingResponse(response) {
          return /\?t=ping&/.test(response.url)
        }

        function isValidIP(ip) {
          return /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(ip)
        }

        const validIPList = []
        let parseTimeoutId = null

        function parsePingResponse() {
          // eslint-disable-next-line
          page.evaluate(function() {
            /* eslint-disable */
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
              keys.forEach(function (key) {
                var selector = map[key]
                var el = li.querySelector(selector)
                var text = ''
                if (el) {
                  text = el.innerText
                }
                response[key] = text.trim()
              })

              if (response.time && /^\d+ms$/.test(response.time)) {
                response.time = parseInt(response.time, 10)
              } else {
                response.time = -1
              }

              if (response.ttl && /^\d+$/.test(response.ttl)) {
                response.ttl = parseInt(response.ttl, 10)
              } else {
                response.ttl = -1
              }
              return response
            }

            var ul = document.getElementById('speedlist')
            var ipList = []

            if (!ul) {
              return {
                  ipList: ipList,
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
                if (liInfo && liInfo.time > 0 && liInfo.ip &&
                    liInfo.city && liInfo.city.indexOf('海外') > -1) {
                  ipList.push(liInfo.ip)
                }
              }
            }

            var uniqueIpList = []
            ipList.forEach(function (ip) {
              if (uniqueIpList.indexOf(ip) === -1) {
                uniqueIpList.push(ip)
              }
            })

            return {
              ipList: uniqueIpList,
              message: message.join('\n')
            }
            /* eslint-enable */
          }).then((data) => {
            // console.log('ipList', data)
            _.forEach(data.ipList, (ip) => {
              console.log('for each ip', ip)
              if (isValidIP(ip) && validIPList.indexOf(ip) === -1) {
                validIPList.push(ip)
              }
            })

            resolve(validIPList)
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
            clearTimeout(parseTimeoutId)
            parseTimeoutId = setTimeout(parsePingResponse, 1000 * 10)
          }
        })
        const url = `http://ping.chinaz.com/${domain}`
        const setting = {
          operation: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: JSON.stringify({
            host: domain,
            linetype: '海外'
          })
        }

        console.log('to open url', url)
        // eslint-disable-next-line
        page.open(url, setting, function (status) {
          console.log('open url status', status)
        })
        // page.open(url)
      }).catch((error) => {
        console.log('error =>', error)
        ph.exit()
        reject()
      })
    })
  })
}
