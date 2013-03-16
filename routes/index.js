var _ = require('underscore')._
  , routes = require("express-http-routes")
  , config = projRequire("/config")
  , cons = require("consolidate")
  ;

_.extend(routes.all, {
  "GET /index.html": function(req, res, next) {
    var self = this, ctx = {
      logHeader: "GET /index.html"
    };
    cons.handlebars("public/templates/index.html.mustache", {}, function(err, html) {
      console.info(ctx.logHeader + "|public/templates/index.html.mustache");
      if (err) {
        next(err);
        return;
      }
      cons.handlebars("public/templates/layout.html.mustache", {main_content: html}, function(err, html) {
        console.info(ctx.logHeader + "|public/templates/index.html.mustache|public/templates/layout.html.mustache");
        if (err) {
          next(err);
          return;
        }
        res.send(html);
      });
    });
  }
});

module.exports = routes;
