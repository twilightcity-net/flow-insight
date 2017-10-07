const { BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Util = require('./Util');
const ViewManagerHelper = require('./ViewManagerHelper');
const LoadingWindow = require('./LoadingWindow');

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
	 * Gets the window from the global array of windows
	 */

	static getWindow(name) {
		Windows.forEach(function(item, index, array) {
		  if (Windows[i].name == name) {
	      return Windows[i];
	    }
		});
  	return null;
	}

	/*
	 * Gets the url to load in the window based on a name of a view
	 */

	static getWindowViewURL(viewName) {
		return isDev
			? 'http://localhost:3000?' + viewName
			: `file://${path.join(__dirname, '../build/index.html?' + viewName)}`;
	}

	/*
	 * Loads a view into a window and creates its event handlers
	 */
	 
	static loadWindow(window) {
		window.window.loadURL(window.url);
		window.window.on('ready-to-show', () => {
	  	this.openWindow(window);
	  });
	  window.window.on('closed', () => {
	  	this.destroyWindow(window);
	  });
	}

	/*
	 * Opens a window based on its object reference
	 */

	static openWindow(window) {
		window.window.show();
	 	window.window.focus();
	}

	/*
	 * closes the window with and option to destroy the window from
	 * Memory
	 */

	static closeWindow(window, destroy) {
		window.window.hide();
		if(destroy) {
			this.destroyWindow(window);
		}
	}

	/*
	 * Hids the window, and removes it from the Array of windows. This
	 * is needed so that we do not leak memory or waste local resources.
	 */

	static destroyWindow(window) {
		Windows.forEach(function(item, index, array) {
		  if (array[index].name == window.name) {
	      return array.splice(index, 1);
	    }
		});
		return null;
	}

	/*
	 * creates a new window based off the string name of the window.
	 * After creating the window, it is added to a global array to
	 * be reused.
	 */

	static createWindow(name) {
		let window = this.getWindow(name);
	  if(!window) {
	  	window = this.getWindowClassFromName(name);
	  }
	  this.loadWindow(window);
	  Windows.push(window);
	}

	/*
	 * Toggles open / close of windows withing our Array
	 */

	static toggleWindow(window) {
	  if (window.window.isVisible()) {
	    openWindow(window);
	  } else {
	    closeWindow(window);
	  }
	}

	/*
	 * This is a helper method that returns the class of a window
	 * based on the literal string name of the class. A better way to do
	 * is to figure out how to use some type of reflection with a 
	 * factory class.
	 *
	 * Need to add a new case for each window we wish to open
	 */

	static getWindowClassFromName(name) {
		// TODO this should use a factory design
  	switch(name) {
  		case this.WindowNames.LOADING:
  			return new LoadingWindow(this);
  		case this.WindowNames.CONSOLE:
  			return new ConsoleWindow(this);
  		default:
  			return null
  	}
	}

	/*
	 * Stuff that you need to add when making a new window. These are high 
	 * level API calls for other classes to use.
	 */

	static createWindowLoading() {
		let name = this.WindowNames.LOADING;
		this.createWindow(name);
	}

	static createWindowConsole() {
		let name = this.WindowNames.CONSOLE;
		this.createWindow(name);
	}
}
