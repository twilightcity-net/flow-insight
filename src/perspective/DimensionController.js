import SpiritPanel from "../components/SpiritPanel";
import JournalItems from "../components/JournalItems";
import FlowContent from "../components/FlowContent";
import ConsoleLayout from "../components/ConsoleLayout";

/**
 * generic controller that handles calculations for dynamic fluid heights of
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
   * builds the class into the static property instance
   * @param scope - the scope to build the instance into
   */
  static init(scope) {
    if (!DimensionController.instance) {
      DimensionController.instance = new DimensionController(scope);
    }
  }

  static getFlowPanelHeight() {
    let heights = {
      border: 2,
      margin: 24,
      padding: 8,
      header: 51,
      content: 0,
      menu: 28
    };
    return (
      window.innerHeight -
      heights.border -
      heights.margin -
      heights.padding -
      heights.header -
      heights.content -
      heights.menu
    );
  }

  static getJournalItemsPanelHeight() {
    let heights = {
      border: 2,
      margin: 12,
      padding: 12,
      header: 51,
      entry: 50,
      menu: 28
    };
    return (
      window.innerHeight -
      heights.border -
      heights.margin -
      heights.padding -
      heights.header -
      heights.entry -
      heights.menu
    );
  }

  static getSpiritPanelWidth() {
    let widths = {
      window: window.innerWidth,
      border: 2,
      margin: 0,
      padding: 0,
      content: 500
    };
    return (
      widths.window -
      widths.border -
      widths.margin -
      widths.padding -
      widths.content
    );
  }

  static getSpiritPanelHeight() {
    let heights = {
      window: window.innerHeight,
      border: 2,
      margin: 20,
      canvas: 0,
      menu: 28
    };
    return (
      heights.window -
      heights.border -
      heights.margin -
      heights.canvas -
      heights.menu
    );
  }

  static getConsoleLayoutHeight() {
    let heights = {
      window: window.innerHeight,
      border: 0,
      margin: 8,
      header: 22
    };
    return heights.window - heights.border - heights.margin - heights.header;
  }

  static getDefaultConsoleSidebarPanelWidth() {
    return window.innerWidth;
  }

  static getDefaultConsoleSidebarPanelHeight() {
    return window.innerHeight;
  }

  static getWidthFor(component) {
    if (component.name === "[" + SpiritPanel.name + "]") {
      return DimensionController.getSpiritPanelWidth();
    }
    return DimensionController.getDefaultConsoleSidebarPanelWidth();
  }

  static getHeightFor(component) {
    if (component.name === "[" + SpiritPanel.name + "]") {
      return DimensionController.getSpiritPanelHeight();
    } else if (component.name === "[" + JournalItems.name + "]") {
      return DimensionController.getJournalItemsPanelHeight();
    } else if (component.name === "[" + FlowContent.name + "]") {
      return DimensionController.getFlowPanelHeight();
    } else if (component.name === "[" + ConsoleLayout.name + "]") {
      return DimensionController.getConsoleLayoutHeight();
    }
    return DimensionController.getDefaultConsoleSidebarPanelHeight();
  }
}
