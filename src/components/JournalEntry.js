import React, { Component } from "react";
import { Button, Dropdown, Grid, Input, Segment } from "semantic-ui-react";
import { DataModelFactory } from "../models/DataModelFactory";
import {JournalModel} from "../models/JournalModel";

//
// this component is the tab panel wrapper for the console content
//
export default class JournalEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      tasks: [],
      currentProjectValue: null,
      currentTaskValue: null,
      currentIntentionValue: ""
    };

    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );
  }

  resetCb = () => {
    console.log("JournalEntry:: Reset CB!");

    document.getElementById("intentionTextInput").focus();
  };

  componentDidMount = () => {
    console.log("Journal Entry : componentDidMount");

    this.journalModel.registerListener(
      "journalEntry",
      JournalModel.CallbackEvent.RECENT_TASKS_UPDATE,
      this.onJournalRecentTasksUpdateCb
    );

    this.resetCb();
  };

  componentWillReceiveProps = nextProps => {

    if (this.lastOpenCloseState === 1 && nextProps.consoleIsCollapsed === 0) {
      //if it's now open, and used to be closed, need to reset the window
      this.resetCb();
    }

    this.lastOpenCloseState = nextProps.consoleIsCollapsed;
  };

  componentWillUnmount = () => {
    console.log("Journal Entry : componentWillUnmount");

    this.journalModel.unregisterAllListeners("journalEntry");
  };

  onJournalRecentTasksUpdateCb = () => {
    console.log("Journal Entry : onJournalRecentTasksUpdateCb");

    this.populateProjects(this.journalModel.getActiveScope().recentProjects);

    let defaultProject = this.initCurrentProject(
      this.journalModel.getActiveScope().recentProjects,
      this.journalModel.getActiveScope().recentEntry
    );
    this.populateTasks(
      defaultProject,
      this.journalModel.getActiveScope().recentTasksByProjectId,
      this.journalModel.getActiveScope().recentEntry
    );

  };


  populateProjects = recentProjects => {
    var projects = [];
    for (var i in recentProjects) {
      projects[i] = {
        text: recentProjects[i].name,
        value: recentProjects[i].id
      };
    }

    this.setState({
      projects: projects
    });
  };

  initCurrentProject = (recentProjects, recentEntry) => {

    console.log("initCurrentProject = " + recentProjects);
    //set default project

    let currentProject = null;

    if (recentEntry) {
      currentProject = recentEntry.projectId;
    }

    if (!currentProject && recentProjects && recentProjects.length > 0) {
      currentProject = recentProjects[0].id;
    }

    this.setState({
      currentProjectValue: currentProject
    });

    console.log("initProject = " + currentProject);

    return currentProject;
  };

  populateTasks = (currentProject, recentTasksByProjectId, recentEntry) => {
    console.log("populating tasks...");

    if (!recentTasksByProjectId) {
      return;
    }

    let currentTasks = recentTasksByProjectId[currentProject];

    var tasksForProject = [];
    for (var i in currentTasks) {
      tasksForProject[i] = {
        text: currentTasks[i].name,
        value: currentTasks[i].id
      };
    }

    if (tasksForProject.length > 0) {
      let currentTask = tasksForProject[0].value;

      if (recentEntry && recentEntry.projectId === currentProject) {
        console.log("Populating default entry");
        currentTask = recentEntry.taskId;
      }

      this.setState({
        tasks: tasksForProject,
        currentTaskValue: currentTask
      });
    }
  };

  /// called when a new task is added from dropdown
  handleAdditionForTask = (e, { value }) => {
    console.log("handleAdditionForTask:" + value);

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
      newTasks = [...this.state.tasks, {text:"Searching...", value:"search"}];
    }

    this.setState({
      tasks: newTasks,
      currentTaskValue: "search"
    });
    this.props.onAddTask(this.state.currentProjectValue, value);
  };

  /// called when a new project is added from dropdown
  handleAdditionForProject = (e, { value }) => {
    console.log("handleAdditionForProject");
    this.setState({
      projects: [{ text: value, value }, ...this.state.projects]
    });
  };

  /// called when a project is selected in dropdown
  handleChangeForProject = (e, { value }) => {
    console.log("handleChangeForProject: " + value);
    this.setState({
      currentProjectValue: value
    });

    this.populateTasks(
      value,
      this.props.recentTasksByProjectId,
      this.props.recentEntry
    );
  };

  /// called when a project is selected in dropdown
  handleKeyPressForProject = e => {
    if (e.key === "Enter") {
      console.log("ENTER!");
    }
  };

  /// called when a project is selected in dropdown
  handleKeyPressForTask = e => {
    console.log("handleKeyPressForTask: ");
  };

  /// called when a task is selected in the dropdown
  handleChangeForTask = (e, { value }) => {
    console.log("handleChangeForTask");
    this.setState({
      currentTaskValue: value
    });
  };

  /// called when the create task button is clicked on, it then shouold dispatch
  /// a new event that will update the rendered view
  handleClickForCreate = () => {
    console.log("handleClickForCreate");

    this.saveJournalEntry();
  };

  /// works the same as the click for create handler.. see above ^
  handleKeyPressForIntention = e => {
    if (e.charCode === 13) {
      console.log("Saving Intention! " + this.state.currentIntentionValue);
      this.saveJournalEntry();
    }
  };

  saveJournalEntry = () => {
    console.log("active projectId: " + this.state.currentProjectValue);
    console.log("active taskId: " + this.state.currentTaskValue);

    this.journalModel.addJournalEntry(
      this.state.currentProjectValue,
      this.state.currentTaskValue,
      this.state.currentIntentionValue
    );

    this.setState({ currentIntentionValue: "" });
  };

  handleChangeForIntention = (e, { name, value }) => {
    this.setState({ currentIntentionValue: value });
  };

  /// highlight field border when element is focused on
  handleFocusForProject = e => {
    console.log("handleFocusForProject");
    document.getElementById("selectProjectInput").classList.add("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForTask = e => {
    console.log("handleFocusForTask");
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.add("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForIntention = e => {
    console.log("handleFocusForIntention");
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.add("focused");
  };

  /// clear all of the highlights to the fields on any element blur.. called by all
  /// form element inputs
  handleBlurForInput = e => {
    console.log("handleBlurForInput");
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
