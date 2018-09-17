import React, {Component} from "react";
import {Button, Dropdown, Grid, Input, Segment} from "semantic-ui-react";
import {DataStoreFactory} from "../DataStoreFactory";

const {remote} = window.require("electron"),
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
      currentIntentionValue: null
    };

  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount = () => {
    this.log("componentDidMount");

    this.entryStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.JOURNAL_ENTRY,
      this
    );

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
  };

  onStoreLoadCb = (err) => {
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

      this.setState({recentJournalDto: recentJournalDto});
    }
  };

  onSaveEntryCb = (err) => {
    this.log("onSaveEntryCb saving!");
    if (err) {
      this.entryStore.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {
      let recentEntry = this.entryStore.dto;
      this.log(JSON.stringify(recentEntry, null, 2));

      this.setState({currentIntentionValue: ""});

      this.log("Success!!");
    }
  };

  populateProjects = (recentJournalDto) => {

    let recentProjects = recentJournalDto.recentProjects;

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

    this.log(JSON.stringify(recentJournalDto, null, 2));

  };

  initCurrentProject = (recentJournalDto) => {
    //set default project

    let recentProjects = recentJournalDto.recentProjects;

    let currentProject = null;

    if (recentProjects.length > 0) {
      currentProject = recentProjects[0].id;
    }

    this.setState({
      currentProjectValue: currentProject
    });

    this.log("initProject = " + currentProject);

    return currentProject;
  };

  populateTasks = (currentProject, recentJournalDto) => {

    this.log("populateTasks");

    let currentTasks = recentJournalDto.recentTasksByProjectId[currentProject];

    var tasksForProject = [];
    for (var i in currentTasks) {
      tasksForProject[i] = {
        text: currentTasks[i].name,
        value: currentTasks[i].id
      };

      this.log("task = "+ tasksForProject[i].text);
    }

    this.setState({
      tasks: tasksForProject
    });

    this.setState({
      currentTaskValue: tasksForProject[0].value
    });

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
    this.log("handleChangeForProject: " + value);
    this.setState({
      currentProjectValue: value
    });

    this.populateTasks(value, this.state.recentJournalDto);

  };

  /// called when a project is selected in dropdown
  handleKeyPressForProject = (e) => {
    this.log("handleKeyPressForProject: " + e.key);

    if (e.key === 'Enter') {
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
  handleClickForCreate = () => {
    this.log("handleClickForCreate");

    this.saveJournalEntry();
  };

  /// works the same as the click for create handler.. see above ^
  handleKeyPressForIntention = e => {
    this.log("handleKeyPressForIntention");

    if (e.charCode === 13) {
      this.log("Saving Intention! " + this.state.currentIntentionValue);
      this.saveJournalEntry();
    }
  };

  saveJournalEntry = () => {

    this.log("active projectId: "+ this.state.currentProjectValue);
    this.log("active taskId: "+this.state.currentTaskValue);

    //TODO extract active state of projectId, and taskId from current project and task fields

    //what if I changed the active value to the Id, and the text to the friendly name?
    //can I get the controls and their active value?
    //or should I iterate over the list in the journal to find the project / task that matches the active?
    //this seems like I should construct the lists so the values actually represent the selected thing

    //then I need projectId, taskId, description, send this to server, and in theory should be able to make new tasks
    //
    // let recentJour = this.
    //
    this.log("saveJournalEntry: " + this.tokenKeyValue);
    this.entryStore.load(
      new IntentionInputDto({
        projectId: this.state.currentProjectValue,
        taskId: this.state.currentTaskValue,
        description: this.state.currentIntentionValue
      }),
      err => {
        setTimeout(() => {
          this.onSaveEntryCb(err);
        }, this.activateWaitDelay);
      }
    );
  };

  handleChangeForIntention = (e, {name, value}) => {
    this.log("handleChangeForIntention " + value);

    this.setState({currentIntentionValue: value});
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
                        onClick={this.handleClickForCreate}
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
