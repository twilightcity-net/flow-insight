import React, {Component} from "react";
import {Grid, Popup} from "semantic-ui-react";

/**
 * this component is the metrics table row for friction-y boxes
 */
export default class TaskMetricRow extends Component {
  /**
   * builds our friction box metric rows
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TaskMetricRow]";
    this.state = {};
  }


  /**
   * Create an svg rendering of a momentum square
   * @param confusionPercent
   * @param momentumColor
   */
  getMomentumSquare(confusionPercent, momentumColor, momentum) {

    let cellSize = 25;
    let confusionFillHeight = Math.ceil((confusionPercent / 100) * cellSize);
    let confusionPositionOffset = Math.floor((1 - (confusionPercent / 100)) * cellSize );

    let svgContent = (
      <svg  x="0px" y="0px" width={cellSize + "px"} height={cellSize + "px"} viewBox={"0 0 "+cellSize + " " + cellSize} >
        <defs />
        <rect x="0" y="0" width={cellSize} height={cellSize} fill={momentumColor}/>
        <rect x="0" y={confusionPositionOffset} width="30" height={confusionFillHeight} fill="#FF2C36"/>
      </svg>);

    let popupContent = (
      <div>Momentum: {momentum}</div>
    )

    return (<Popup
      flowing
      trigger={svgContent}
      className="metricContent"
      content={popupContent}
      position="bottom center"
      inverted
      hideOnScroll
    />);
  }

  onClickFlowMap() {
    console.log("Click flow map!");
  }

  /**
   * renders our row in our grid
   * @returns {*}
   */
  render() {
    let momentumSquare = this.getMomentumSquare(this.props.confusionPercent, this.props.momentumColor, this.props.momentum);

    let userColumn = "";
    let taskColumnSize = 9;

    if (this.props.targetType === "team") {
      userColumn = (
        <Grid.Column width={2}>
        <div className="chunkText">{this.props.username}</div>
      </Grid.Column>);
      taskColumnSize = 7;
    }

    return (
      <Grid.Row
        id={this.props.id + "-row"}
        className={"metricRow clickableRow"}
        onClick={() =>
          this.props.onRowClick(this.props.id)
        }
      >
        {userColumn}
          <Grid.Column width={taskColumnSize}>
            <div>
            <div className="circuitTitle">{this.props.taskName}</div>
            <div className="chunkText">{this.props.taskDescription}</div>
           </div>
          </Grid.Column>
        <Grid.Column width={2}>
          <div className="chunkText metricRight">{this.props.duration}</div>
        </Grid.Column>
          <Grid.Column width={3}>
            <div className="chunkText metricRight">{this.props.confusionDuration}</div>
          </Grid.Column>
          <Grid.Column width={2}>
            <div className="chunkText metricRight">{momentumSquare}</div>
          </Grid.Column>
      </Grid.Row>
    );

  }
}
