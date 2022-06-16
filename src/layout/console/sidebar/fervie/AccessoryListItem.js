import React, { Component } from "react";
import {
  Icon,
  Label,
  List,
  Popup,
} from "semantic-ui-react";

export default class AccessoryListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timerIcon: "gem",
      timerColor: "violet",
    };
  }

  /**
   * this is called when we unmount the component so that we can clear any active listeners
   * for memory management.
   */
  componentWillUnmount() {}

  handleClick = () => {
    this.props.onSkillItemClick(this);
  };

  getClassName() {
    return this.timerColor;
  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let popupContent = (
      <div>
        <div className="skill">
          <div className="skillname">
            <b>
              {this.props.skillName}{" "}
              {this.props.isActive ? " (Active)" : ""}
            </b>
          </div>
          <div className="description">
            <i>{this.props.skillEffect}</i>
          </div>
        </div>
      </div>
    );

    return (
      <Popup
        trigger={trigger}
        className="skillPopup chunkTitle"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }

  /**
   * renders our popup content for a disabled skill card
   * @param trigger
   * @returns {*}
   */
  getDisabledPopupContent(trigger) {
    let popupContent = (
      <div>
        <div className="skill">
          <div className="skillname">
            <b>
              Accessory
            </b>
          </div>
          <div className="description">
            <i>
              Unlock by watching {this.props.moovieWatchCountRequired} moovies
            </i>
          </div>
        </div>
      </div>
    );

    return (
      <Popup
        trigger={trigger}
        className="skillPopup chunkTitle"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }

  getDisabledSkillCard() {
    return (
      <List.Item
        className={this.getClassName() + "disabled"}
        key={this.props.idkey}
      >
        <List.Content
          floated="right"
          verticalAlign="middle"
          className={"skillBonusButton"}
        >
          <Label
            color={this.state.timerColor}
            className={"disabled"}
          >
            <span>
              <Icon name={this.state.timerIcon} />
            </span>
          </Label>
        </List.Content>
        <List.Content>
          <List.Header>
            {"Accessory"}
          </List.Header>
          <i className="description">
            ({this.props.accessoryName})
          </i>
        </List.Content>
      </List.Item>
    );
  }

  getSkillCard() {
    return (
      <List.Item
        className={
          this.getClassName() +
          (this.props.isActive ? " active" : "")
        }
        key={this.props.idkey}
        onClick={this.handleClick}
      >
        <List.Content
          floated="right"
          verticalAlign="middle"
          className={"skillBonusButton"}
        >
          <Label
            color={this.state.timerColor}
            className={this.props.isActive ? "active" : ""}
          >
            <span>
              <Icon name={this.state.timerIcon} />{" "}
            </span>
          </Label>
        </List.Content>
        <List.Content>
          <List.Header>{this.props.skillName}</List.Header>
          <i className="description">
            ({this.props.accessoryName})
          </i>
        </List.Content>
      </List.Item>
    );
  }

  render() {
    if (this.props.moovieWatchCount < this.props.moovieWatchCountRequired) {
      return this.getDisabledPopupContent(
        this.getDisabledSkillCard()
      );
    } else {
      return this.getPopupContent(this.getSkillCard());
    }
  }
}
