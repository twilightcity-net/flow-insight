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
      SIDEBAR_PANEL: "[SidebarPanel]",
      CIRCUIT_SIDEBAR: "[CircuitSidebar]"
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
  static getJournalItemsPanelHeight(isEntryShowing) {
    let heights = {
      border: 2,
      margin: 12,
      padding: 12,
      header: 51,
      entry: isEntryShowing ? 50 : 0
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
   * calculates the dynamic relative size based on screensize. This is called
   * by the onchange vertical panel resizer for splitter-layout
   * @param size
   * @returns {number}
   */
  static getActiveCircuitFeedContentHeight(size) {
    let oneRem = window.innerHeight / 100,
      newSize;
    if (size) {
      let heights = {
        window: window.innerHeight,
        border: Math.ceil(1.68 * oneRem),
        margin: Math.ceil(1.68 * oneRem),
        padding: Math.ceil(0.84 * oneRem),
        chat: size,
        header: Math.ceil(10.14 * oneRem)
      };
      newSize =
        heights.window -
        heights.border -
        heights.margin -
        heights.padding -
        heights.chat -
        heights.header;
    } else {
      let heights = {
        window: window.innerHeight,
        border: Math.ceil(1.68 * oneRem),
        margin: Math.ceil(1.68 * oneRem),
        padding: Math.ceil(0.84 * oneRem),
        chat: DimensionController.getActiveCircuitContentChatMinHeightDefault(),
        header: Math.ceil(10.14 * oneRem)
      };
      newSize =
        heights.window -
        heights.border -
        heights.margin -
        heights.padding -
        heights.chat -
        heights.header;
    }
    return newSize;
  }

  /**
   * calculates the default resize panel height for the chat panel
   * @returns {number}
   */
  static getActiveCircuitContentChatMinHeightDefault() {
    return Math.ceil(
      DimensionController.getActiveCircuitContentChatMinHeight() * 1.42
    );
  }

  /**
   * calculates the minimum height for the circuit content panel
   * @returns {number}
   */
  static getActiveCircuitContentFeedMinHeight() {
    let oneRem = window.innerHeight / 100;
    return 24 * oneRem;
  }

  /**
   * calculates the circuit chat content height for the panel
   * @returns {number}
   */
  static getActiveCircuitContentChatMinHeight() {
    let oneRem = window.innerHeight / 100;
    return 14 * oneRem;
  }

  /**
   * calculates the circuit feed content width for the panel
   * @returns {number}
   */
  static getActiveCircuitContentFeedMinWidth() {
    let oneRem = window.innerHeight / 100;
    return 48 * oneRem;
  }

  /**
   * calculates the height for the circuit scrapbook panel
   * @returns {number}
   */
  static getActiveCircuitContentScrapbookMinWidth() {
    let oneRem = window.innerHeight / 100;
    return 44.42 * oneRem;
  }

  /**
   * calculate the default resize panel width for the circuit scrapbook
   * @returns {number}
   */
  static getActiveCircuitContentScrapbookMinWidthDefault() {
    return (
      DimensionController.getActiveCircuitContentScrapbookMinWidth() * 1.42
    );
  }

  /**
   * gets the dynamic height of the circuit side bar
   * @returns {number}
   */
  static getCircuitSidebarHeight() {
    let oneRem = window.innerHeight / 100;
    let heights = {
      window: window.innerHeight,
      border: Math.ceil(1.68 * oneRem),
      margin: Math.ceil(1.68 * oneRem),
      header: 52,
      padding: Math.ceil(1.26 * oneRem),
      footer: Math.ceil(14 * oneRem),
      timer: Math.ceil(20 * oneRem)
    };
    return (
      heights.window -
      heights.border -
      heights.margin -
      heights.header -
      heights.padding -
      heights.footer -
      heights.timer
    );
  }

  /**
   * gets the circuit sidebar actions
   * @returns {number}
   */
  static getCircuitSidebarActionsHeight() {
    let oneRem = window.innerHeight / 100;
    return 14 * oneRem;
  }

  /**
   * gets our circuit sidebar timer height relative units
   * @returns {number}
   */
  static getCircuitSidebarTimerHeight() {
    let oneRem = window.innerHeight / 100;
    return 19 * oneRem;
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
    } else if (component === DimensionController.Components.CIRCUIT_SIDEBAR) {
      return DimensionController.getCircuitSidebarHeight();
    } else {
      throw new Error(
        "Unknown component " + component + " in DimensionController"
      );
    }
  }
}
