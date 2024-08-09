const { app, shell } = require("electron"),
  isDev = require("electron-is-dev"),
  path = require("path"),
  util = require("util"),
  fs = require("fs"),
  os = require("os"),
  moment = require("moment-timezone");

/**
 * general purpose global utility functions
 * @type {Util}
 */
class Util {
  /**
   * static linking to internal nodejs util exports
   * @https://nodejs.org/api/util.html#util_util
   * @returns {module:util}
   */
  static get node() {
    return util;
  }

  /**
   * checks to see if we have an empty object.
   * @param obj
   * @returns {boolean}
   */
  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  /**
   * Get a nicely formatted time string from a utc db timestamp
   * @param formattedTime
   * @returns {string}
   */

  static getTimeString(formattedTime) {
    let t = moment.utc(
      formattedTime,
      "YYYY-MM-DDTHH:mm:ss.SSS"
    );

    return t.utc().local().calendar();
  }

  static getCurrentLocalTimeString() {
    return moment().format("YYYY-MM-DDTHH:mm:ss");
  }

  static getCurrentTime() {
    return moment().local().toDate();
  }


  /**
   * Expects two formatted datestamps in formattedEventTimeEnd and returns the number of
   * seconds between them
   * @param formattedEventTimeStart
   * @param formattedEventTimeEnd
   * @returns {number}
   */
  static getTimeDifferenceInSeconds(formattedEventTimeStart, formattedEventTimeEnd) {
    var startTime = moment(formattedEventTimeStart, 'YYYY-MM-DDTHH:mm:ss');
    var endTime = moment(formattedEventTimeEnd, 'YYYY-MM-DDTHH:mm:ss');

    var duration = moment.duration(endTime.diff(startTime));

    return duration.asSeconds();
  }

  /**
   * Clamp an integer value between a min and max value
   * @param intValue
   * @param min
   * @param max
   */
  static clamp(intValue, min, max) {
    if (intValue < min) {
      return min;
    }
    if (intValue > max) {
      return max;
    }
    return intValue;
  }

  /**
   * shortcut helper link to a baked util.inspect
   * @param object
   * @returns {string}
   */
  static inspect(object) {
    console.log(
      util.inspect(object, {
        showHidden: true,
        depth: null,
        colors: true,
        showProxy: true,
        maxArrayLength: null,
        breakLength: 80,
      })
    );
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
    let url = "https://home.twilightcity.net";
    if (isDev) {
      process.argv.forEach(function (val, index, array) {
        if (val.toLowerCase().startsWith("server=")) {
          url = val.toLowerCase().substring(7);
        }
      });
    }
    return url;
  }

  /**
   * gets the url of the Talknet Server. returns localhost if it is local
   * @returns {string}
   */
  static getAppTalkUrl() {
    let url = "https://talk.twilightcity.net";
    if (isDev) {
      process.argv.forEach((val) => {
        if (val.toLowerCase().startsWith("talk=")) {
          url = val.toLowerCase().substring(5);
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
      process.argv.forEach(function (val, index, array) {
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
   * Create a folder if it doesn't exist, and run callback when complete
   * @param folder
   * @param callback
   */
  static createFolderIfDoesntExist(folder, callback) {
    fs.mkdir(folder, callback);
  }


  /**
   * sets the user data directory for dev mode
   */
  static setDevUserDataDir() {
    let filePath = path.join(app.getAppPath(), "data");
    console.log(
      "*** DEVELOPMENT MODE [" + filePath + "] ***"
    );
    app.setPath("userData", filePath);
  }

  /**
   * gets the users home directory based on which os they are using
   * @returns {string}
   */
  static getUserHomePath() {
    return process.env[
      process.platform === "win32" ? "USERPROFILE" : "HOME"
    ];
  }

  /**
   * Touch a file, create an empty file if it doesn't exist
   * @param filePath
   */
  static touchFile(filePath) {
    fs.closeSync(fs.openSync(filePath, 'w'));
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
   * gets the path of our .flow directory that TC and our plugins share
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
    return path.join(
      Util.getFlowHomePath(),
      "settings.json"
    );
  }

  /**
   * returns the file path to the plugins folder that can optionally include
   * flow metrics plugins that augment the data in feeds
   * @returns {string}
   */
  static getPluginFolderPath() {
    let pluginFolder = path.join(
      Util.getFlowHomePath(),
      "plugins"
    );
    return pluginFolder;
  }


  static deleteSettings() {
    let settingsPath = this.getAppSettingsPath();
    fs.unlink(settingsPath, (err) => {
      if (err) {
        //couldnt delete file
        return -1;
      }

      return 0;
    });
  }

  /**
   * returns the file path to the settings file that electron stores as JSON
   * @returns {string}
   */
  static getSettingsFileName() {
    return "settings.json";
  }

  /**
   * the path where we store our screenshots
   * @returns {string}
   */
  static getScreenshotFolderPath() {
    let screensFolder = path.join(
      this.getFlowHomePath(),
      "screenshots"
    );
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
    return (
      date.toLocaleTimeString() +
      " " +
      date.toLocaleDateString()
    );
  }

  /**
   * gets an epoch unix timestamp from a given UTC string with a timezone
   * @param utcStr
   * @returns {number}
   */
  static getTimestampFromUTCStr(utcStr) {
    return moment(utcStr).valueOf();
  }


  /**
   * Get a local date object back from a formatted utc string
   * @param utcStr
   */
  static getDateFromUTCStr(utcStr) {
    let t = moment.utc(utcStr, "YYYY-MM-DDTHH:mm:ss");
    return t.local().toDate();
  }

  /**
   * gets the uri guid of our talk room from the first item in our array index.
   * We use this value to store into a room collection that allows us to
   * reference this for future use.
   * @param array
   * @returns {string}
   */
  static getUriFromMessageArray(array) {
    let uri = "";
    if (!!array && array.length > 0) {
      uri = array[0].uri;
    }
    return uri;
  }

  /**
   * gets our room name from our urn that is contained within  one of the messages
   * (we use the first one). once we get the urn we split the string into its various
   * parts then the last  index of it is the room name.
   * @param array
   * @returns {string}
   */
  static getRoomNameFromMessageArray(array) {
    let roomName = "";
    if (!!array && array.length > 0) {
      let urn = array[0].urn;
      let arr = urn.split("/");
      roomName = arr[arr.length - 1];
    }
    return roomName;
  }

  /**
   * useful helper to detect if we have a sql injection attack. Should
   * implement this anywhere we are sending data or receiving data.
   *
   * sql regex reference: http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
   * @param value
   * @returns {boolean}
   */
  static hasSQL(value) {
    if (value === null || value === undefined) {
      return false;
    }

    let sql_meta = new RegExp(
      "(%27)|(')|(--)|(%23)|(#)",
      "i"
    );
    if (sql_meta.test(value)) {
      return true;
    }

    /* eslint no-control-regex: "off" */
    let sql_meta2 = new RegExp(
      "((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))",
      "i"
    );
    if (sql_meta2.test(value)) {
      return true;
    }

    let sql_typical = new RegExp(
      "w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))",
      "i"
    );
    if (sql_typical.test(value)) {
      return true;
    }

    let sql_union = new RegExp("((%27)|('))union", "i");
    return sql_union.test(value);
  }

  /**
   * helper function that given a specific user and a circuit, it will
   * return true if the member created it or is a moderator. This
   * is done by comparing the id's of the member in the circuit.
   * @param member
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitOwnerModerator(member, circuit) {
    return (
      member.id === (circuit.ownerId || circuit.moderatorId)
    );
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
}

module.exports = Util;
