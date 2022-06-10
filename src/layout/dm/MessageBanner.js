import React, {Component} from "react";
import UtilRenderer from "../../UtilRenderer";
import FervieProfile from "../shared/FervieProfile";

/**
 * this component is the DM message banner that gives you a little info about the chat window
 */
export default class MessageBanner extends Component {

  /**
   * Initialize the layout
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[ChatInput]";
    this.state = {
      chatValue: ""
    };
    this.isEnterKeyPressed = false;
    this.timer = null;
  }

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
  };


  /**
   * renders the layout of the view
   * @returns {*} - the JSX to render
   */
  render() {
    let title = ".";
    let username = "";
    let profileImage = "";
    if (this.props.member) {
      title = this.props.member.fervieName;
      username = "@"+this.props.member.username;

      profileImage = (<FervieProfile
        showPopup={false}
        isBuddy={false}
        hasBuddyActions={false}
        circuitMember={this.props.member}
      />);
    }

    return (
     <div className="chatBanner">
       <span className="profileImage">{profileImage}</span>
       <span className="title"> {title}</span>
       <span className="username"> { username}</span>
     </div>
    );
  }
}
