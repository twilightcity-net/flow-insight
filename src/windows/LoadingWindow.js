const { BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const ViewManagerHelper = require('../ViewManagerHelper');

/*
 * The Application loading window. Loads LoadingView class. This window
 * is always show when the application first loads
 */

module.exports = class LoadingWindow {

	// TODO extend BrowserWindow instead; this makes us call window.window

	constructor(WindowManager) {

		// window and view properties
		this.manager = WindowManager;
		this.name = WindowManager.WindowNames.LOADING;
		this.view = ViewManagerHelper.ViewNames.LOADING;
		this.url = WindowManager.getWindowViewURL(this.view);

		// creates the BrowserWindow with View Content
		this.window = new BrowserWindow({
      name: this.name,
      width: 360, 
      height: 160,
      minWidth: 360,
      minHeight: 160,
      resizable: false,
      show: false,
      backgroundColor: '#ffffff',
      fullscreenable : false,
      webPreferences: {
        devTools: isDev,
        toolbar: false
    }});

    // dont show a menu
    this.window.setMenu(null);
	}
}
