import React, {Component} from "react";
/**
 *  This view class is used to show a small window of the person's active status
 */
export default class ActiveStatusView extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }

  }

  componentDidMount() {

  }


  /// renders the view into our root element of our window
  render() {
    return (
      <div id="component" className="activeStatusLayout" >
        <span className="status">
        Are you troubleshooting?
        </span>
      </div>
    );
  }
}
