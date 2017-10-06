/*
 * Simpler helper function for the ViewManager used to store the
 * names of the applications various views
 */

module.exports = class ViewManagerHelper {

	/*
	 * Enum subclass to store view names in
	 */
	 
	static get ViewNames() {
		return {
			LOADING: 'loading',
			CONSOLE: 'console',
			BUGREPORT: 'bugreport'
		}
	}
}