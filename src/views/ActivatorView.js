import React, { Component } from "react";
import {
  Button,
  Container,
  Divider,
  Form,
  Icon,
  Header,
  Segment,
  Transition
} from "semantic-ui-react";

//
// This view class is used to activate the application
//
export default class ActivatorView extends Component {
  constructor(props) {
    super(props);
    this.animationTime = 500;
    this.state = {
      apiKeyVisible: true,
      termsVisible: false,
      activatingVisible: false
    };
  }

  handleSubmit = () => {
    this.setState({
      apiKeyVisible: false,
      termsVisible: false,
      activatingVisible: false
    });
    setTimeout(() => {
      this.setState({
        termsVisible: true
      });
    }, this.animationTime);
  };

  handleTermsAndConditionsAccept = () => {
    this.setState({
      apiKeyVisible: false,
      termsVisible: false,
      activatingVisible: false
    });
    setTimeout(() => {
      this.setState({
        activatingVisible: true
      });
    }, this.animationTime);
  };

  /// renders the view into our root element of our window
  render() {
    const apiKeyContent = (
      <Container className="apiKeyContent">
        <Header as="h4" floated="left" inverted>
          <Icon size="huge" circular inverted color="violet" name="signup" />
        </Header>
        <Header as="h3" floated="left" inverted>
          <Header.Content>
            Activate Application
            <Header.Subheader>
              Please enter your api-key below and click 'Activate Torchie' to
              continue.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider clearing />
        <Segment className="apiKey" inverted>
          <Form onSubmit={this.handleSubmit} size="big" inverted>
            <Form.Group widths="equal" className="apiKey">
              <Form.Input
                fluid
                label="Api-Key"
                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              />
            </Form.Group>
            <Divider />
            <Button type="submit" size="big" color="violet" animated>
              <Button.Content visible>Activate Torchie</Button.Content>
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
                  Please standby while we verify your api-key with our servers.
                </i>
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>
      </Container>
    );
    return (
      <Segment basic inverted>
        <Transition
          visible={this.state.apiKeyVisible}
          animation="vertical flip"
          duration={this.animationTime}
          unmountOnHide
        >
          {apiKeyContent}
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
      </Segment>
    );
  }
}
