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
import { MemberClient } from "../../../../../clients/MemberClient";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import {BaseClient} from "../../../../../clients/BaseClient";
import {RendererEventFactory} from "../../../../../events/RendererEventFactory";

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
    this.me = MemberClient.me;
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
    this.talkRoomMessageListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TALK_MESSAGE_ROOM,
      this,
      this.onTalkRoomMessage
    );
    this.state = {
      resource: props.resource,
      scrapbookVisible: false,
      model: null,
      messages: [],
      status: []
    };
  }

  /**
   * called after this circuit component is loaded. This will thgen fetch the circuit
   * details from our local database and update our model in our state for our
   * child components
   */
  componentDidMount() {
    let circuitName = this.props.resource.uriArr[2],
      model = null,
      messages = null;

    CircuitClient.getCircuitWithAllDetails(
      circuitName,
      this,
      arg => {
        model = arg.data;
        console.log("MODEL:MOUNT", model);
        TalkToClient.getAllTalkMessagesFromRoom(
          model.wtfTalkRoomName,
          model.wtfTalkRoomId,
          this,
          arg => {
            messages = arg.data;
            this.setState({
              model: model,
              messages: messages
            });
          }
        );
      }
    );
  }

  /**
   * checks our update argument to see if we should update and get circuit
   * model from database
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    console.log("update");
    if (
      !this.state.model ||
      this.state.scrapbookVisible !==
        nextState.scrapbookVisible
    ) {
      return true;
    } else if (
      this.props.resource.uri === nextProps.resource.uri
    ) {
      return false;
    }

    let circuitName = nextProps.resource.uriArr[2],
      model = null,
      messages = null;

    CircuitClient.getCircuitWithAllDetails(
      circuitName,
      this,
      arg => {
        model = arg.data;
        TalkToClient.getAllTalkMessagesFromRoom(
          model.wtfTalkRoomName,
          model.wtfTalkRoomId,
          this,
          arg => {
            messages = arg.data;
            this.setState({
              model: model,
              messages: messages
            });
          }
        );
      }
    );

    this.setState({
      model: null,
      messages: null
    });

    return false;
  }

  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
  }

  onTalkRoomMessage = (event, arg) => {
    switch (arg.messageType) {
      case BaseClient.MessageTypes.WTF_STATUS_UPDATE:
        let data = arg.data,
          circuit = data.learningCircuitDto,
          model = this.state.model;

        if(data && circuit && model && circuit.id === model.id) {
          console.log("match", data, circuit, model);
          model = Object.assign(model, circuit);
          console.log(model);
          this.setState({
            model: model
          });
        }
        break;
      default:
        break;
    }
  };

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
    this.setState(prevState => ({
      scrapbookVisible: !prevState.scrapbookVisible
    }));
  };

  /**
   * gets our classname for the splitter panel
   * @returns {string}
   */
  getClassName() {
    return this.state.scrapbookVisible
      ? "content show"
      : "content hide";
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
              model={this.state.model}
              messages={this.state.messages}
            />
          </div>
          <Transition
            visible={this.state.scrapbookVisible}
            animation={this.animationType}
            duration={this.animationDelay}
          >
            <div
              id="wrapper"
              className="activeCircuitScrapbook"
            >
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
        style={{
          height: DimensionController.getActiveCircuitContentHeight()
        }}
      >
        <div id="wrapper" className="circuitContentPanel">
          {this.getCircuitContentPanel()}
        </div>
        <div id="wrapper" className="circuitContentSidebar">
          <div
            id="component"
            className="circuitContentSidebar"
          >
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
