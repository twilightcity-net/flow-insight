const path = require('path');
const isDev = require('electron-is-dev');
const ViewManagerHelper = require('../src/ViewManagerHelper');

/*
 * An array containing all of our global windows the app uses
 */

module.exports = Windows = []

/*
 * This class is used to manage the view, state, and display of each
 * of our windows in our application. Windows are stored in an array
 * and are dynamically loaded.
 */

module.exports = class WindowManager {

	/*
	 * static helper enum subclass to store window names
	 */

	static get WindowNames() {
		let appName = 'metaos-';
		return {
			LOADING: appName + ViewManagerHelper.ViewNames.LOADING,
			CONSOLE: appName + ViewManagerHelper.ViewNames.CONSOLE
		}
	}

	/*
	 * Gets the url to load in the window based on a name of a view
	 */
	 
	static GetWindowViewURL(viewName) {
		return isDev
			? 'http://localhost:3000?' + viewName
			: `file://${path.join(__dirname, '../build/index.html?' + viewName)}`;
	}
}
