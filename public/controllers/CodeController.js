const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const log = require("electron-log");
const fs = require("fs");
const IdeCommandProcessor = require("../job/IdeCommandProcessor");

/**
 * This class is used to coordinate calls to gridtime for the Code service
 * @type {CodeController}
 */
module.exports = class CodeController extends (BaseController) {

  /**
   * builds our Code Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, CodeController);
    if (!CodeController.instance) {
      CodeController.instance = this;
      CodeController.wireTogetherControllers();
      this.ideCommandProcessor = new IdeCommandProcessor();
    }
  }

  /**
   * general enum list of all of our possible circuit events for code
   * @constructor
   */
  static get Events() {
    return {
      GET_CODE_MODULE_CONFIG: "get-code-module-config",
      UPDATE_CODE_MODULE_CONFIG: "update-code-module-config",
      GET_ALL_CODE_MODULE_CONFIGS: "get-all-code-module-configs",
      GET_LAST_CODE_LOCATION: "get-last-code-location",
      GOTO_CODE_LOCATION: "goto-code-location"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      CodeController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(CodeController.instance);
    this.codeClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.CODE_CLIENT,
        this,
        this.onCodeClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onCodeClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        CodeController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case CodeController.Events.GET_CODE_MODULE_CONFIG:
          this.handleGetCodeModuleConfigEvent(event, arg);
          break;
        case CodeController.Events.UPDATE_CODE_MODULE_CONFIG:
          this.handleUpdateCodeModuleConfigEvent(event, arg);
          break;
        case CodeController.Events.GET_ALL_CODE_MODULE_CONFIGS:
          this.handleGetAllCodeModuleConfigsEvent(event, arg);
          break;
        case CodeController.Events.GET_LAST_CODE_LOCATION:
          this.handleGetLastLocationEvent(event, arg);
          break;
        case CodeController.Events.GOTO_CODE_LOCATION:
          this.handleGotoCodeLocationEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown code client event type '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * client event handler for retrieval of all code module details
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllCodeModuleConfigsEvent(event, arg, callback) {
    let urn =
        CodeController.Paths.CODE;

    this.doClientRequest(
      CodeController.Contexts.CODE_CLIENT,
      {},
      CodeController.Names.GET_ALL_CODE_MODULE_CONFIGS,
      CodeController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for retrieval of code module details
   * @param event
   * @param arg
   * @param callback
   */
  handleGetCodeModuleConfigEvent(event, arg, callback) {
    let moduleName = arg.args.moduleName,
      urn =
        CodeController.Paths.CODE +
        CodeController.Paths.SEPARATOR +
        moduleName +
        CodeController.Paths.CONFIG;

    this.doClientRequest(
      CodeController.Contexts.CODE_CLIENT,
      {},
      CodeController.Names.GET_CODE_MODULE_CONFIG,
      CodeController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for retrieval of code module details
   * @param moduleName
   * @param location
   * @param callback
   */
  doIdentifyBoxForLocation(moduleName, location, callback) {
    let urn =
        CodeController.Paths.CODE +
        CodeController.Paths.SEPARATOR +
        moduleName +
        CodeController.Paths.FILE;

    this.doClientRequest(
      CodeController.Contexts.CODE_CLIENT,
      {filePath: location},
      CodeController.Names.IDENTIFY_BOX,
      CodeController.Types.POST,
      urn,
      (store) => {
        const arg = {};
        if (store.error) {
          arg.error = store.error;
        } else {
          arg.data = store.data;
        }
        if (callback) {
          callback(arg);
        }
      }
    );
  }


  /**
   * client event handler for updating our code module details
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateCodeModuleConfigEvent(event, arg, callback) {
    let moduleName = arg.args.moduleName,
      urn =
        CodeController.Paths.CODE +
        CodeController.Paths.SEPARATOR +
        moduleName +
        CodeController.Paths.CONFIG;

    const moduleConfigFile = this.getConfigFileForModule(moduleName);

    if (moduleConfigFile) {
      this.parseConfigFile(moduleName, moduleConfigFile, (moduleConfigs) => {
        const teamModuleConfigs = { boxMatcherConfigs: moduleConfigs };

        this.doClientRequest(
          CodeController.Contexts.CODE_CLIENT,
          teamModuleConfigs,
          CodeController.Names.UPDATE_CODE_MODULE_CONFIG,
          CodeController.Types.POST,
          urn,
          (store) =>
            this.defaultDelegateCallback(
              store,
              event,
              arg,
              callback
            )
        );
      });
    } else {
      arg.error = "Module configuration not yet initialized.  Please wait for a minute, then try again.";

      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    }

  }


  /**
   * Communicate a goto request for navigating to a specific file in the IDE
   * @param event
   * @param arg
   * @param callback
   */
  handleGotoCodeLocationEvent(event, arg, callback) {
    console.log("Goto code location");
    const module = arg.args.module;
    const filePath = arg.args.filePath;

    if (module && filePath) {
      console.log("Writing goto cmd: "+module + "::" + filePath);
      this.ideCommandProcessor.writeGotoFileCommand(module, filePath);
    } else {
      console.error("Ignoring invalid goto cmd args: "+module + "::" + filePath);
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * client event handler for getting the last location
   * @param event
   * @param arg
   * @param callback
   */
  handleGetLastLocationEvent(event, arg, callback) {
    global.App.CodeModuleConfigHandler.getLastLocationAcrossPlugins((locationContents) => {
      if (locationContents) {
        this.doIdentifyBoxForLocation(locationContents.module, locationContents.lastLocation,
          (results) => {
            if (results.error) {
              arg.error = results.error;
            } else {
              arg.data = {
                module: locationContents.module,
                location: locationContents.lastLocation,
                box: results.data.boxName
              }
            }
            this.delegateCallbackOrEventReplyTo(
              event,
              arg,
              callback
            );
          });
      } else {
        arg.error = "Last location config file not available from registered plugins";
        this.delegateCallbackOrEventReplyTo(
          event,
          arg,
          callback
        );
      }
    });
  }


  /**
   * Get the config file location for the specified module.
   *
   * @param moduleName
   */
  getConfigFileForModule(moduleName) {
    const configFile = global.App.CodeModuleConfigHandler.getModuleConfigFileForModule(moduleName);
    log.info("[CodeController] Loading config file "+configFile);
    return configFile;
  }

  /**
   * Parse a project module config file, and then callback with a nice
   * easy to read data structure from the deserialized json.
   * Note that in these loaded config files, the module is assumed from the context
   * @param moduleName
   * @param moduleConfigFile
   * @param callback
   */
  parseConfigFile(moduleName, moduleConfigFile, callback) {
    log.debug("[CodeController] Parse module config file: "+moduleConfigFile);

    fs.readFile(moduleConfigFile, "utf8", (err, jsonString) => {
      if (err) {
        log.error("[CodeController] File read failed for "+moduleName+ ": " + err);
        callback([]);
      } else {
        const moduleConfigs = this.extractModuleConfigInputs(moduleName, jsonString);
        callback(moduleConfigs);
      }
    });
  }

  /**
   * Translate the json into a list of module config objects
   * @param moduleName
   * @param jsonString
   */
  extractModuleConfigInputs(moduleName, jsonString) {
    const rawConfigs = JSON.parse(jsonString);
    rawConfigs.boxes.forEach((boxConfig) => {
      boxConfig.module = moduleName;
    });

    return rawConfigs.boxes;
  }


  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  defaultDelegateCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


};
