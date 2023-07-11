import React, {Component} from "react";
import {List,} from "semantic-ui-react";
import AccessoryListItem from "./AccessoryListItem";
import SkillListItem from "./SkillListItem";
import {FeatureToggleClient} from "../../../../clients/FeatureToggleClient";
import FeatureToggle from "../../../shared/FeatureToggle";

/**
 * Return the fervie subpanel for showing either skills or accessories
 * for the same set of items
 */
export default class SkillsAccessoriesContent extends Component {

  onSunglassesClick = (itemComp) => {
    if (this.props.fervieAccessory === itemComp.props.fervieAccessory) {
      FeatureToggleClient.toggleOffFeature(FeatureToggle.Toggle.NEO);
      this.props.onUpdateAccessory(null, null);
    } else {
      FeatureToggleClient.toggleOnFeature(FeatureToggle.Toggle.NEO);
      this.props.onUpdateAccessory(itemComp.props.fervieAccessory, "#000000");
    }
  }


  onHeartGlassesClick = (itemComp) => {
    if (this.props.fervieAccessory === itemComp.props.fervieAccessory) {
      this.props.onUpdateAccessory(null, null);
    } else {
      this.props.onUpdateAccessory(itemComp.props.fervieAccessory, "#A12E79");
    }
  }

  /**
   * gets the skills content panel for the sidebar
   * @returns {*}
   */
  getSkillsContent = () => {
    let heartGlassDescription = "Earn 10% bonus XP when you help your teammates troubleshoot, and receive badges for helping out.";
    if (FeatureToggle.isIndividualModeEnabled) {
      heartGlassDescription += " (Requires Add On: Slack Plugin)";
    }
    
    return (
      <div
        className="fervieSkillsContent"
        style={{
          height: 443,
        }}
      >
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          <SkillListItem
            idkey={"1"}
            isActive={this.props.fervieAccessory === "SUNGLASSES"}
            skillName={"Fervie Neo"}
            skillEffect={
              "Earn 10% bonus XP while you learn the command line tools, and receive badges for exploring new commands"
            }
            skillBonus={"+10% bonus XP"}
            currentLevel={this.props.xpSummary.level}
            skillLevelRequired={7}
            xpToLevel={this.props.xpSummary.xpRequiredToLevel}
            accessoryName={"Sunglasses"}
            fervieAccessory={"SUNGLASSES"}
            onSkillItemClick={this.onSunglassesClick}
          />
          <SkillListItem
            idkey={"2"}
            isActive={this.props.fervieAccessory === "HEARTGLASSES"}
            skillName={"Fervie Love"}
            skillEffect={
              heartGlassDescription
            }
            skillBonus={"+10% bonus XP"}
            currentLevel={this.props.xpSummary.level}
            skillLevelRequired={7}
            xpToLevel={this.props.xpSummary.xpRequiredToLevel}
            accessoryName={"Sunglasses"}
            fervieAccessory={"HEARTGLASSES"}
            onSkillItemClick={this.onHeartGlassesClick}
          />
        </List>
      </div>
    );
  };

  /**
   * gets the accessories content panel for the sidebar
   * @returns {*}
   */
  getAccessoriesContent = () => {
    return (
      <div
        className="fervieSkillsContent"
        style={{
          height: 443,
        }}
      >
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          <AccessoryListItem
            idkey={"1"}
            isActive={this.props.fervieAccessory === "SUNGLASSES"}
            moovieWatchCount={this.props.moovieWatchCount}
            moovieWatchCountRequired={5}
            skillName={"Neo Shades"}
            skillEffect={
              "Express your inner Neo.  If Neo can do it, so can Fervies."
            }
            accessoryName={"Sunglasses"}
            fervieAccessory={"SUNGLASSES"}
            onSkillItemClick={this.onSunglassesClick}
          />
          <AccessoryListItem
            idkey={"2"}
            isActive={this.props.fervieAccessory === "HEARTGLASSES"}
            moovieWatchCount={this.props.moovieWatchCount}
            moovieWatchCountRequired={5}
            skillName={"Heart Shades"}
            skillEffect={
              "The perfect shades for making friends at the moovies."
            }
            accessoryName={"Sunglasses"}
            fervieAccessory={"HEARTGLASSES"}
            onSkillItemClick={this.onHeartGlassesClick}
          />
        </List>
      </div>
    );
  };


  render() {
    if (this.props.type === "skills") {
      return this.getSkillsContent();
    } else {
      return this.getAccessoriesContent();
    }
  }
}
