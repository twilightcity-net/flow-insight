import React, {Component} from "react";
import {Button, Dropdown, Grid, Input, Segment} from "semantic-ui-react";
import {DataStoreFactory} from "../DataStoreFactory";

const {remote} = window.require("electron");

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
      currentProjectValue : null,
      currentTaskValue : null,
      currentIntentionValue : null
    };

  }

  componentDidMount() {
    this.log("componentDidMount");

    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.RECENT_JOURNAL,
      this
    );

    this.store.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });

  }

  onStoreLoadCb(err) {
    this.log("onStoreLoadCb");
    if (err) {
      this.store.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      let recentJournalDto = this.store.dto;

      this.populateProjects(recentJournalDto);

      let defaultProject = this.initCurrentProject(recentJournalDto);
      this.populateTasks(defaultProject, recentJournalDto);

      this.setState({recentJournalDto : recentJournalDto});
    }
  }

  populateProjects = (recentJournalDto) => {

    let recentProjects = recentJournalDto.recentProjects;

    var projects = [];
    for (var i in recentProjects) {
      projects[i] = {
        text: recentProjects[i].name,
        value: recentProjects[i].name
      };
    }

    this.setState({
      projects: projects
    });

    this.log(JSON.stringify(recentJournalDto, null, 2));

  };

  initCurrentProject(recentJournalDto) {
    //set default project

    let recentIntentions = recentJournalDto.recentIntentions;
    let recentProjects = recentJournalDto.recentProjects;

    let currentProject = null;
    if (recentIntentions.length > 0) {
      currentProject = recentIntentions[0].projectName;

    } else if (recentProjects.length > 0) {
      currentProject = recentProjects[0].value;
    }

    this.setState({
      currentProjectValue: currentProject
    });

    this.log("initProject = "+currentProject);

    return currentProject;
  }

  populateTasks = (currentProject, recentJournalDto) => {

    this.log("current project = "+ currentProject);

    let currentTasks = recentJournalDto.recentTasksByProjectName[currentProject];

    this.log("currentTasks = "+currentTasks);

    var tasksForProject = [];
    for (var i in currentTasks) {
      tasksForProject[i] = {
        text: currentTasks[i].name,
        value: currentTasks[i].name
      };
    }

    this.setState({
      tasks: tasksForProject
    });

    this.setState({
      currentTaskValue: tasksForProject[0].value
    });

  };

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  /// called when a new project is added from dropdown
  handleAdditionForProject = (e, {value}) => {
    this.log("handleAdditionForProject");
    this.setState({
      projects: [{text: value, value}, ...this.state.projects]
    });
  };

  /// called when a new task is added from dropdown
  handleAdditionForTask = (e, {value}) => {
    this.log("handleAdditionForTask");
    this.setState({
      tasks: [{text: value, value}, ...this.state.tasks]
    });
  };

  /// called when a project is selected in dropdown
  handleChangeForProject = (e, {value}) => {
    this.log("handleChangeForProject: "+value);
    this.setState({
      currentProjectValue: value
    });

    this.populateTasks(value, this.state.recentJournalDto);

  };

  /// called when a project is selected in dropdown
  handleKeyPressForProject = (e) => {
    this.log("handleKeyPressForProject: "+e.key);

    if(e.key === 'Enter'){
      this.log("ENTER!");
    }
  };

  /// called when a project is selected in dropdown
  handleKeyPressForTask = (e) => {
    this.log("handleKeyPressForTask: ");

  };

  /// called when a task is selected in the dropdown
  handleChangeForTask = (e, {value}) => {
    this.log("handleChangeForTask");
    this.setState({
      currentTaskValue: value
    });
  };

  /// called when the create task button is clicked on, it then shouold dispatch
  /// a new event that will update the rendered view
  handleClickForIntention = () => {
    this.log("handleClickForIntention");
    console.log("[JournalEntry] handle button click -> " + this.type);
  };

  /// works the same as the click for create handler.. see above ^
  handleKeyPressForIntention = e => {
    this.log("handleKeyPressForIntention");

    if (e.charCode === 13) {
      this.log("13!! " + this.state.currentIntentionValue);
    }
  };

  handleChangeForIntention = (e, {name, value})  => {
    this.log("handleChangeForIntention "+value);

    this.setState({currentIntentionValue : value});
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
    const {} = this.state;
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
                <Grid.Column width={2} id="selectTaskInput">
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
                <Grid.Column width={12} id="createIntentionInput">
                  <Input
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
                        onClick={this.handleClickForIntention}
                        onKeyPress={this.handleKeyPressForIntention}
                      />
                    }
                    placeholder="What's your next Intention?"
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
