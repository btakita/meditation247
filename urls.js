var config = require("./config");

var Urls = {
  index: function() {
    return "http://" + config.host + "/index.html";
  }
};

module.exports = Urls;
