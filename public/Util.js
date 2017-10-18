const { app, shell } = require("electron"),
  isDev = require("electron-is-dev");

/* 
 * general purpose global utility functions
 */
module.exports = class Util {
  /*
   * returns the applications name
   */
  static getAppName() {
    return app.getName();
  }

  /*
    * opens external default os browser window with url
    */
  static openExternalBrowser(url) {
    shell.openExternal(url);
  }
  /*
	 * Used to force showing the chrome dev tools for debugging
	 */
  static showDevTools(window) {
    if (!isDev) return;
    window.openDevTools({ detach: true });
  }

  static getDateTimeString(date) {
    return date.toLocaleTimeString() + " " + date.toLocaleDateString();
  }

  /*
   * store some tokens for the subway
   */
  static get tokens() {
    return {
      0: ["a", "H", "R", "0", "c", "H", "M", "="],
      1: ["a", "G", "9", "v", "a", "3", "M", "="],
      2: ["c", "2", "x", "h", "Y", "2", "s", "="],
      3: ["Y", "2", "9", "t"],
      4: ["c", "2", "V", "y", "d", "m", "l", "j", "Z", "X", "M", "="],
      5: ["u", "n", "s", "Q", "w", "K", "s", "Z", "A", "u", "a", "P"],
      6: ["x", "S", "s", "C", "j", "j", "1", "E", "8", "7", "y", "s"],
      7: ["Y", "R", "G", "P", "N", "7", "F", "7", "B"],
      8: ["Z", "6", "9", "M", "R", "S", "G", "0", "T"]
    };
  }

  /*
   * use our MTA card to get tokens
   */
  static getToken(id) {
    return this.tokens[id];
  }

  /*
   * our MTA cards
   */
  static get tokenA() {
    return this.getToken(0);
  }
  static get tokenB() {
    return this.getToken(1);
  }
  static get tokenC() {
    return this.getToken(2);
  }
  static get tokenD() {
    return this.getToken(3);
  }
  static get tokenE() {
    return this.getToken(4);
  }
  static get tokenF() {
    return this.getToken(5);
  }
  static get tokenG() {
    return this.getToken(6);
  }
  static get tokenH() {
    return this.getToken(7);
  }
  static get tokenI() {
    return this.getToken(8);
  }
};
