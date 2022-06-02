import { BrowserRequestFactory } from "./controllers/BrowserRequestFactory";
import { BaseClient } from "./clients/BaseClient";
import moment from "moment";
import { Icon, Message } from "semantic-ui-react";
import React from "react";

export default class UtilRenderer {
  /**
   * the string prefix that is used to create our WTF timer string.
   * @type {string}
   */
  static wtfTimePrefixStr = "T + ";

  /**
   * our moment UTC format string that gridtime uses. This must match the
   * format schema that is set on gridtime server that you are accessing. DO
   * NOT CHANGE, EVEN IF YOU THINK THIS DOESN'T LOOK RIGHT; IT DOES.
   * @type {string}
   */
  static wtfTimeFormatStr = "MMM Do YYYY, h:mm:ss a";

  /** ChartDto map properties for feature data */

  static FILE_DATA = "@place/location";
  static EXEC_DATA = "@exec/runtime";

  /**
   * this is the name of the meta property field which the talk message uses
   * to store the value of the user whom made the request.
   * @type {string}
   */
  static fromUserNameMetaPropsStr = "from.username";

  /**
   * this is the name of the meta property field which the talk message uses
   * to store the value of the memberId whom made the request.
   * @type {string}
   */
  static fromMemberIdMetaPropsStr = "from.member.id";
  /**
   * helper function to return a date time string from a date object that is localized
   * to our current timezone
   * @param date - moment js date object
   * @returns {string} -  the utc string
   */
  static getDateTimeString(date) {
    return (
      date.toLocaleTimeString() +
      " " +
      date.toLocaleDateString()
    );
  }

