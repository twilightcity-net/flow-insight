const isDev = require("electron-is-dev");

/* 
 * general purpose global utility functions
 */
module.exports = class Util {
  /*
	 * Used to force showing the chrome dev tools for debugging
	 */
  static showDevTools(window) {
    if (!isDev) return;
    window.openDevTools({ detach: true });
  }
};
