/*
 * Required Packages
 */

const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const notifier = require('node-notifier');
const logger = require("electron-log");

/*
 * Global Constants
 */

const assetsDirectory = path.join(__dirname, 'assets');
const applicationIcon = assetsDirectory + '/icons/icon.ico';
const trayIcon = assetsDirectory + '/icons/icon.png';

/*
 * Global Objects
 */

let tray = undefined;
let window = undefined;

/*
 * Application Events
 */

app.on('ready', onAppReadyCb);
app.on('window-all-closed', onAppWindowAllCloseCb);
app.on('activate', onAppActivateCb);

/*
 * Event Callback Functions
 */

function onAppReadyCb() {
  createTray();
  createWindow();
}

function onAppWindowAllCloseCb() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function onAppActivateCb() {
  createWindow();
}

function onWindowReadyToShowCb() {
  showWindow();
}

function onWindowCloseCb() {
  window = null;
}

function onTrayRightClickCb() {
  toggleWindow();
}

function onTrayDoubleClickCb() {
  toggleWindow();
}

function onTrayClickCb(event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.ctrlKey) {
      showDevTools();
    }
}

/*
 * Creates the system tray object and icon. Called by onAppReadyCb()
 */
function createTray() {
  tray = new Tray(trayIcon);
  tray.on('right-click', onTrayRightClickCb);
  tray.on('double-click', onTrayDoubleClickCb);
  tray.on('click', onTrayClickCb);
}

/*
 * Creates the main application window. Called by onAppReadyCb()
 */
function createWindow() {

  // dont make the window if it already exists
  if(window !== (null || undefined)) {
    return;
  }

  // make new browser window and load view
  window = new BrowserWindow(
    {
      name: 'metaos-console-window',
      width: 900, 
      height: 680,
      show: false,
      backgroundColor: '#ffffff',
      icon: applicationIcon,
      fullscreenable : false,
      webPreferences: 
      {
        devTools: isDev,
        toolbar: false
      }
    }
  );
  window.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  window.setMenu(null);

  showDevTools();

  // handle our windows events
  window.on('ready-to-show', onWindowReadyToShowCb);
  window.on('closed', onWindowCloseCb);

  // start the autoupdate service
  initAutoUpdate();
}

/*
 * show the main application window
 */
function showWindow() {
  window.show();
  window.focus();
}

/*
 * hides the main application window
 */
function hideWindow() {
  window.hide();
}

/*
 * toggles window display between show and hide state
 */
function toggleWindow() {
  if (window.isVisible()) {
    hideWindow();
  } else {
    showWindow();
  }
}

/*
 * show the debug dev tools
 */
function showDevTools() {
  if(!isDev) {
    return
  }
  window.openDevTools(
    {
      detach: true
    }
  );
}

/*
 * setup auto-update and check for updates. Called from createWindow()
*/
function initAutoUpdate() {

  // skip update if we are in linux or dev mode
  if (isDev) {
    return;
  }
  if (process.platform === 'linux') {
    return;
  }

  // configure update logging to file
  autoUpdater.logger = logger;
  autoUpdater.logger.transports.file.level = 'info';

  // check for updates and notify if we have a new version
  autoUpdater.checkForUpdates();
  autoUpdater.signals.updateDownloaded(showUpdateNotification);
}

/*
 * shows system notification for when there is a new app update
 * >> CURRENTLY BROKEN : not showing for when there is an update <<
*/
function showUpdateNotification(it) {
  
  // TODO implement logger into notifications

  // define our object and lables
  it = it || {};
  const restartNowAction = 'Restart now';
  const versionLabel = it.label 
    ? `Version ${it.version}` 
    : 'The latest version';

  // display a system notification dialog
  notifier.notify(
    {
      title: 'A new update is ready to install.',
      message: `${versionLabel} has been downloaded and will be automatically installed after restart.`,
      closeLabel: 'Okay',
      actions: restartNowAction
    },
    function(err, response, metadata) {
      if (err) throw err;
      if (metadata.activationValue !== restartNowAction) {
        return;
      }
      autoUpdater.quitAndInstall();
    }
  );
}
