import React, {Component} from "react";
import {Image, Popup} from "semantic-ui-react";

export default class MontyProfile extends Component {
  /**
   * builds our monty profile image for the chat feed
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[MontyProfile]";
  }

  getMontyProfileContent() {
    return (
      <Image src={"./assets/animation/monty/monty_profile.png"}
             className="monty"/>
    );
  }

  render() {
    const popupContent =  (<Popup.Content>Monty</Popup.Content>);

    return (<div className="profileImage">
      <Popup
      trigger={this.getMontyProfileContent()}
      content={popupContent}
      position="bottom left"
      inverted
      hideOnScroll
    /></div>);
  }

}
