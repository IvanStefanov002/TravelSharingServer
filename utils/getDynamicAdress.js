require("dotenv").config();
const os = require("os");

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (
        iface.family === "IPv4" &&
        !iface.internal &&
        !iface.address.startsWith("169.")
      ) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

const getCurrentUrl = () => {
  const ip = getLocalIp();
  const development = `http://${ip}:${process.env.PORT}/`;
  const production = process.env.PRODUCTION_URL || "https://your-prod-url.com";
  return process.env.NODE_ENV === "production" ? production : development;
};

module.exports = getCurrentUrl;
