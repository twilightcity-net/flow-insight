import React, {Component} from "react";
import {Button, Grid, Icon, Segment,} from "semantic-ui-react";
import {MemberClient} from "../../../../../clients/MemberClient";

/**
 * this component is the journal link panel for linking/unlinking to other member's journals
 */
export default class JournalLinkPanel extends Component {

  /**
   * builds our journal link panel shown when view other member's journals
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[JournalLinkPanel]";
  }

  isMe(props) {
    let username = this.getUserNameFromResource(props);
    if (
      username === "me" ||
      username === MemberClient.me.username
    ) {
      return true;
    }
    return false;
  }

  /**
   * gets our user name from a given journal resource from our browser
   * @param props
   * @returns {string}
   */
  getUserNameFromResource(props) {
    if (props.resource.uriArr.length > 1) {
      return props.resource.uriArr[1];
    } else {
      return "me";
    }
  }

  onClickLink = () => {
    this.props.onClickPairingLink();
  }

  onClickCancel = () => {
    this.props.onClickCancelLink();
  }

  getLinkButton() {
    if (this.props.isLinked) {
      return (<Button icon className="linkButton"
              onClick={this.onClickLink}
              size="medium"
              color="red"
      >
        Stop Pairing&nbsp;
        <Icon name='broken chain'/>
      </Button>);
    } else if (this.props.isLinking) {
      return (<Button icon className="linkButton"
                      onClick={this.onClickCancel}
                      size="medium"
                      color="grey"
      >
        Cancel&nbsp;
        <Icon name='broken chain'/>
      </Button>);
    } else {
        return (<Button icon className="linkButton"
                        onClick={this.onClickLink}
                        size="medium"
                        color="grey"
        >
          Pair&nbsp;
          <Icon name='chain'/>
        </Button>);
    }
  }

  getLinkMessage() {
    if (this.props.isLinked) {
      return (<div className="linkMessage">
        You are pairing with {this.props.username}
      </div>);
    } else if (this.props.isLinking) {
      return (<div className="linkMessage">
        Waiting for confirmation...
      </div>);
    } else if (this.props.error) {
      return (<div className="linkMessage linkError">
        {this.props.username} is unavailable.  Please try again later.
      </div>);
    }

  }

  /**
   * renders the journal entry component of the console view
   * @returns {*}
   */
  render() {
    let linkButton = this.getLinkButton();
    let linkMessage = this.getLinkMessage();
    return (
      <div id="component" className="journalLink">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column
                  width={14}
                >{linkMessage}
                </Grid.Column>
                <Grid.Column width={2}>
                  {linkButton}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
