import React, { Component } from "react";
import { Dropdown, Grid, Input, Segment } from "semantic-ui-react";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalEntry extends Component {
  /**
   * our basic struct that semantic ui drops downs use.
   * @param key
   * @param value
   * @param text
   * @returns {{text: *, value: *, key: JournalEntry.Opt.props}}
   * @constructor
   */
  static Opt(key, value, text) {
    return {
      key: key,
      value: value,
      text: text
    };
  }

  /**
   * general purpose strings, like a screwdriver, never know if you need a plus
   * or minus type. *sigh*
   * @returns {{LOKI: string, ID: string, NAME: string}}
   * @constructor
   */
  static get Strings() {
    return {
      LOKI: "$loki",
      ID: "id",
      NAME: "name"
    };
  }

  /**
   * builds our journal entry component which is only shown when viewing our
   * own journal for now.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[JournalEntry]";
    this.projects = [];
    this.tasks = [];
    this.state = {
      currentProjectValue: null,
      currentTaskValue: null,
      currentIntentionValue: ""
    };
  }

  /**
   * this is called right before our parent passes us new props that contain
   * our recent projects and tasks
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    console.log("update...");
    this.projects = [];
    this.tasks = [];

    if (this.hasProjectUpdated(nextState)) return true;

    nextProps.projects.forEach(project =>
      this.projects.push(this.transformLokiDataStruct(project))
    );
    nextProps.tasks.forEach(task => {
      if (nextState.currentProjectValue === task.projectId) {
        this.tasks.push(this.transformLokiDataStruct(task));
      }
    });
    return true;
  }

  /**
   * checks to see if we are updating the current selected project, and update
   * the state while we are at it.
   * @param state
   * @returns {boolean}
   */
  hasProjectUpdated(state) {
    if (state.currentProjectValue !== this.state.currentProjectValue) {
      this.setState({
        currentTaskValue: null
      });
      return true;
    }
    return false;
  }

  /**
   * transforms our loki datastructure returned from our local database into
   * the option object that semantic ui is looking for. in fact these are
   * in deed the droids we are looking for
   * @param p
   * @returns {{text: *, value: *, key: JournalEntry.Opt.props}}
   */
  transformLokiDataStruct = p => {
    return JournalEntry.Opt(
      p[JournalEntry.Strings.LOKI],
      p[JournalEntry.Strings.ID],
      p[JournalEntry.Strings.NAME]
    );
  };

  /**
   * adds a new task to our local database and find creates on grid
   * @param name
   */
  addTask(name) {
    console.log(name);

    // TODO make client request to add this...

    // TODO render the journal entry from local db insert

    // TODO rewind local db task if error from grid
  }

  /**
   * called when a new task is added from dropdown
   * @param e
   * @param value
   */
  handleAdditionForTask = (e, { value }) => {
    this.addTask(value);
  };

  /**
   * called when a project is selected in dropdown
   * @param e
   * @param value
   */
  handleChangeForProject = (e, { value }) => {
    this.setState({
      currentProjectValue: value
    });
  };

  /**
   *  called when a task is selected in the dropdown
   * @param e
   * @param value
   */
  handleChangeForTask = (e, { value }) => {
    this.setState({
      currentTaskValue: value
    });
  };

  /**
   * works the same as the click for create handler.. see above ^
   * @param e
   */
  handleKeyPressForIntention = e => {
    if (e.charCode === 13) {
      this.createIntention();
    }
  };

  /**
   * creates a new intention based on our current states values for our
   * dropdowns and our user text input
   */
  createIntention() {
    this.props.createIntention(
      this.state.currentProjectValue,
      this.state.currentTaskValue,
      this.state.currentIntentionValue
    );
    this.setState({
      currentIntentionValue: ""
    });
  }

  /**
   * handles the event that is notified on change of an entry in one of tbe inputs
   * @param e
   * @param value
   */
  handleChangeForIntention = (e, { value }) => {
    this.setState({
      currentIntentionValue: value
    });
  };

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocusForProject = e => {
    document.getElementById("selectProjectInput").classList.add("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocusForTask = e => {
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.add("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocusForIntention = e => {
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.add("focused");
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all form element inputs
   * @param e
   */
  handleBlurForInput = e => {
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /**
   * renders our project drop down from our local database
   * @returns {*}
   */
  getProjectDropdown() {
    return (
      <Dropdown
        className="projectId"
        id="journalEntryProjectId"
        placeholder="Choose Project"
        options={this.projects}
        selection
        search
        fluid
        upward
        value={this.state.currentProjectValue}
        onFocus={this.handleFocusForProject}
        onBlur={this.handleBlurForInput}
        onChange={this.handleChangeForProject}
      />
    );
  }

  /**
   * renders our drop down for tasks filters on project.id
   * @returns {*}
   */
  getTaskDropdown() {
    return (
      <Dropdown
        id="journalEntryTaskId"
        className="chunkId"
        placeholder="Choose Task"
        options={this.tasks}
        search
        selection
        fluid
        upward
        allowAdditions
        value={this.state.currentTaskValue}
        onFocus={this.handleFocusForTask}
        onBlur={this.handleBlurForInput}
        onAddItem={this.handleAdditionForTask}
        onChange={this.handleChangeForTask}
      />
    );
  }

  /**
   * gets our text input field for the entry
   * @returns {*}
   */
  getTextInput() {
    return (
      <Input
        id="intentionTextInput"
        className="intentionText"
        fluid
        inverted
        placeholder="What's your next Intention?"
        value={this.state.currentIntentionValue}
        onFocus={this.handleFocusForIntention}
        onBlur={this.handleBlurForInput}
        onKeyPress={this.handleKeyPressForIntention}
        onChange={this.handleChangeForIntention}
      />
    );
  }

  /**
   * renders the journal entry component of the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="journalEntry">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={3} id="selectProjectInput">
                  {this.getProjectDropdown()}
                </Grid.Column>
                <Grid.Column width={2} id="selectTaskInput">
                  {this.getTaskDropdown()}
                </Grid.Column>
                <Grid.Column width={11} id="createIntentionInput">
                  {this.getTextInput()}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
