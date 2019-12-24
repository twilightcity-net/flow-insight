const { app, shell } = require("electron"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  path = require("path"),
  util = require("util"),
  fs = require("fs"),
  os = require("os");

/**
 * general purpose global utility functions
 * @class Util
 * @type {module.Util}
 */
module.exports = class Util {
  /**
   * static linking to internal nodejs util exports
   * @https://nodejs.org/api/util.html#util_util
   * @returns {module:util}
   */
  static get node() {
    return util;
  }

  /**
   * stores slack tokens into an array matrix for encoding purposes
   * @returns {{"0": string[], "1": string[], "2": string[], "3": string[], "4": string[], "5": string[], "6": string[], "7": string[], "8": string[]}}
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

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenA() {
    return this.getToken(0);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenB() {
    return this.getToken(1);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenC() {
    return this.getToken(2);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenD() {
    return this.getToken(3);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenE() {
    return this.getToken(4);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenF() {
    return this.getToken(5);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenG() {
    return this.getToken(6);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenH() {
    return this.getToken(7);
  }

  /**
   * slack tokens
   * @returns {*}
   */
  static get tokenI() {
    return this.getToken(8);
  }

  /**
   * shortcut helper link to a baked util.inspect
   * @param object
   * @returns {string}
   */
  static inspect(object) {
    return util.inspect(object, {
      showHidden: true,
      depth: null,
      colors: true,
      showProxy: true,
      maxArrayLength: null,
      breakLength: 80
    });
  }

  /**
   * the applications name
   * @returns {string}
   */
  static getAppName() {
    return app.getName();
  }

  /**
   * gets the api url to use
   * @returns {string}
   */
  static getAppApi() {
    let url = "https://torchie.dreamscale.io";
    if (isDev) {
      process.argv.forEach(function(val, index, array) {
        if (val.toLowerCase().startsWith("server=")) {
          url = val.toLowerCase().substring(7);
        }
      });
    }
    return url;
  }

  /**
   * gets the url of the Talk Server. returns localhost if it is local
   * @returns {string}
   */
  static getAppTalkUrl() {
    // FIXME use the new secure talk url on heroku (needs to be setup)

    let url = "http://ds-talk.herokuapp.com";
    if (isDev) {
      process.argv.forEach(function(val, index, array) {
        if (val.toLowerCase().startsWith("talk=")) {
          return val.toLowerCase().substring(5);
        }
      });
    }
    return url;
  }

  /**
   * gets a startup environmental flag to tell the system to run 3d modeor not
   * this should be false for now until we figure out what the fuck we are doin'
   * also kinda need an artist to make this all work
   * @returns {boolean} - the boolean flag to display 3d or not
   */
  static getRender3D() {
    let flag = false;
    if (isDev) {
      process.argv.forEach(function(val, index, array) {
        if (val.toLowerCase().startsWith("render3d=")) {
          flag = val.toLowerCase().substring(9);
        }
      });
    }
    return flag;
  }

  /**
   * the root applciation icon
   * @param name
   * @returns {string}
   */
  static getAppIcon(name) {
    // TODO: This is wrong.  It should take account of the platform; see AppTray.js.  Its code ought to be extracted into here
    return path.join(__dirname, "assets/icons/" + name);
  }

  /**
   * gets the root app page
   * @returns {string}
   */
  static getAppRootDir() {
    return __dirname;
  }

  /**
   * gets the user data for app
   * @returns {string}
   */
  static getAppUserDataDir() {
    return app.getPath("userData");
  }

  /**
   * gets the base path for the asset resouces
   * @returns {string}
   */
  static getAssetsDir() {
    if (isDev) {
      return path.join(__dirname, "assets");
    }
    return path.join(app.getAppPath(), __dirname, "assets");
  }

  /**
   * gets the path of a specific asset. must provide qualifying location
   * @param asset
   * @returns {string}
   */
  static getAssetPath(asset) {
    return path.join(Util.getAssetsDir(), asset);
  }

  /**
   * sets the user data directory for dev mode
   */
  static setDevUserDataDir() {
    let filePath = path.join(app.getAppPath(), "data");
    console.log("*** DEVELOPMENT MODE [" + filePath + "] ***");
    app.setPath("userData", filePath);
  }

  /**
   * gets the users home directory based on which os they are using
   * @returns {string}
   */
  static getUserHomePath() {
    return process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
  }

  /**
   * gets our hot key configuration file
   * @returns {string}
   */
  static getConfiguredHotkeysOrDefault() {
    let hotkeyConfPath = path.join(this.getFlowHomePath(), "hotkey.conf");

    let defaultKey = "CommandOrControl+`";
    let activeHotkey = defaultKey;

    if (fs.existsSync(hotkeyConfPath)) {
      activeHotkey = fs.readFileSync(hotkeyConfPath, "utf8");
    } else {
      fs.mkdir(this.getFlowHomePath());

      fs.writeFileSync(hotkeyConfPath, defaultKey, "utf8");
    }

    log.info("[Util] found hotkey config: " + activeHotkey);
    return activeHotkey;
  }

  /**
   * checks to see if we started the app from the command line
   * @param args
   * @returns {boolean}
   */
  static checkIfCalledFromCLI(args) {
    if (args && args.length > 1) {
      return true;
    }
    return false;
  }

  /**
   * gets the path of our .flow directory that torchie and our plugins share
   * @returns {string}
   */
  static getFlowHomePath() {
    return path.join(os.homedir(), ".flow");
  }

  /**
   * returns the file path to the settings file that electron stores as JSON
   * @returns {string}
   */
  static getAppSettingsPath() {
    return path.join(Util.getFlowHomePath(), "settings.json");
  }

  /**
   * returns the api key file thats is stored in the .flow directory.
   * @todo this needs to be encrypted, plugin need to be updated too
   * @returns {string}
   */
  static getApiKeyPath() {
    return path.join(Util.getFlowHomePath(), "api.key");
  }

  /**
   * the path where we store our screenshots
   * @returns {string}
   */
  static getScreenshotFolderPath() {
    let screensFolder = path.join(this.getFlowHomePath(), "screenshots");
    fs.mkdir(screensFolder);
    return screensFolder;
  }

  /**
   * used to generate a new screenshot path
   * @returns {string}
   */
  static getLatestScreenshotPath() {
    return path.join(
      this.getScreenshotFolderPath(),
      "screen_" + Math.random() + ".png"
    );
  }

  /**
   * sets the applications tray into memory
   * @param tray
   */
  static setAppTray(tray) {
    app.tray = tray;
  }

  /**
   * gets the application tray object
   * @returns {*}
   */
  static getAppTray() {
    return app.tray;
  }

  /**
   * opens external default os browser window with url.
   * @todo this should use the opn-cli util which is cross platform
   * @param url
   */
  static openExternalBrowser(url) {
    shell.openExternal(url);
  }

  /**
   * gets the local time and date as a string
   * @param date
   * @returns {string}
   */
  static getDateTimeString(date) {
    return date.toLocaleTimeString() + " " + date.toLocaleDateString();
  }

  /**
   * returns a new unique random GUID with a random number generator
   * @returns {string}
   */
  static getGuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }

  /**
   * use our MTA card to get tokens
   * @param id
   * @returns {*}
   */
  static getToken(id) {
    return this.tokens[id];
  }
};
