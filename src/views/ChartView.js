import React, {Component} from "react";

/**
 *  This view class is used to show a floating draggable IFM chart
 */
export default class ChartView extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    if (this.props.routeProps) {
      document.title = "Task Flow for "+this.props.routeProps.circuitName;
    }
  }

  /// renders the view into our root element of our window
  render() {
    let circuitName = "";

    if (this.props.routeProps) {
      circuitName = this.props.routeProps.circuitName;
    }

    return (
      <div>Chart goes here for circuit {circuitName}</div>
    );
  }
}
