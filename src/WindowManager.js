const path = require('path');
const isDev = require('electron-is-dev');
const ViewManagerHelper = require('../src/ViewManagerHelper');

module.exports = class WindowManager {

	static get WindowNames() {
		let appName = 'metaos-';
		return {
			LOADING: appName + ViewManagerHelper.ViewNames.LOADING,
			CONSOLE: appName + ViewManagerHelper.ViewNames.CONSOLE
		}
	}

	static GetWindowViewURL(viewName) {
		return isDev
			? 'http://localhost:3000?' + viewName
			: `file://${path.join(__dirname, '../build/index.html?' + viewName)}`;
	}
}
