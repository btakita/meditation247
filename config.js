function main() {
  verifyEnv();
  envDefaults();
  setupExports();
  setupProjRequire();
  setupJSON();
  setupUnderscore();
  setupHandlebars();
}

function verifyEnv() {
}

function envDefaults() {
}

function setupExports() {
  module.exports = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost:3000",
    templatesDir: __dirname + "/public/templates",
    layoutPath: exports.templatesDir + "/layout.html.mustache",
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

function setupHandlebars() {
  require("handlebars");
}

main();
