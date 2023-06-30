const log = require("electron-log"),
  chalk = require("chalk"),
  fs = require("fs"),
path = require("path");

const Util = require("../Util");
const {DtoClient} = require("../managers/DtoClientFactory");
const WindowManagerHelper = require("../managers/WindowManagerHelper");

/**
 * This class is used to manage the plugins in the ~/.flow/plugins
 * directory, register the plugins, and manage sending data to the server via the flow publisher
 * @type {PluginRegistrationHandler}
 */
module.exports = class PluginRegistrationHandler {
  constructor() {
    this.name = "[PluginRegistrationHandler]";
    this.pluginFolders = [];
    this.registeredPluginFolders = [];

    this.registeredPluginSet = new Set();
  }

  static INTELLIJ_PLUGIN = "com.jetbrains.intellij";
  static VSCODE_PLUGIN = "com.microsoft.vscode";


  getRegisteredPluginList() {
    return this.registeredPluginFolders;
  }

  /**
   * Load and initialize all plugin folders, and request registration
   * for any unregistered plugins
   * @param callbackWhenDone
   */
  loadAndValidatePlugins(callbackWhenDone) {
    //so first, lets update our known folders, to see if there was a new folder added.

    this.loadPluginFolders((plugins) => {
      this.pluginFolders = plugins;

      this.doGetRegisteredPluginList((store) => {
        if (!store.error) {
          const plugins = store.data;
          plugins.forEach(plugin => {
            log.debug(this.name + " Found registered plugin "+plugin.pluginId);
            this.registeredPluginSet.add(plugin.pluginId);
          });
          this.checkForUnregisteredPluginsAndSendEvent();
          if (callbackWhenDone) {
            callbackWhenDone();
          }
        } else {
          log.error(this.name + " Error occurred getting registered plugin list: "+store.error);
        }
      });
    });

  }

  /**
   * Get the list of IDE plugin folders that are registered already by the app.
   * Returns an empty list if none found
   */
  getRegisteredIdePluginFolders() {
    const pluginBaseFolder = Util.getPluginFolderPath();

    let idePluginFolders = [];
    this.addToListIfRegistered(idePluginFolders, pluginBaseFolder, PluginRegistrationHandler.INTELLIJ_PLUGIN);
    this.addToListIfRegistered(idePluginFolders, pluginBaseFolder, PluginRegistrationHandler.VSCODE_PLUGIN);

    return idePluginFolders;
  }

  /**
   * Add pluginId to list if it's registered
   * @param folderList
   * @param pluginBaseFolder
   * @param pluginId
   * @returns {*}
   */
  addToListIfRegistered(folderList, pluginBaseFolder, pluginId) {
    if (this.registeredPluginSet.has(pluginId)) {
      folderList.push(path.join(pluginBaseFolder, pluginId));
    }
    return folderList;
  }



  /**
   * Load up the plugin folders to see which are running
   */
  loadPluginFolders(callback) {
    const pluginFolder = Util.getPluginFolderPath();

    Util.createFolderIfDoesntExist(pluginFolder, () => {
      this.loadAllPlugins(pluginFolder, (plugins) => {
        this.pluginFolders = plugins;
        callback(plugins);
      });
    });
  }


  /**
   * Check plugin folders against registered plugins from server,
   * and send registration request event for any unregistered ones
   */
  checkForUnregisteredPluginsAndSendEvent() {
    const unregisteredPluginsList = [];
    const registeredPluginsList = [];

    this.pluginFolders.forEach(pluginId => {
       if (!this.registeredPluginSet.has(pluginId)) {
         log.debug(this.name+" Found unregistered plugin: "+pluginId);
         unregisteredPluginsList.push(pluginId);
       } else {
         registeredPluginsList.push(pluginId);
       }
    });

    this.registeredPluginFolders = registeredPluginsList;

    if (unregisteredPluginsList.length > 0) {
      this.hasUnregisteredPlugins = true;
      this.onUnregisteredPlugins(unregisteredPluginsList);
    } else {
      this.hasUnregisteredPlugins = false;
    }
  }

  /**
   * Open plugin registration dialog for unregistered plugins
   * @param unregisteredPluginIds
   */
  onUnregisteredPlugins = (unregisteredPluginIds) => {
    log.info(this.name +" Opening registration requests for unregistered plugins ");

    let pluginConcatStr = "";
    unregisteredPluginIds.forEach((pluginId) => {
      if (pluginConcatStr.length === 0) {
        pluginConcatStr += pluginId;
      } else {
        pluginConcatStr += "|";
        pluginConcatStr += pluginId;
      }
    });

    WindowManagerHelper.createPluginRegistrationWindow({pluginIds: pluginConcatStr});
  }


  /**
   * Get the registered plugin list from the server
   * @param callback
   */
  doGetRegisteredPluginList(callback) {
    log.info(this.name + " do get registered plugin list");

    this.urn = "/account/plugin/registration";

    this.callback = callback;
    this.store = {
      context: "PluginRegistrationHandler",
      dto: {},
      guid: Util.getGuid(),
      name: "PluginStore",
      requestType: "get",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug(this.name+" get registered plugins -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }


  /**
   * Load the plugins from top level folder
   * @param pluginFolder
   * @param callback
   */
  loadAllPlugins(pluginFolder, callback) {
    const pluginList = [];
    fs.readdir(pluginFolder, (err, files) => {
      files.forEach(folder => {
        let subFolder = path.join(pluginFolder, folder);
        if (fs.statSync(subFolder).isDirectory()){
          pluginList.push( folder );
        }
      });
      callback(pluginList);
    });
  }


};
