const express = require("express");
const httpErrors = require("http-errors");
const { logger } = require("@/logger").scoped("HTTP");
const pino = require("pino");
const pinoHttp = require("pino-http");
const { Writable: WritableStream } = require("stream");

module.exports = function main(options, cb) {
  logger.wait("Starting");

  // Set default options
  const ready = cb || function () {};
  const opts = Object.assign(
    {
      // Default options
    },
    options
  );

  // Server state
  let server;
  let serverStarted = false;
  let serverClosing = false;

  // Setup error handling
  function unhandledError(err) {
    // Log the errors
    logger.error(err);

    // Only clean up once
    if (serverClosing) {
      return;
    }
    serverClosing = true;

    // If server has started, close it down
    if (serverStarted) {
      server.close(function () {
        process.exit(1);
      });
    }
  }
  process.on("uncaughtException", unhandledError);
  process.on("unhandledRejection", unhandledError);

  // Create the express app
  const app = express();

  // Logger
  class PinoToSignale extends WritableStream {
    write(json) {
      const data = JSON.parse(json);
      const method = data.req.method,
        url = data.req.url,
        code = data.res.statusCode;

      let level = "info";
      if (code >= 200) level = "success";
      if (code >= 300) level = "watch";
      if (code >= 400) level = "warn";
      if (code >= 500) level = "error";

      logger[level](`${method} - ${url} - ${code}`);
    }
  }
  app.use(
    pinoHttp({
      logger: pino(new PinoToSignale()),
    })
  );

  // Load API
  require("@/api")(app, opts);

  // Common error handlers
  app.use(function fourOhFourHandler(req, res, next) {
    next(httpErrors(404, `Route not found: ${req.url}`));
  });
  app.use(function fiveHundredHandler(err, req, res, next) {
    if (err.status >= 500) {
      logger.error(err);
    }
    res.status(err.status || 500).json({
      messages: [
        {
          code: err.code || "InternalServerError",
          message: err.message,
        },
      ],
    });
  });

  // Start server
  server = app.listen(opts.port, opts.host, function (err) {
    if (err) {
      return ready(err, app, server);
    }

    // If some other error means we should close
    if (serverClosing) {
      return ready(new Error("Server was closed before it could start"));
    }

    serverStarted = true;
    const addr = server.address();
    logger.success(`Started at ${opts.host || addr.host || "localhost"}:${addr.port}`);
    ready(err, app, server);
  });
};
