import { BrowserRequestFactory } from "./controllers/BrowserRequestFactory";
import { BaseClient } from "./clients/BaseClient";
import moment from "moment";

export default class UtilRenderer {
  /**
   * helper function to return a date time string from a date object that is localized
   * to our current timezoe
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
   * checks if an object is empty but not null
   * @param obj
   * @returns {boolean|boolean}
   */
  static isObjEmpty(obj) {
    return (
      Object.keys(obj).length === 0 &&
      obj.constructor === Object
    );
  }

  /**
   * clears a interval timer from our global scope. fast timers rock
   * @param timer - our window timer to clearclea
   */
  static clearIntervalTimer(timer) {
    if (timer) {
      window.clearInterval(timer);
    }
    return null;
  }

  /**
   * formats our circuit name string with _ and capitalizes the first character
   * @param circuitName
   * @returns {string}
   */
  static getFormattedCircuitName(circuitName) {
    return circuitName
      .split("_")
      .map((t, i) => {
        if (t.length > 1) {
          return t.charAt(0).toUpperCase() + t.slice(1);
        }
        return t.charAt(0).toUpperCase();
      })
      .join(" ");
  }

  /**
   * gets our timer string from the time now see getWtfTimerStringFromSeconds
   * @param openTime
   * @returns {string}
   */
  static getWtfTimerStringFromOpenTime(openTime) {
    let t = moment().diff(openTime, "s"),
      d = (t / 86400) | 0,
      h = ((t / 3600) | 0) % 24,
      m = ((t / 60) | 0) % 60,
      s = t % 60;

    return (
      (d < 10 ? "0" + d : d) +
      ":" +
      (h < 10 ? "0" + h : h) +
      ":" +
      (m < 10 ? "0" + m : m) +
      ":" +
      (s < 10 ? "0" + s : s) +
      "s"
    );
  }

  /**
   * calculates a string representation of a total amount of nanoseconds. This
   * is commonly used to calculate the total elapsed paused time for example.
   * @param nanoseconds
   */
  static getWtfTimerStringFromTotalNs(nanoseconds) {
    console.log("nano", nanoseconds);
    return nanoseconds / 1000000000;
  }

  /**
   * gets a date time string from an array of time values
   * @param array
   * @returns {string}
   */
  static getTimeStringFromTimeArray(array) {
    // console.log(array);
    return "5 min";
  }

  /**
   * figured out what our open time string is given a utc array
   * of date time numbers in central timezone
   * @param array
   * @returns {string}
   */
  static getOpenTimeStringFromOpenTimeArray(array) {
    if (array) {
      let t = moment.utc([
        array[0],
        array[1] - 1,
        array[2],
        array[3],
        array[4],
        array[5]
      ]);
      return t.format("MMM Do YYYY, h:mm:ss a");
    }
    return "";
  }

  /**
   * gets the browser resource from a given request
   * @param request
   * @returns {{action: string, uriArr: string[], uri: string}}
   */
  static getResourceFromRequest(request) {
    if (!request) {
      return {
        action: BrowserRequestFactory.ACTION_ERROR,
        uri: BrowserRequestFactory.URI_ERROR,
        uriArr: [BrowserRequestFactory.URI_ERROR]
      };
    }
    let req = request
      .toLowerCase()
      .split(BrowserRequestFactory.URI_SEPARATOR);
    let res = req[1].split(
      BrowserRequestFactory.PATH_SEPARATOR
    );
    if (res[0] === "/" || res[0] === "") {
      res.shift();
    }
    if (!req[1].startsWith("/")) {
      req[1] += "/" + req[1];
    }
    return {
      action: req[0],
      uri: req[1],
      uriArr: res
    };
  }

  /**
   * iterates over an array to see if we alread have the message. simple
   * shit right?
   * @param arr - our array to search in
   * @param message - our message we are looking for
   * @returns {boolean}
   */
  static hasMessageInArray(arr, message) {
    let length = arr.length;
    for (let i = 0, m = null; i < length; i++) {
      m = arr[i];
      if (m.id === message.id) {
        return true;
      }
    }
    return false;
  }

  /**
   * searches an array for a message which id equals the
   * parameter id's
   * @param arr
   * @param message
   */
  static updateMessageInArrayById(arr, message) {
    let length = arr.length;
    for (let i = 0, m = null; i < length; i++) {
      m = arr[i];
      if (m.id === message.id) {
        arr[i] = message;
        break;
      }
    }
    return arr;
  }

  /**
   * a simple check to see if a talk message is a status message
   * @param message
   * @returns {boolean}
   */
  static isStatusMessage(message) {
    return (
      message.messageType ===
        BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT ||
      message.messageType ===
        BaseClient.MessageTypes.CIRCUIT_STATUS
    );
  }

  /**
   * determines if this should be a wtf session or new start session componet
   * @param resource
   * @returns {boolean}
   */
  static isWTFResource(resource) {
    let arr = resource.uriArr;
    if (arr.length > 1) {
      if (arr[1] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length > 2) {
          return true;
        }
      }
    }
    return false;
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
   * gets the name of our room from a given circuit resource
   * @param resource
   * @returns {string|null}
   */
  static getRoomNameFromResource(resource) {
    let arr = resource.uriArr;
    if (arr.length > 1) {
      if (arr[1] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length > 2) {
          return (
            arr[2] +
            "-" +
            BrowserRequestFactory.Locations.WTF
          );
        }
      }
    }
    return null;
  }

  /**
   * gets a decimal percent of our relative xp towards the next level.
   * @param xpProgress
   * @param xpRequiredToLevel
   * @returns {number}
   */
  static getXpPercent(xpProgress, xpRequiredToLevel) {
    return ((xpProgress / xpRequiredToLevel) * 100) | 0;
  }

  /**
   * checks of our member is online by their online status field
   * @param member
   * @returns {boolean}
   */
  static isMemberOnline(member) {
    return member.onlineStatus === "Online";
  }

  static isEveryoneTeam(team) {
    return team.name === "Everyone";
  }

  /**
   * checks our member dto to see if we have an active circuit
   * and if we do then we need ot set the alarm flag to true.
   * @param member
   * @returns {boolean}
   */
  static isMemberAlarm(member) {
    return !!member.activeCircuit;
  }

  /**
   * checks a circuit to see if its state is on_hold (paused)
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitPaused(circuit) {
    return (
      circuit &&
      circuit.circuitState ===
        BaseClient.CircuitStates.ON_HOLD
    );
  }

  /**
   * helper function that given a specific user and a circuit, it will
   * return true if the member created it or is a moderator. This
   * is done by comparing the id's of the member in the circuit.
   * see the Util's version of this, which is identical.
   * @param member
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitOwnerModerator(member, circuit) {
    return (
      member &&
      circuit &&
      member.id === (circuit.ownerId || circuit.moderatorId)
    );
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
   * gets a unique id in a ISO GUID format based off random number
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
