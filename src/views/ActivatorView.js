import React, { Component } from "react";
import {
  Button,
  Container,
  Divider,
  Form,
  Icon,
  Header,
  Segment
} from "semantic-ui-react";

//
// This view class is used to activate the application
//
export default class ActivatorView extends Component {
  // constructor(props) {
  //   super(props);
  // }

  handleSubmit = () => {
    console.log("submit activation");
  };

  /// renders the view into our root element of our window
  render() {
    return (
      <Segment basic inverted>
        <Container>
          <Header as="h4" floated="left" inverted>
            <Icon size="huge" circular inverted color="violet" name="signup" />
          </Header>
          <Header as="h3" floated="left" inverted>
            <Header.Content>
              Activate Application
              <Header.Subheader>
                Please enter your api-key below and click activate to continue.
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Container>
        <Divider clearing />
        <Segment className="apiKey" inverted>
          <Form onSubmit={this.handleSubmit} size="big" inverted>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Api-Key"
                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              />
            </Form.Group>
            <Form.Checkbox label="I agree to the Terms and Conditions" />
            <Divider />
            <Button type="submit" size="big" color="violet">
              Activate
            </Button>
          </Form>
        </Segment>
      </Segment>
    );
  }
}
