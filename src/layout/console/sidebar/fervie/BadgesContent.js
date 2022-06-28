import React, {Component} from "react";

export default class BadgesContent extends Component {

  /**
   * gets the badges content panel for the sidebar
   * @returns {*}
   */
  getBadgesContent = () => {
    return (
      <div
        className="badgesContent"
        style={{
          height: 443,
        }}
      >
        <i>Check back later :)</i>
      </div>
    );
  };

  render() {
    return this.getBadgesContent();
  }
}
