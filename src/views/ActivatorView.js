import React, { Component } from "react";
import { DataStoreFactory } from "../stores/DataStoreFactory";
import { ActivationCodeDto } from "../dto/ActivationCodeDto";
import { RendererEventFactory } from "../events/RendererEventFactory";
import {
  Button,
  Container,
  Divider,
  Form,
  Icon,
  Header,
  Segment,
  Transition,
} from "semantic-ui-react";
import FeatureToggle from "../layout/shared/FeatureToggle";

/**
 * This view class is used to activate the application
 * @class ActivatorView
 * @extends Component
 */
export default class ActivatorView extends Component {
  /**
   * creates a new Activator view for the Activator Window
   * @constructor
   * @param props
   */
  constructor(props) {
    super(props);
    this.animationTime = 500;
    this.activateWaitDelay = 1000;
    this.tokenKeyValue = "";
    this.state = {
      finishedMessage: "",
      submitBtnDisabled: true,
      tokenKeyVisible: true,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false,
    };
    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.ACCOUNT_ACTIVATION,
      this
    );
    this.events = {
      closeActivator: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_ACTIVATOR_CLOSE,
        this
      ),
      saveActivation: RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .APPACTIVATOR_SAVE_ACTIVATION,
        this
      ),
      activationSaved: RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .APPACTIVATOR_ACTIVATION_SAVED,
        this,
        this.onActivationSaved
      ),
    };
  }

  log = (msg) => {
    console.log(`[${this.constructor.name}] ${msg}`);
  };

  onActivationSaved(event, arg) {
    this.log("onActivationSaved");
    this.showSuccessOrFailureContent();
  }

  componentDidMount() {
    this.log("componentDidMount");
    let input = document.getElementById(
      "activator-view-form-tokenKey-input"
    );
    if (input) input.focus();
  }

  /**
   * processes the activation code by loading into a DataStore for API. calls store.load()
   */
  processActivationCode() {
    this.log(
      "process activation code: " + this.tokenKeyValue
    );
    this.store.load(
      new ActivationCodeDto({
        activationCode: this.tokenKeyValue,
      }),
      (err) => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      }
    );
  }

  activationFinished() {
    this.log("activationFinished");
    this.events.closeActivator.dispatch(0, true);
  }

  onStoreLoadCb(err) {
    this.log("onStoreLoadCb");
    if (err) {
      this.store.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED",
      });
      this.showSuccessOrFailureContent();
    } else {
      this.events.saveActivation.dispatch(
        this.store.dto,
        true
      );
    }
  }

  showSuccessOrFailureContent() {
    this.log("showSuccessOrFailureContent");
    this.setState({
      tokenKeyVisible: false,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false,
    });
    setTimeout(() => {
      let accountActivationDto = this.store.dto;
      if (accountActivationDto.isValidToken()) {
        this.setState({
          successVisible: true,
          finishedMessage: accountActivationDto.message,
        });
      } else {
        this.setState({
          failedVisible: true,
          finishedMessage: accountActivationDto.message,
        });
      }
    }, this.animationTime);
  }

  handleChange = (e, { name, value }) => {
    this.log(
      "handleChange : " + value.length + " : " + value
    );
    /// reset the activate button if incorrect value present
    if (value.length > 32) {
      document.getElementById(
        "activator-view-form-tokenKey-input"
      ).value = value.substring(0, 32);
      value = value.substring(0, 32);
    } else if (
      !this.state.submitBtnDisabled ||
      value.length === 0
    ) {
      this.setState({
        submitBtnDisabled: true,
      });
    }
    /// filter out for alpha numeric
    if (!value.match(/^[0-9a-zA-Z]+$/)) {
      let input = document.getElementById(
        "activator-view-form-tokenKey-input"
      );
      input.value = input.value.substring(
        0,
        input.value.length - 1
      );
      return;
    }
    /// enable the activate button if everything is good
    if (
      value !== "" &&
      this.state.submitBtnDisabled &&
      value.length === 32
    ) {
      this.setState({
        submitBtnDisabled: false,
      });
    }
    this.tokenKeyValue = value;
  };

  handleSubmit = () => {
    this.log("handleSubmit");
    this.setState({
      tokenKeyVisible: false,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false,
    });
    setTimeout(() => {
      this.setState({
        termsVisible: true,
      });
    }, this.animationTime);
  };

  handleTermsAndConditionsAccept = () => {
    this.log("handleTermsAndConditionsAccept");
    this.setState({
      tokenKeyVisible: false,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false,
    });
    setTimeout(() => {
      this.setState({
        activatingVisible: true,
      });
      setTimeout(() => {
        this.processActivationCode();
      }, this.animationTime * 2);
    }, this.animationTime);
  };

  handleFinishedActivating = () => {
    this.activationFinished();
  };

  handleErrorActivating = () => {
    console.log("Error... try again");
    this.setState({
      tokenKeyVisible: false,
      termsVisible: false,
      activatingVisible: false,
      successVisible: false,
      failedVisible: false,
    });
    setTimeout(() => {
      this.tokenKeyValue = "";
      this.setState({
        tokenKeyVisible: true,
        submitBtnDisabled: true,
      });
      let input = document.getElementById(
        "activator-view-form-tokenKey-input"
      );
      input.value = "";
      input.focus();
    }, this.animationTime);
  };

  /// renders the view into our root element of our window
  render() {
    const tokenContent = (
      <Container className="tokenContent">
        <Header as="h4" floated="left" inverted>
          <Icon
            size="huge"
            circular
            inverted
            color="violet"
            name="signup"
          />
        </Header>
        <Header as="h3" floated="left" inverted>
          <Header.Content>
            Activate Application
            <Header.Subheader>
              Please enter your &apos;Activation Token&apos;
              provided and click &apos;Activate&apos;.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Segment className="tokenKey" inverted>
          <Form
            onSubmit={this.handleSubmit}
            size="big"
            inverted
          >
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
              disabled={this.state.submitBtnDisabled}
            >
              Activate
            </Button>
          </Form>
        </Segment>
      </Container>
    );

    const appName = FeatureToggle.appName;

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
              Please read the following and click &apos;I
              Agree to Terms&apos; to continue.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Segment className="terms" inverted>
          <p>****** End-User License Agreement ******</p>
          <p>
            This License Agreement (&quot;Agreement&quot;)
            is made between you (the &quot;Licensee&quot;)
            and Twilight City, Inc. (the
            &quot;Licensor&quot;). The terms of this
            Agreement apply to all current and future
            versions and updates of {appName}
            application software
            (&quot;{appName}&quot;).
          </p>
          <p>
            By installing, enabling or using {appName},
            Licensee agrees with all the terms of this
            Agreement. Licensor reserves all rights not
            specifically granted and transferred to
            Licensee.
          </p>
          <p>
            Licensee understands, acknowledges and agrees
            with the following:
          </p>
          <ul>
            <li>
              Licensor grants Licensee a non-exclusive and
              non-transferable license to use {appName}
              for non-commercial purposes only. Licensee
              therefore does not own {appName}, Licensor
              remains the owner of {appName}.
            </li>
            <li>
              Licensor provides {appName} on an &quot;as
              is&quot; basis without warranty of any kind.
              Licensor neither guarantees the correct,
              error-free functioning of {appName} nor is Licensor
              responsible for any damage caused by the use
              of {appName}.
            </li>
            <li>
              Licensee may not decompile, disassemble,
              reverse-engineer, modify or redistribute
              {appName} in any way.
            </li>
            <li>
              {appName} will automatically, without notice to
              Licensee, download and install updates from
              time to time.
            </li>
            <li>
              {appName} may report and store Licensee&apos;s
              Internet Protocol address, account name and
              identifier, in-app nickname, email address, and
              system-related and hardware-related
              information including, but not limited to,
              device identifiers and hardware serial
              numbers.
            </li>
            <li>
              Licensor values Licensee&apos;s privacy and
              does its utmost to protect it at all times.
              {appName} does not report any personally
              identifiable information or personal data
              except for any information/data specifically
              mentioned herein.
            </li>
            <li>
              Licensor stores all information collected by
              {appName} on servers located in Europe and/or the US.
              Licensor may share the information with its
              partners and/or affiliates.
            </li>
            <li>
              Licensor is allowed to terminate the license
              at any time for any reason and without notice
              to Licensee.
            </li>
          </ul>

          <p>
            This License Agreement constitutes the entire
            agreement between Licensor and Licensee and
            supersedes any prior statements.
          </p>
        </Segment>
        <Divider />
        <Button
          onClick={this.handleTermsAndConditionsAccept}
          size="big"
          color="violet"
        >
          I Agree to Terms
        </Button>
      </Container>
    );
    const activatingContent = (
      <Container className="activatingContent">
        <Segment textAlign="center" inverted>
          <Icon
            loading
            size="huge"
            name="spinner"
            color="violet"
          />
          <Divider clearing />
          <Header as="h3" floated="left" inverted>
            <Header.Content>
              Activating {appName}...
              <Header.Subheader>
                <i>
                  Please standby while we verify your
                  &apos;Activation Token&apos; with our
                  servers.
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
          <Icon
            size="huge"
            name="checkmark box"
            color="green"
          />
          <Divider clearing />
          <Header as="h3" floated="left" inverted>
            <Header.Content>
              Successfully Activated =]
              <Header.Subheader>
                <i>{this.state.finishedMessage}</i>
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
          <Icon
            size="huge"
            name="warning circle"
            color="red"
          />
          <Divider clearing />
          <Header as="h3" floated="left" inverted>
            <Header.Content>
              Unable to Activate
              <Header.Subheader>
                <i>{this.state.finishedMessage}</i>
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>
        <Divider clearing />
        <Container textAlign="center">
          <Button
            onClick={this.handleErrorActivating}
            size="big"
            color="red"
          >
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
