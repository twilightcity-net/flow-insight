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
   * Contains the logging to properly set the component heights of various
   * view layouts
   * @param scope - the scope to determine the dimensional properties to of components
   */
  constructor(scope) {
    this.name = "[DimensionController]";
    this.scope = scope;
  }

  /**
   * the list of components we wish to manage dimensions for
   * @returns {{HOTKEY_CONFIG:string, FLOW_PANEL: string, PLAY_PANEL: string, FERVIE_PANEL: string, JOURNAL_ITEMS: string, CONSOLE_LAYOUT: string, TROUBLESHOOT: string}}
   * @constructor
   */
  static get Components() {
    return {
      FERVIE_PANEL: "[FerviePanel]",
      JOURNAL_ITEMS: "[JournalItems]",
      FLOW_PANEL: "[FlowPanel]",
      PLAY_PANEL: "[PlayPanel]",
      CONSOLE_LAYOUT: "[ConsoleLayout]",
      TROUBLESHOOT: "[Troubleshoot]",
      SIDEBAR_PANEL: "[SidebarPanel]",
      CIRCUIT_SIDEBAR: "[CircuitSidebar]",
      HOTKEY_CONFIG: "[HotkeyConfig]",
    };
  }

  /**
   * builds the class into the static property instance
   * @param scope - the scope to build the instance into
   */
  static init(scope) {
    if (!DimensionController.instance) {
      DimensionController.instance =
        new DimensionController(scope);
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
      content: 0,
      barHeight: 0,
    };
    let addressBar = document.querySelector(
      "#component.browserHeader"
    );
    if (addressBar) {
      return (
        window.innerHeight -
        heights.border -
        heights.padding -
        addressBar.clientHeight
      );
    } else {
      return window.innerHeight;
    }
  }

  /**
   * calculates the play panel height for the console view
   * @returns {number}
   */
  static getPlayPanelHeight() {
    return window.innerHeight;
  }

  /**
   * Calculates the height for the hotkey config window
   * @returns {number}
   */
  static getHotkeyConfigHeight() {
    return window.innerHeight;
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
      entry: 50,
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
   * gets the fervie panel width of the canvas
   * @returns {number}
   */
  static getFervieCanvasWidth() {
    let consoleSidebarWidthPixels = 29,
      oneRem = window.innerWidth / 100,
      relativeWidth = 21.2;

    return (
      oneRem * relativeWidth - consoleSidebarWidthPixels
    );
  }

  /**
   * gets the fervie canvas height dimension for canvas
   * @returns {number}
   */
  static getFervieCanvasHeight() {
    let consoleSidebarBorderPixels = 4,
      oneRem = window.innerHeight / 100,
      relativeHeight = 76;

    return (
      oneRem * relativeHeight - consoleSidebarBorderPixels
    );
  }

  /**
   * gets the mini fervie canvas height dimension for canvas on the color picker panel
   * @returns {number}
   */
  static getMiniFervieCanvasHeight() {
    let consoleSidebarBorderPixels = 4,
      oneRem = window.innerHeight / 100,
      relativeHeight = 37;

    return (
      oneRem * relativeHeight - consoleSidebarBorderPixels
    );
  }

  /**
   * gets the fervie panel width of the canvas
   * @returns {number}
   */
  static getMiniFervieCanvasWidth() {
    let consoleSidebarWidthPixels = 29,
      oneRem = window.innerWidth / 100,
      relativeWidth = 11;

    return (
      oneRem * relativeWidth - consoleSidebarWidthPixels
    );
  }

  /**
   * gets the height dimension for the fervie color picker
   * @returns {number}
   */
  static getColorPickerDivHeight() {
    let consoleSidebarBorderPixels = 4,
      oneRem = window.innerHeight / 100,
      relativeHeight = 37;

    return (
      oneRem * relativeHeight - consoleSidebarBorderPixels
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
      contentHeader: 34,
    };
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader
    );
  }

  /**
   * gets the general relative height dimension for sidebar content panel w/ extra padding
   * @returns {number}
   */
  static getSidebarPanelHeight() {
    let heights = {
      rootBorder: 4,
      contentMargin: 1,
      contentHeader: 34,
    };
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader
    );
  }

  /**
   * gets the fervie panel height
   * @returns {number}
   */
  static getFerviePanelHeight() {
    let heights = {
      window: window.innerHeight,
      border: 2,
      margin: 20,
      canvas: 0,
    };
    return (
      heights.window -
      heights.border -
      heights.margin -
      heights.canvas
    );
  }

  /**
   * gets the console layout height
   * @returns {number}
   */
  static getConsoleLayoutHeight() {
    let heights = {
      window: window.innerHeight,
      border: 0,
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
      header: 52,
    };
    return (
      heights.window -
      heights.border -
      heights.margin -
      heights.header
    );
  }

  /**
   * calculates the dynamic relative size based on screen size. This is called
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
        header: Math.ceil(10.14 * oneRem),
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
        header: Math.ceil(10.14 * oneRem),
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
      DimensionController.getActiveCircuitContentChatMinHeight() *
        1.42
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
   * calculates the height for the circuit scrapbook panel
   * @returns {number}
   */
  static getActiveCircuitContentRetroSlideMinWidthDefault() {
    let oneRem = window.innerHeight / 100;
    return 100.42 * oneRem;
  }

  /**
   * calculate the default resize panel width for the circuit scrapbook
   * @returns {number}
   */
  static getActiveCircuitContentScrapbookMinWidthDefault() {
    return (
      DimensionController.getActiveCircuitContentScrapbookMinWidth() *
      1.42
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
      timer: Math.ceil(20 * oneRem),
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
      rootBorder: 2,
    };
    return window.innerHeight - heights.rootBorder;
  }

  /**
   * Get the width of a full panel on the right hand side, without the right side popup window
   */
  static getFullRightPanelWidth() {
    let fullWidth = window.innerWidth - 10; // default margin

    let browserHeader = document.querySelector(
      "#component.browserHeader"
    );

    if (browserHeader) {
      fullWidth = browserHeader.clientWidth;
    }

    return fullWidth;
  }

  static getBrowserBarHeight() {
    let barHeight = 0;

    let addressbar = document.querySelector(
      "#component.browserHeader"
    );
    if (addressbar) {
      barHeight = addressbar.clientHeight;
    }
    return barHeight;
  }

  /**
   * Get the height of a full panel on the right hand side, with the address bar in place
   */
  static getFullRightPanelHeight() {
    let barHeight = 10;

    let addressbar = document.querySelector(
      "#component.browserHeader"
    );
    if (addressbar) {
      barHeight = addressbar.clientHeight;
    }
    let padding = 8 * 2;

    return window.innerHeight - barHeight - padding;
  }

  /**
   * gets the height for a component based on its constructor
   * @param component
   * @returns {number|*}
   */
  static getHeightFor(component) {
    if (
      component ===
      DimensionController.Components.FERVIE_PANEL
    ) {
      return DimensionController.getFerviePanelHeight();
    } else if (
      component ===
      DimensionController.Components.JOURNAL_ITEMS
    ) {
      return DimensionController.getJournalItemsPanelHeight(
        false
      );
    } else if (
      component ===
      DimensionController.Components.FLOW_PANEL
    ) {
      return DimensionController.getFlowPanelHeight();
    } else if (
      component ===
      DimensionController.Components.PLAY_PANEL
    ) {
      return DimensionController.getPlayPanelHeight();
    } else if (
      component ===
      DimensionController.Components.CONSOLE_LAYOUT
    ) {
      return DimensionController.getConsoleLayoutHeight();
    } else if (
      component ===
      DimensionController.Components.TROUBLESHOOT
    ) {
      return DimensionController.getActiveCircuitContentHeight();
    } else if (
      component ===
      DimensionController.Components.HOTKEY_CONFIG
    ) {
      return DimensionController.getHotkeyConfigHeight();
    }
    else if (
      component ===
      DimensionController.Components.SIDEBAR_PANEL
    ) {
      return DimensionController.getSidebarPanelHeight();
    } else if (
      component ===
      DimensionController.Components.CIRCUIT_SIDEBAR
    ) {
      return DimensionController.getCircuitSidebarHeight();
    } else {
      throw new Error(
        "Unknown component " +
          component +
          " in DimensionController"
      );
    }
  }
}
