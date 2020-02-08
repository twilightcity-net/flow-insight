/**
 * our generic controller that handles calculations for dynamic fluid heights of
 * the different resolution aspect ratios
 */
export class DimensionController {
  /**
   * the static property to store this class into for reference
   */
  static instance;

  /**
   * Contains the logig to properly set the component heights of various view layouts
   * @param scope - the scope to determine the dimenational properties to of components
   */
  constructor(scope) {
    this.name = "[DimensionController]";
    this.scope = scope;
  }

  /**
   * the list of components we wish to manage dimensions for
   * @returns {{FLOW_PANEL: string, SPIRIT_PANEL: string, JOURNAL_ITEMS: string, CONSOLE_LAYOUT: string, TROUBLESHOOT: string}}
   * @constructor
   */
  static get Components() {
    return {
      SPIRIT_PANEL: "[SpiritPanel]",
      JOURNAL_ITEMS: "[JournalItems]",
      FLOW_PANEL: "[FlowPanel]",
      CONSOLE_LAYOUT: "[ConsoleLayout]",
      TROUBLESHOOT: "[Troubleshoot]",
      SIDEBAR_PANEL: "[SidebarPanel]"
    };
  }

  /**
   * builds the class into the static property instance
   * @param scope - the scope to build the instance into
   */
  static init(scope) {
    if (!DimensionController.instance) {
      DimensionController.instance = new DimensionController(scope);
    }
  }

  /**
   * calculates the flow panel height for the console view
   * @returns {number}
   */
  static getFlowPanelHeight() {
    let heights = {
      border: 2,
      margin: 24,
      padding: 8,
      header: 51,
      content: 0
    };
    return (
      window.innerHeight -
      heights.border -
      heights.margin -
      heights.padding -
      heights.header -
      heights.content
    );
  }

  /**
   * gets the journal items height for the journal view
   * @returns {number}
   */
  static getJournalItemsPanelHeight() {
    let heights = {
      border: 2,
      margin: 12,
      padding: 12,
      header: 51,
      entry: 50
    };
    return (
      window.innerHeight -
      heights.border -
      heights.margin -
      heights.padding -
      heights.header -
      heights.entry
    );
  }

  /**
   * gets the spirit panel width of the canvas
   * @returns {number}
   */
  static getSpiritCanvasWidth() {
    let consoleSidebarWidthPixels = 29,
      oneRem = window.innerWidth / 100,
      relativeWidth = 20.2;
    return oneRem * relativeWidth - consoleSidebarWidthPixels;
  }

  /**
   * gets the spirit canvas height dimension for canvas
   * @returns {number}
   */
  static getSpiritCanvasHeight() {
    let heights = {
      window: window.innerHeight,
      border: 2,
      margin: 20,
      title: 24,
      canvas: 108
    };
    return (
      heights.window -
      heights.border -
      heights.margin -
      heights.title -
      heights.canvas
    );
  }

  /**
   * gets the circuits height dimension for sidebar panel
   * @returns {number}
   */
  static getCircuitsSidebarPanelHeight() {
    let heights = {
      rootBorder: 4,
      contentMargin: 1,
      contentHeader: 34
    };
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader
    );
  }

  /**
   * gets the general relative height dimension for sidebar content panelm w/ extra padding
   * @returns {number}
   */
  static getSidebarPanelHeight() {
    let heights = {
      rootBorder: 4,
      contentMargin: 1,
      contentHeader: 34
    };
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader
    );
  }

  /**
   * gets the spirit panel height
   * @returns {number}
   */
  static getSpiritPanelHeight() {
    let heights = {
      window: window.innerHeight,
      border: 2,
      margin: 20,
      canvas: 0
    };
    return heights.window - heights.border - heights.margin - heights.canvas;
  }

  /**
   * gets the console layout height
   * @returns {number}
   */
  static getConsoleLayoutHeight() {
    let heights = {
      window: window.innerHeight,
      border: 0
    };
    return heights.window - heights.border;
  }

  /**
   * gets the troubleshoot content height
   * @returns {number}
   */
  static getActiveCircuitContentHeight() {
    let oneRem = window.innerHeight / 100;
    let heights = {
      window: window.innerHeight,
      border: Math.ceil(1.68 * oneRem),
      margin: Math.ceil(1.68 * oneRem),
      header: 52
    };
    return heights.window - heights.border - heights.margin - heights.header;
  }

  /**
   * gets the height of the inner part of the window width
   * @returns {number}
   */
  static getWindowInnerWidth() {
    return window.innerWidth;
  }

  /**
   * gets the relative height of the console sidebar based on the screen resolution
   * @returns {number}
   */
  static getConsoleSidebarHeight() {
    let heights = {
      rootBorder: 2
    };
    return window.innerHeight - heights.rootBorder;
  }

  /**
   * gets the inner part of the window height
   * @returns {number}
   */
  static getWindowInnerHeight() {
    return window.innerHeight;
  }

  /**
   * gets the height for a component based on its constructor
   * @param component
   * @returns {number|*}
   */
  static getHeightFor(component) {
    if (component === DimensionController.Components.SPIRIT_PANEL) {
      return DimensionController.getSpiritPanelHeight();
    } else if (component === DimensionController.Components.JOURNAL_ITEMS) {
      return DimensionController.getJournalItemsPanelHeight();
    } else if (component === DimensionController.Components.FLOW_PANEL) {
      return DimensionController.getFlowPanelHeight();
    } else if (component === DimensionController.Components.CONSOLE_LAYOUT) {
      return DimensionController.getConsoleLayoutHeight();
    } else if (component === DimensionController.Components.TROUBLESHOOT) {
      return DimensionController.getActiveCircuitContentHeight();
    } else if (component === DimensionController.Components.SIDEBAR_PANEL) {
      return DimensionController.getSidebarPanelHeight();
    } else {
      throw new Error(
        "Unknown component " + component + " in DimensionController"
      );
    }
  }
}
