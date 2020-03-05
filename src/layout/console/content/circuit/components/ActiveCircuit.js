import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import CircuitSidebar from "./CircuitSidebar";
import ActiveCircuitFeed from "./ActiveCircuitFeed";
import ActiveCircuitScrapbook from "./ActiveCircuitScrapbook";
import { Transition } from "semantic-ui-react";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ActiveCircuit extends Component {
  /**
   *  builds the active circuit component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuit]";
    this.myController = props.myController;
    this.animationType = "fade";
    this.animationDelay = 210;
    this.state = {
      resource: props.resource,
      scrapbookVisible: false
    };
  }

  /**
   * make sure we load the circuit with members when we load this component
   */
  componentDidMount() {
    console.log(this.name + " load active circuit with members");

    // TODO implement circuit client getActiveCircuitWithMembers()
  }

  /**
   * hides our resizable scrapbook in the feed panel
   */
  hideScrapbook = () => {
    console.log("hide scrapbook");
    this.setState({
      scrapbookVisible: false
    });
  };

  /**
   * shows our scrapbook in our feedpanel
   */
  showScrapbook = () => {
    console.log("show scrapbook");
    if (this.state.scrapbookVisible) return;
    this.setState({
      scrapbookVisible: true
    });
  };

  /**
   * gets our classname for the splitter panel
   * @returns {string}
   */
  getClassName() {
    return this.state.scrapbookVisible ? "content show" : "content hide";
  }

  /**
   * renders our circuit content panel and resizable scrapbook
   * @returns {*}
   */
  getCircuitContentPanel() {
    return (
      <div id="component" className="circuitContentPanel">
        <SplitterLayout
          customClassName={this.getClassName()}
          primaryMinSize={DimensionController.getActiveCircuitContentFeedMinWidth()}
          secondaryMinSize={DimensionController.getActiveCircuitContentScrapbookMinWidth()}
          secondaryInitialSize={DimensionController.getActiveCircuitContentScrapbookMinWidthDefault()}
        >
          <div id="wrapper" className="activeCircuitFeed">
            <ActiveCircuitFeed />
          </div>
          <Transition
            visible={this.state.scrapbookVisible}
            animation={this.animationType}
            duration={this.animationDelay}
          >
            <div id="wrapper" className="activeCircuitScrapbook">
              <ActiveCircuitScrapbook hideScrapbook={this.hideScrapbook} />
            </div>
          </Transition>
        </SplitterLayout>
      </div>
    );
  }

  /**
   * renders the default troubleshoot component in the console view
   */
  render() {
    return (
      <div
        id="component"
        className="circuitContent"
        style={{ height: DimensionController.getActiveCircuitContentHeight() }}
      >
        <div id="wrapper" className="circuitContentPanel">
          {this.getCircuitContentPanel()}
        </div>
        <div id="wrapper" className="circuitContentSidebar">
          <div id="component" className="circuitContentSidebar">
            <CircuitSidebar
              controller={this.myController}
              resource={this.state.resource}
              showScrapbook={this.showScrapbook}
            />
          </div>
        </div>
      </div>
    );
  }
}
