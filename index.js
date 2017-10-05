
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const readFile = require('./src/readFile');
const fetchPing = require('./src/fetchPing');
const writeAsHosts = require('./src/writeAsHosts');


console.log(process.argv);
let args = process.argv.slice(2);
let configName = _.first(args);

if (!configName) {
  console.error('no config name, arguments are not valid', args);
  return;
}

const configPathFromConfig = path.join(__dirname, './src/domain-config/', configName + '.txt');
const configPathFromCurrent = path.join(__dirname, configName + '.txt');
let configPath = '';

console.log('"' + configPathFromCurrent + '"', '"' + configPathFromConfig + '"');

if (fs.existsSync(configPathFromConfig)) {
  configPath = configPathFromConfig;
} else if (fs.exists(configPathFromCurrent)) {
  configPath = configPathFromCurrent;
}

const domainNames = readFile(configPath);
if (!domainNames || !domainNames.length) {
  console.error('no domain names', domainNames);
}

const data = {
  configName: configName,
  pings: {}
};

let count = 0;
let resultCount = 0;

_.each(domainNames, function (domain) {
  count++;
  fetchPing(domain, function (ipList) {
    resultCount++;
    if (ipList && ipList.length) {
      data.pings[domain] = ipList;
    }
  });
});

const writeFiles = function () {
  if (resultCount >= count) {
    writeAsHosts(data, __dirname);
  } else {
    setTimeout(writeFiles, 1000);
  }
};

writeFiles();











