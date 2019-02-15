"use strict"

const logger = require("fluent-logger")
const debug = require("debug")("fluentd-logger-middleware")

/**
 * Create a fluentd logger middleware.
 *
 * @public
 * @param {Object}
 * @return {Function}
 */
exports = module.exports = function fluentdLoggerMiddleware(options) {
    const defaultOptions = {
        source: "Access",
        level: "info",
        mode: "development",
        tag: "debug",
        label: "server",
        configure: { host: "127.0.0.1", port: 24224, timeout: 3.0 },
        responseHeaders: [],
    }

    options = Object.assign(defaultOptions, options)

    logger.configure(options.tag, options.configure)

    logger.on("error", debug)

    return function(req, res, next) {
        var start = new Date()
        function emitHandler() {
            res.removeListener("finish", emitHandler)
            res.removeListener("close", emitHandler)
            var record = {
                timestamp: start.getTime(),
                "remote-address": req.ip,
                method: req.method,
                url:
                    req.protocol + "://" + req.get("host") + req.originalUrl
                        ? req.originalUrl
                        : req.url,
                "http-version": req.httpVersion,
                status: res.statusCode,
                "content-length": res.get("content-length"),
                referrer: req.get("referrer") || req.get("referer") || "",
                "response-time": new Date() - start,
            }

            /**
             * Request Headers
             */
            Object.keys(req.headers)
                .filter(key => {
                    return (
                        key !== "host" &&
                        key !== "connection" &&
                        key !== "referrer" &&
                        key !== "referer"
                    )
                })
                .forEach(key => {
                    key = key.toLowerCase()
                    record[key] = req.get(key)
                })

            /**
             * Response Headers
             */
            options.responseHeaders
                .filter(key => {
                    return res.get(key)
                })
                .forEach(key => {
                    key = key.toLowerCase()
                    record[key.toLowerCase()] = res.get(key)
                })

            logger.emit(options.label, {
                source: options.source,
                level: options.level,
                mode: options.mode,
                record,
            })
        }

        res.on("finish", emitHandler)
        res.on("close", emitHandler)
        req.logger = logger
        next()
    }
}
