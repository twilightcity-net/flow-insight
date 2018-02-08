import React, { Component } from "react";
import { DataStoreFactory } from "../DataStoreFactory";
import {
  Button,
  Container,
  Divider,
  Form,
  Icon,
  Header,
  Popup,
  Segment,
  Transition
} from "semantic-ui-react";

const { remote } = window.require("electron"),
  ActivationTokenDto = remote.require("./dto/ActivationTokenDto");

//
// This view class is used to activate the application
//
export default class ActivatorView extends Component {
  constructor(props) {
    super(props);
    this.animationTime = 500;
    this.activateWaitDelay = 2000;
    this.tokenKeyValue = "";
    this.state = {
      submitBtnDisabled: true,
      tokenKeyVisible: true,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false
    };
    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.ACCOUNT_ACTIVATION,
      this
    );
  }

  processApiKey() {
    this.store.load(
      new ActivationTokenDto({
        activationToken: this.tokenKeyValue
      }),
      () => {
        setTimeout(() => {
          this.onStoreLoadCb();
        }, this.activateWaitDelay);
      }
    );
  }

  onStoreLoadCb() {
    console.log("onLoadStoreCb");

    this.setState({
      tokenKeyVisible: false,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false
    });
    setTimeout(() => {
      if (true) {
        this.setState({
          successVisible: true
        });
        console.log(this.store);
      } else {
        this.setState({
          failedVisible: true
        });
      }
    }, this.animationTime);
  }

  handleChange = (e, { name, value }) => {
    /// reset the activate button if incorrect value present
    if (value.length > 20) {
      document.getElementById(
        "activator-view-form-tokenKey-input"
      ).value = value.substring(0, 20);
    } else if (!this.state.submitBtnDisabled || value.length === 0) {
      this.setState({
        submitBtnDisabled: true
      });
    }
    /// filter out for alpha numeric
    if (!value.match(/^[0-9a-zA-Z]+$/)) {
      let input = document.getElementById("activator-view-form-tokenKey-input");
      input.value = input.value.substring(0, input.value.length - 1);
      return;
    }
    /// enable the activate button if everything is good
    if (value !== "" && this.state.submitBtnDisabled && value.length === 20) {
      this.setState({
        submitBtnDisabled: false
      });
    }
    this.tokenKeyValue = value;
  };

  handleSubmit = () => {
    this.setState({
      tokenKeyVisible: false,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false
    });
    setTimeout(() => {
      this.setState({
        termsVisible: true
      });
    }, this.animationTime);
  };

  handleTermsAndConditionsAccept = () => {
    this.setState({
      tokenKeyVisible: false,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false
    });
    setTimeout(() => {
      this.setState({
        activatingVisible: true
      });
      setTimeout(() => {
        this.processApiKey();
      }, this.animationTime * 2);
    }, this.animationTime);
  };

  handleFinishedActivating = () => {
    console.log("Finished... close window");

    // TODO fire event for activation finished
  };

  handleErrorActivating = () => {
    console.log("Error... try again");
  };

  /// renders the view into our root element of our window
  render() {
    const tokenContent = (
      <Container className="tokenContent">
        <Header as="h4" floated="left" inverted>
          <Icon size="huge" circular inverted color="violet" name="signup" />
        </Header>
        <Header as="h3" floated="left" inverted>
          <Header.Content>
            Activate Application
            <Header.Subheader>
              Please enter your 'Activation Token' provided and click
              'Activate'.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Segment className="tokenKey" inverted>
          <Form onSubmit={this.handleSubmit} size="big" inverted>
            <Form.Group widths="equal" className="tokenKey">
              <Form.Input
                id="activator-view-form-tokenKey-input"
                fluid
                label="Activation Token:"
                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                name="name"
                onChange={this.handleChange}
              />
            </Form.Group>
            <Divider />
            <Button
              type="submit"
              size="big"
              color="violet"
              animated
              disabled={this.state.submitBtnDisabled}
            >
              <Button.Content visible>Activate</Button.Content>
              <Button.Content hidden>
                continue
                <Icon name="right arrow" />
              </Button.Content>
            </Button>
          </Form>
        </Segment>
      </Container>
    );
    const termsContent = (
      <Container className="termsContent">
        <Header as="h4" floated="left" inverted>
          <Icon
            size="huge"
            circular
            inverted
            color="violet"
            name="announcement"
          />
        </Header>
        <Header as="h3" floated="left" inverted>
          <Header.Content>
            Accept Terms and Conditions
            <Header.Subheader>
              Please read the following and click 'I Agree to Terms' to
              continue.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Segment className="terms" inverted>
          <p>****** End-User License Agreement ******</p>
          <p>
            This License Agreement ("Agreement") is made between you (the
            "Licensee") and DreamScale, Inc. (the "Licensor"). The terms of this
            Agreement apply to all current and future versions and updates of
            Torchie collborative troubleshooting software ("Torchie").
          </p>
          <p>
            By installing, enabling or using Torchie, Licensee agrees with all
            the terms of this Agreement. Licensor reserves all rights not
            specifically granted and transferred to Licensee.
          </p>
          <p>
            Licensee understands, acknowledges and agrees with the following:
          </p>
          <ul>
            <li>
              Licensor grants Licensee a non-exclusive and non-transferable
              license to use Torchie for non-commercial purposes only. Licensee
              therefore does not own Torchie, Licensor remains the owner of
              Torchie.
            </li>
            <li>
              Licensor provides Torchie on an "as is" basis without warranty of
              any kind. Licensor neither guarantees the correct, error-free
              functioning of Torchie nor is Licensor responsible for any damage
              caused by the use of Torchie.
            </li>
            <li>
              Licensee may not decompile, disassemble, reverse-engineer, modify
              or redistribute Torchie in any way.
            </li>
            <li>
              Torchie will automatically, without notice to Licensee, download
              and install updates from time to time.
            </li>
            <li>
              Torchie may scan Licensee's entire random access memory (RAM), and
              any software-related and system-related files and folders on
              Licensee's system using hueristic-algorithms, report results of
              such algorithms to other connected computers and/or to Licensor
              and store such information for the sole purpose of troubleshooting
              software issues. Torchie only scans and/or reports data which
              absolutely needs to be scanned and/or reported to meet this
              purpose.
            </li>
            <li>
              Torchie may further report and store Licensee's Internet Protocol
              address, account name and identifier, in-app nickname, and
              system-related and hardware-related information including, but not
              limited to, device identifiers and hardware serial numbers.
            </li>
            <li>
              Licensor values Licensee's privacy and does its utmost to protect
              it at all times. Torchie does not report any personally
              identifiable information or personal data except for any
              information/data specifically mentioned herein.
            </li>
            <li>
              Licensor stores all information collected by Torchie on servers
              located in Europe and/or the US. Licensor may share the
              information with its partners and/or affiliates.
            </li>
            <li>
              {" "}
              Licensee acknowledges that the invasive nature of Torchie is
              necessary to meet its purpose and goal of troubleshooting software
              development.
            </li>
            <li>
              Licensor is allowed to terminate the license at any time for any
              reason and without notice to Licensee.
            </li>
          </ul>

          <p>
            This License Agreement constitutes the entire agreement between
            Licensor and Licensee and supersedes any prior statements.
          </p>
        </Segment>
        <Divider />
        <Button
          onClick={this.handleTermsAndConditionsAccept}
          size="big"
          color="violet"
          animated
        >
          <Button.Content visible>I Agree to Terms</Button.Content>
          <Button.Content hidden>
            continue
            <Icon name="right arrow" />
          </Button.Content>
        </Button>
      </Container>
    );
    const activatingContent = (
      <Container className="activatingContent">
        <Segment textAlign="center" inverted>
          <Icon loading size="huge" name="spinner" color="violet" />
          <Divider clearing />
          <Header as="h3" floated="left" inverted>
            <Header.Content>
              Activating Torchie...
              <Header.Subheader>
                <i>
                  Please standby while we verify your 'Activation Token' with
                  our servers.
                </i>
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>
      </Container>
    );
    const successContent = (
      <Container className="successContent">
        <Segment textAlign="center" inverted>
          <Icon size="huge" name="checkmark box" color="green" />
          <Divider clearing />
          <Header as="h3" floated="left" inverted>
            <Header.Content>
              Successfully Activated =]
              <Header.Subheader>
                <i>Thank you for activating your Torchie application!</i>
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>
        <Divider clearing />
        <Container textAlign="center">
          <Button
            onClick={this.handleFinishedActivating}
            size="big"
            color="green"
          >
            Okay
          </Button>
        </Container>
      </Container>
    );
    const failedContent = (
      <Container className="failedContent">
        <Segment textAlign="center" inverted>
          <Icon size="huge" name="warning circle" color="red" />
          <Divider clearing />
          <Header as="h3" floated="left" inverted>
            <Header.Content>
              Unable to Activate
              <Header.Subheader>
                <i>Oops, we were unable to activate with the token provided.</i>
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>
        <Divider clearing />
        <Container textAlign="center">
          <Button onClick={this.handleErrorActivating} size="big" color="red">
            Try Again
          </Button>
        </Container>
      </Container>
    );
    return (
      <Segment basic inverted>
        <Transition
          visible={this.state.tokenKeyVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {tokenContent}
        </Transition>
        <Transition
          visible={this.state.termsVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {termsContent}
        </Transition>
        <Transition
          visible={this.state.activatingVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {activatingContent}
        </Transition>
        <Transition
          visible={this.state.successVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {successContent}
        </Transition>
        <Transition
          visible={this.state.failedVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {failedContent}
        </Transition>
      </Segment>
    );
  }
}
