/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

import React, { Component } from 'react';
import { Button, Form } from 'semantic-ui-react'

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
    }

    handleDescriptionChange = (event) => {
        this.setState({
            issueDescription: event.target.value,
            email: this.state.email
        });
    }

    handleEmailChange = (event) => {
        this.setState({
            issueDescription: this.state.issueDescription,
            email: event.target.value
        });
    }

    submit = () => {
        console.error(`A bug would have been submitted: ${this.state.issueDescription}`);
    }

    render() {
        return (
            <Form>
                <Form.Field>
                    <label>Issue description</label>
                    <textarea placeholder='...description...'
                              value={this.state.issueDescription}
                              onChange={this.handleDescriptionChange}/>
                </Form.Field>
                <Form.Field>
                    <label>Email address</label>
                    <input value={this.state.email}
                           onChange={this.handleEmailChange}/>
                </Form.Field>
                <Button type='submit' onClick={this.submit}>Submit</Button>
            </Form>
        )
    }
}
