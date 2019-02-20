import React, { Component } from "react";
import { Button, Form, Header, Input, Segment } from "semantic-ui-react";

export default class ChatBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chats: [
        {
          username: "Adrian Rillon",
          content: "Having issues with a thingy!"
        },
        {
          username: "Janelle Klein",
          content: "You need to try the stuff!"
        }
      ]
    };
  }

  submitMessage(e) {
    e.preventDefault();

    //  concatenate ReactDOM.findDOMNode(this.refs.msg).value to state, binding to user
  }
  render() {
    const { chats } = this.state;
    const renderMessages = chats.map(chat => {
      return (
        <li className={`chat right`}>
          <p>
            {chat.username} : {chat.content}
          </p>
        </li>
      );
    });
    return (
      <Segment inverted className="troubleshootChatBox">
        <div id="chatMessages">
          <Header as="h2" attached="top" inverted>
            Problem Solving Circle
          </Header>
          <ul className="chats" ref="chats">
            {renderMessages}
          </ul>
        </div>
        <Form onSubmit={e => this.submitMessage(e)}>
          <Input
            ref="msg"
            id="troubleshootChatInput"
            placeholder="What insights do you have?"
            inverted
            search
            selection
            fluid
            upward
            allowAdditions
            action={<Button type="submit">Submit</Button>}
          />
        </Form>
      </Segment>
    );
  }
}
