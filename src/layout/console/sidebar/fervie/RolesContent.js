import React, {Component} from "react";
import {List,} from "semantic-ui-react";

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
          <i>A "Role" is a recommended skill set with a name.<br/>Use your skills to support a fervie role.</i>
        </div>
      </div>
    );
  };


  render() {
    return this.getRolesContent();
  }
}
