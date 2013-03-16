#!/usr/bin/env jasmine-node

require("./");

var _ = require('underscore')._
  , request = require("request")
  , Urls = projRequire("/urls")
  , cheerio = require("cheerio")
  ;

var ctx, self;

describe("GET /index.html", function() {
  it("renders a page with layout", function(done) {
    request.get(Urls.index(), function(err, res, body) {
      var $ = cheerio.load(body);
      expect($("title").text()).toEqual("Meditation247 | Group Meditation Now!")
      expect($(".main-container .main section:first-child").text()).toContain("Welcome to meditation247.org");
      done(err);
    });
  });
});
