"use strict";

/*
 * Avian Fluentd Logger
 */

var logger = require('fluent-logger');
var debug = require('debug')('avian-fluentd-logger');

/**
 * Create a fluentd logger middleware.
 *
 * @public
 * @param {String|Object} tag
 * @param {String|Object} label
 * @param {Object} options
 * @return {Function}
 */
exports = module.exports = function expressFluentLogger(options) {

  options = options || { level: "info", mode: "development", tag: "debug", label: "server", configure: { host: '127.0.0.1', port: 24224, timeout: 3.0 }};

  logger.configure(options.tag, options.configure);

  logger.on('error', debug);

  return function(req, res, next) {
    var start = new Date();
    function emitHandler() {
      res.removeListener('finish', emitHandler);
      res.removeListener('close',  emitHandler);
      var record = {
        'timestamp':      start.getTime(),
        'remote-address': req.ip,
        'method':         req.method,
        'url':            req.protocol + '://' + req.get('host') + req.originalUrl ? req.originalUrl : req.url,
        'http-version':   req.httpVersion,
        'status':         res.statusCode,
        'content-length': res.get('content-length'),
        'referrer':       req.get('referrer') || req.get('referer') || '',
        'response-time':  new Date() - start
      };

      /** 
       * Request Headers
       */
      Object.keys(req.headers)
        .filter(function(key) {
          return key !== 'host' && key !== 'connection' && key !== 'referrer' && key !== 'referer';
        })
        .forEach(function(key) {
          key = key.toLowerCase();
          record[key] = req.get(key);
        });

      /** 
       * Response Headers
       */
      options.responseHeaders = options.responseHeaders || [];
      options.responseHeaders
        .filter(function(key) {
          return res.get(key);
        })
        .forEach(function(key) {
          key = key.toLowerCase();
          record[key.toLowerCase()] = res.get(key);
        });

        let componentName = req.path.split("/")
        componentName = componentName[1]

      logger.emit(options.label || "server", {
        component: componentName || null,
        level: options.level || "info",
        mode: options.mode || "development",
        record
      });
    }

    res.on('finish', emitHandler);
    res.on('close',  emitHandler);
    req.logger = logger;
    next();
  };
};
