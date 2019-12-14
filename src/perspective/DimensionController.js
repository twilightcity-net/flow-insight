import SpiritPanel from "../components/SpiritPanel";
import JournalItems from "../components/JournalItems";
import FlowContent from "../components/FlowContent";

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
      margin: 13,
      padding: 16,
      header: 51,
      items: 50,
      menu: 28
    };
    return (
      window.innerHeight -
      heights.border -
      heights.margin -
      heights.padding -
      heights.header -
      heights.items -
      heights.menu
    );
  }

  static getSpiritPanelHeight() {
    let heights = {
      window: window.innerHeight,
      border: 2,
      margin: 8,
      header: 34,
      canvas: 0,
      menu: 28
    };
    return (
      heights.window -
      heights.border -
      heights.margin -
      heights.header -
      heights.canvas -
      heights.menu
    );
  }

  static getDefaultConsoleSidebarPanelWidth() {
    return window.innerWidth;
  }

  static getDefaultConsoleSidebarPanelHeight() {
    return window.innerHeight;
  }

  static getWidthFor(component) {
    if (component.name === "[" + SpiritPanel.name + "]") {
      return DimensionController.getSpiritPanelHeight();
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
    }
    return DimensionController.getDefaultConsoleSidebarPanelHeight();
  }
}
