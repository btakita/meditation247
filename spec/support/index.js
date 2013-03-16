process.env.NODE_ENV = process.env.NODE_ENV || "test";

var config = require("../../config")
  , _ = require("underscore")._
  , request = require("request")
  , util = require("util")
  ;

function main() {
  setupExceptionHandling();
  addTestHttpHeaderToRequests();
  require("jasmine-spec-prototype");
  setupFocusedSpecs();
  fixIt();
  overrideJasmineSpecGetFullName();
  immediateErrorOutput();
  overrideJasmineErrorOutput();

  module.exports = {
    config: config,
    port: config.port,
    testServer: "http://localhost:" + exports.port
  };
}

function setupExceptionHandling() {
  process.on('uncaughtException', function(err) {
    if (jasmine.getEnv().currentSpec) {
      console.error(jasmine.getEnv().currentSpec.getFullName());
    }
    if (err) {
      if (err.stack) {
        console.error(err.stack);
      } else {
        console.trace(err);
      }
    }
  });
}

function addTestHttpHeaderToRequests() {
  var originalRequestHandlers = {
    get: request.get,
    put: request.put,
    post: request.post,
    del: request.del
  };
  var overrideRequestHandler = function(method) {
    return function(uri, options, callback) {
      var params = request.initParams(uri, options, callback);
      params.options.headers = _.extend(params.options.headers || {}, {
        "X-TEST": "true",
        "X-LOG": util.format("jasmine|%s", jasmine.getEnv().currentSpec.getFullName())
      });
      return originalRequestHandlers[method](params.uri, params.options, params.callback);
    };
  };
  _.extend(request, {
    get: overrideRequestHandler("get"),
    put: overrideRequestHandler("put"),
    post: overrideRequestHandler("post"),
    del: overrideRequestHandler("del")
  });
}

function setupFocusedSpecs() {
  function main() {
    ddescribeSetup();
    iitSetup();
  }

  function ddescribeSetup() {
    GLOBAL.ddescribe = function(desc, func) {
      GLOBAL.describe = GLOBAL.xdescribe;

      if (func) {
        normalState(function() {
          return jasmine.getEnv().describe(desc, func);
        });
      }
    };
  }

  function iitSetup() {
    GLOBAL.iit = function(desc, func) {
      GLOBAL.it = GLOBAL.xit;

      if (func) {
        return jasmine.getEnv().it(desc, func);
      }
    };
  }

  function normalState(cb) {
    var originalDescribe = GLOBAL.describe;
    var originalIt = GLOBAL.it;

    GLOBAL.describe = function(desc, func) {
      return jasmine.getEnv().describe(desc, func);
    };
    GLOBAL.it = function(desc, func) {
      return jasmine.getEnv().it(desc, func);
    };

    cb();

    GLOBAL.describe = originalDescribe;
    GLOBAL.it = originalIt;
  }

  main();
}

// TODO: Apply fix to jasmine-node
function fixIt() {
  GLOBAL.it = function() {
    return jasmine.getEnv().it.apply(jasmine.getEnv(), arguments);
  }
}

function overrideJasmineSpecGetFullName() {
  jasmine.Spec.prototype.getFullName = function() {
    return this.suite.getFullName() + '|' + this.description;
  }
}

function immediateErrorOutput() {
  var theOriginalFail = jasmine.Spec.prototype.fail;
  jasmine.Spec.prototype.fail = function (e) {
    theOriginalFail.apply(this, arguments);
    console.error(e ? jasmine.util.formatException(e) : "Exception");
  };
}

function overrideJasmineErrorOutput() {
  jasmine.Matchers.matcherFn_ = function(matcherName, matcherFunction) {
    return function() {
      var matcherArgs = jasmine.util.argsToArray(arguments);
      var result = matcherFunction.apply(this, arguments);

      if (this.isNot) {
        result = !result;
      }

      if (this.reportWasCalled_) return result;

      var message;
      if (!result) {
        if (this.message) {
          message = this.message.apply(this, arguments);
          if (jasmine.isArray_(message)) {
            message = message[this.isNot ? 1 : 0];
          }
        } else {
          var englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });
          message = "Expected\n" + jasmine.pp(this.actual) + (this.isNot ? " not " : " ") + "\n" + englishyPredicate + "\n";
          if (matcherArgs.length > 0) {
            for (var i = 0; i < matcherArgs.length; i++) {
              if (i > 0) message += ",";
              message += jasmine.pp(matcherArgs[i]);
            }
          }
        }
      }
      var expectationResult = new jasmine.ExpectationResult({
        matcherName: matcherName,
        passed: result,
        expected: matcherArgs.length > 1 ? matcherArgs : matcherArgs[0],
        actual: this.actual,
        message: message
      });
      this.spec.addMatcherResult(expectationResult);
      return jasmine.undefined;
    };
  }

  jasmine.Matchers.wrapInto_(jasmine.Matchers.prototype, jasmine.getEnv().matchersClass);
}

main();
