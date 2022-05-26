import React, { Component } from "react";
import {
  Button,
  Grid,
  Icon,
  Segment,
} from "semantic-ui-react";

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

  onClickStartPairing = () => {
    this.props.onClickStartPairing();
  };

  onClickStopPairing = () => {
    this.props.onClickStopPairing();
  };

  onClickCancel = () => {
    this.props.onClickCancelLink();
  };

  onClickConfirm = () => {
    this.props.onClickConfirmLink();
  };

  getLinkButton() {
    let pairingIncludesMe = this.pairingIncludesMe();
    let iAmLinked = this.amILinked();
    let isMemberLinked = this.isMemberLinked();

    if (this.props.isLinking) {
      return (
        <Button
          icon
          className="linkButton"
          onClick={this.onClickCancel}
          size="medium"
          color="grey"
        >
          Cancel&nbsp;
          <Icon name="broken chain" />
        </Button>
      );
    } else if (this.props.incomingPairRequest) {
      return (
        <Button
          icon
          className="linkButton"
          onClick={this.onClickConfirm}
          size="medium"
          color="violet"
        >
          Confirm&nbsp;
          <Icon name="linkify" />
        </Button>
      );
    } else if (isMemberLinked && pairingIncludesMe) {
      return (
        <Button
          icon
          className="linkButton"
          onClick={this.onClickStopPairing}
          size="medium"
          color="red"
        >
          Stop Pairing&nbsp;
          <Icon name="broken chain" />
        </Button>
      );
    } else if (
      !isMemberLinked ||
      (isMemberLinked && !pairingIncludesMe && !iAmLinked)
    ) {
      return (
        <Button
          icon
          className="linkButton"
          onClick={this.onClickStartPairing}
          size="medium"
          color="grey"
        >
          Pair&nbsp;
          <Icon name="chain" />
        </Button>
      );
    } else if (
      isMemberLinked &&
      !pairingIncludesMe &&
      iAmLinked
    ) {
      return (
        <Button
          icon
          className="linkButton"
          onClick={this.onClickStartPairing}
          size="medium"
          color="grey"
          disabled
        >
          Pair&nbsp;
          <Icon name="chain" />
        </Button>
      );
    } else {
      return "";
    }
  }

  getLinkMessage() {
    let isMemberLinked = this.isMemberLinked();

    if (isMemberLinked && this.pairingIncludesMe()) {
      return (
        <div className="linkMessage">
          You are pairing with{" "}
          {this.getPairingUsersStringExcludingOwner(
            this.props.me.username
          )}
        </div>
      );
    } else if (isMemberLinked) {
      return (
        <div className="linkMessage">
          {this.props.username} is pairing with{" "}
          {this.getPairingUsersStringExcludingOwner(
            this.props.username
          )}
        </div>
      );
    } else if (this.props.isLinking) {
      return (
        <div className="linkMessage">
          Waiting for confirmation...
        </div>
      );
    } else if (this.props.incomingPairRequest) {
      return (
        <div className="linkMessage">
          {this.props.username} wants to pair with you.
        </div>
      );
    } else if (this.props.error) {
      return (
        <div className="linkMessage linkError">
          {this.props.username} is unavailable. Please try
          again later.
        </div>
      );
    }
  }

  amILinked() {
    return !!(
      this.props.me && this.props.me.pairingNetwork
    );
  }

  isMemberLinked() {
    return !!(
      this.props.member && this.props.member.pairingNetwork
    );
  }

  pairingIncludesMe() {
    if (
      this.props.member &&
      this.props.member.pairingNetwork
    ) {
      let links =
        this.props.member.pairingNetwork.sparkLinks;
      for (let i = 0; i < links.length; i++) {
        let username = links[i].name;

        if (username === this.props.me.username) {
          return true;
        }
      }
    }
    return false;
  }

  getPairingUsersStringExcludingOwner(username) {
    let usernameStr = "";
    if (
      this.props.member &&
      this.props.member.pairingNetwork
    ) {
      let usernamesNotMe =
        this.getPairingUsersExcludingOwner(username);

      for (let i = 0; i < usernamesNotMe.length; i++) {
        let username = usernamesNotMe[i];

        usernameStr += username;
        if (i === usernamesNotMe.length - 2) {
          usernameStr += " and ";
        } else if (i < usernamesNotMe.length - 1) {
          usernameStr += ", ";
        }
      }
    }
    return usernameStr;
  }

  getPairingUsersExcludingOwner(ownerUsername) {
    let usernames = [];
    if (
      this.props.member &&
      this.props.member.pairingNetwork
    ) {
      let links =
        this.props.member.pairingNetwork.sparkLinks;
      for (let i = 0; i < links.length; i++) {
        let username = links[i].name;

        if (username !== ownerUsername) {
          usernames.push(username);
        }
      }
    }
    return usernames;
  }

  /**
   * renders the journal entry component of the console view
   * @returns {*}
   */
  render() {
    //re-enable this after we've got the backend done
    let linkButton = ""; //this.getLinkButton();
    let linkMessage = ""; // this.getLinkMessage();

    return (
      <div id="component" className="journalLink">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={14}>
                  {linkMessage}
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
