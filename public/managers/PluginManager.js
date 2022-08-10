const log = require("electron-log"),
  chalk = require("chalk"),
  fs = require("fs");

const Util = require("../Util");

/**
 * This class is used to manage the plugins in the ~/.flow/plugins
 * directory, register the plugins, and manage sending data to the server via the flow publisher
 * @type {PluginManager}
 */
module.exports = class PluginManager {
  constructor() {
    this.name = "[PluginManager]";
    this.initialized = false;
    this.initPlugins();

    this.pluginsFound = [];
    this.registeredPluginSet = new Set();
  }

  isInitialized() {
    return this.initialized;
  }

  /**
   * Initialize the plugins we
   */
  initPlugins() {
    const pluginFolder = Util.getPluginFolderPath();

    this.createPluginFolderIfDoesntExist(pluginFolder, () => {
      this.loadAllPlugins(pluginFolder, (plugins) => {
        this.pluginsFound = plugins;
        this.initialized = true;
      });
    });
  }

  validateRegistration() {
    if (!this.initialized) return;

    const pluginFolder = Util.getPluginFolderPath();
    this.loadAllPlugins(pluginFolder, (newPlugins) => {
       if (newPlugins.length !== this.pluginsFound) {
         this.registerMissingPlugins();
       } else {
         this.checkRegistrationListMatchesServer();
       }
    });
  }

  registerMissingPlugins() {

  }

  checkRegistrationListMatchesServer() {

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
          pluginList.push( { plugin: folder} );
        }
      });
      callback(pluginList);
    });
  }


};
