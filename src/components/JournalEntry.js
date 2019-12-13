import React, { Component } from "react";
import { Button, Dropdown, Grid, Input, Segment } from "semantic-ui-react";
import { DataModelFactory } from "../models/DataModelFactory";
import { JournalModel } from "../models/JournalModel";
import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";

//
// this component is the tab panel wrapper for the console content
//
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

    this.consoleController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.CONSOLE_PANEL,
      this
    );
  }

  // resetOnConsoleOpen() {
  //   if (!this.consoleController.consoleIsCollapsed) {
  //     console.log(this.name + " - resetOnConsoleOpen");
  //     setTimeout(() => {
  //       this.resetFocus();
  //     }, 200);
  //   }
  // }

  resetFocus() {
    document.getElementById("intentionTextInput").focus();
  }

  componentDidMount = () => {
    console.log(this.name + " - componentDidMount");

    this.journalModel.registerListener(
      "journalEntry",
      JournalModel.CallbackEvent.RECENT_TASKS_UPDATE,
      this.onJournalRecentTasksUpdateCb
    );

    // this.consoleController.configureJournalEntryListener(
    //   this,
    //   this.resetOnConsoleOpen
    // );
    this.resetFocus();

    this.onJournalRecentTasksUpdateCb();
  };

  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.journalModel.unregisterAllListeners("journalEntry");
    this.consoleController.configureJournalEntryListener(this, null);
  };

  onJournalRecentTasksUpdateCb = () => {
    console.log(this.name + " - onJournalRecentTasksUpdateCb");

    let projectList = this.getProjectList(
      this.journalModel.getActiveScope().recentProjects
    );

    let currentProject = this.getCurrentProject(
      this.journalModel.getActiveScope().recentProjects,
      this.journalModel.getActiveScope().recentEntry
    );

    console.log(this.name + " - currentProjectSelected = " + currentProject);

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

  getCurrentProject = (recentProjects, recentEntry) => {
    let currentProject = null;

    if (recentEntry) {
      currentProject = recentEntry.projectId;
    }

    return currentProject;
  };

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

  /// called when a new task is added from dropdown
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

  /// called when a project is selected in dropdown
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

  /// called when a project is selected in dropdown
  handleKeyPressForProject = e => {
    if (e.key === "Enter") {
      console.log("ENTER!");
    }
  };

  /// called when a project is selected in dropdown
  handleKeyPressForTask = e => {
    //console.log("handleKeyPressForTask: ");
  };

  /// called when a task is selected in the dropdown
  handleChangeForTask = (e, { value }) => {
    //console.log("handleChangeForTask");
    this.setState({
      currentTaskValue: value
    });
  };

  /// called when the create task button is clicked on, it then shouold dispatch
  /// a new event that will update the rendered view
  handleClickForCreate = () => {
    this.saveJournalEntry();
  };

  /// works the same as the click for create handler.. see above ^
  handleKeyPressForIntention = e => {
    if (e.charCode === 13) {
      console.log(
        this.name + " - Saving Intention! " + this.state.currentIntentionValue
      );
      this.saveJournalEntry();
    }
  };

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

  handleChangeForIntention = (e, { name, value }) => {
    this.setState({ currentIntentionValue: value });
  };

  /// highlight field border when element is focused on
  handleFocusForProject = e => {
    console.log(this.name + " - handleFocusForProject");
    document.getElementById("selectProjectInput").classList.add("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForTask = e => {
    console.log(this.name + " - handleFocusForTask");
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.add("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForIntention = e => {
    console.log(this.name + " - handleFocusForIntention");
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.add("focused");
  };

  /// clear all of the highlights to the fields on any element blur.. called by all
  /// form element inputs
  handleBlurForInput = e => {
    console.log(this.name + " - handleBlurForInput");
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /// renders the journal entry component of the console view
  render() {
    return (
      <div id="component" className="journalEntry">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={2} id="selectProjectInput">
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
                </Grid.Column>
                <Grid.Column width={3} id="selectTaskInput">
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
                </Grid.Column>
                <Grid.Column width={11} id="createIntentionInput">
                  <div>
                    <Input
                      disabled={this.state.disableControls}
                      id="intentionTextInput"
                      className="intentionText"
                      fluid
                      inverted
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
                      placeholder="What's your next Intention?"
                    />
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
