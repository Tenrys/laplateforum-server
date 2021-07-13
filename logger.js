const { Signale } = require("signale");
const options = {
  disabled: !process.env.NODE_ENV === "development",
  interactive: false,
  config: {
    // displayScope: true,
    // displayBadge: true,
    // displayDate: true,
    // displayFilename: false,
    displayLabel: false,
    // displayTimestamp: true,
    // underlineLabel: true,
    // underlineMessage: false,
    // underlinePrefix: false,
    // underlineSuffix: false,
    // uppercaseLabel: false,
  },
  // logLevel: "info",
  // scope: "custom",
  // secrets: [],
  // stream: process.stdout,
  // types: {
  //   remind: {
  //     badge: "**",
  //     color: "yellow",
  //     label: "reminder",
  //     logLevel: "info",
  //   },
  // },
};

module.exports = {
  signale: new Signale(options),
  logger: new Signale(options),
  interactive(scope) {
    return { ...module.exports, logger: new Signale({ ...options, interactive: true, scope }) };
  },
  scoped(scope) {
    return { ...module.exports, logger: new Signale({ ...options, scope }) };
  },
  newInteractive(scope) {
    return new Signale({ ...options, interactive: true, scope });
  },
  newScoped(scope) {
    return new Signale({ ...options, scope });
  },
};
