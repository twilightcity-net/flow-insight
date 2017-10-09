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
    state = {
        issueDescription: '',
        email: ''
    };

    handleDescriptionChange = event => {
        this.setState({
            issueDescription: event.target.value,
            email: this.state.email
        });
    };

    handleEmailChange = event => {
        this.setState({
            issueDescription: this.state.issueDescription,
            email: event.target.value
        });
    };

    submit = () => {
        console.error(
            `A bug would have been submitted: ${this.state.issueDescription}`
        );
    };

    render() {
        const errorLabel = <Label color="red" pointing/>
        return (
            <Segment basic>
                <Form>
                    <Form.Field>
                        <Label>Issue description</Label>
                        <TextArea
                            placeholder="...description..."
                            name="description"
                            value={this.state.issueDescription}
                            onChange={this.handleDescriptionChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>Email address</Label>
                        <Input value={this.state.email}
                               name="email"
                               onChange={this.handleEmailChange}
                               validations="isEmail"
                               validationErrors={{ isEmail: 'Invalid email' }}
                               errorLabel={ errorLabel }/>
                    </Form.Field>
                    <Button type="submit" onClick={this.submit}>
                        Submit
                    </Button>
                </Form>
            </Segment>
        );
    }
}
