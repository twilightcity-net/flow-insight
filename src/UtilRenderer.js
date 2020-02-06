import { BrowserRequestFactory } from "./controllers/BrowserRequestFactory";

export default class UtilRenderer {
  /**
   * helper function to return a date time string from a date object that is localized
   * to our current timezoe
   * @param date
   * @returns {string}
   */
  static getDateTimeString(date) {
    return date.toLocaleTimeString() + " " + date.toLocaleDateString();
  }

  /**
   * checks if an object is empty but not null
   * @param obj
   * @returns {boolean|boolean}
   */
  static isObjEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
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
    let req = request.toLowerCase().split(BrowserRequestFactory.URI_SEPARATOR);
    let res = req[1].split(BrowserRequestFactory.PATH_SEPARATOR);
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
   * gets a unique id in a ISO GUID format based off random number
   * @returns {string}
   */

  //TODO this should get the current epoch time and add it to the random number
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
