function main() {
  verifyEnv();
  envDefaults();
  setupExports();
  setupProjRequire();
  setupJSON();
  setupUnderscore();
}

function verifyEnv() {
}

function envDefaults() {
}

function setupExports() {
  module.exports = {
    port: process.env.PORT || 3000,
    "": ""
  };
}

function setupProjRequire() {
  var projectDir = __dirname;
  GLOBAL.projRequire = function(module) {
    return require(projectDir + module);
  };
}

function setupJSON() {
  require("json-parse2");
  require("json-deep");
}

function setupUnderscore() {
  require("underscore")._.mixin(require('underscore.string').exports());
}

main();
