import React, { Component } from "react";
import JournalEntry from "./components/JournalEntry";
import { DimensionController } from "../../../../controllers/DimensionController";
import {
  Grid,
  Icon,
  Message,
  Transition
} from "semantic-ui-react";
import JournalItem from "./components/JournalItem";
import { JournalClient } from "../../../../clients/JournalClient";
import { scrollTo } from "../../../../UtilScroll";
import { MemberClient } from "../../../../clients/MemberClient";
import { RendererEventFactory } from "../../../../events/RendererEventFactory";
import UtilRenderer from "../../../../UtilRenderer";
import { BaseClient } from "../../../../clients/BaseClient";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalResource extends Component {
  /**
   * general purpose string to reprent ourselves.. again.
   * @returns {{ME: string}}
   * @constructor
   */
  static get Strings() {
    return {
      ME: "me"
    };
  }

  /**
   * builds the basic journal layout component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[JournalResource]";
    this.resource = props.resource;
    this.journalIntentions = [];
    this.projects = [];
    this.tasks = [];
    this.activeJournalItem = null;
    this.loadCount = 0;
    this.error = null;
    this.username = JournalResource.Strings.ME;
    this.talkRoomMessageListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TALK_MESSAGE_ROOM,
      this,
      this.onTalkRoomMessage
    );
  }

  /**
   * this function is called when ever a talk message is recieve over
   * one of the rooms that the torchie client is connected to. This
   * is regulated and brokered by gridtime server.
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    let mType = arg.messageType,
      data = arg.data,
      username = data.username,
      me = MemberClient.me;

    if (
      mType ===
        BaseClient.MessageTypes.INTENTION_STARTED_DETAILS &&
      this.username !== JournalResource.Strings.ME &&
      this.username !== me.username &&
      this.username === username
    ) {
      let journalEntry = data.journalEntry,
        hasIntention = UtilRenderer.hasMessageInArray(
          this.journalIntentions,
          journalEntry
        );

      if (!hasIntention) {
        this.journalIntentions.push(journalEntry);
        this.forceUpdate(() => {
          this.scrollToJournalItemById();
        });
      }
    }
  };

  /**
   * make sure we clear our talk room listener when destroying this component
   */
  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
  }

  /**
   * gets our user name from a given journal resource from our browser
   * @param props
   * @returns {string}
   */
  getUserNameFromResource(props) {
    return props.resource.uriArr[1];
  }

  /**
   * this function is called when we load a new resource into this resource view. recycles the component
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (
      nextProps.resource.uri === this.props.resource.uri
    ) {
      return false;
    }
    this.refreshJournal(nextProps);
    return false;
  }

  /**
   * load our recent journalIntentions after we load this page resource. This is only called when we
   * initially create the window's console view or switch resource views
   */
  componentDidMount() {
    this.refreshJournal(this.props);
  }

  /**
   * refreshes our journal in the gui by getting journal items from our local database.
   * if an empty array is return we make a load call on gridtime through our client
   * interface and controllers. This will scroll to the bottom of the grid when we
   * have everything loaded.
   * @param props
   */
  refreshJournal(props) {
    this.error = null;
    this.loadCount = 0;
    let username = this.getUserNameFromResource(props);
    JournalClient.getRecentIntentions(
      username,
      this,
      arg => {
        if (
          !this.hasCallbackError(arg) &&
          arg.data &&
          arg.data.length > 0
        ) {
          this.username = username;
          this.journalIntentions = arg.data;
          this.handleCallback();
        }
      }
    );
    JournalClient.getRecentProjects(this, arg => {
      if (!this.hasCallbackError(arg)) {
        this.projects = arg.data;
        this.handleCallback();
      }
    });
    JournalClient.getRecentTasks(this, arg => {
      if (!this.hasCallbackError(arg)) {
        this.tasks = arg.data;
        this.handleCallback();
      }
    });
  }

  /**
   * does stuff when our client callback errors out
   * @param arg
   * @returns {boolean}
   */
  hasCallbackError(arg) {
    if (arg.error) {
      this.error = arg.error;
      this.forceUpdate();
      return true;
    }
    return false;
  }

  /**
   * handles our callback for loading data from our local database
   */
  handleCallback() {
    this.loadCount++;
    if (this.loadCount === 3) {
      this.forceUpdate(() => {
        this.scrollToJournalItemById();
      });
    }
  }

  /**
   * scrolls our journal items grid into the view of a selected item by
   * id, or if null it will just scroll to the bottom. This can perform
   * smooth or auto (jump directly to) performance. In order to center
   * selected journal items in our grid we must manually loop through the
   * array of children and calculate the rendered pixel from the offsetHeight.
   * After this then fire the callback.
   * @param id
   * @param smooth
   * @param callback
   */
  scrollToJournalItemById(id, smooth, callback) {
    let rootElement = document.getElementById(
        "journal-items-grid"
      ),
      parentElement = rootElement.parentElement,
      smoothStr = smooth ? "smooth" : "auto",
      theHeight = 0;

    if (id) {
      let array = rootElement.children;
      for (let i = 0; i < array.length; i++) {
        let obj = array[i];
        theHeight += obj.offsetHeight;
        if (
          obj.id === this.activeJournalItem.props.model.id
        ) {
          theHeight -=
            parentElement.offsetHeight / 2 +
            obj.offsetHeight / 2;
          break;
        }
      }
      scrollTo(parentElement, {
        behavior: smoothStr,
        top: theHeight
      }).then(callback);
    } else if (parentElement && rootElement) {
      theHeight = rootElement.scrollHeight;
      scrollTo(parentElement, {
        behavior: smoothStr,
        top: theHeight
      }).then(callback);
    }
  }

  onEntryShown = () => {
    if (this.isMyJournal()) {
      this.scrollToJournalItemById(null, true);
    }
  };

  /**
   * saves the journal entry from the callback event
   * @param projectId
   * @param taskId
   * @param intention
   */
  handleCreateIntention = (
    projectId,
    taskId,
    intention
  ) => {
    this.error = null;
    JournalClient.createIntention(
      projectId,
      taskId,
      intention,
      this,
      arg => {
        if (!this.hasCallbackError(arg) && arg.data) {
          this.journalIntentions.push(arg.data);
          this.forceUpdate(() => {
            this.scrollToJournalItemById();
          });
        }
      }
    );
  };

  /**
   * create a task reference using our journal client
   * @param projectId
   * @param name
   * @param callback
   */
  handleCreateTask = (projectId, name, callback) => {
    JournalClient.findOrCreateTask(
      projectId,
      name,
      "",
      this,
      arg => {
        this.createProjectOrTaskHelper(
          this.tasks,
          arg,
          callback
        );
      }
    );
  };

  /**
   * creates new project on the journal client and controller
   * @param name
   * @param callback
   */
  handleCreateProject = (name, callback) => {
    JournalClient.findOrCreateProject(
      name,
      "",
      false,
      this,
      arg => {
        this.createProjectOrTaskHelper(
          this.projects,
          arg,
          callback
        );
      }
    );
  };

  /**
   * helps create a project or task from the client request
   * @param objects
   * @param arg
   * @param callback
   */
  createProjectOrTaskHelper(objects, arg, callback) {
    if (arg.error) {
      this.error = arg.error;
      this.forceUpdate();
    } else {
      let obj = arg.data;
      objects.push(obj);
      this.error = null;
      if (callback) {
        callback(obj);
      }
    }
  }

  /**
   * event callback for when we set a row active
   * @param journalItem
   */
  onRowClick = journalItem => {
    if (this.activeJournalItem) {
      this.activeJournalItem.isActive = false;
      this.activeJournalItem.forceUpdate();
    }
    this.activeJournalItem = journalItem;
    this.scrollToJournalItemById(
      journalItem.props.model.id,
      true
    );
  };

  /**
   * event callback for for finishing a row
   * @param rowId
   * @param rowObj
   * @param journalItem
   */
  onUpdateFinishStatus = (rowId, rowObj, journalItem) => {
    // TODO set the active row
  };

  /**
   * determines if our journal item is active
   * @param id
   * @returns {boolean}
   */
  isActive(id) {
    if (this.activeJournalItem) {
      return this.activeJournalItem.id === id;
    } else {
      return false;
    }
  }

  /**
   * determines if we should render this from the point of view as ourselves
   * @returns {boolean}
   */
  isMyJournal() {
    return (
      this.username === JournalResource.Strings.ME ||
      this.username === MemberClient.me.username
    );
  }

  /**
   * renders the array of journal items
   * @returns {array}
   */
  getJournalItemsContent() {
    return this.journalIntentions.map(item => {
      return (
        <JournalItem
          key={item.id}
          model={item}
          isActive={this.isActive(item.id)}
          linked={item.linked}
          projectName={item.projectName}
          taskName={item.taskName}
          taskSummary={item.taskSummary}
          description={item.description}
          flameRating={item.flameRating}
          finishStatus={item.finishStatus}
          journalEntryType={item.journalEntryType}
          circleId={item.circleId}
          position={item.position}
          journalItem={item}
          onRowClick={this.onRowClick}
          onUpdateFinishStatus={this.onUpdateFinishStatus}
        />
      );
    });
  }

  /**
   * wraps our journal items array
   * @returns {*}
   */
  getJournalItemsWrapperContent() {
    return (
      <div id="wrapper" className="journalIntentions">
        <div
          id="component"
          className="journalIntentions"
          style={{
            height: DimensionController.getJournalItemsPanelHeight(
              this.isMyJournal()
            )
          }}
        >
          <Grid id="journal-items-grid" inverted>
            {this.getJournalItemsContent()}
          </Grid>
        </div>
      </div>
    );
  }

  /**
   * renders our error for the screen
   * @returns {*}
   */
  getJournalErrorContent() {
    return (
      <Message icon negative size="large">
        <Icon name="warning sign" />
        <Message.Content>
          <Message.Header>{this.error} :(</Message.Header>
          These were not the cats you were looking for
          =|^.^|=
        </Message.Content>
      </Message>
    );
  }

  /**
   * renders our journal entry component in the journal resource view
   * @returns {*}
   */
  getJournalEntryContent() {
    return (
      <Transition
        visible={this.isMyJournal()}
        animation="fade"
        duration={420}
        onComplete={this.onEntryShown}
      >
        <div id="wrapper" className="journalEntry ">
          <JournalEntry
            projects={this.projects}
            tasks={this.tasks}
            createIntention={this.handleCreateIntention}
            createTask={this.handleCreateTask}
            createProject={this.handleCreateProject}
          />
        </div>
      </Transition>
    );
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - returns the JSX for this component
   */
  render() {
    let error = !!this.error;

    return (
      <div
        id="component"
        className={
          "journalLayout" + (error ? " error" : "")
        }
      >
        {error && this.getJournalErrorContent()}
        {!error && this.getJournalItemsWrapperContent()}
        {!error && this.getJournalEntryContent()}
      </div>
    );
  }
}
