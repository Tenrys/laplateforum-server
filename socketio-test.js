const io = require("socket.io-client");

const socket = io("http://localhost:8000", {
  query: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJsYXN0UGFzc3dvcmRDaGFuZ2UiOiIyMDIxLTA3LTE5VDAwOjI2OjQ0LjAwMFoifSwiaWF0IjoxNjI2NjU1MDU3fQ.QsIXiOsT2tr-llXE1i9HpLpFyH6V9xL9orX2MjnG6NQ",
  },
});
socket.on("connect", () => {
  console.log("Connected");
  socket.send("benis");
});
socket.on("disconnect", () => {
  console.log("Disconnected");
});
