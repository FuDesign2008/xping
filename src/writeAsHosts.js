const _  = require('lodash');
const fs = require('fs');
const path = require('path');

const LINE_BREAK = '\n';

/**
 *
 * @param {String} data.configName
 * @param {Object} data.pings  - key is domain name, value is an array of ip
 */
module.exports = function(data, directoryPath) {

  if (!data || !data.configName || !data.pings) {
    console.warn('No pings', data);
    return;
  }

  let lines = ['# { ' + data.configName];
  let wholeInfoLines = [];

  _.each(data.pings, function (ipList, domainName) {
    const first = _.first(ipList);
    lines.push(domainName + ' ' + first);
    wholeInfoLines.push('# {' + domainName);
    wholeInfoLines.push(ipList.join(LINE_BREAK));
    wholeInfoLines.push('# }');
  });

  lines.push('# }');
  const hostFilePath = path.join(directoryPath, data.configName + '-host.txt');
  const wholeInfoFilePath = path.join(directoryPath, data.configName + '-all.text');

  fs.writeFile(hostFilePath, lines.join(LINE_BREAK));
  fs.writeFile(wholeInfoFilePath, wholeInfoLines.join(LINE_BREAK));

};

