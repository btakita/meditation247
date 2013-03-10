#!/usr/bin/env node

var _ = require("underscore")._
  , express = require('express')
  , connect = require('connect')
  , path = require('path')
  , app = global.app = express()
  , config = require('./config')
  , routes = require('./routes')
  ;

var ctx = {};

function main() {
  appConfigure();
  onUncaughtException();
  onSigterm();
  routesAttach();
  createServer();
}

function appConfigure() {
  app.configure(function() {
    app.set("config", config);
    app.set('port', config.port);
    app.use(connect.compress());
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(xLog());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(handleRequestErrors);
  });
}

function xLog() {
  var header = "x-log";
  return function xLogHandler(req, res, next) {
    var message = req.headers[header];
    if (message) {
      console.info(message);
    }
    next();
  };
}

function handleRequestErrors(err, req, res, next) {
  console.info("(app)|handleRequestErrors");
  console.info(err.stack);
  console.info(JSON.stringify(err));
  var status = (err && (err.clientStatusCode || err.statusCode || err.status)) || 500;
  var message = (err && (err.clientMessage || err.message)) || "Unknown Error Occurred";
  res.send(status, message);
}

function onUncaughtException() {
  process.on('uncaughtException', function(err) {
    console.error("process|on|uncaughtException");
    if (err) {
      if (err.stack) {
        console.error(err.stack);
      } else {
        console.trace(err);
      }
    }
  });
}

function onSigterm() {
  process.on('SIGTERM', function() {
    console.info("process|on|SIGTERM");
    ctx.server.close(onClose);
    setTimeout(function() {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 30 * 1000);
  });
}

function onClose() {
}

function routesAttach() {
  routes.attach({
    app: app,
    override: function(routeDefinition, routeHandler) {
      return function() {
        console.info(routeDefinition);
        routeHandler.apply(this, arguments);
      }
    }
  });
}

function createServer() {
  ctx.server = app.listen(config.port, function() {
    console.info("Express server listening on port %s", config.port);
  });
}

main();
