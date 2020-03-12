import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import CircuitSidebar from "./CircuitSidebar";
import ActiveCircuitFeed from "./ActiveCircuitFeed";
import ActiveCircuitScrapbook from "./ActiveCircuitScrapbook";
import { Transition } from "semantic-ui-react";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import { CircuitClient } from "../../../../../clients/CircuitClient";

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
    this.animationType = "fade";
    this.animationDelay = 210;
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
    this.state = {
      resource: props.resource,
      scrapbookVisible: false,
      model: null
    };
  }

  /**
   * called after this circuit component is loaded. This will thgen fetch the circuit
   * details from our local database and update our model in our state for our
   * child components
   */
  componentDidMount() {
    let circuitName = this.props.resource.uriArr[2];
    CircuitClient.getCircuitWithAllDetails(circuitName, this, arg => {
      this.setState({
        model: arg.data
      });
    });
  }

  /**
   * hides our resizable scrapbook in the feed panel
   */
  hideScrapbook = () => {
    this.setState({
      scrapbookVisible: false
    });
  };

  /**
   * shows our scrapbook in our feedpanel
   */
  showScrapbook = () => {
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
            <ActiveCircuitFeed
              resource={this.state.resource}
              showScrapbook={this.showScrapbook}
              model={this.state.model}
            />
          </div>
          <Transition
            visible={this.state.scrapbookVisible}
            animation={this.animationType}
            duration={this.animationDelay}
          >
            <div id="wrapper" className="activeCircuitScrapbook">
              <ActiveCircuitScrapbook
                resource={this.state.resource}
                hideScrapbook={this.hideScrapbook}
                model={this.state.model}
              />
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
              resource={this.state.resource}
              showScrapbook={this.showScrapbook}
              model={this.state.model}
            />
          </div>
        </div>
      </div>
    );
  }
}
