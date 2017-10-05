
module.exports = function (domain, callback) {
  const phantom = require('phantom');

  phantom.create().then(function (ph) {
    ph.createPage().then(function (page) {

      // page.property('onResourceRequested', function(requestData, networkRequest, debug) {
      // }, process.env.DEBUG);

      // request url: http://ping.chinaz.com/iframe.ashx?t=ping&callback=jQuery1113029412193011663734_1506837802741
      // response body: jQuery1113007332989590840855_1506838141753({state:1,msg:'',result:{ip:'162.125.82.3',ipaddress:'美国  ',responsetime:'3毫秒',ttl:'58',bytes:'32'}})
      const isPingResponse = function (responese) {
        return /\?t=ping&/.test(responese.url);
        // return /^jQuery\d+_\d+\({/.test(str);
      };
      const parsePingResponse = function () {
        page.off();
        page.evaluate(function () {
          var el = document.body.querySelector('.PClist');
          if (!el) {
            return;
          }
          var links = el.querySelectorAll('a'),
            hrefList = [],
            index,
            len = links.length,
            theElement;
          for (index = 0; index < len; index++) {
            theElement = links[index];
            hrefList.push(theElement.innerText);
          }
          return hrefList;
        }).then(function (data) {
          callback(data);
        }).then(function () {
          page.close();
          ph.exit();
        });
      };
      // let lastReceivedTime = null;
      let runParseTimeoutId = null;
      let pingCount = 0;

      // jQuery1113007332989590840855_1506838141753({state:1,msg:'',result:{ip:'162.125.82.3',ipaddress:'美国  ',responsetime:'3毫秒',ttl:'58',bytes:'32'}})
      // @see http://phantomjs.org/api/webpage/handler/on-resource-received.html
      page.on('onResourceReceived', function(response) {
        if (isPingResponse(response)) {
          pingCount++;
          console.log('on receive ping', pingCount);
          clearTimeout(runParseTimeoutId);
          runParseTimeoutId = setTimeout(parsePingResponse, 10 * 1000);
        }
      });
      const url = 'http://ping.chinaz.com/' + domain;
      page.open(url);

    }).catch(function (error) {
        console.log('error =>', error);
        ph.exit();
    });
  });

};