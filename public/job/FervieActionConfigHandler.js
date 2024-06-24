const log = require("electron-log");
const Util = require("../Util");
const path = require("path");
const fs = require("fs");

/**
 * keeps track of the fervie action plugin extension configurations across the plugins
 */
module.exports = class FervieActionConfigHandler {
  /**
   * builds the fervie action config job for the global app scope
   */
  constructor() {
    this.name = "[FervieActionConfigHandler]";
    this.fervieActions = new Map();
  }

  static FERVIE_ACTION_CONFIG_FILE = "fervie-action-config.json";

  /**
   * Consolidate the fervie action configurations from the various plugins into
   * a single module configuration
   * @param plugins
   * @param callback
   */
  consolidateFervieActionConfigurations(plugins, callback) {
    const allPluginsFolder = Util.getPluginFolderPath();

    let pluginsLoaded = 0;

    plugins.forEach((pluginId) => {
      //do stuff
      const pluginFolder = path.join(allPluginsFolder, pluginId);
      const configFile = path.join(pluginFolder, FervieActionConfigHandler.FERVIE_ACTION_CONFIG_FILE);

      this.readFervieActionsFromConfigFile(pluginId, configFile, (fervieActions) => {
        log.debug(this.name +" Found "+fervieActions.length + " fervie actions in "+pluginId);
        fervieActions.forEach((fervieAction) => {
          //make sure we don't save any blank entries
          log.debug(fervieAction);

          if (fervieAction && fervieAction.actionId) {
            log.debug(this.name +" Adding fervie action for "+fervieAction.actionId);
            this.fervieActions.set(fervieAction.actionId, fervieAction);
          }
        });

        pluginsLoaded++;

        this.onFinishedLoadingFervieActionConfigs(plugins.length, pluginsLoaded, callback);
      });
    });
  }

  getAllFervieActions() {
    let actionList = [];
    this.fervieActions.forEach((value, key) => {
      actionList.push(value);
    });

    return actionList;
  }

  /**
   * Gets a specific fervie action object that corresponds to the actionId returned.
   * @param actionId
   */
  getFervieActionForActionId(actionId) {
    this.fervieActions.forEach((value, key) => {
      log.debug(" Fervie action = "+key );
      log.debug(value);
    });

    return this.fervieActions.get(actionId);
  }

  /**
   * Read in fervie-action-config.json file from each plugin directory,
   * and extract the fervie action extension information, then augment with the pluginId
   * that the action config comes from.
   * The config file may not exist, which is fine, just return a blank list then
   * @param pluginId
   * @param configFile
   * @param callback
   */
  readFervieActionsFromConfigFile(pluginId, configFile, callback) {
    if (fs.existsSync(configFile)) {

      log.debug(this.name +" Config file found: "+configFile);

      fs.readFile(configFile, "utf8", (err, jsonString) => {
        if (err) {
          log.error(this.name +" File read failed: " + err);
          callback([]);
        } else {
          const fervieActions = this.extractFervieActions(pluginId, jsonString);
          callback(fervieActions);
        }
      });
    } else {
      log.warn("Config file does not exist!: "+configFile);
      callback([]);
    }
  }


  /**
   * Extract the fervieActions information from the json string
   * @param pluginId
   * @param jsonString
   */
  extractFervieActions(pluginId, jsonString) {
    const fervieActionConfigs = JSON.parse(jsonString);

    if (fervieActionConfigs.fervieActions ) {
      fervieActionConfigs.fervieActions.forEach((action) => {
        action.pluginId = pluginId;
      });
      return fervieActionConfigs.fervieActions;
    } else {
      return [];
    }
  }

  /**
   * When all the plugins have loaded their fervie action configs, we can consolidate into a single file
   * @param pluginCount
   * @param pluginLoadedCount
   * @param callback
   */
  onFinishedLoadingFervieActionConfigs(pluginCount, pluginLoadedCount, callback) {
    if (pluginCount === pluginLoadedCount) {
      this.writeOutTopLevelConfigFile(callback);
    }
  }


  /**
   * After consolidating a list of configured fervie actions from all the registered plugins,
   * write out a top level fervie action configuration file with the known fervie actions across all plugins
   * @param callback
   */
  writeOutTopLevelConfigFile(callback) {
    const flowHomePath = Util.getFlowHomePath();
    const configFile = path.join(flowHomePath, FervieActionConfigHandler.FERVIE_ACTION_CONFIG_FILE);

    const config = {};
    config.fervieActions = [];

    this.fervieActions.forEach((value, key) => {
      config.fervieActions.push(value);
    });

    const jsonString = JSON.stringify(config);

    fs.writeFile(configFile, jsonString, err => {
      if (err) {
        log.error(this.name + " Error writing "+FervieActionConfigHandler.FERVIE_ACTION_CONFIG_FILE + err);
      } else {
        log.debug(this.name + ' Successfully wrote '+ FervieActionConfigHandler.FERVIE_ACTION_CONFIG_FILE);
      }
      callback();
    });
  }
  //
  // /**
  //  * Retrieve the last location saved across the different available plugins
  //  * We need to find the one with the most recent timestamp
  //  * @param callback
  //  */
  // getLastLocationAcrossPlugins(callback) {
  //   this.findLastLocationFile((filePath) => {
  //      if (filePath) {
  //        this.parseLastLocationFile(filePath, (contents) => {
  //          console.log(contents);
  //          callback(contents);
  //        });
  //      } else {
  //        callback(null); //if there's no last-location file available
  //      }
  //   });
  // }
  //
  // /**
  //  * Parse the contents of the selected last location file and callback with
  //  * the json contents
  //  * @param filePath
  //  * @param callback
  //  */
  // parseLastLocationFile(filePath, callback) {
  //   fs.readFile(filePath, "utf8", (err, jsonString) => {
  //     if (err) {
  //       log.error("[CodeModuleConfigHandler] File read failed for "+filePath+ ": " + err);
  //       callback(null);
  //     } else {
  //       const rawConfig = JSON.parse(jsonString);
  //       callback(rawConfig);
  //     }
  //   });
  // }
  //
  // /**
  //  * Find the path of the last location file we're going to use
  //  * across all available registered plugins, using the most recently modified file
  //  * if there are multiple across plugins
  //  * @param callback
  //  */
  // findLastLocationFile(callback) {
  //   const allPluginsFolder = Util.getPluginFolderPath();
  //   let plugins = global.App.PluginRegistrationHandler.getRegisteredPluginList();
  //
  //   const lastLocationFilesFound = [];
  //
  //   plugins.forEach((pluginId) => {
  //     const pluginFolder = path.join(allPluginsFolder, pluginId);
  //     const lastLocationFile = path.join(pluginFolder, CodeModuleConfigHandler.LAST_LOCATION_FILE);
  //     if (fs.existsSync(lastLocationFile)) {
  //       lastLocationFilesFound.push(lastLocationFile);
  //     }
  //   });
  //
  //   this.findMostRecentModifiedFile(lastLocationFilesFound, callback);
  // }
  //
  // /**
  //  * Find the most recent modified file from a set of files,
  //  * and callback with the filePath
  //  * @param files
  //  * @param callback
  //  */
  // findMostRecentModifiedFile(files, callback) {
  //   if (files.length === 0) {
  //     callback(null);
  //   } else if (files.length === 1) {
  //     callback(files[0]);
  //   } else {
  //     let mostRecentModifyTimeMs = null;
  //     let mostRecentFile = null;
  //     files.forEach((filePath) => {
  //       let stats = fs.statSync(filePath);
  //       if (mostRecentModifyTimeMs == null) {
  //         mostRecentModifyTimeMs = stats.mtimeMs;
  //         mostRecentFile = filePath;
  //       } else if (stats.mtimeMs > mostRecentModifyTimeMs) {
  //         mostRecentModifyTimeMs = stats.mtimeMs;
  //         mostRecentFile = filePath
  //       }
  //     });
  //     callback(mostRecentFile);
  //   }
  // }
  //
  //
  // /**
  //  * Iterate over the config files in each of our known modules,
  //  * and if there is no config on the server, load in the config file from the project
  //  * @param callback
  //  */
  // loadConfiguredModulesList(callback) {
  //
  //   this.getAllModuleConfigsFromServer((moduleConfigs) => {
  //       this.saveConfiguredModulesToState(moduleConfigs);
  //       if (callback) {
  //         callback();
  //       }
  //     }
  //   );
  // }
  //
  // /**
  //  * When a flowinsight-config.json file is found in the code module root,
  //  * and the module is not yet listed as a configurable module by the server.
  //  * Ask the user if we can load up the found configuration file for this module.
  //  * @param callback
  //  */
  // tryToLoadConfigsWhenModuleNotConfigured(callback) {
  //
  //   const listOfModulesToConfigure = [];
  //
  //   this.moduleRoots.forEach((config, moduleNameKey) => {
  //     const moduleRootDir = config.rootDir;
  //     const moduleConfigFile = path.join(moduleRootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);
  //
  //     if (fs.existsSync(moduleConfigFile)) {
  //       if (!this.configuredModuleNames.has(moduleNameKey)) {
  //         log.debug(this.name +" Found module config not loaded to server, requesting load: "+moduleNameKey);
  //         listOfModulesToConfigure.push(moduleNameKey);
  //       }
  //     }
  //   });
  //
  //   if (listOfModulesToConfigure.length > 0) {
  //     this.openRequestToUserForLoadingModuleConfig(listOfModulesToConfigure);
  //   }
  // }
  //
  //
  // /**
  //  * Get the full path to a particular module configuration file, given the module name.
  //  * This will be based off the module root paths.
  //  * @param moduleName
  //  */
  // getModuleConfigFileForModule(moduleName) {
  //    const config = this.moduleRoots.get(moduleName);
  //    if (config) {
  //      return path.join(config.rootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);
  //    } else {
  //      return null;
  //    }
  // }
  //
  //
  // /**
  //  * Open up a window to request the user load the module configs
  //  * for the specified modules
  //  * @param listOfModulesToConfigure
  //  */
  // openRequestToUserForLoadingModuleConfig(listOfModulesToConfigure) {
  //
  //   let moduleConcatStr = "";
  //   listOfModulesToConfigure.forEach((moduleName) => {
  //     if (moduleConcatStr.length === 0) {
  //       moduleConcatStr += moduleName;
  //     } else {
  //       moduleConcatStr += "|";
  //       moduleConcatStr += moduleName;
  //     }
  //   });
  //
  //   let configFileConcatStr = "";
  //   listOfModulesToConfigure.forEach((moduleName) => {
  //     const config = this.moduleRoots.get(moduleName);
  //     if (config && config.rootDir) {
  //       if (configFileConcatStr.length === 0) {
  //         configFileConcatStr += path.join(config.rootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);
  //       } else {
  //         configFileConcatStr += "|";
  //         configFileConcatStr += path.join(config.rootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);
  //       }
  //     }
  //   });
  //
  //   WindowManagerHelper.createLoadModuleConfigWindow({moduleNames: moduleConcatStr, configFiles: configFileConcatStr});
  //
  // }
  //
  // /**
  //  * Parse a project module config file, and then callback with a nice
  //  * easy to read data structure from the deserialized json.
  //  * Note that in these loaded config files, the module is assumed from the context
  //  * @param moduleName
  //  * @param moduleConfigFile
  //  * @param callback
  //  */
  // parseModuleConfigFile(moduleName, moduleConfigFile, callback) {
  //   log.debug(this.name + " Parse module config file: "+moduleConfigFile);
  //
  //   fs.readFile(moduleConfigFile, "utf8", (err, jsonString) => {
  //     if (err) {
  //       log.error( "[CodeModuleConfigHandler] File read failed for "+moduleName+ ": " + err);
  //       callback([]);
  //     } else {
  //       const moduleConfigs = this.extractModuleConfigInputs(moduleName, jsonString);
  //       callback(moduleConfigs);
  //     }
  //   });
  // }
  //
  // /**
  //  * Translate the json into a list of module config objects
  //  * @param moduleName
  //  * @param jsonString
  //  */
  // extractModuleConfigInputs(moduleName, jsonString) {
  //   const rawConfigs = JSON.parse(jsonString);
  //   rawConfigs.boxes.forEach((boxConfig) => {
  //     boxConfig.module = moduleName;
  //   });
  //
  //   return rawConfigs.boxes;
  // }
  //
  //
  // /**
  //  * Iterate through the configured modules, and save a list of the
  //  * configured module names
  //  * @param moduleConfigs
  //  */
  // saveConfiguredModulesToState(moduleConfigs) {
  //   if (moduleConfigs != null) {
  //     moduleConfigs.rowsOfPaddedCells.forEach((row) => {
  //       this.configuredModuleNames.add(row[0].trim());
  //     });
  //     log.debug(this.name +" List of configured modules:");
  //     log.debug(this.configuredModuleNames);
  //   } else {
  //     log.warn("No module configs back from server!");
  //     //no module configs from server
  //   }
  // }
  //
  //
  //
  // /**
  //  * Retrieve all the module configs, across all modules by making a call to the server,
  //  * and then the module configs are returned via the callback
  //  */
  // getAllModuleConfigsFromServer(callback) {
  //   this.doGetAllModuleConfigs((store) => {
  //     if (store.error) {
  //       console.error(this.name + " Unable to retrieve module configs: "+store.error);
  //       callback(null);
  //     } else {
  //       callback(store.data);
  //     }
  //   });
  // }
  //
  // /**
  //  * Retrieve all the module configs, across all modules
  //  * @param callback
  //  */
  // doGetAllModuleConfigs(callback) {
  //   this.urn = "/code";
  //
  //   this.callback = callback;
  //   this.store = {
  //     context: "CodeModuleConfigHandler",
  //     dto: {},
  //     guid: Util.getGuid(),
  //     name: "CodeModuleConfigStore",
  //     requestType: "get",
  //     timestamp: new Date().getTime(),
  //     urn: this.urn,
  //   };
  //   log.debug(this.name + " get all code modules -> do request");
  //   let client = new DtoClient(this.store, this.callback);
  //   client.doRequest();
  // }


};
