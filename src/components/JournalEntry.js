import React, { Component } from "react";
// import { RendererEvent } from "../RendererEventManager";
// import { RendererEventManagerHelper } from "../RendererEventManagerHelper";
import {
  Button,
  Dropdown,
  Grid,
  Icon,
  Input,
  Segment
} from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class JournalEntry extends Component {
  constructor(props) {
    super(props);
    // this.events = {
    //   createChunk: new RendererEvent(
    //     RendererEventManagerHelper.Events.WINDOW_CONSOLE_JOURNAL_CREATE_CHUNK,
    //     this,
    //     function(event, arg) {
    //       console.log("[JournalEntry] event -> " + this.type);
    //       this.scope.events.hideConsole.dispatch(0);
    //     }
    //   ),
    //   hideConsole: new RendererEvent(
    //     RendererEventManagerHelper.Events.WINDOW_CONSOLE_SHOW_HIDE,
    //     this
    //   )
    // };
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

  handleAdditionForProject = (e, { value }) =>
    this.setState({
      projects: [{ text: value, value }, ...this.state.projects]
    });

  handleAdditionForChunk = (e, { value }) =>
    this.setState({
      chunks: [{ text: value, value }, ...this.state.chunks]
    });

  handleChangeForProject = (e, { value }) =>
    this.setState({
      currentProjectValue: value
    });

  handleChangeForChunk = (e, { value }) =>
    this.setState({
      currentChunkValue: value
    });

  handleClickForCreate = () => {
    console.log("[JournalEntry] handle button click -> " + this.type);
    // this.events.createChunk.dispatch(">>>create chunk");
  };

  handleKeyPressForCreate = e => {
    if (e.charCode === 13) {
      console.log(
        "[JournalEntry] handle key press -> " + this.type + " : " + e.charCode
      );
      // this.events.createChunk.dispatch(">>>create chunk");
    }
  };

  handleFocusForProject = e => {
    document.getElementById("createProjectInput").classList.add("focused");
    document.getElementById("createChunkInput").classList.remove("focused");
    document.getElementById("createTaskInput").classList.remove("focused");
  };

  handleFocusForChunk = e => {
    document.getElementById("createProjectInput").classList.remove("focused");
    document.getElementById("createChunkInput").classList.add("focused");
    document.getElementById("createTaskInput").classList.remove("focused");
  };

  handleFocusForTask = e => {
    document.getElementById("createProjectInput").classList.remove("focused");
    document.getElementById("createChunkInput").classList.remove("focused");
    document.getElementById("createTaskInput").classList.add("focused");
  };

  handleBlurForInput = e => {
    document.getElementById("createProjectInput").classList.remove("focused");
    document.getElementById("createChunkInput").classList.remove("focused");
    document.getElementById("createTaskInput").classList.remove("focused");
  };
  /*
   * renders the tab component of the console view
   */
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
