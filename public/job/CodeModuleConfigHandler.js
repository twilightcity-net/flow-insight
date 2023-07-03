const log = require("electron-log");
const Util = require("../Util");
const path = require("path");
const fs = require("fs");
const {DtoClient} = require("../managers/DtoClientFactory");
const WindowManagerHelper = require("../managers/WindowManagerHelper");

/**
 * keeps track of the code module configurations across the plugins
 */
module.exports = class CodeModuleConfigHandler {
  /**
   * builds the code module config job for the global app scope
   */
  constructor() {
    this.name = "[CodeModuleConfigHandler]";
    this.moduleRoots = new Map();
    this.configuredModuleNames = new Set();
  }

  static MODULE_CONFIG_FILE = "flowinsight-config.json";
  static LAST_LOCATION_FILE = "last-location.json";

  /**
   * Retrieve the last location saved across the different available plugins
   * We need to find the one with the most recent timestamp
   * @param callback
   */
  getLastLocationAcrossPlugins(callback) {
    this.findLastLocationFile((filePath) => {
       if (filePath) {
         this.parseLastLocationFile(filePath, (contents) => {
           console.log(contents);
           callback(contents);
         });
       } else {
         callback(null); //if there's no last-location file available
       }
    });
  }

  /**
   * Parse the contents of the selected last location file and callback with
   * the json contents
   * @param filePath
   * @param callback
   */
  parseLastLocationFile(filePath, callback) {
    fs.readFile(filePath, "utf8", (err, jsonString) => {
      if (err) {
        log.error("[CodeModuleConfigHandler] File read failed for "+filePath+ ": " + err);
        callback(null);
      } else {
        const rawConfig = JSON.parse(jsonString);
        callback(rawConfig);
      }
    });
  }

  /**
   * Find the path of the last location file we're going to use
   * across all available registered plugins, using the most recently modified file
   * if there are multiple across plugins
   * @param callback
   */
  findLastLocationFile(callback) {
    const allPluginsFolder = Util.getPluginFolderPath();
    let plugins = global.App.PluginRegistrationHandler.getRegisteredPluginList();

    const lastLocationFilesFound = [];

    plugins.forEach((pluginId) => {
      const pluginFolder = path.join(allPluginsFolder, pluginId);
      const lastLocationFile = path.join(pluginFolder, CodeModuleConfigHandler.LAST_LOCATION_FILE);
      if (fs.existsSync(lastLocationFile)) {
        lastLocationFilesFound.push(lastLocationFile);
      }
    });

    this.findMostRecentModifiedFile(lastLocationFilesFound, callback);
  }

  /**
   * Find the most recent modified file from a set of files,
   * and callback with the filePath
   * @param files
   * @param callback
   */
  findMostRecentModifiedFile(files, callback) {
    if (files.length === 0) {
      callback(null);
    } else if (files.length === 1) {
      callback(files[0]);
    } else {
      let mostRecentModifyTimeMs = null;
      let mostRecentFile = null;
      files.forEach((filePath) => {
        let stats = fs.statSync(filePath);
        if (mostRecentModifyTimeMs == null) {
          mostRecentModifyTimeMs = stats.mtimeMs;
          mostRecentFile = filePath;
        } else if (stats.mtimeMs > mostRecentModifyTimeMs) {
          mostRecentModifyTimeMs = stats.mtimeMs;
          mostRecentFile = filePath
        }
      });
      callback(mostRecentFile);
    }
  }

  /**
   * Consolidate the module configurations from the various plugins into
   * a single module configuration
   * @param plugins
   * @param callback
   */
  consolidatePluginConfigurations(plugins, callback) {
    const allPluginsFolder = Util.getPluginFolderPath();

    let pluginsLoaded = 0;

    plugins.forEach((pluginId) => {
      //do stuff
      const pluginFolder = path.join(allPluginsFolder, pluginId);
      const configFile = path.join(pluginFolder, CodeModuleConfigHandler.MODULE_CONFIG_FILE);

      this.readModuleRootsFromConfigFile(configFile, (moduleRoots) => {
        log.debug(this.name +" Found "+moduleRoots.length + " roots in "+pluginId);
        moduleRoots.forEach((moduleRoot) => {
          //make sure we don't save any blank entries
          if (moduleRoot.moduleName && moduleRoot.rootDir) {
            this.moduleRoots.set(moduleRoot.moduleName, moduleRoot);
          }
        });

        pluginsLoaded++;

        this.onFinishedLoadingPluginConfigs(plugins.length, pluginsLoaded, callback);
      });
    });
  }

  /**
   * Iterate over the config files in each of our known modules,
   * and if there is no config on the server, load in the config file from the project
   * @param callback
   */
  loadConfiguredModulesList(callback) {

    this.getAllModuleConfigsFromServer((moduleConfigs) => {
        this.saveConfiguredModulesToState(moduleConfigs);
        if (callback) {
          callback();
        }
      }
    );
  }

  /**
   * When a flowinsight-config.json file is found in the code module root,
   * and the module is not yet listed as a configurable module by the server.
   * Ask the user if we can load up the found configuration file for this module.
   * @param callback
   */
  tryToLoadConfigsWhenModuleNotConfigured(callback) {

    const listOfModulesToConfigure = [];

    this.moduleRoots.forEach((config, moduleNameKey) => {
      const moduleRootDir = config.rootDir;
      const moduleConfigFile = path.join(moduleRootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);

      if (fs.existsSync(moduleConfigFile)) {
        if (!this.configuredModuleNames.has(moduleNameKey)) {
          log.debug(this.name +" Found module config not loaded to server, requesting load: "+moduleNameKey);
          listOfModulesToConfigure.push(moduleNameKey);
        }
      }
    });

    if (listOfModulesToConfigure.length > 0) {
      this.openRequestToUserForLoadingModuleConfig(listOfModulesToConfigure);
    }
  }


  /**
   * Get the full path to a particular module configuration file, given the module name.
   * This will be based off the module root paths.
   * @param moduleName
   */
  getModuleConfigFileForModule(moduleName) {
     const config = this.moduleRoots.get(moduleName);
     if (config) {
       return path.join(config.rootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);
     } else {
       return null;
     }
  }


  /**
   * Open up a window to request the user load the module configs
   * for the specified modules
   * @param listOfModulesToConfigure
   */
  openRequestToUserForLoadingModuleConfig(listOfModulesToConfigure) {

    let moduleConcatStr = "";
    listOfModulesToConfigure.forEach((moduleName) => {
      if (moduleConcatStr.length === 0) {
        moduleConcatStr += moduleName;
      } else {
        moduleConcatStr += "|";
        moduleConcatStr += moduleName;
      }
    });

    let configFileConcatStr = "";
    listOfModulesToConfigure.forEach((moduleName) => {
      const config = this.moduleRoots.get(moduleName);
      if (config && config.rootDir) {
        if (configFileConcatStr.length === 0) {
          configFileConcatStr += path.join(config.rootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);
        } else {
          configFileConcatStr += "|";
          configFileConcatStr += path.join(config.rootDir, CodeModuleConfigHandler.MODULE_CONFIG_FILE);
        }
      }
    });

    WindowManagerHelper.createLoadModuleConfigWindow({moduleNames: moduleConcatStr, configFiles: configFileConcatStr});

  }

  /**
   * Parse a project module config file, and then callback with a nice
   * easy to read data structure from the deserialized json.
   * Note that in these loaded config files, the module is assumed from the context
   * @param moduleName
   * @param moduleConfigFile
   * @param callback
   */
  parseModuleConfigFile(moduleName, moduleConfigFile, callback) {
    log.debug(this.name + " Parse module config file: "+moduleConfigFile);

    fs.readFile(moduleConfigFile, "utf8", (err, jsonString) => {
      if (err) {
        log.error( "[CodeModuleConfigHandler] File read failed for "+moduleName+ ": " + err);
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
   * Iterate through the configured modules, and save a list of the
   * configured module names
   * @param moduleConfigs
   */
  saveConfiguredModulesToState(moduleConfigs) {
    if (moduleConfigs != null) {
      moduleConfigs.rowsOfPaddedCells.forEach((row) => {
        this.configuredModuleNames.add(row[0].trim());
      });
      log.debug(this.name +" List of configured modules:");
      log.debug(this.configuredModuleNames);
    } else {
      log.warn("No module configs back from server!");
      //no module configs from server
    }
  }

  /**
   * When all the plugins have loaded their configs, we can consolidate into a single file
   * @param pluginCount
   * @param pluginLoadedCount
   * @param callback
   */
  onFinishedLoadingPluginConfigs(pluginCount, pluginLoadedCount, callback) {
    if (pluginCount === pluginLoadedCount) {
      this.writeOutTopLevelConfigFile(callback);
    }
  }

  /**
   * After consolidating a list of configured modules from all the registered plugins,
   * write out a top level module configuration file with the known module roots
   * @param callback
   */
  writeOutTopLevelConfigFile(callback) {
    const flowHomePath = Util.getFlowHomePath();
    const configFile = path.join(flowHomePath, CodeModuleConfigHandler.MODULE_CONFIG_FILE);

    const config = {};
    config.modules = [];

    this.moduleRoots.forEach((value, key) => {
      config.modules.push(value);
    });

    const jsonString = JSON.stringify(config);

    fs.writeFile(configFile, jsonString, err => {
      if (err) {
        log.error("[CodeModuleConfigHandler] Error writing flowinsight-config file: "+err);
      } else {
        log.debug('[CodeModuleConfigHandler] Successfully wrote flowinsight-config file');
      }
      callback();
    });
  }

  /**
   * Read in flowinsight-config.json file from each plugin directory,
   * and extract the module roots information.
   * The config file may not exist, which is fine, just return a blank list then
   * @param configFile
   * @param callback
   */
  readModuleRootsFromConfigFile(configFile, callback) {
    if (fs.existsSync(configFile)) {

      log.debug(this.name +" Config file found: "+configFile);

      fs.readFile(configFile, "utf8", (err, jsonString) => {
        if (err) {
          log.error("[CodeModuleConfigHandler] File read failed: " + err);
          callback([]);
        } else {
          const moduleRoots = this.extractModuleRoots(jsonString);
          callback(moduleRoots);
        }
      });
    } else {
      log.warn("Config file does not exist!: "+configFile);
      callback([]);
    }
  }

  /**
   * Extract the module root information from the json string
   * @param jsonString
   */
  extractModuleRoots(jsonString) {
    const moduleConfigs = JSON.parse(jsonString);

    if (moduleConfigs.modules ) {
      return moduleConfigs.modules;
    } else {
      return [];
    }
  }

  /**
   * Retrieve all the module configs, across all modules by making a call to the server,
   * and then the module configs are returned via the callback
   */
  getAllModuleConfigsFromServer(callback) {
    this.doGetAllModuleConfigs((store) => {
      if (store.error) {
        console.error(this.name + " Unable to retrieve module configs: "+store.error);
        callback(null);
      } else {
        callback(store.data);
      }
    });
  }

  /**
   * Retrieve all the module configs, across all modules
   * @param callback
   */
  doGetAllModuleConfigs(callback) {
    this.urn = "/code";

    this.callback = callback;
    this.store = {
      context: "CodeModuleConfigHandler",
      dto: {},
      guid: Util.getGuid(),
      name: "CodeModuleConfigStore",
      requestType: "get",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug(this.name + " get all code modules -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }


};
