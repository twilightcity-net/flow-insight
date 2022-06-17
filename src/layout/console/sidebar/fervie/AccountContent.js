import React, {Component} from "react";

export default class AccountContent extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * gets the account content panel for the sidebar
   * @returns {*}
   */
  getAccountContent = () => {
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
    return this.getAccountContent();
  }
}
