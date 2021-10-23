import React, { Component } from "react";
import {
  Icon,
  Label,
  List,
  Popup
} from "semantic-ui-react";
import { LearningCircuitModel } from "../../../../models/LearningCircuitModel";
import UtilRenderer from "../../../../UtilRenderer";
import moment from "moment";

export default class SkillListItem extends Component {
  constructor(props) {
    super(props);
    this.wtfTimer = null;

    this.state = {
      isSelected: false,
      isRetro: false,
      time: "00:00",
      timerIcon: "gem",
      timerColor: "violet"
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
      //show XP remaining in the tooltip

      <div>
        <div className="skill">
          <div className="skillname">
            <b>
              Skill requires level{" "}
              {this.props.skillLevelRequired}
            </b>
          </div>
          <div className="description">
            <i>
              {this.props.xpToLevel + " XP to next level"}
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
              <Icon name={this.state.timerIcon} /> {"???"}
            </span>
          </Label>
        </List.Content>
        <List.Content>
          <List.Header>
            {"Unlock at level " +
              this.props.skillLevelRequired}
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
              {this.props.skillBonus}
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
    if (
      this.props.currentLevel <
      this.props.skillLevelRequired
    ) {
      return this.getDisabledPopupContent(
        this.getDisabledSkillCard()
      );
    } else {
      return this.getPopupContent(this.getSkillCard());
    }
  }
}
