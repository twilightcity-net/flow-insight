import React, {Component} from "react";
import {MemberClient} from "../clients/MemberClient";
import ActiveStatusLayout from "../layout/ActiveStatusLayout";
/**
 *  This view class is used to show a small window of the person's active status
 */
export default class ActiveStatusView extends Component {
  constructor(props) {
    super(props);

    MemberClient.init(this);
    this.state = {
    }

  }

  componentDidMount() {

  }


  /// renders the view into our root element of our window
  render() {
    return (
      <ActiveStatusLayout />
    );
  }
}
