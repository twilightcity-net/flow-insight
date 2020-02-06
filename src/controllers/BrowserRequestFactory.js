/**
 * a factory class that is used to create new requests for our browser
 * @type{BrowserRequestFactory}
 */
export class BrowserRequestFactory {
  /**
   * the possible types of request we have
   * @returns {{ACTIVE_CIRCUIT: string, BROWSER: string, JOURNAL: string, FLOW: string, TROUBLESHOOT: string}}
   * @constructor
   */
  static get Requests() {
    return {
      BROWSER: "browser",
      JOURNAL: "journal",
      TROUBLESHOOT: "troubleshoot",
      FLOW: "flow",
      ACTIVE_CIRCUIT: "active-circuit",
      TEAM: "team"
    };
  }

  /**
   * separates the action from our uri
   * @returns {string}
   * @constructor
   */
  static get URI_SEPARATOR() {
    return "::";
  }

  /**
   * separates what denotes the root of the uri that represents the given resource
   * @returns {string}
   * @constructor
   */
  static get ROOT_SEPARATOR() {
    return "/";
  }

  /**
   * separates dependent locations from our root location of our URI
   * @returns {string}
   * @constructor
   */
  static get PATH_SEPARATOR() {
    return "/";
  }

  /**
   * our possible actions we can perform on a uril
   * @returns {{JOIN: string, LEAVE: string, CLOSE: string, OPEN: string}}
   * @constructor
   */
  static get Actions() {
    return {
      OPEN: "open",
      CLOSE: "close",
      JOIN: "join",
      LEAVE: "leave"
    };
  }

  /**
   * the possible locations we can use
   * @returns {{ACTIVE: string, JOURNAL: string, WTF: string, ME: string, ROOM: string, CIRCUIT: string}}
   * @constructor
   */
  static get Locations() {
    return {
      CIRCUIT: "circuit",
      JOURNAL: "journal",
      FLOW: "flow",
      WTF: "wtf",
      ROOM: "room",
      ACTIVE: "active",
      ME: "me"
    };
  }

  /**
   * the string for browser action error
   * @returns {string}
   * @constructor
   */
  static get ACTION_ERROR() {
    return "error";
  }

  /**
   * the string for browser uri errors
   * @returns {string}
   * @constructor
   */
  static get URI_ERROR() {
    return "error";
  }

  /**
   * creates a request based on a given type of request that is past in. each request could have a variable
   * array size of arguments. the _fn calls are priavate and handle  validating this and returning the
   * uril path from enums above
   * @param requestType
   * @param args
   * @returns {*}
   */
  static createRequest(requestType, ...args) {
    switch (requestType) {
      case BrowserRequestFactory.Requests.BROWSER:
        return BrowserRequestFactory._getBrowserRequest(args[0], args[1]);
      case BrowserRequestFactory.Requests.ACTIVE_CIRCUIT:
        return BrowserRequestFactory._getActiveCircuitRequest(args[0]);
      case BrowserRequestFactory.Requests.JOURNAL:
        return BrowserRequestFactory._getJournalRequest(args[0]);
      case BrowserRequestFactory.Requests.TROUBLESHOOT:
        return BrowserRequestFactory._getTroubleshootRequest(args[0]);
      case BrowserRequestFactory.Requests.FLOW:
        return BrowserRequestFactory._getFlowRequest(args[0]);
      case BrowserRequestFactory.Requests.TEAM:
        return BrowserRequestFactory._getTeamRequest(args[0]);
      default:
        throw new Error("Unknown request type '" + requestType + "'");
    }
  }

  /**
   * returns a browser requestion from a given input string
   * @param action
   * @param uril
   * @returns {string}
   * @private
   */
  static _getBrowserRequest(action, uril) {
    if (uril) {
      return action + BrowserRequestFactory.URI_SEPARATOR + uril;
    } else {
      throw new Error(
        "request: browser requires 2 arguments, action and uril string "
      );
    }
  }

  /**
   * gets an active circuit request
   * @param circuitName
   * @returns {string}
   * @private
   */
  static _getActiveCircuitRequest(circuitName) {
    if (circuitName) {
      return (
        BrowserRequestFactory.Actions.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.CIRCUIT +
        BrowserRequestFactory.PATH_SEPARATOR +
        BrowserRequestFactory.Locations.WTF +
        BrowserRequestFactory.PATH_SEPARATOR +
        circuitName
      );
    } else {
      throw new Error(
        "request: active circuit requires 1 argument, circuitName"
      );
    }
  }

  /**
   * gets journal request for a team member
   * @param teamMember
   * @returns {string}
   * @private
   */
  static _getJournalRequest(teamMember) {
    if (teamMember) {
      return (
        BrowserRequestFactory.Actions.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.JOURNAL +
        BrowserRequestFactory.PATH_SEPARATOR +
        teamMember
      );
    } else {
      throw new Error("request: journal requires 1 argument, teamMember");
    }
  }

  /**
   * gets a trouble shoot request which if a name is passed in, then
   * we should create a new circuit using that
   * @param circuitName
   * @returns {string}
   * @private
   */
  static _getTroubleshootRequest(circuitName) {
    if (circuitName) {
      return (
        BrowserRequestFactory.Actions.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.CIRCUIT +
        BrowserRequestFactory.PATH_SEPARATOR +
        BrowserRequestFactory.Locations.WTF +
        BrowserRequestFactory.PATH_SEPARATOR +
        circuitName
      );
    } else {
      return (
        BrowserRequestFactory.Actions.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.CIRCUIT +
        BrowserRequestFactory.PATH_SEPARATOR +
        BrowserRequestFactory.Locations.WTF
      );
    }
  }

  /**
   * gets the request for showing the flow content of a team member
   * @param teamMember
   * @returns {string}
   * @private
   */
  static _getFlowRequest(teamMember) {
    if (teamMember) {
      return (
        BrowserRequestFactory.Actions.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.FLOW +
        BrowserRequestFactory.PATH_SEPARATOR +
        teamMember
      );
    } else {
      throw new Error("request: flow requires 1 argument, teamMember");
    }
  }

  /**
   * gets the request for loading a team member into our console
   * @param teamMember
   * @returns {string}
   * @private
   */
  static _getTeamRequest(teamMember) {
    if (teamMember) {
      return (
        BrowserRequestFactory.Actions.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.JOURNAL +
        BrowserRequestFactory.PATH_SEPARATOR +
        teamMember
      );
    } else {
      throw new Error("request: team requires 1 argument, teamMember");
    }
  }
}
