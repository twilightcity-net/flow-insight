import React, { Component } from "react";
import JournalEntry from "./components/JournalEntry";
import { DimensionController } from "../../../../controllers/DimensionController";
import { Grid, Icon, Message, Transition } from "semantic-ui-react";
import JournalItem from "./components/JournalItem";
import { JournalClient } from "../../../../clients/JournalClient";
import { scrollTo, scrollIntoView } from "scroll-js";

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
    this.journalItems = [];
    this.projects = [];
    this.tasks = [];
    this.activeJournalItem = null;
    this.error = null;
    this.userName = JournalResource.Strings.ME;
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
    if (nextProps.resource.uri === this.props.resource.uri) {
      return false;
    }
    let userName = this.getUserNameFromResource(nextProps);
    this.refreshRecentIntentions(userName);
    return false;
  }

  /**
   * load our recent intentions after we load this page resource. This is only called when we
   * initially create the window's console view or switch resource views
   */
  componentDidMount() {
    this.loadCount = 0;
    let userName = this.getUserNameFromResource(this.props);
    JournalClient.getRecentIntentions(userName, this, arg => {
      if (!this.hasCallbackError(arg)) {
        this.userName = userName;
        this.journalItems = arg.data;
        this.handleCallback();
      }
    });
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
    let rootElement = document.getElementById("journal-items-grid"),
      parentElement = rootElement.parentElement,
      myElement = rootElement.lastChild,
      smoothStr = smooth ? "smooth" : "auto",
      theHeight = 0;

    if (id) {
      myElement = rootElement;
      let array = myElement.children;
      for (let i = 0; i < array.length; i++) {
        let obj = array[i];
        theHeight += obj.offsetHeight;
        if (obj.id === this.activeJournalItem.props.model.id) {
          theHeight -= parentElement.offsetHeight / 2 + obj.offsetHeight / 2;
          break;
        }
      }
      scrollTo(parentElement, { top: theHeight }).then(callback);
    } else if (parentElement && myElement) {
      scrollIntoView(myElement, parentElement, { behavior: smoothStr }).then(
        callback
      );
    }
  }

  /**
   * refreshes our current intentions list view with our most recent data from our
   * local database.
   * @param userName
   */
  refreshRecentIntentions(userName) {
    JournalClient.getRecentIntentions(userName, this, arg => {
      if (arg.error) {
        this.error = arg.error;
        this.forceUpdate();
      } else {
        this.error = null;
        this.userName = userName;
        this.journalItems = arg.data;
        this.forceUpdate(() => {
          if (this.activeJournalItem) {
            this.scrollToJournalItemById(this.activeJournalItem.id);
          } else {
            this.scrollToJournalItemById();
          }
        });
      }
    });
  }

  /**
   * saves the journal entry from the callback event
   * @param projectId
   * @param taskId
   * @param intention
   */
  handleCreateIntention = (projectId, taskId, intention) => {
    JournalClient.createIntention(projectId, taskId, intention, this, () => {
      this.refreshRecentIntentions(JournalResource.Strings.ME);
    });
  };

  /**
   * create a task reference using our journal client
   * @param taskName
   */
  handleCreateTaskReference = taskName => {
    JournalClient.createTaskReference(taskName, this, arg => {
      if (arg.error) {
        this.error = arg.error;
        this.forceUpdate();
      } else {
        this.error = null;
        this.tasks = arg.data;
        this.forceUpdate();
      }
    });
  };

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
    this.scrollToJournalItemById(journalItem.props.model.id, true);
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
   * determines if we should render this from the point of view as ourself
   * @returns {boolean}
   */
  isMyJournal() {
    return this.userName === JournalResource.Strings.ME;
  }

  /**
   * renders the array of journal items
   * @returns {array}
   */
  getJournalItemsContent() {
    return this.journalItems.map(item => {
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
  getJournalItemsWrapperContent(isMyJournal) {
    return (
      <div id="wrapper" className="journalItems">
        <div
          id="component"
          className="journalItems"
          style={{
            height: DimensionController.getJournalItemsPanelHeight(isMyJournal)
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
          These were not the cats you were looking for =|^.^|=
        </Message.Content>
      </Message>
    );
  }

  /**
   * renders our journal entry component in the journal resource view
   * @param isMyJournal
   * @returns {*}
   */
  getJournalEntryContent(isMyJournal) {
    return (
      <Transition visible={isMyJournal} animation="fade" duration={420}>
        <div id="wrapper" className="journalEntry ">
          <JournalEntry
            projects={this.projects}
            tasks={this.tasks}
            createIntention={this.handleCreateIntention}
            createTaskReference={this.handleCreateTaskReference}
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
    let error = !!this.error,
      isMyJournal = this.isMyJournal();

    return (
      <div id="component" className={"journalLayout" + (error ? " error" : "")}>
        {error && this.getJournalErrorContent()}
        {!error && this.getJournalItemsWrapperContent(isMyJournal)}
        {!error && this.getJournalEntryContent(isMyJournal)}
      </div>
    );
  }
}
