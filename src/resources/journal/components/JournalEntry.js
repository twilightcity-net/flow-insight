import React, { Component } from "react";
import { Button, Dropdown, Grid, Input, Segment } from "semantic-ui-react";
import { DataModelFactory } from "../../../models/DataModelFactory";
import { JournalModel } from "../../../models/JournalModel";
import { RendererControllerFactory } from "../../../controllers/RendererControllerFactory";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalEntry extends Component {
  constructor(props) {
    super(props);

    this.name = "[JournalEntry]";
    this.state = {
      projects: [],
      tasks: [],
      currentProjectValue: null,
      currentTaskValue: null,
      currentIntentionValue: "",
      disableControls: false
    };

    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );

    this.consoleController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_VIEW,
      this
    );
  }

  /**
   * resets the focus of this component
   */
  resetFocus() {
    document.getElementById("intentionTextInput").focus();
  }

  /**
   * called when removing the component from the view
   */
  componentDidMount = () => {
    this.journalModel.registerListener(
      "journalEntry",
      JournalModel.CallbackEvent.RECENT_TASKS_UPDATE,
      this.onJournalRecentTasksUpdateCb
    );
    this.resetFocus();
    this.onJournalRecentTasksUpdateCb();
  };

  /**
   * called when the component mounts
   */
  componentWillUnmount = () => {
    this.journalModel.unregisterAllListeners("journalEntry");
    this.consoleController.configureJournalEntryListener(this, null);
  };

  /**
   * handles the event when notified of a change to one or more recent tasks
   */
  onJournalRecentTasksUpdateCb = () => {
    let projectList = this.getProjectList(
      this.journalModel.getActiveScope().recentProjects
    );

    let currentProject = this.getCurrentProject(
      this.journalModel.getActiveScope().recentProjects,
      this.journalModel.getActiveScope().recentEntry
    );
    let currentTasks = this.getCurrentTasks(
      currentProject,
      this.journalModel.getActiveScope().recentTasksByProjectId,
      this.journalModel.getActiveScope().recentEntry
    );
    let disableControls = false;
    if (!this.teamModel.isMeActive()) {
      disableControls = true;
    }
    this.setState({
      projects: projectList,
      currentProjectValue: currentProject,
      tasks: currentTasks.tasks,
      currentTaskValue: currentTasks.currentTaskValue,
      disableControls: disableControls
    });
  };

  /**
   * gets the project list for the drop down in the gui
   * @param recentProjects
   * @returns {*}
   */
  getProjectList = recentProjects => {
    var projects = [];
    for (var i in recentProjects) {
      projects[i] = {
        text: recentProjects[i].name,
        value: recentProjects[i].id
      };
    }
    return projects;
  };

  /**
   * gets the current project in the journal
   * @param recentProjects
   * @param recentEntry
   * @returns {null}
   */
  getCurrentProject = (recentProjects, recentEntry) => {
    let currentProject = null;

    if (recentEntry) {
      currentProject = recentEntry.projectId;
    }
    return currentProject;
  };

  /**
   * gets the current task in the journal
   * @param currentProject
   * @param recentTasksByProjectId
   * @param recentEntry
   * @returns {{currentTaskValue: null, tasks: {*}}}
   */
  getCurrentTasks = (currentProject, recentTasksByProjectId, recentEntry) => {
    if (!currentProject || !recentTasksByProjectId) {
      return { tasks: [], currentTaskValue: null };
    }
    let currentTasks = recentTasksByProjectId[currentProject];
    var tasksForProject = [];
    for (var i in currentTasks) {
      tasksForProject[i] = {
        text: currentTasks[i].name,
        value: currentTasks[i].id
      };
    }
    let currentTask = null;
    if (tasksForProject.length > 0) {
      if (recentEntry && recentEntry.projectId === currentProject) {
        currentTask = recentEntry.taskId;
      }
    }
    return {
      tasks: tasksForProject,
      currentTaskValue: currentTask
    };
  };

  /**
   * called when a new task is added from dropdown
   * @param e
   * @param value
   */
  handleAdditionForTask = (e, { value }) => {
    console.log(this.name + " - handleAdditionForTask:" + value);

    //setup temporary addition to the menu

    let newTasks = this.state.tasks;
    let searchIsFound = false;
    for (var i in this.state.tasks) {
      let task = this.state.tasks[i];
      if (task.value === "search") {
        searchIsFound = true;
        break;
      }
    }
    if (!searchIsFound) {
      newTasks = [
        ...this.state.tasks,
        { text: "Searching...", value: "search" }
      ];
    }
    this.setState({
      tasks: newTasks,
      currentTaskValue: "search"
    });
    this.props.onAddTask(this.state.currentProjectValue, value);
  };

  /**
   * called when a project is selected in dropdown
   * @param e
   * @param value
   */
  handleChangeForProject = (e, { value }) => {
    console.log(this.name + " - handleChangeForProject: " + value);

    let currentProject = value;

    let currentTasks = this.getCurrentTasks(
      currentProject,
      this.journalModel.getActiveScope().recentTasksByProjectId,
      this.journalModel.getActiveScope().recentEntry
    );

    this.setState({
      currentProjectValue: value,
      tasks: currentTasks.tasks,
      currentTaskValue: currentTasks.currentTaskValue
    });
  };

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
  handleKeyPressForTask = e => {
    //console.log("handleKeyPressForTask: ");
  };

  /**
   *  called when a task is selected in the dropdown
   * @param e
   * @param value
   */
  handleChangeForTask = (e, { value }) => {
    //console.log("handleChangeForTask");
    this.setState({
      currentTaskValue: value
    });
  };

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
      console.log(
        this.name + " - Saving Intention! " + this.state.currentIntentionValue
      );
      this.saveJournalEntry();
    }
  };

  /**
   * saves the journal entry from the callback event
   */
  saveJournalEntry = () => {
    if (this.state.currentIntentionValue.length >= 1) {
      this.journalModel.addJournalEntry(
        this.state.currentProjectValue,
        this.state.currentTaskValue,
        this.state.currentIntentionValue
      );

      this.setState({ currentIntentionValue: "" });
    }
  };

  /**
   * handles the event that is notified on change of an entry in one of tbe inputs
   * @param e
   * @param name
   * @param value
   */
  handleChangeForIntention = (e, { name, value }) => {
    this.setState({ currentIntentionValue: value });
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

  getProjectDropdown() {
    return (
      <Dropdown
        disabled={this.state.disableControls}
        className="projectId"
        id="journalEntryProjectId"
        placeholder="Choose Project"
        selection
        search
        options={this.state.projects}
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

  getTaskDropdown() {
    return (
      <Dropdown
        disabled={this.state.disableControls}
        id="journalEntryTaskId"
        className="chunkId"
        options={this.state.tasks}
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