  /**
   * Get simple formatted date string
   * @param date
   */
  static getDateString(date) {
    return moment.utc(date).format("MMM D");
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
   * @param timer - our window timer to clear
   */
  static clearIntervalTimer(timer) {
    if (timer) {
      window.clearInterval(timer);
    }
    return null;
  }

  /**
   * formats our circuit name string with _ and capitalizes the first character
   * @param name
   * @returns {string}
   */
  static getCapitalizedName(name) {
    return name
      .split("_")
      .map((t) => {
        if (t.length > 1) {
          return t.charAt(0).toUpperCase() + t.slice(1);
        }
        return t.charAt(0).toUpperCase();
      })
      .join(" ");
  }

  /**
   * renders our error page when an error occurs on gridtime
   * @param errorContext
   * @param error
   * @returns {*}
   */
  static getErrorPage(errorContext, error) {
    if (!errorContext) {
      errorContext = "Error Occurred";
    }

    return (
      <div id="component" className="errorLayout">
        <Message icon negative size="large">
          <Icon name="warning sign" />
          <Message.Content>
            <Message.Header>
              {errorContext} :(
            </Message.Header>
            {error}
          </Message.Content>
        </Message>
      </div>
    );
  }

  /**
   * gets our timer string from the time inside the circuit.  If the circuit is paused,
   *
   * @param openUtcTime
   * @param pausedNanoTime
   * @returns {string}
   */
  static getWtfTimerFromCircuit(circuit) {
    let openUtcTime = moment.utc(circuit.openTime);
    let totalPauseNanoTime =
      circuit.totalCircuitPausedNanoTime;
    let totalElapsedNanoTime =
      circuit.totalCircuitElapsedNanoTime;

    if (UtilRenderer.isCircuitTroubleshoot(circuit)) {
      // in this case, we want the ticking clock based on open time.
      let seconds =
        moment().diff(openUtcTime, "s") -
        UtilRenderer.getSecondsFromNanoseconds(
          totalPauseNanoTime
        );

      return UtilRenderer.getWtfTimerStringFromTimeDurationSeconds(
        seconds
      );
    } else {
      //we want the clock to be fixed based on total elapsed time
      let seconds = UtilRenderer.getSecondsFromNanoseconds(
        totalElapsedNanoTime
      );

      return UtilRenderer.getWtfTimerStringFromTimeDurationSeconds(
        seconds
      );
    }
  }


  /**
   * gets our timer string from the time inside a moovie circuit.  If the circuit is paused,
   *
   * @param moovie
   * @returns {string}
   */
  static getTimerFromMoovieCircuit(moovie) {
    if (moovie.circuitState === "OPEN") {
      return "Not Started";
    }

    let openUtcTime = moment.utc(moovie.startTime);
    let totalPauseNanoTime = moovie.totalCircuitPausedNanoTime;
    let totalElapsedNanoTime = moovie.totalCircuitElapsedNanoTime;

    if (moovie.circuitState === "STARTED") {
      // in this case, we want the ticking clock based on open time.
      let seconds =
        moment().diff(openUtcTime, "s") -
        UtilRenderer.getSecondsFromNanoseconds(
          totalPauseNanoTime
        );

      return UtilRenderer.getTimerStringFromTimeDurationSeconds(
        seconds
      );
    } else {
      //we want the clock to be fixed based on total elapsed time
      let seconds = UtilRenderer.getSecondsFromNanoseconds(
        totalElapsedNanoTime
      );

      return UtilRenderer.getTimerStringFromTimeDurationSeconds(
        seconds
      );
    }
  }

  /**
   * gets the number of seconds from the circuit timer to be used for math
   *
   * @returns {string}
   */
  static getWtfSecondsFromCircuit(circuit) {
    let openUtcTime = moment.utc(circuit.openTime);
    let totalPauseNanoTime =
      circuit.totalCircuitPausedNanoTime;
    let totalElapsedNanoTime =
      circuit.totalCircuitElapsedNanoTime;

    if (UtilRenderer.isCircuitTroubleshoot(circuit)) {
      // in this case, we want the ticking clock based on open time.
      let seconds =
        moment().diff(openUtcTime, "s") -
        UtilRenderer.getSecondsFromNanoseconds(
          totalPauseNanoTime
        );

      return seconds;
    } else {
      //we want the clock to be fixed based on total elapsed time
      let seconds = UtilRenderer.getSecondsFromNanoseconds(
        totalElapsedNanoTime
      );

      return seconds;
    }
  }

  /**
   * gets our timer string from the time now see getWtfTimerStringFromSeconds
   * @param openUtcTime
   * @param pausedNanoTime
   * @returns {string}
   */
  static getWtfTimerStringFromOpenMinusPausedTime(
    openUtcTime,
    pausedNanoTime
  ) {
    let t =
      moment().diff(openUtcTime, "s") -
      UtilRenderer.getSecondsFromNanoseconds(
        pausedNanoTime
      );

    return UtilRenderer.getWtfTimerStringFromTimeDurationSeconds(
      t
    );
  }

  /**
   * Retrieves the circuit name from a circuit path
   * @param circuitPath
   * @returns {string}
   */
  static getCircuitName(circuitPath) {
    let circuitName = circuitPath;
    if (
      circuitPath != null &&
      circuitPath.includes("/wtf")
    ) {
      circuitName = circuitPath.substr(
        circuitPath.lastIndexOf("/") + 1
      );
    }

    return circuitName;
  }

  /**
   * gets our timer string for other functions that the gui uses from seconds
   * @param seconds
   * @returns {string}
   */
  static getTimerString(seconds) {
    let hours = (seconds / 3600) | 0,
      minutes = ((seconds / 60) | 0) % 60;

    let roundedMinute = Math.round((seconds % 60) / 60);
    minutes += roundedMinute;

    if (hours === 0 && minutes === 0 && seconds > 0) {
      minutes = 1;
    }

    return (
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes)
    );
  }

  /**
   * gets our wtf timer string for other functions that the gui uses.
   * @param hours
   * @param minutes
   * @param seconds
   * @returns {string}
   */
  static getWtfTimerString(hours, minutes, seconds) {
    return (
      UtilRenderer.wtfTimePrefixStr +
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds) +
      "s"
    );
  }

