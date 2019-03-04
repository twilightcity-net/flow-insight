import React, { Component } from "react";
import { Button, Dropdown, Grid, Input, Segment } from "semantic-ui-react";
import { DataModelFactory } from "../models/DataModelFactory";

const { remote } = window.require("electron"),
  IntentionInputDto = remote.require("./dto/IntentionInputDto");

const electronLog = remote.require("electron-log");

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
    this.log("JournalEntry:: Reset CB!");

    document.getElementById("intentionTextInput").focus();
  };

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount = () => {
    this.log("componentDidMount");
    this.resetCb();
  };

  componentWillReceiveProps = nextProps => {
    this.populateProjects(nextProps.recentProjects);

    let defaultProject = this.initCurrentProject(
      nextProps.recentProjects,
      nextProps.recentEntry
    );
    this.populateTasks(
      defaultProject,
      nextProps.recentTasksByProjectId,
      nextProps.recentEntry
    );

    if (this.lastOpenCloseState === 1 && nextProps.consoleIsCollapsed === 0) {
      //if it's now open, and used to be closed, need to reset the window
      this.resetCb();
    }

    this.lastOpenCloseState = nextProps.consoleIsCollapsed;
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

    this.log("initProject = " + currentProject);

    return currentProject;
  };

  populateTasks = (currentProject, recentTasksByProjectId, recentEntry) => {
    this.log("populating tasks...");

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

    this.setState({
      tasks: tasksForProject
    });

    if (tasksForProject.length > 0) {
      let currentTask = tasksForProject[0].value;

      if (recentEntry && recentEntry.projectId === currentProject) {
        this.log("Populating default entry");
        currentTask = recentEntry.taskId;
      }

      this.setState({
        currentTaskValue: currentTask
      });
    }
  };

  /// called when a new task is added from dropdown
  handleAdditionForTask = (e, { value }) => {
    this.log("handleAdditionForTask:" + value);

    this.props.onAddTask(this.state.currentProjectValue, value);
  };

  /// called when a new project is added from dropdown
  handleAdditionForProject = (e, { value }) => {
    this.log("handleAdditionForProject");
    this.setState({
      projects: [{ text: value, value }, ...this.state.projects]
    });
  };

  /// called when a project is selected in dropdown
  handleChangeForProject = (e, { value }) => {
    this.log("handleChangeForProject: " + value);
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
      this.log("ENTER!");
    }
  };

  /// called when a project is selected in dropdown
  handleKeyPressForTask = e => {
    this.log("handleKeyPressForTask: ");
  };

  /// called when a task is selected in the dropdown
  handleChangeForTask = (e, { value }) => {
    this.log("handleChangeForTask");
    this.setState({
      currentTaskValue: value
    });
  };

  /// called when the create task button is clicked on, it then shouold dispatch
  /// a new event that will update the rendered view
  handleClickForCreate = () => {
    this.log("handleClickForCreate");

    this.saveJournalEntry();
  };

  /// works the same as the click for create handler.. see above ^
  handleKeyPressForIntention = e => {
    if (e.charCode === 13) {
      this.log("Saving Intention! " + this.state.currentIntentionValue);
      this.saveJournalEntry();
    }
  };

  saveJournalEntry = () => {
    this.log("active projectId: " + this.state.currentProjectValue);
    this.log("active taskId: " + this.state.currentTaskValue);

    let journalEntry = new IntentionInputDto({
      projectId: this.state.currentProjectValue,
      taskId: this.state.currentTaskValue,
      description: this.state.currentIntentionValue
    });

    this.journalModel.addJournalEntry(
      journalEntry.projectId,
      journalEntry.taskId,
      journalEntry.description
    );

    this.setState({ currentIntentionValue: "" });
  };

  handleChangeForIntention = (e, { name, value }) => {
    this.setState({ currentIntentionValue: value });
  };

  /// highlight field border when element is focused on
  handleFocusForProject = e => {
    this.log("handleFocusForProject");
    document.getElementById("selectProjectInput").classList.add("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForTask = e => {
    this.log("handleFocusForTask");
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.add("focused");
    document.getElementById("createIntentionInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForIntention = e => {
    this.log("handleFocusForIntention");
    document.getElementById("selectProjectInput").classList.remove("focused");
    document.getElementById("selectTaskInput").classList.remove("focused");
    document.getElementById("createIntentionInput").classList.add("focused");
  };

  /// clear all of the highlights to the fields on any element blur.. called by all
  /// form element inputs
  handleBlurForInput = e => {
    this.log("handleBlurForInput");
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
