const { logger } = require("@/logger").scoped("WS");

const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("@models");

module.exports = app => {
  const io = socketIo(app.server);

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return next(new Error("Authentication error"));
        socket.decoded = decoded;
        const { id } = socket.decoded.user;
        const user = await User.query().findById(id);
        if (!user) return next(new Error("Authentication error"));
        socket.user = user;
        next();
      });
    } else {
      next(new Error("Authentication error"));
    }
  }).on("connection", socket => {
    const { id } = socket.user;
    const { online } = User;
    if (!online.includes(id)) {
      online.push(id);
    }

    socket.on("disconnect", () => {
      online.splice(online.indexOf(id), 1);
    });

    socket.on("message", data => {
      // TODO: Implement chat logic. Maybe.
      logger.info(`from ${socket.user.username}: ${data}`);
    });
  });

  logger.success("Started on HTTP server");

  return io;
};
