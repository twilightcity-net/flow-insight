/*
 * Electron Node Required Packages
 */
const {app, Menu, Tray} = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const path = require('path');
const isDev = require('electron-is-dev');
const logger = require('electron-log');

/*
 * Project Required Packages
 */
const WindowManager = require('../src/WindowManager');

/*
 * Global Constants
 */
const assetsDirectory = path.join(__dirname, 'assets');
const trayIcon = assetsDirectory + '/icons/icon.png';

/*
 * Global Objects
 */
let tray = undefined;

/*
 * Application Events
 */
// TODO move to its own App Class, and call one function to start
app.on('ready', onAppReadyCb);
app.on('activate', onAppActivateCb);  //macOS
app.on('window-all-closed', onAppWindowAllCloseCb);

/*
 * Event Callback Functions
 */

function onAppReadyCb() {
    app.setName('MetaOS');
    // createTray();
    createMenu();
    WindowManager.createWindowLoading();
    WindowManager.createWindowBugReport();
    // initAutoUpdate();
}

// FIXME doesn't work, untested
function onAppActivateCb() {
    // should show or create a console window
    // createWindow();
}

function onAppWindowAllCloseCb() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

// TODO move tray stuff to its own AppTray Class
function onTrayRightClickCb() {
    // TODO toggle console window
}

function onTrayDoubleClickCb() {
    // TODO toggle console window
}

function onTrayClickCb() {
    // TODO toggle console window
}

/*
 * Creates the app's menu for MacOS
 * Ref. https://electron.atom.io/docs/api/menu/#notes-on-macos-application-menu
 */
function createMenu() {
    let menu = null;
    if (process.platform === 'darwin') {
        const template = [
            {
                label: app.getName(),
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services', submenu: []},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideothers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            },
            {
                role: 'window',
                submenu: [
                    {role: 'close'},
                    {role: 'minimize'},
                    {role: 'zoom'},
                    {type: 'separator'},
                    {role: 'front'}
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'MetaOS - Learn More',
                        click() {
                            require('electron').shell.openExternal('http://www.openmastery.org/')
                        }
                    },
                    {
                        label: 'Report bug',
                        click() {
                            WindowManager.loadWindow(window)
                            createBugReportWindow();
                            showBugReportWindow();
                        }
                    }
                ]
            }
        ]
        menu = Menu.buildFromTemplate(template)
    } else {
        const template = [
            {
                label: 'Edit',
                submenu: [
                    {role: 'undo'},
                    {role: 'redo'},
                    {type: 'separator'},
                    {role: 'cut'},
                    {role: 'copy'},
                    {role: 'paste'},
                    {role: 'pasteandmatchstyle'},
                    {role: 'delete'},
                    {role: 'selectall'}
                ]
            },
            {
                label: 'View',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {role: 'toggledevtools'},
                    {type: 'separator'},
                    {role: 'resetzoom'},
                    {role: 'zoomin'},
                    {role: 'zoomout'},
                    {type: 'separator'},
                    {role: 'togglefullscreen'}
                ]
            },
            {
                role: 'window',
                submenu: [
                    {role: 'minimize'},
                    {role: 'close'}
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click() {
                            require('electron').shell.openExternal('http://www.openmastery.org/')
                        }
                    },
                    {
                        label: 'Report bug',
                        click() {
                            WindowManager.loadWindow(window)
                            createBugReportWindow();
                            showBugReportWindow();
                        }
                    }
                ]
            }
        ]
        menu = Menu.buildFromTemplate(template)
    }

    Menu.setApplicationMenu(menu)
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
 * setup auto-update and check for updates. Called from createWindow()
*/

// TODO move to its own AppUpdater Class
function initAutoUpdate() {

    // skip update if we are in linux or dev mode
    if (isDev) {
        return;
    }
    if (process.platform === 'linux') {
        return;
    }

    autoUpdater.autoDownload = false;

    // configure update logging to file
    autoUpdater.logger = logger;
    autoUpdater.logger.transports.file.level = 'info';

    autoUpdater.on('checking-for-update', () => {
        autoUpdater.logger.info('Checking for update...');
    })
    autoUpdater.on('update-available', (info) => {
        autoUpdater.logger.info('Update available.');
    })
    autoUpdater.on('update-not-available', (info) => {
        autoUpdater.logger.info('Update not available.');
    })
    autoUpdater.on('error', (err) => {
        autoUpdater.logger.error('Error in auto-updater.');
    })
    autoUpdater.on('download-progress', (progressObj) => {
        let logMsg = "Download speed: " + progressObj.bytesPerSecond;
        logMsg = logMsg + ' - Downloaded ' + progressObj.percent + '%';
        logMsg = logMsg + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        autoUpdater.logger.info(logMsg);
    })
    autoUpdater.on('update-downloaded', (info) => {
        autoUpdater.logger.info('Update downloaded');
    });

    // check for updates and notify if we have a new version
    autoUpdater.checkForUpdates();
}