  /**
   * gets our timer string without the wtf prefix
   * @param hours
   * @param minutes
   * @param seconds
   * @returns {string}
   */
  static getTimerStringWithoutPrefix(hours, minutes, seconds) {
    return (
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds) +
      "s"
    );
  }

  /**
   * returns the relative elased time based on the number of seconds
   * @param seconds
   */
  static getRelativeTimerAsHoursMinutes(seconds) {
    let hours = (seconds / 3600) | 0;
    let minutes = ((seconds / 60) | 0) % 60;

    let timer =
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes);

    return timer;
  }

  /**
   * returns our the total amount of time that has elapsed, excluding pause
   * time which is precompiled by gridtime.
   * @param seconds
   */
  static getWtfTimerStringFromTimeDurationSeconds(seconds) {
    return UtilRenderer.getWtfTimerString(
      (seconds / 3600) | 0,
      ((seconds / 60) | 0) % 60,
      seconds % 60
    );
  }

  /**
   * returns our the total amount of time that has elapsed,
   * displayed without any prefix
   * @param seconds
   */
  static getTimerStringFromTimeDurationSeconds(seconds) {
    return UtilRenderer.getTimerStringWithoutPrefix(
      (seconds / 3600) | 0,
      ((seconds / 60) | 0) % 60,
      seconds % 60
    );
  }

  /**
   * renders our wtf time from the circuit
   * @param circuit
   * @returns {string}
   */

  static getWtfTimerCount(circuit) {
    if (!circuit) {
      return "loading...";
    } else {
      let openUtcTime = moment.utc(circuit.openTime);

      return UtilRenderer.getWtfTimerStringFromOpenMinusPausedTime(
        openUtcTime,
        circuit.totalCircuitPausedNanoTime
      );
    }
  }

  /**
   * Convert a number of seconds to a rough number of hours or days
   * for simplified friendly display.
   * @param seconds
   * @returns {string}
   */
  static convertSecondsToFriendlyDuration(seconds) {
    if (seconds >= 86400) {
      let days = Math.round(seconds / 86400);
      if (days > 1) {
        return days + " days";
      } else {
        return days + " day";
      }
    } else if (seconds >= 3600) {
      let hours = Math.round(seconds / 3600);
      if (hours > 1) {
        return hours + " hours";
      } else {
        return hours + " hour";
      }
    } else if (seconds >= 60) {
      let minutes = Math.round(seconds / 60);
      if (minutes > 1) {
        return minutes + " minutes";
      } else {
        return minutes + " minute";
      }
    } else {
      return seconds + " seconds";
    }
  }

  /**
   * Convert a duration string in hh:mm:ss format to a number of seconds
   * @param durationStr
   */
  static getSecondsFromDurationString(durationStr) {
    let splitArray = durationStr.split(":");

    if (splitArray.length !== 3) {
      console.error(
        "Trying to split duration with invalid format, expecting hh:mm:ss, got " +
          durationStr
      );
      return 0;
    }

    let hours = parseInt(splitArray[0], 10);
    let minutes = parseInt(splitArray[1], 10);
    let seconds = parseInt(splitArray[2], 10);

    return hours * 60 * 60 + minutes * 60 + seconds;
  }

  /**
   * calculates a string representation of a total amount of nanoseconds. This
   * is commonly used to calculate the total elapsed paused time for example.
   * @param nanoseconds
   */
  static getSecondsFromNanoseconds(nanoseconds) {
    return (nanoseconds / 1000000000) | 0;
  }

  /**
   * gets a date time string from an array of time values
   * @param array
   * @returns {string}
   */
  static getTimeStringFromTimeArray(array) {
    if (array) {
      let t = moment.utc([
        array[0],
        array[1] - 1,
        array[2],
        array[3],
        array[4],
        array[5],
      ]);
      return t.format(UtilRenderer.wtfTimeFormatStr);
    }
    return "";
  }

  /**
   * figured out what our open time string is given input default format,
   * and return in the form required for the UI to display Open Time
   * @param formattedTime like 2021-09-10T18:00:10.31
   * @returns {string}
   */
  static getOpenTimeString(formattedTime) {
    let t = moment.utc(
      formattedTime,
      "YYYY-MM-DDTHH:mm:ss.SSS"
    );

    return t.utc().local().calendar();
  }

  /**
   * figured out what our open time string is given input default format,
   * and return in the form required for the UI to display Journal Time
   * @param formattedTime like 2021-09-10T18:00:10.31
   * @returns {string}
   */
  static getJournalTimeString(formattedTime) {
    let t = moment.utc(
      formattedTime,
      "YYYY-MM-DDTHH:mm:ss.SSS"
    );

    return t.utc().local().calendar();
  }

  /**
   * figured out what our chat message time string is given input default format,
   * and return in the form required for the UI to display Chat Message Times
   * @param formattedTime like 2021-09-10T18:00:10.31
   * @returns {string}
   */
  static getChatMessageTimeString(formattedTime) {
    let t = moment.utc(
      formattedTime,
      "YYYY-MM-DDTHH:mm:ss.SSS"
    );

    return t.utc().local().calendar();
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
        uriArr: [BrowserRequestFactory.URI_ERROR],
      };
    }
    let req = request
      .toLowerCase()
      .split(BrowserRequestFactory.URI_SEPARATOR);

    if (!req[1].startsWith("/")) {
      req[1] = "/" + req[1];
    }
    if (req[1].includes(" ")) {
      req[1] = req[1].replace(" ", "/");
    }

    let res = req[1].split(
      BrowserRequestFactory.PATH_SEPARATOR
    );
    if (res[0] === "/" || res[0] === "") {
      res.shift();
    }

    return {
      action: req[0],
      uri: req[1],
      uriArr: res,
    };
  }

  /**
   * iterates over an array to see if we alread have the message. simple
   * shit right?
   * @param arr - our array to search in
   * @param message - our message we are looking for
   * @returns {boolean}
   */
  static hasMessageByIdInArray(arr, message) {
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
   * Check if the circuit has been marked for close by my id
   * @param circuit
   * @param me
   * @returns {boolean}
   */
  static isMarkedForCloseByMe(circuit, me) {
    for (
      let i = 0;
      i < circuit.memberMarksForClose.length;
      i++
    ) {
      if (circuit.memberMarksForClose[i] === me.id) {
        return true;
      }
    }
    return false;
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
    if (arr.length > 0) {
      if (arr[0] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length > 1) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * determines if this should be a retro session connection
   * @param resource
   * @returns {boolean}
   */
  static isRetroResource(resource) {
    let arr = resource.uriArr;
    if (arr.length > 0) {
      if (
        arr[0] === BrowserRequestFactory.Locations.RETRO
      ) {
        if (arr.length > 1) {
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
   * gets the name of our wtf room from a given circuit resource
   * @param resource
   * @returns {string|null}
   */
  static getRoomNameFromResource(resource) {
    let arr = resource.uriArr;
    if (arr.length > 0) {
      if (arr[0] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length > 1) {
          return (
            arr[1] +
            "-" +
            BrowserRequestFactory.Locations.WTF
          );
        }
      }
    }
    return null;
  }

  /**
   * gets the name of our retro room from a given circuit resource
   * @param resource
   * @returns {string|null}
   */
  static getRetroRoomNameFromResource(resource) {
    let arr = resource.uriArr;
    if (arr.length > 0) {
      if (
        arr[0] === BrowserRequestFactory.Locations.RETRO
      ) {
        if (arr.length > 1) {
          return (
            arr[1] +
            "-" +
            BrowserRequestFactory.Locations.RETRO
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
    if (xpRequiredToLevel > 0) {
      return ((xpProgress / xpRequiredToLevel) * 100) | 0;
    } else {
      return 100;
    }
  }

  /**
   * gets a detailed XP display to show how much XP to next level
   * @param xpSummary
   * @returns {string}
   */
  static getXpDetailDisplay(xpSummary) {
    if (xpSummary.xpRequiredToLevel > 0) {
      return (
        xpSummary.xpProgress +
        " / " +
        xpSummary.xpRequiredToLevel +
        " XP"
      );
    } else {
      return xpSummary.totalXP + " XP";
    }
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
   * checks our member dto to see if we have an active circuit
   * and whether that circuit belongs to another member
   * @param member
   * @returns {boolean}
   */
  static isMemberHelping(member) {
    var helping =
      !!member.activeCircuit &&
      member.activeJoinType === "TEAM_MEMBER";
    return helping;
  }

  /**
   * checks to see if circuit is on_hold (paused)
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitActive(circuit) {
    return (
      circuit &&
      (circuit.circuitState ===
        BaseClient.CircuitStates.TROUBLESHOOT ||
        circuit.circuitState ===
          BaseClient.CircuitStates.RETRO)
    );
  }

  /**
   * checks to see if circuit is on_hold (paused)
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitTroubleshoot(circuit) {
    return (
      circuit &&
      circuit.circuitState ===
        BaseClient.CircuitStates.TROUBLESHOOT
    );
  }

  /**
   * checks to see if circuit is on_hold (paused)
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
   * checks to see if circuit is solved
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitSolved(circuit) {
    return (
      circuit &&
      circuit.circuitState ===
        BaseClient.CircuitStates.SOLVED
    );
  }

  /**
   * checks to see if circuit is in retro
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitInRetro(circuit) {
    return (
      circuit &&
      circuit.circuitState ===
        BaseClient.CircuitStates.RETRO
    );
  }

  /**
   * checks to see if circuit is canceled
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitCanceled(circuit) {
    return (
      circuit &&
      circuit.circuitState ===
        BaseClient.CircuitStates.CANCELED
    );
  }

  /**
   * checks to see if circuit is closed
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitClosed(circuit) {
    return (
      circuit &&
      circuit.circuitState ===
        BaseClient.CircuitStates.CLOSED
    );
  }

  /**
   * checks to see if circuit state is on_hold (paused)
   * @param circuitState
   * @returns {boolean}
   */
  static isCircuitStatePaused(circuitState) {
    return (
      circuitState &&
      circuitState === BaseClient.CircuitStates.ON_HOLD
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
   * a helper function which is used to look up a specific memberId (NOT
   * doc.id like everything else.), to see if it is part of the participants
   * array, and is also actually joined, not as a guest (which hasn't called
   * joinWTF on the circuit yet)
   * @param member
   * @param participants
   * @returns {boolean}
   */
  static isCircuitParticipant(member, participants) {
    let memberId = member.id;
    for (
      let i = 0, participant = null;
      i < participants.length;
      i++
    ) {
      participant = participants[i];
      if (participant.memberId === memberId) {
        return true;
      }
    }
    return false;
  }

  /**
   * renders our username from the talk message's meta-prop which contains
   * the string of this.
   * @param metaProps
   * @returns {boolean|*}
   */
  static getUsernameFromMetaProps(metaProps) {
    return (
      !!metaProps &&
      metaProps[UtilRenderer.fromUserNameMetaPropsStr]
    );
  }

  /**
   * renders our memberId from the talk message's meta-prop which contains
   * the string of this.
   * @param metaProps
   * @returns {boolean|*}
   */
  static getMemberIdFromMetaProps(metaProps) {
    return (
      !!metaProps &&
      metaProps[UtilRenderer.fromMemberIdMetaPropsStr]
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
