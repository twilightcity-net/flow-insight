import React, {Component} from "react";
import {HotkeyClient} from "../clients/HotkeyClient";
import FeatureToggle from "../layout/shared/FeatureToggle";
import FervieProfile from "../layout/shared/FervieProfile";
import FervieButtonLayout from "../layout/FervieButtonLayout";
import {MemberClient} from "../clients/MemberClient";

/**
 *  This view class is used to show a little fervie button,
 *  in the lower right-hand corner of your screen.
 */
export default class FervieView extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {
    MemberClient.init(this);
  }

  /// renders the view into our root element of our window
  render() {
    return (
      <FervieButtonLayout />
    );
  }
}
