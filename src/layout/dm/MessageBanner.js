import React, {Component} from "react";
import FervieProfile from "../shared/FervieProfile";
import FeatureToggle from "../shared/FeatureToggle";

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
    let offline = "";
    let offlineClass = "";
    if (this.props.member) {
      if (FeatureToggle.isMoovieApp()) {
        title = this.props.member.fervieName;
      } else {
        title = this.props.member.displayName;
      }
      username = "@"+this.props.member.username;

      if (!title) {
        title = username;
      }

      if (this.props.member.onlineStatus !== "Online") {
        offline = " (Offline)";
        offlineClass = " offline";
      }

      profileImage = (<FervieProfile
        showPopup={false}
        isBuddy={false}
        hasBuddyActions={false}
        circuitMember={this.props.member}
      />);
    }

    return (
     <div className="chatBanner">
       <span className={"profileImage"+offlineClass}>{profileImage}</span>
       <span className={"title" + offlineClass}> {title+offline}</span>
       <span className={"username"+offlineClass}> { username}</span>
     </div>
    );
  }
}
