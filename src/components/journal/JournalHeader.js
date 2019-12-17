import React, {Component} from "react";
import {Segment, Breadcrumb, Input, Button, Icon} from "semantic-ui-react";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalItems extends Component {

  /**
   * the constructor for the array of journal items to display
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[JournalHeader]";
    this.state = {
      disableControls: false
    };
  }

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocusForIntention = e => {
    console.log(this.name + " - handleFocusForIntention");
    document.getElementById("createIntentionInput").classList.add("focused");
    document.getElementById("browserGoInput").classList.add("focused");
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all
   * form element inputs
   * @param e
   */
  handleBlurForInput = e => {
    console.log(this.name + " - handleBlurForInput");
    document.getElementById("createIntentionInput").classList.remove("focused");
    document.getElementById("browserGoInput").classList.remove("focused");
  };

  /**
   * renders the journal items component from array in the console view
   * @returns {*} - the JSX to render for the journal header
   */
  render() {
    return (
      <div id="component" className="journalHeader">
        <Segment inverted>
          <div>
            <Input
              disabled={this.state.disableControls}
              // disabled={true}
              id="intentionTextInput"
              className="intentionText"
              fluid
              inverted
              value={"talk://journal/" + this.props.member}
              // value={this.state.currentIntentionValue}
              onFocus={this.handleFocusForIntention}
              onBlur={this.handleBlurForInput}
              // onKeyPress={this.handleKeyPressForIntention}
              // onChange={this.handleChangeForIntention}
              placeholder={"talk://journal/" + this.props.member}
            >
              <Button animated='vertical'>
                <Button.Content hidden>Back</Button.Content>
                <Button.Content visible>
                  <Icon name='backward'/>
                </Button.Content>
              </Button>
              <Button animated='vertical'>
                <Button.Content hidden>Forward</Button.Content>
                <Button.Content visible>
                  <Icon name='forward'/>
                </Button.Content>
              </Button>
              <input/>
              <Button animated='vertical' className={"browserGo"} id={"browserGoInput"}>
                <Button.Content hidden>Go ></Button.Content>
                <Button.Content visible>
                  <Icon name='share'/>
                </Button.Content>
              </Button>
              <Button animated='vertical'>
                <Button.Content hidden>Share</Button.Content>
                <Button.Content visible>
                  <Icon name='external share'/>
                </Button.Content>
              </Button>
            </Input>
          </div>
        </Segment>
      </div>
    );
  }
}
