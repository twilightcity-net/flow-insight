import React, { Component } from "react";
import { Button, Dropdown, Grid, Input, Segment } from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class JournalEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [
        {
          key: "torchie",
          text: "torchie",
          value: "torchie"
        },
        {
          key: "torchie2",
          text: "torchie 2",
          value: "torchie2"
        },
        {
          key: "torchie3",
          text: "torchie 3",
          value: "torchie3"
        }
      ],
      chunks: [
        {
          key: "US124945",
          text: "US124945",
          value: "US124945"
        },
        {
          key: "US124947",
          text: "US124947",
          value: "US124947"
        },
        {
          key: "US124949",
          text: "US124949",
          value: "US124949"
        }
      ]
    };
  }

  /// called when a new project is added from dropdown
  handleAdditionForProject = (e, { value }) =>
    this.setState({
      projects: [{ text: value, value }, ...this.state.projects]
    });

  /// called when a new chunk is added from dropdown
  handleAdditionForChunk = (e, { value }) =>
    this.setState({
      chunks: [{ text: value, value }, ...this.state.chunks]
    });

  /// called when a project is selected in dropdown
  handleChangeForProject = (e, { value }) =>
    this.setState({
      currentProjectValue: value
    });

  /// called when a chunk is selected in the dropdown
  handleChangeForChunk = (e, { value }) =>
    this.setState({
      currentChunkValue: value
    });

  /// called when the create task button is clicked on, it then shouold dispatch
  /// a new event that will update the rendered view
  handleClickForCreate = () => {
    console.log("[JournalEntry] handle button click -> " + this.type);
  };

  /// works the same as the click for create handler.. see above ^
  handleKeyPressForCreate = e => {
    if (e.charCode === 13) {
      console.log(
        "[JournalEntry] handle key press -> " + this.type + " : " + e.charCode
      );
    }
  };

  /// highlight field border when element is focused on
  handleFocusForProject = e => {
    document.getElementById("createProjectInput").classList.add("focused");
    document.getElementById("createChunkInput").classList.remove("focused");
    document.getElementById("createTaskInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForChunk = e => {
    document.getElementById("createProjectInput").classList.remove("focused");
    document.getElementById("createChunkInput").classList.add("focused");
    document.getElementById("createTaskInput").classList.remove("focused");
  };

  /// highlight field border when element is focused on
  handleFocusForTask = e => {
    document.getElementById("createProjectInput").classList.remove("focused");
    document.getElementById("createChunkInput").classList.remove("focused");
    document.getElementById("createTaskInput").classList.add("focused");
  };

  /// clear all of the highlights to the fields on any element blur.. called by all
  /// form element inputs
  handleBlurForInput = e => {
    document.getElementById("createProjectInput").classList.remove("focused");
    document.getElementById("createChunkInput").classList.remove("focused");
    document.getElementById("createTaskInput").classList.remove("focused");
  };

  /// renders the journal entry component of the console view
  render() {
    const {
      currentProjectValue,
      currentChunkValue,
      currentTaskValue
    } = this.state;
    return (
      <div id="component" className="journalEntry">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={2} id="createProjectInput">
                  <Dropdown
                    className="projectId"
                    options={this.state.projects}
                    placeholder="Choose Project"
                    search
                    selection
                    fluid
                    upward
                    allowAdditions
                    value={currentProjectValue}
                    onFocus={this.handleFocusForProject}
                    onBlur={this.handleBlurForInput}
                    onAddItem={this.handleAdditionForProject}
                    onChange={this.handleChangeForProject}
                  />
                </Grid.Column>
                <Grid.Column width={2} id="createChunkInput">
                  <Dropdown
                    className="chunkId"
                    options={this.state.chunks}
                    placeholder="Choose Chunk"
                    search
                    selection
                    fluid
                    upward
                    allowAdditions
                    value={currentChunkValue}
                    onFocus={this.handleFocusForChunk}
                    onBlur={this.handleBlurForInput}
                    onAddItem={this.handleAdditionForChunk}
                    onChange={this.handleChangeForChunk}
                  />
                </Grid.Column>
                <Grid.Column width={12} id="createTaskInput">
                  <Input
                    className="taskText"
                    fluid
                    inverted
                    value={currentTaskValue}
                    onFocus={this.handleFocusForTask}
                    onBlur={this.handleBlurForInput}
                    onKeyPress={this.handleKeyPressForTask}
                    action={
                      <Button
                        className="createTask"
                        icon="share"
                        labelPosition="right"
                        content="Create"
                        onClick={this.handleClickForTask}
                        onKeyPress={this.handleKeyPressForTask}
                      />
                    }
                    placeholder="What chunk are you working on next?"
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
