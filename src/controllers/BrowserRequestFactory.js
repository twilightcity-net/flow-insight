/**
 * a factory class that is used to create new requests for our browser
 * @type{BrowserRequestFactory}
 */

export class BrowserRequestFactory {
  /**
   * the possible types of request we have
   * @constructor
   */
  static get Requests() {
    return {
      ERROR: "error",
      COMMAND: "command",
      BROWSER: "browser",
      TERMINAL: "terminal",
      JOURNAL: "journal",
      FLOW: "flow",
      CIRCUIT: "circuit",
      RETRO_CIRCUIT: "retro-circuit",
      PLAY: "play",
      DASHBOARD: "dashboard",
      MOOVIE: "moovie",
    };
  }

  static get Commands() {
    return {
      OPEN: "open",
      WTF: "wtf",
      JOURNAL: "journal",
      TERMINAL: "terminal",
      PLAY: "play",
      MOOVIE: "moovie"
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
   * separates arguments
   * @returns {string}
   * @constructor
   */
  static get SPACE_SEPARATOR() {
    return " ";
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
   * the possible locations we can use
   * @constructor
   */
  static get Locations() {
    return {
      TERMINAL: "terminal",
      CIRCUIT: "circuit",
      JOURNAL: "journal",
      DASHBOARD: "dashboard",
      FLOW: "flow",
      PLAY: "play",
      MOOVIE: "moovie",
      WTF: "wtf",
      RETRO: "retro",
      ROOM: "room",
      ACTIVE: "active",
      ME: "me",
      ERROR: "error",
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
   * static string for unknown command error
   * @returns {{UNKNOWN: string}}
   * @constructor
   */
  static get Errors() {
    return {
      ERROR: "error",
      UNKNOWN: "unknown-command",
    };
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
    try {
      switch (requestType) {
        case BrowserRequestFactory.Requests.COMMAND:
          return BrowserRequestFactory._getCommandRequest(
            args[0]
          );
        case BrowserRequestFactory.Requests.BROWSER:
          return BrowserRequestFactory._getBrowserRequest(
            args[0],
            args[1]
          );
        case BrowserRequestFactory.Requests.CIRCUIT:
          return BrowserRequestFactory._getActiveCircuitRequest(
            args[0]
          );
        case BrowserRequestFactory.Requests.RETRO_CIRCUIT:
          return BrowserRequestFactory._getRetroCircuitRequest(
            args[0]
          );
        case BrowserRequestFactory.Requests.JOURNAL:
          return BrowserRequestFactory._getJournalRequest(
            args[0]
          );
        case BrowserRequestFactory.Requests.FLOW:
          return BrowserRequestFactory._getFlowRequest(
            args[0]
          );
        case BrowserRequestFactory.Requests.DASHBOARD:
          return BrowserRequestFactory._getDashboardRequest(
            args
          );
        case BrowserRequestFactory.Requests.PLAY:
          return BrowserRequestFactory._getPlayRequest();
        case BrowserRequestFactory.Requests.MOOVIE:
          return BrowserRequestFactory._getMoovieRequest();
        case BrowserRequestFactory.Requests.ERROR:
          return BrowserRequestFactory._getErrorRequest(
            args[0]
          );
        default:
          return BrowserRequestFactory._getUnknownCommandErrorRequest();
      }
    } catch (e) {
      return BrowserRequestFactory._getErrorRequest(
        e.toString()
      );
    }
  }

  /**
   * returns a request for unknown commands
   * @returns {string}
   * @private
   */
  static _getErrorRequest(message) {
    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.ERROR
    );
  }

  /**
   * returns a uri path with a command
   * @param args - array of arguments
   * @returns {string}
   * @private
   */
  static _getCommandRequest(arg) {
    console.log(
      "_getCommandRequest: " + JSON.stringify(arg)
    );
    let args = arg.split(
        BrowserRequestFactory.SPACE_SEPARATOR
      ),
      cmd = args[0];

    if (cmd) {
      switch (cmd) {
        case BrowserRequestFactory.Commands.WTF:
          return BrowserRequestFactory._getCommandWTFRequest(
            args
          );
        case BrowserRequestFactory.Commands.TERMINAL:
          return BrowserRequestFactory._getCommandTerminalRequest(
            args
          );
        case BrowserRequestFactory.Commands.JOURNAL:
          return BrowserRequestFactory._getCommandJournalRequest(
            args
          );
        case BrowserRequestFactory.Commands.PLAY:
          return BrowserRequestFactory._getPlayRequest();
        case BrowserRequestFactory.Commands.MOOVIE:
          return BrowserRequestFactory._getMoovieRequest();
        default:
          return BrowserRequestFactory._getUnknownCommandErrorRequest();
      }
    } else {
      throw new Error(
        "request: command requires 2 arguments, command"
      );
    }
  }

  /**
   * returns a request for unknown commands
   * @returns {string}
   * @private
   */
  static _getUnknownCommandErrorRequest() {
    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.ERROR
    );
  }

  /**
   * returns the request for a wtf new screen
   * @param args
   * @returns {string}
   * @private
   */
  static _getCommandWTFRequest(...args) {
    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.WTF
    );
  }

  /**
   * returns the request for a console terminal
   * @param args
   * @returns {string}
   * @private
   */
  static _getCommandTerminalRequest(...args) {
    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.TERMINAL
    );
  }

  /**
   * returns the request for a users journal 'me'
   * @param args
   * @returns {string}
   * @private
   */
  static _getCommandJournalRequest(...args) {
    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.JOURNAL +
      BrowserRequestFactory.PATH_SEPARATOR +
      BrowserRequestFactory.Locations.ME
    );
  }

