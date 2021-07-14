module.exports = [
  { path: "/auth", provider: require("@controllers/auth") },
  { path: "/threads", provider: require("@controllers/threads") },
];
