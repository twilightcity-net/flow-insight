import React, { Component } from "react";
import JournalEntry from "./components/JournalEntry";
import { DimensionController } from "../../../../controllers/DimensionController";
import { Grid, Icon, Message, Transition } from "semantic-ui-react";
import JournalItem from "./components/JournalItem";
import { JournalClient } from "../../../../clients/JournalClient";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalResource extends Component {
  static get userNameMe() {
    return "me";
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
    this.activeJournalItem = null;
    this.error = null;
    this.userName = JournalResource.userNameMe;
  }

  /**
   * this function is called when we load a new resource into this resource view. recycles the component
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if(nextProps.resource.uri === this.props.resource.uri) {
      return false;
    }
    let userName = this.getUserNameFromResource(nextProps);
    JournalClient.getRecentIntentions(userName, this, arg => {
      if (arg.error) {
        this.error = arg.error;
        this.forceUpdate();
      } else {
        this.error = null;
        this.userName = userName;
        this.journalItems = arg.data;
        this.forceUpdate(() => {
          this.scrollToBottomOrActive();
        });
      }
    });
    return false;
  }

  /**
   * load our recent intentions after we load this page resource. This is only called when we
   * initially create the window's console view or switch resource views
   */
  componentDidMount() {
    let userName = this.getUserNameFromResource(this.props);
    JournalClient.getRecentIntentions(userName, this, arg => {
      if (arg.error) {
        this.error = arg.error;
        this.forceUpdate();
      } else {
        this.userName = userName;
        this.journalItems = arg.data;
        this.forceUpdate(() => {
          this.scrollToBottomOrActive();
        });
      }
    });
  }

  getUserNameFromResource(props) {
    let userName = props.resource.uriArr[1];
    return userName;
  }

  /**
   * called when we finish creating a new intention from the journal entry
   * @param journalEntry
   * @param finishStatus
   */
  onFinishEntry = (journalEntry, finishStatus) => {
    // TODO  save our journal entry
  };

  /**
   * called when the active selected item changes
   * @param rowId
   * @param journalItem
   */
  onChangeActiveEntry = (rowId, journalItem) => {
    // TODO do some stuff to update to the active journal item
  };

  /**
   * callback listener for the AddTask event which creates  new journal entry
   * @param projectId - the id of the project the task will be added to
   * @param taskName - the name of the task to be entered into the journal
   */
  onAddTask = (projectId, taskName) => {
    // creates a new task for our drop down
  };

  /**
   * scrolls to the bottom of the array
   */
  scrollToBottomOrActive = () => {
    if (this.activeJournalItem) {
      let activeRowId = this.activeJournalItem.id;

      let rowObj = document.getElementById(activeRowId);

      if (
        rowObj &&
        (this.isFirstActive() || !this.isElementInViewport(rowObj))
      ) {
        rowObj.scrollIntoView({ behavior: "smooth" });
      }
    }

    if (this.isLastActive()) {
      this.elEnd.scrollIntoView({ behavior: "smooth" });
    }
  };

  /**
   * checks to see if the first item in our array is active
   * @returns {boolean}
   */
  isFirstActive() {
    let activeIndex = 0;

    if (this.activeJournalItem) {
      activeIndex = this.activeJournalItem.index;
    }

    return activeIndex === 0;
  }

  /**
   * checks to see if our last item in our array is active
   * @returns {boolean}
   */
  isLastActive() {
    let activeIndex = 0;

    if (this.activeJournalItem) {
      activeIndex = this.activeJournalItem.index;
    }

    return activeIndex === this.journalItems.length - 1;
  }

  /**
   * checks to see if our element is in the view port
   * @param el
   * @returns {boolean|boolean}
   */
  isElementInViewport = el => {
    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight ||
          document.documentElement.clientHeight) /*or $(window).height() */ &&
      rect.right <=
        (window.innerWidth ||
          document.documentElement.clientWidth) /*or $(window).width() */
    );
  };

  /**
   * event callback for when we set a row active
   * @param rowId
   * @param rowObj
   * @param journalItem
   */
  onSetActiveRow = (rowId, rowObj, journalItem) => {
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

  isMyJournal() {
    return this.userName === JournalResource.userNameMe;
  }

  /**
   * renders our dirty flame string
   * @param id
   * @returns {null}
   */
  getEffectiveDirtyFlame(id) {
    // TODO how dirty is our flame? We just don't know for sure.
    return null;
  }

  /**
   * renders the array of journal items
   * @returns {array}
   */
  getJournalItems() {
    return this.journalItems.map(item => {
      return (
        <JournalItem
          key={item.id}
          id={item.id}
          isActive={this.isActive(item.id)}
          dirtyFlame={this.getEffectiveDirtyFlame(item.id)}
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
          onSetActiveRow={this.onSetActiveRow}
          onUpdateFinishStatus={this.onUpdateFinishStatus}
        />
      );
    });
  }

  /**
   * wraps our journal items array
   * @returns {*}
   */
  getJournalItemsWrapper(isMyJournal) {
    return (
      <div id="wrapper" className="journalItems">
        <div
          id="component"
          className="journalItems"
          style={{
            height: DimensionController.getJournalItemsPanelHeight(isMyJournal)
          }}
        >
          <Grid inverted>{this.getJournalItems()}</Grid>
          <div
            className="fltLftClrBth"
            ref={el => {
              this.elEnd = el;
            }}
          />
        </div>
      </div>
    );
  }

  /**
   * renders our error for the screen
   * @returns {*}
   */
  getJournalError() {
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
  getJournalEntry(isMyJournal) {
    return (
      <Transition visible={isMyJournal} animation="fade" duration={420}>
        <div id="wrapper" className="journalEntry ">
          <JournalEntry onAddTask={this.onAddTask} />
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
        {error && this.getJournalError()}
        {!error && this.getJournalItemsWrapper(isMyJournal)}
        {!error && this.getJournalEntry(isMyJournal)}
      </div>
    );
  }
}
