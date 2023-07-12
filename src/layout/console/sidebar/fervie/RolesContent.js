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
export default class RolesContent extends Component {

  /**
   * gets the accessories content panel for the sidebar
   * @returns {*}
   */
  getRolesContent = () => {
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
        </List>
        <div >
          <i>A "Role" is a recommended skill set with a name.  Use your skills to support a fervie role for your team.</i>
        </div>
      </div>
    );
  };


  render() {
    return this.getRolesContent();
  }
}
