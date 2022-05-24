import React, {Component} from "react";
import {Image} from "semantic-ui-react";

export default class MontyProfile extends Component {
  /**
   * builds our monty profile image for the chat feed
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[MontyProfile]";
  }

  render() {
    return (
      <div className="profileImage">
        <Image src={"./assets/animation/monty/monty_profile.png"}
               className="monty"/>
      </div>
    );
  }

}
