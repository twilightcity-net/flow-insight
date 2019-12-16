import React, { Component } from "react";
import { Button, Label, Segment } from "semantic-ui-react";
import { Form, Input, TextArea } from "formsy-semantic-ui-react";
import { RendererEventFactory } from "../events/RendererEventFactory";

const { remote } = window.require("electron");
const electronLog = remote.require("electron-log");

/*
 * Presents a form that represents bug report info, then dispatches an event with the state of the form
 * upon form submission.
 */
export default class BugReportView extends Component {
  constructor(props) {
    super(props);
    this.state = this.createState();
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "auto";

    this.log("register events");
    this.events = {
      submitBugReport: RendererEventFactory.createEvent(
        RendererEventFactory.Events.SUBMIT_BUG_REPORT,
        this
      )
    };
  }

  createState() {
    return {
      issueDescription: null,
      reproductionSteps: null,
      expectedResults: null,
      actualResults: null,
      email: null
    };
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  handleDescriptionChange = event => {
    this.setState({
      issueDescription: event.target.value
    });
  };

  handleReproductionSteps = event => {
    this.setState({
      reproductionSteps: event.target.value
    });
  };

  handleExpectedResults = event => {
    this.setState({
      expectedResults: event.target.value
    });
  };

  handleActualResults = event => {
    this.setState({
      actualResults: event.target.value
    });
  };

  handleEmailChange = event => {
    this.setState({
      email: event.target.value
    });
  };

  submit = () => {
    this.events.submitBugReport.dispatch(this.state);
  };

  render() {
    const errorLabel = <Label color="red" pointing />;
    return (
      <Segment basic>
        <Form>
          <Form.Field>
            <label>Issue description</label>
            <TextArea
              placeholder="..."
              name="description"
              value={this.state.issueDescription}
              onChange={this.handleDescriptionChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Steps to reproduce</label>
            <TextArea
              placeholder="..."
              name="reproductionSteps"
              value={this.state.reproductionSteps}
              onChange={this.handleReproductionSteps}
            />
          </Form.Field>
          <Form.Field>
            <label>Expected results</label>
            <TextArea
              placeholder="..."
              name="expectedResults"
              value={this.state.expectedResults}
              onChange={this.handleExpectedResults}
            />
          </Form.Field>
          <Form.Field>
            <label>Actual results</label>
            <TextArea
              placeholder="..."
              name="actualResults"
              value={this.state.actualResults}
              onChange={this.handleActualResults}
            />
          </Form.Field>
          <Form.Field>
            <label>Email address</label>
            <Input
              value={this.state.email}
              name="email"
              onChange={this.handleEmailChange}
              validations="isEmail"
              validationErrors={{ isEmail: "Invalid email" }}
              errorLabel={errorLabel}
            />
          </Form.Field>
          <Button type="submit" onClick={this.submit}>
            Submit
          </Button>
        </Form>
      </Segment>
    );
  }
}
