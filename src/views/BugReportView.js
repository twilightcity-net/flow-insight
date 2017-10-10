/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

import React, { Component } from 'react';
import { Button, Label, Segment } from 'semantic-ui-react';
import { Form, Input, TextArea } from 'formsy-semantic-ui-react';

/*
 * This View will contain logic to inject the various tabs of the
 * console into the view. It will also manage the states of these
 * views in an array.
 *
 * TODO: implement bug report view
 */

export default class BugReport extends Component {

    state = { }

    handleDescriptionChange = (event) => {
        this.setState({
            issueDescription: event.target.value,
        });
    }

    handleReproductionSteps = (event) => {
        this.setState({
            reproductionSteps: event.target.value
        });
    }

    handleExpectedResults = (event) => {
        this.setState({
            expectedResults: event.target.value
        });
    }

    handleActualResults = (event) => {
        this.setState({
            actualResults: event.target.value
        });
    }

    handleEmailChange = (event) => {
        this.setState({
            email: event.target.value
        });
    }

    submit = () => {
        // TODO: djh - wait until after code from Kara is merged into master
        // Do something with this.state
    }

    render() {
        const errorLabel = <Label color="red" pointing/>
        return (
            <Segment basic>
            <Form>
                <Form.Field>
                    <label>Issue description</label>
                    <TextArea
                        placeholder='...'
                        name="description"
                        value={this.state.issueDescription}
                        onChange={this.handleDescriptionChange}/>

                </Form.Field>
                <Form.Field>
                    <label>Steps to reproduce</label>
                    <TextArea
                        placeholder='...'
                        name="reproductionSteps"
                        value={this.state.reproductionSteps}
                        onChange={this.handleReproductionSteps}/>

                </Form.Field>
                <Form.Field>
                    <label>Expected results</label>
                    <TextArea
                        placeholder='...'
                        name="expectedResults"
                        value={this.state.expectedResults}
                        onChange={this.handleExpectedResults}/>

                </Form.Field>
                <Form.Field>
                    <label>Actual results</label>
                    <TextArea
                        placeholder='...'
                        name="actualResults"
                        value={this.state.actualResults}
                        onChange={this.handleActualResults}/>

                </Form.Field>
                    <Form.Field>
                        <label>Email address</label>
                        <Input value={this.state.email}name="email"
                               onChange={this.handleEmailChange}
                               validations="isEmail"
                               validationErrors={{ isEmail: 'Invalid email' }}
                               errorLabel={ errorLabel }/>
                    </Form.Field>
                    <Button type='submit' onClick={this.submit}>
                        Submit
                    </Button>
                </Form>
            </Segment>
        )
    }
}
