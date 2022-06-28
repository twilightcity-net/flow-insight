import React, {Component} from "react";
import {HotkeyClient} from "../clients/HotkeyClient";
import FeatureToggle from "../layout/shared/FeatureToggle";

/**
 *  This view class is used to show a floating hotkey configuration window
 */
export default class GettingStartedView extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }

  }

  componentDidMount() {
    HotkeyClient.init(this);

    this.loadHotkeyContent();
  }

  loadHotkeyContent() {
    HotkeyClient.getConsoleShortcut(this, (arg) => {
      this.setState({
        hotkey: this.getFriendlyHotkey(arg.data)
      });
    });
  }


  getFriendlyHotkey(shortcut) {
    let friendly = "";
    if (shortcut.modifier === "Control") {
      friendly += "ctrl";
    } else if (shortcut.modifier === "Command") {
      friendly += "cmd";
    } else {
      friendly += shortcut.modifier.toLowerCase();
    }
    if (shortcut.hasShift) {
      friendly += " shift";
    }

    if (shortcut.key === "`") {
      friendly += " ~";
    } else {
      friendly += " "+shortcut.key;
    }

    return friendly;
  }


  /// renders the view into our root element of our window
  render() {
    let appName = FeatureToggle.appName;

    if (!this.state.hotkey) {
      return <div id="component" className="gettingStartedLayout" >
      </div>;
    }

    return (
      <div id="component" className="gettingStartedLayout" >
        Press {this.state.hotkey} to open {appName}
      </div>
    );
  }
}
