import React, { Component } from "react";
import { Button, Dropdown, Grid, Input, Segment } from "semantic-ui-react";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalEntry extends Component {
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
      currentIntentionValue: "",
      disableControls: false
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
    console.log("should");
    this.projects = [];
    this.tasks = [];
    nextProps.projects.forEach(project =>
      this.projects.push(this.transformLokiDataStruct(project))
    );
    nextProps.tasks.forEach(task =>
      this.tasks.push(this.transformLokiDataStruct(task))
    );
    return true;
  }

  /**
   * transforms our loki datastructure returned from our local database into
   * the option object that semantic ui is looking for. in fact these are
   * in deed the droids we are looking for
   * @param p
   * @returns {{text: *, value: *, key: *}}
   */
  transformLokiDataStruct = p => {
    return {
      key: p["$loki"],
      value: p["id"],
      text: p["name"]
    };
  };

  /**
   * called when a new task is added from dropdown
   * @param e
   * @param value
   */
  handleAdditionForTask = (e, { value }) => {};

  /**
   * called when a project is selected in dropdown
   * @param e
   * @param value
   */
  handleChangeForProject = (e, { value }) => {};

  /**
   * called when a project is selected in dropdown
   * @param e
   */
  handleKeyPressForProject = e => {
    if (e.key === "Enter") {
      console.log("ENTER!");
    }
  };

  /**
   * called when a project is selected in dropdown
   * @param e
   */
  handleKeyPressForTask = e => {};

  /**
   *  called when a task is selected in the dropdown
   * @param e
   * @param value
   */
  handleChangeForTask = (e, { value }) => {};

  /**
   * called when the create task button is clicked on, it then shouold dispatch
   * a new event that will update the rendered view
   */
  handleClickForCreate = () => {
    this.saveJournalEntry();
  };

  /**
   * works the same as the click for create handler.. see above ^
   * @param e
   */
  handleKeyPressForIntention = e => {
    if (e.charCode === 13) {
      this.saveJournalEntry();
    }
  };

  /**
   * saves the journal entry from the callback event
   */
  saveJournalEntry = () => {};

  /**
   * handles the event that is notified on change of an entry in one of tbe inputs
   * @param e
   * @param name
   * @param value
   */
  handleChangeForIntention = (e, { name, value }) => {};

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
        disabled={this.state.disableControls}
        className="projectId"
        id="journalEntryProjectId"
        placeholder="Choose Project"
        selection
        search
        options={this.projects}
        fluid
        upward
        value={this.state.currentProjectValue}
        onFocus={this.handleFocusForProject}
        onBlur={this.handleBlurForInput}
        onChange={this.handleChangeForProject}
        onKeyPress={this.handleKeyPressForProject}
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
        disabled={this.state.disableControls}
        id="journalEntryTaskId"
        className="chunkId"
        options={this.tasks}
        placeholder="Choose Task"
        search
        selection
        fluid
        upward
        allowAdditions
        value={this.state.currentTaskValue}
        onFocus={this.handleFocusForTask}
        onBlur={this.handleBlurForInput}
        onAddItem={this.handleAdditionForTask}
        onKeyPress={this.handleKeyPressForTask}
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
        disabled={this.state.disableControls}
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
        action={
          <Button
            className="createIntention"
            icon="share"
            labelPosition="right"
            content="Create"
            onClick={this.handleClickForCreate}
          />
        }
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
