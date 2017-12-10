import React, {Component} from 'react';
import {Button, Label, Segment} from 'semantic-ui-react';
import {Form, Input, TextArea} from 'formsy-semantic-ui-react';
import {RendererEvent} from '../RendererEventManager';
import {RendererEventManagerHelper} from '../RendererEventManagerHelper';

/*
 * Presents a form that represents bug report info, then emits an event with the state of the form
 * upon form submission.
 */

log = (msg) => { // TODO: Probably should extract to a singleton logger class and use everywhere
  console.log(`[${this.constructor.name}] ${msg}`);
}

export default class BugReportView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submissionResult: null
    };
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'auto';

    log('register events');
    this.events = {
      submitBugReport: new RendererEvent(
        RendererEventManagerHelper.Events.BUGREPORT_SUBMITTAL,
        this,
        function (event, arg) {
          log(`event -> ${this.type} : ${arg.load}`);
          this.scope.setState(state => {
            this.scope.updateHeaderText(arg.text);
            this.scope.updateProgress(arg.value, arg.total, arg.label);
          });
        }
      )
    }
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
    // TODO: djh - wait until after code from Kara is merged into master
    // Do something with this.state
    // TODO dispatch a new event for submitting the bug. pass this info as json in arg
    this.events.shown.dispatch();
  };

  render() {
    function SubmissionResultSegment(props) {
      if (!props || !props.result) {
        return null;  // No segment to display
      }

      // TODO: Experiment to make this look nice
      const resultStyle = {
        padding: 10,
        margin: 10,
        backgroundColor: props.result.status === 'success' ? 'green' : 'red',
        color: '#333',
        display: 'inline-block',
        fontFamily: 'monospace',
        fontSize: 16,
        textAlign: 'center'
      };

      return (
        <Segment raised>
          <span style={resultStyle}>{result.text}</span>
        </Segment>
      );
    }

    return (
      <div>
        <Segment basic>
          <Form>
            <Form.Field>
              <label>Issue description</label>
              <TextArea
                placeholder='...'
                name='description'
                value={this.state.issueDescription}
                onChange={this.handleDescriptionChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Steps to reproduce</label>
              <TextArea
                placeholder='...'
                name='reproductionSteps'
                value={this.state.reproductionSteps}
                onChange={this.handleReproductionSteps}
              />
            </Form.Field>
            <Form.Field>
              <label>Expected results</label>
              <TextArea
                placeholder='...'
                name='expectedResults'
                value={this.state.expectedResults}
                onChange={this.handleExpectedResults}
              />
            </Form.Field>
            <Form.Field>
              <label>Actual results</label>
              <TextArea
                placeholder='...'
                name='actualResults'
                value={this.state.actualResults}
                onChange={this.handleActualResults}
              />
            </Form.Field>
            <Form.Field>
              <label>Email address</label>
              <Input
                value={this.state.email}
                name='email'
                onChange={this.handleEmailChange}
                validations='isEmail'
                validationErrors={{isEmail: 'Invalid email'}}
                errorLabel={errorLabel}
              />
            </Form.Field>
            <Button type='submit' onClick={this.submit}>
              Submit
            </Button>
          </Form>
        </Segment>
        <SubmissionResultSegment result={this.state.submissionResult}/>
      </div>
    );
  }
}