  /**
   * returns a browser request from a given input string
   * @param action
   * @param uril
   * @returns {string}
   * @private
   */
  static _getBrowserRequest(action, uril) {
    if (uril) {
      return (
        action + BrowserRequestFactory.URI_SEPARATOR + uril
      );
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
        BrowserRequestFactory.Commands.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
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
   * loads our do it later circuits. pretty much the same as the active circuits
   * @param circuitName
   * @returns {string}
   * @private
   */
  static _getDoItLaterCircuitRequest(circuitName) {
    if (circuitName) {
      return (
        BrowserRequestFactory.Commands.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.WTF +
        BrowserRequestFactory.PATH_SEPARATOR +
        circuitName
      );
    } else {
      throw new Error(
        "request: do it later circuit requires 1 argument, circuitName"
      );
    }
  }

  /**
   * loads our retro circuits. pretty much the same as the active circuits
   * @param circuitName
   * @returns {string}
   * @private
   */
  static _getRetroCircuitRequest(circuitName) {
    if (circuitName) {
      return (
        BrowserRequestFactory.Commands.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.RETRO +
        BrowserRequestFactory.PATH_SEPARATOR +
        circuitName
      );
    } else {
      throw new Error(
        "request: retro circuit requires 1 argument, circuitName"
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
        BrowserRequestFactory.Commands.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.JOURNAL +
        BrowserRequestFactory.PATH_SEPARATOR +
        teamMember
      );
    } else {
      throw new Error(
        "request: journal requires 1 argument, teamMember"
      );
    }
  }

  /**
   * gets the request for playing the fervie mini game
   * @returns {string}
   * @private
   */
  static _getPlayRequest() {
    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.PLAY
    );
  }

  /**
   * gets the request for opening the moovie theater app
   * @returns {string}
   * @private
   */
  static _getMoovieRequest() {
    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.MOOVIE
    );
  }

  /**
   * gets the request for showing the default flow content
   * @param displayOption
   * @returns {string}
   * @private
   */
  static _getFlowRequest(displayOption) {

    let extendedPath = "";

    if (displayOption) {
      extendedPath =  BrowserRequestFactory.PATH_SEPARATOR + displayOption;
    }

    return (
      BrowserRequestFactory.Commands.OPEN +
      BrowserRequestFactory.URI_SEPARATOR +
      BrowserRequestFactory.ROOT_SEPARATOR +
      BrowserRequestFactory.Locations.FLOW +
      extendedPath
    );
  }

  /**
   * gets the request for showing a dashboard
   * @param args dashboardType, target, timeScope
   * @returns {string}
   * @private
   */
  static _getDashboardRequest(args) {
    let dashboardType = args[0];
    let targetType = args[1];
    let target = args[2];
    let timeScope = args[3];

    if (dashboardType) {
      return (
        BrowserRequestFactory.Commands.OPEN +
        BrowserRequestFactory.URI_SEPARATOR +
        BrowserRequestFactory.ROOT_SEPARATOR +
        BrowserRequestFactory.Locations.DASHBOARD +
        BrowserRequestFactory.PATH_SEPARATOR +
        dashboardType +
        BrowserRequestFactory.PATH_SEPARATOR +
        targetType +
        BrowserRequestFactory.PATH_SEPARATOR +
        target +
        BrowserRequestFactory.PATH_SEPARATOR +
        timeScope
      );
    } else {
      throw new Error(
        "request: flow requires 1 argument, teamMember"
      );
    }
  }
}
