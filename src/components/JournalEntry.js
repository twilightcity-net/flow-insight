import React, { Component } from "react";
import { Dropdown, Grid, Segment } from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class JournalEntry extends Component {
  constructor(props) {
    super(props);
    this.options = [
      { key: "English", text: "English", value: "English" },
      { key: "French", text: "French", value: "French" },
      { key: "Spanish", text: "Spanish", value: "Spanish" },
      { key: "German", text: "German", value: "German" },
      { key: "Chinese", text: "Chinese", value: "Chinese" }
    ];
    this.state = {
      options: [
        {
          key: "torchie",
          text: "torchie",
          value: "torchie"
        }
      ]
    };
  }

  handleProjectAddition = (e, { value }) =>
    this.setState({
      options: [{ text: value, value }, ...this.state.options]
    });

  handleChange = (e, { value }) =>
    this.setState({
      currentValue: value
    });

  /*
   * renders the tab component of the console view
   */
  render() {
    const { currentValue } = this.state;
    return (
      <div id="component" className="journalEntry">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={2}>
                  <Dropdown
                    className="projectId"
                    options={this.state.options}
                    placeholder="Choose Project"
                    search
                    selection
                    fluid
                    upward
                    allowAdditions
                    value={currentValue}
                    onAddItem={this.handleProjectAddition}
                    onChange={this.handleChange}
                  />
                </Grid.Column>
                <Grid.Column width={2}>cell 2</Grid.Column>
                <Grid.Column width={12}>cell 3</Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
