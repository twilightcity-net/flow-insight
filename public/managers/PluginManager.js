const log = require("electron-log"),
  chalk = require("chalk"),
  fs = require("fs");

const Util = require("../Util");
const EventFactory = require("../events/EventFactory");
const {DtoClient} = require("./DtoClientFactory");
const WindowManagerHelper = require("./WindowManagerHelper");

/**
 * This class is used to manage the plugins in the ~/.flow/plugins
 * directory, register the plugins, and manage sending data to the server via the flow publisher
 * @type {PluginManager}
 */
module.exports = class PluginManager {
  constructor() {
    this.name = "[PluginManager]";
    this.pluginFolders = [];
    this.registeredPluginFolders = [];

    this.registeredPluginSet = new Set();
  }

  getRegisteredPluginList() {
    return this.registeredPluginFolders;
  }

  /**
   * Load up the plugin folders to see which are running
   */
  loadPluginFolders(callback) {
    const pluginFolder = Util.getPluginFolderPath();

    this.createPluginFolderIfDoesntExist(pluginFolder, () => {
      this.loadAllPlugins(pluginFolder, (plugins) => {
        this.pluginFolders = plugins;
        callback(plugins);
      });
    });
  }

  validateAllPluginsRegistered(callbackWhenDone) {
    //so first, lets update our known folders, to see if there was a new folder added.

    this.loadPluginFolders((plugins) => {
      this.pluginFolders = plugins;

      this.doGetRegisteredPluginList((store) => {
        if (!store.error) {
          const plugins = store.data;
          plugins.forEach(plugin => {
            console.log("registered "+plugin);
            this.registeredPluginSet.add(plugin.pluginId);
          });
          this.checkForUnregisteredPluginsAndSendEvent();
          if (callbackWhenDone) {
            callbackWhenDone();
          }
        } else {
          log.error("Error occurred getting registered plugin list: "+store.error);
        }
      });
    });

  }

  checkForUnregisteredPluginsAndSendEvent() {
    const unregisteredPluginsList = [];
    const registeredPluginsList = [];

    this.pluginFolders.forEach(pluginId => {
       if (!this.registeredPluginSet.has(pluginId)) {
         console.log("Found unregistered plugin: "+pluginId);
         unregisteredPluginsList.push(pluginId);
       } else {
         registeredPluginsList.push(pluginId);
       }
    });

    this.registeredPluginFolders = registeredPluginsList;

    if (unregisteredPluginsList.length > 0) {
      console.log("Unregistered plugins found!");
      this.hasUnregisteredPlugins = true;
      this.onUnregisteredPlugins(unregisteredPluginsList);
    } else {
      this.hasUnregisteredPlugins = false;
    }
  }

  onUnregisteredPlugins = (unregisteredPluginIds) => {
    console.log("Opening registration requests for unregistered plugins ");

    let pluginConcatStr = "";
    unregisteredPluginIds.forEach((pluginId) => {
      if (pluginConcatStr.length === 0) {
        pluginConcatStr += pluginId;
      } else {
        pluginConcatStr += "|";
        pluginConcatStr += pluginId;
      }
    });

    //WindowManagerHelper.createPluginRegistrationWindow({pluginIds: pluginConcatStr});
  }


  doGetRegisteredPluginList(callback) {
    log.info("[PluginManager] do get registered plugin list");

    this.urn = "/account/plugin/registration";

    this.callback = callback;
    this.store = {
      context: "PluginManager",
      dto: {},
      guid: Util.getGuid(),
      name: "PluginStore",
      requestType: "get",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug("[PluginManager] get registered plugins -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }

  createPluginFolderIfDoesntExist(pluginFolder, callback) {
    fs.mkdir(pluginFolder, callback);
  }

  loadAllPlugins(pluginFolder, callback) {
    const pluginList = [];
    fs.readdir(pluginFolder, (err, files) => {
      files.forEach(folder => {
        if (fs.statSync(pluginFolder + "/" + folder).isDirectory()){
          console.log("plugin found: "+folder);
          pluginList.push( folder );
        }
      });
      callback(pluginList);
    });
  }


};
