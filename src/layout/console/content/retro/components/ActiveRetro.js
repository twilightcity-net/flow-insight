import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import RetroSidebar from "./RetroSidebar";
import ActiveRetroFeed from "./ActiveRetroFeed";
import { Transition } from "semantic-ui-react";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import { CircuitClient } from "../../../../../clients/CircuitClient";
import { ChartClient } from "../../../../../clients/ChartClient";
import { MemberClient } from "../../../../../clients/MemberClient";
import { DictionaryClient } from "../../../../../clients/DictionaryClient";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import { BaseClient } from "../../../../../clients/BaseClient";
import { RendererEventFactory } from "../../../../../events/RendererEventFactory";
import UtilRenderer from "../../../../../UtilRenderer";
import PastTroubleshootFeed from "./PastTroubleshootFeed";
import FilesDetail from "./FilesDetail";
import ExecDetail from "./ExecDetail";
import FeedCreator from "../../support/FeedCreator";
import FeatureToggle from "../../../../shared/FeatureToggle";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ActiveRetro extends Component {
  /**
   * the string name of our learning circuit dto used for property name.
   * @type {string}
   */
  static learningCircuitDtoStr = "learningCircuitDto";

  /**
   * the string that represents  the roomMember prop of some talk message data.
   * @type {string}
   */
  static roomMemberPropStr = "roomMember";

  /**
   * the status event property name that talk uses for talk room status
   * @type {string}
   */
  static statusEventPropStr = "statusEvent";

  /**
   *  builds the active circuit component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveRetro]";
    this.animationType = "fade";
    this.animationDelay = 210;
    this.me = MemberClient.me;
    this.loadCount = 0;
    this.retroMessages = [];
    this.troubleshootMessages = [];
    this.circuitMembers = [];
    this.dictionaryWords = [];

    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.RESOURCES,
        this
      );
    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.circuitsRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.CIRCUIT_DATA_REFRESH,
        this,
        this.onCircuitDataRefresh
      );

    this.dictionaryRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.DICTIONARY_DATA_REFRESH,
        this,
        this.onDictionaryDataRefresh
      );

    this.circuitSidebarComponent = null;
    this.circuitFeedComponent = null;

    this.state = {
      slidePanelVisible: true,
      retroMessages: [],
      troubleshootMessages: [],
      troubleshootFeedEvents: [],
      retroFeedEvents: [],
      status: [],
      circuitMembers: [],
      missingMembers: [],
      dictionaryWords: [],
      isFilesVisible: false,
      isExecVisible: false,
    };
  }

  /**
   * called after this circuit component is loaded. This will then fetch the circuit
   * details from our local database and update our model in our state for our
   * child components
   */
  componentDidMount() {
    this.loadCircuitDetails(this.props.circuit);
    this.loadDictionary();
  }

  /**
   * Force refresh the circuit data manually on triggering event.  This is called after the connection
   * goes stale, and reconnects again.  Since we lost messages, easiest way to resync is to refresh again
   */
  onCircuitDataRefresh() {
    this.loadCircuitDetails(this.props.circuit);
  }

  /**
   * Force refresh the dictionary data manually on triggering event.  This is called after the connection
   * goes stale, and reconnects again.  Since we lost messages, easiest way to resync is to refresh again
   */
  onDictionaryDataRefresh() {
    this.loadDictionary();
  }

  /**
   * Updates the state of the circuit, based on a state change, or the resource uri
   * changing entirely
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.circuit.circuitName !==
      this.props.circuit.circuitName
    ) {
      this.loadCircuitDetails(this.props.circuit);
    }

    if (this.props.circuit.circuitState === "RETRO") {
      let that = this;
      setTimeout(function () {
        that.focusOnChatInput();
      }, 500);
    }
  }

  focusOnChatInput() {
    let element = document.getElementById(
      "activeRetroChatInput"
    );
    if (element) {
      element.focus();
    }
  }

  /**
   * updates and loads dictionary for use by all circuit tags
   */
  loadDictionary() {
    DictionaryClient.getTeamDictionary(this, (arg) => {
      if (arg.error) {
        console.error(
          "Dictionary failed to load, " + arg.error
        );
      } else {
        this.dictionaryWords = arg.data;
        this.updateDictionaryState(this.dictionaryWords);
      }
    });
  }

  /**
   * updates and loads our circuit form gridtime
   * @param circuit
   * @param model
   * @param messages
   */
  loadCircuitDetails(circuit) {
    this.loadCount = 0;
    this.retroMessages = [];
    this.troubleshootMessages = [];

    TalkToClient.getAllTalkMessagesFromRoom(
      circuit.wtfTalkRoomName,
      circuit.wtfTalkRoomId,
      this,
      (arg) => {
        if (arg.error) {
          this.props.handleError(
            "Failed to load troubleshoot messages",
            arg.error
          );
        } else {
          this.troubleshootMessages = arg.data;
          this.updateStateIfDoneLoading();
        }
      }
    );

    if (circuit.retroTalkRoomId) {
      TalkToClient.getAllTalkMessagesFromRoom(
        circuit.retroTalkRoomName,
        circuit.retroTalkRoomId,
        this,
        (arg) => {
          if (arg.error) {
            this.props.handleError(
              "Failed to load retro messages",
              arg.error
            );
          } else {
            this.retroMessages = arg.data;
            this.updateStateIfDoneLoading();
          }
        }
      );
    } else {
      this.updateStateIfDoneLoading();
    }

    CircuitClient.loadCircuitMembers(
      circuit.circuitName,
      circuit.wtfTalkRoomId,
      this,
      (arg) => {
        if (arg.error) {
          console.log(
            "Failed to load circuit members, " + arg.error
          );
        } else {
          this.circuitMembers = arg.data;
          this.updateStateIfDoneLoading(arg.error);
        }
      }
    );

    CircuitClient.getCircuitTaskSummary(
      circuit.circuitName,
      this,
      (arg) => {
        if (!arg.error) {
          this.setState({
            taskSummary: arg.data,
          });
        } else {
          console.error(
            "Failed to load circuit task summary, " +
              arg.error
          );
        }
      }
    );

    this.loadMetricsData(circuit);
  }

  /**
   * Loads the metrics data for this service (gets file, exec summaries)
   * @param circuit
   */
  loadMetricsData(circuit) {
    ChartClient.chartFrictionForWTF(
      circuit,
      this,
      (arg) => {
        if (arg.error) {
          console.error(
            "Failed to load friction chart, " + arg.error
          );
        } else {
          this.chartDto = arg.data;
          this.setState({
            chartDto: arg.data,
          });
        }
      }
    );
  }

  /**
   * Make sure the state updates happen at the same time, so we dont load the chat
   * with incorrect profile pics, then fix it.  This loads the state at end, after loadcount == 2
   */
  updateStateIfDoneLoading() {
    this.loadCount++;
    if (this.loadCount === 3) {
      let feedCreator = new FeedCreator(
        this.props.circuit,
        this.circuitMembers,
        MemberClient.me
      );

      feedCreator.createTroubleshootFeed(
        this.troubleshootMessages,
        (arg) => {
          this.setState({
            troubleshootMessages: this.troubleshootMessages,
            troubleshootFeedEvents: arg.feedEvents,
            circuitMembers: this.circuitMembers,
            missingMembers: arg.members,
            slidePanelVisible: true,
          });
        }
      );

      feedCreator.createRetroFeed(
        this.retroMessages,
        (arg) => {
          this.setState({
            retroMessages: this.retroMessages,
            retroFeedEvents: arg.feedEvents,
            missingMembers: arg.members,
          });
        }
      );
    }
  }

  getCircuitMemberForUsername(circuitMembers, username) {
    for (let i = 0; i < circuitMembers.length; i++) {
      if (circuitMembers[i].username === username) {
        return circuitMembers[i];
      }
    }

    return null;
  }

  /**
   * this is called when we unmount the component so that we can clear any active listeners
   * for memory management.
   */
  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
    this.circuitsRefreshListener.clear();
    this.dictionaryRefreshListener.clear();
    UtilRenderer.clearIntervalTimer(this.wtfTimer);
  }

  /**
   * event handler for talk messages. This is called everytime we receive a new talk
   * message over the event bus. Make sure to check that this is the circuit
   * we wish to effect, as you can get various wtf status events for other
   * types of circuits going on in the network.
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    let hasMessage = UtilRenderer.hasMessageByIdInArray(
      this.state.retroMessages,
      arg
    );

    switch (arg.messageType) {
      case BaseClient.MessageTypes.CIRCUIT_MEMBER_STATUS_EVENT:
        if (arg.uri === this.props.circuit.retroTalkRoomId) {
          this.handleCircuitMemberStatusEventMessage(arg);
        }
        break;
      case BaseClient.MessageTypes.WTF_STATUS_UPDATE:
        this.handleWtfStatusUpdateMessage(arg);
        break;
      case BaseClient.MessageTypes.TEAM_MEMBER:
        this.handleTeamMemberStatusUpdate(arg);
        break;
      case BaseClient.MessageTypes.DICTIONARY_UPDATE:
        this.handleDictionaryUpdateMessage(arg);
        break;

      case BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS:
        if (arg.uri === this.props.circuit.retroTalkRoomId && !hasMessage) {
          this.appendChatMessage(arg);
        } else {
          console.log("Duplicate talk message observed: " + JSON.stringify(arg));
        }
        break;
      default:
        break;
    }
  };

  /**
   * If theres a team member update for one of the members in our circuit,
   * then update the status fields in our circuit member status.
   * @param arg
   */
  handleTeamMemberStatusUpdate(arg) {
    let teamMember = arg.data;

    let circuitMembers = this.state.circuitMembers;

    for (let i = 0; i < circuitMembers.length; i++) {
      let circuitMember = circuitMembers[i];
      if (circuitMember.memberId === teamMember.id) {
        circuitMember.displayName = teamMember.displayName;
        circuitMember.fullName = teamMember.fullName;
        circuitMember.username = teamMember.username;
        circuitMember.fervieColor = teamMember.fervieColor;
        circuitMember.fervieSecondaryColor =
          teamMember.fervieSecondaryColor;
        circuitMember.fervieAccessory =
          teamMember.fervieAccessory;
        circuitMember.onlineStatus =
          teamMember.onlineStatus;
        break;
      }
    }
    this.updateStateCircuitMembers(circuitMembers);
  }

  /**
   * adds a chat message to the end of all of our chat
   * message feed events, and update the gui. This assumes we have
   * already loaded the circuit resource view.
   * @param message
   */
  appendChatMessage(message) {
    let metaProps = message.metaProps,
      username =
        UtilRenderer.getUsernameFromMetaProps(metaProps),
      time = UtilRenderer.getChatMessageTimeString(
        message.messageTime
      ),
      json = message.data;

    let that = this;

    this.setState((prevState) => {
      prevState.retroMessages.push(message);

      return {
        retroMessages: prevState.retroMessages,
        retroFeedEvents: that.addFeedEvent(
          prevState.retroFeedEvents,
          username,
          time,
          json.message,
          false
        ),
      };
    });
  }

  /**
   * processes our circuit member status event which is used to notify the
   * current active circuit that another member has joined this active
   * circuit that we are part of. This includes ourself. This function
   * should update the circuit members state model that is linked to the
   * child components of this resource view.
   * @param arg
   */
  handleCircuitMemberStatusEventMessage(arg) {
    let data = arg.data,
      roomMember = data[ActiveRetro.roomMemberPropStr];

    switch (data.statusEvent) {
      case BaseClient.CircuitMemberStatus
        .CIRCUIT_MEMBER_JOIN:
        this.addCircuitMemberToCircuit(roomMember);
        return;
      case BaseClient.CircuitMemberStatus
        .CIRCUIT_MEMBER_LEAVE:
        this.removeCircuitMemberFromCircuit(roomMember);
        return;
      default:
        return;
    }
  }

  /**
   * adds a circuit member object to our array of circuit members. the
   * function then will update the states of the child components
   * @param roomMember
   */
  addCircuitMemberToCircuit(roomMember) {
    let circuitMembers = this.state.circuitMembers,
      circuitMember = null,
      len = circuitMembers.length,
      members = [roomMember];

    for (let i = 0; i < len; i++) {
      circuitMember = circuitMembers[i];
      if (circuitMember.memberId !== roomMember.memberId) {
        members.push(circuitMember);
      }
    }
    this.updateStateCircuitMembers(members);
  }

  /**
   * removes a given circuit member from the array by search by member id.
   * This then will update the child component states.
   * @param roomMember
   */
  removeCircuitMemberFromCircuit(roomMember) {
    let circuitMembers = this.state.circuitMembers,
      circuitMember = null,
      len = circuitMembers.length,
      members = [];

    for (let i = 0; i < len; i++) {
      circuitMember = circuitMembers[i];
      if (circuitMember.memberId !== roomMember.memberId) {
        members.push(circuitMember);
      }
    }
    this.updateStateCircuitMembers(members);
  }

  /**
   * processes our wtf status events. inside this function we check to see
   * if this is the circuit we are looking for. some jedi shit. then we use
   * the classic Object.assign to mutate into a new prototype. Lastly we
   * call an update on the linked state models which represent our active
   * circuit that we are participating in. This event is is broadcast over
   * the team circuit.
   * @param arg
   */
  handleWtfStatusUpdateMessage(arg) {
    //on a status update, the fervie message may need to get added here too.

    let data = arg.data,
      circuit = data[ActiveRetro.learningCircuitDtoStr],
      model = this.props.circuit;

    if (
      data &&
      circuit &&
      model &&
      circuit.id === model.id
    ) {
      this.updateStateModelsOnTalkMessageUpdate(circuit);
    }
  }

  /**
   * processes updates to our dictionary from new terms being added.
   * @param arg
   */
  handleDictionaryUpdateMessage(arg) {
    let wordUpdate = arg.data;

    if (wordUpdate) {
      this.setState((prevState) => {
        let isUpdated = false;

        for (
          let i = 0;
          i < prevState.dictionaryWords.length;
          i++
        ) {
          let word = prevState.dictionaryWords[i];
          if (word.id === wordUpdate.id) {
            prevState.dictionaryWords[i] = wordUpdate;
            isUpdated = true;
            break;
          }
        }
        if (!isUpdated) {
          prevState.dictionaryWords.push(wordUpdate);
        }
        return {
          dictionaryWords: prevState.dictionaryWords,
        };
      });
    }
  }

  /**
   * updates our models in our various child components states. This
   * utilizes callback functions which are way faster then using refs
   * @param model
   */
  updateStateModelsOnTalkMessageUpdate(circuit) {
    if (
      UtilRenderer.isCircuitInRetro(circuit) &&
      !UtilRenderer.isMarkedForCloseByMe(
        circuit,
        MemberClient.me
      )
    ) {
      let feedCreator = new FeedCreator(
        circuit,
        this.state.missingMembers,
        MemberClient.me
      );

      setTimeout(() => {
        feedCreator.createRetroFeed(
          this.retroMessages,
          (arg) => {
            this.setState({
              retroFeedEvents: arg.feedEvents,
              missingMembers: arg.members,
            });
          }
        );

        this.focusOnChatInput();
      }, 400);
    }
  }

  /**
   * updates our dictionary of words from the latest in the DB
   * @param words
   */
  updateDictionaryState(words) {
    this.setState({
      dictionaryWords: words,
    });
  }

  /**
   * Add a new feed event to the array which is used to display the chat messages
   * @param username
   * @param time
   * @param text
   * @param isStatusEvent
   */
  addFeedEvent(
    feedEvents,
    username,
    time,
    text,
    isStatusEvent
  ) {
    let feedEvent = null;
    if (
      feedEvents.length > 0 &&
      feedEvents[feedEvents.length - 1] &&
      feedEvents[feedEvents.length - 1].name === username &&
      !isStatusEvent
    ) {
      feedEvent = feedEvents.pop();
      feedEvent.text.push(text);
    } else {
      feedEvent = {
        name: username,
        time: time,
        text: [text],
        isStatusEvent: isStatusEvent,
      };
    }

    feedEvents.push(feedEvent);

    return feedEvents;
  }

  /**
   * updates our circuit members array in our component states
   * @param circuitMembers
   */
  updateStateCircuitMembers(circuitMembers) {
    this.setState({
      circuitMembers: circuitMembers,
    });
  }

  /**
   * hides our resizable scrapbook in the feed panel
   */
  hideSlidePanel = () => {
    this.setState({
      slidePanelVisible: false,
    });
  };

  /**
   * shows our files in our feed panel
   */
  toggleFilesPanel = () => {
    this.setState((prevState) => ({
      slidePanelVisible: true,
      isFilesVisible: true,
      isExecVisible: false,
    }));
  };

  /**
   * shows our exec in our feed panel
   */
  toggleExecPanel = () => {
    this.setState((prevState) => ({
      slidePanelVisible: true,
      isExecVisible: true,
      isFilesVisible: false,
    }));
  };

  /**
   * shows our troubleshooting session in our feed panel
   */
  toggleTroubleshootPanel = () => {
    this.setState((prevState) => ({
      slidePanelVisible: true,
      isFilesVisible: false,
      isExecVisible: false,
    }));
  };

  /**
   * gets our classname for the splitter panel
   * @returns {string}
   */
  getClassName() {
    return this.state.slidePanelVisible
      ? "content show"
      : "content hide";
  }

  /**
   * stores our circuit sidebar component into memory to access.
   * @param component
   */
  setCircuitSidebarComponent = (component) => {
    this.circuitSidebarComponent = component;
  };

  /**
   * stores our circuit feed component with all of our messages in memory to
   * access and update.
   * @param component
   */
  setCircuitFeedComponent = (component) => {
    this.circuitFeedComponent = component;
  };

  reportFeedError = (errorMsg) => {
    this.addErrorMessageToFeed(errorMsg);
  };

  /**
   * Adds an error message to the chat feed
   * @param errorMsg
   */
  addErrorMessageToFeed(errorMsg) {
    let time = "";

    this.setState((prevState) => {
      let feedEvents = this.addFeedEvent(
        prevState.retroFeedEvents,
        "Fervie",
        time,
        errorMsg,
        true
      );

      return {
        retroFeedEvents: feedEvents,
      };
    });
  }

  /**
   * renders our circuit content panel and resizable scrapbook
   * @returns {*}
   */
  getInRetroCircuitContentPanel() {
    let sidePanelContent = "";

    if (this.state.isFilesVisible && FeatureToggle.isMetricsEnabled) {
      sidePanelContent = (
        <FilesDetail
          chartDto={this.state.chartDto}
          hideSlidePanel={this.hideSlidePanel}
        />
      );
    } else if (this.state.isExecVisible && FeatureToggle.isMetricsEnabled) {
      sidePanelContent = (
        <ExecDetail
          chartDto={this.state.chartDto}
          hideSlidePanel={this.hideSlidePanel}
        />
      );
    } else {
      sidePanelContent = (
        <PastTroubleshootFeed
          model={this.props.circuit}
          circuitState={this.props.circuit.circuitState}
          circuitMembers={this.state.circuitMembers}
          missingMembers={this.state.missingMembers}
          feedEvents={this.state.troubleshootFeedEvents}
          hideSlidePanel={this.hideSlidePanel}
        />
      );
    }

    return (
      <div id="component" className="circuitContentPanel">
        <SplitterLayout
          customClassName={this.getClassName()}
          primaryMinSize={DimensionController.getActiveCircuitContentFeedMinWidth()}
          secondaryMinSize={DimensionController.getActiveCircuitContentScrapbookMinWidth()}
          secondaryInitialSize={DimensionController.getActiveCircuitContentRetroSlideMinWidthDefault()}
        >
          <ActiveRetroFeed
            model={this.props.circuit}
            circuitState={this.props.circuit.circuitState}
            circuitMembers={this.state.circuitMembers}
            missingMembers={this.state.missingMembers}
            feedEvents={this.state.retroFeedEvents}
            set={this.setCircuitFeedComponent}
            reportFeedError={this.reportFeedError}
          />
          <Transition
            visible={this.state.slidePanelVisible}
            animation={this.animationType}
            duration={this.animationDelay}
          >
            {sidePanelContent}
          </Transition>
        </SplitterLayout>
      </div>
    );
  }

  /**
   * gets our rendering content for the circuits sidebar that contains mod
   * actions and stuff like that.
   * @returns {*}
   */
  getCircuitSidebarContent() {
    return (
      <div id="component" className="circuitContentSidebar">
        <RetroSidebar
          model={this.props.circuit}
          chartDto={this.state.chartDto}
          taskSummary={this.state.taskSummary}
          dictionaryWords={this.state.dictionaryWords}
          circuitMembers={this.state.circuitMembers}
          toggleFilesPanel={this.toggleFilesPanel}
          toggleExecPanel={this.toggleExecPanel}
          toggleTroubleshootPanel={
            this.toggleTroubleshootPanel
          }
          set={this.setCircuitSidebarComponent}
        />
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
          height:
            DimensionController.getActiveCircuitContentHeight(),
        }}
      >
        <div id="wrapper" className="circuitContentPanel">
          {this.getInRetroCircuitContentPanel()}
        </div>
        <div id="wrapper" className="circuitContentSidebar">
          {this.getCircuitSidebarContent()}
        </div>
      </div>
    );
  }
}
