import React, { Component } from "react";
import { Divider, Grid, Segment, Button } from "semantic-ui-react";
import { DataModelFactory } from "../../models/DataModelFactory";
import { ActiveCircleModel } from "../../models/ActiveCircleModel";
import { WTFTimer } from "../../models/WTFTimer";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class TroubleshootOpen extends Component {
  /**
   * the constructor, duh
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TroubleshootOpen]";
    this.myController = props.ctlr;

    this.state = {
      chatInputValue: "",
      formattedWTFTimer: "00:00"
    };

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );

    this.wtfTimer = DataModelFactory.createModel(
      DataModelFactory.Models.WTF_TIMER,
      this
    );
  }

  componentDidMount = () => {
    console.log(this.name + " - componentDidMount");
    this.wtfTimer.registerListener(
      "TroubleshootOpen",
      WTFTimer.CallbackEvent.WTF_TIMER_SECONDS_UPDATE,
      this.onTimerUpdate
    );

    this.activeCircleModel.registerListener(
      "TroubleshootOpen",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onCircleUpdate
    );

    this.onCircleUpdate();
    this.onTimerUpdate();
    this.wtfTimer.startTimer();
  };

  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.wtfTimer.stopTimer();
    this.activeCircleModel.unregisterAllListeners("TroubleshootOpen");
    this.wtfTimer.unregisterAllListeners("TroubleshootOpen");
  };

  /**
   * when the cir4ucle updates
   */
  onCircleUpdate = () => {
    console.log(this.name + " - onCircleUpdate");

    let activeCircle = this.activeCircleModel.getActiveScope().activeCircle;
    let circleName = this.activeCircleModel.getActiveScope().circleName;

    let circleOwner = this.activeCircleModel.getActiveScope().getCircleOwner();

    let formattedTime = this.wtfTimer.wtfTimerInSeconds;
    this.setState({
      formattedWTFTimer: formattedTime,
      activeCircle: activeCircle,
      circleName: circleName,
      circleOwner: circleOwner
    });
  };

  onTimerUpdate = () => {
    this.setState({
      formattedWTFTimer: this.wtfTimer.wtfTimerInSeconds
    });
  };

  onClickStopTroubleshooting = () => {
    console.log(this.name + " - on click stop troubleshooting");

    this.props.onStopTroubleshooting();
  };

  /**
   * renders the default troubleshoot component in the console view
   */
  render() {
    // let feedEvents = [
    //   {
    //     user: "Arty Starr",
    //     type: "chat",
    //     labelImg: "/images/avatar/small/elliot.jpg",
    //     dateStr: "1 Hour Ago",
    //     likes: 4
    //   }
    // ];

    // let feedPanel = (
    //   <Feed>
    //     <Feed.Event>
    //       <Feed.Label>
    //         <img src={feedEvents[0].labelImg} alt={"alt"} />
    //       </Feed.Label>
    //       <Feed.Content>
    //         <Feed.Summary>
    //           <Feed.User>{feedEvents[0].user}</Feed.User> joined the sess.
    //           <Feed.Date>{feedEvents[0].dateStr}</Feed.Date>
    //         </Feed.Summary>
    //         <Feed.Meta>
    //           <Feed.Like>
    //             <Icon name="like" />
    //             {feedEvents[0].likes} Likes
    //           </Feed.Like>
    //         </Feed.Meta>
    //       </Feed.Content>
    //     </Feed.Event>
    //
    //     <Feed.Event>
    //       <Feed.Label image="/images/avatar/small/helen.jpg" alt={"alt"} />
    //       <Feed.Content>
    //         <Feed.Summary>
    //           <a>Helen Troy</a> added <a>2 new illustrations</a>
    //           <Feed.Date>4 days ago</Feed.Date>
    //         </Feed.Summary>
    //         <Feed.Extra images>
    //           <a>
    //             <img src="/images/wireframe/image.png" alt={"alt"} />
    //           </a>
    //           <a>
    //             <img src="/images/wireframe/image.png" alt={"alt"} />
    //           </a>
    //         </Feed.Extra>
    //         <Feed.Meta>
    //           <Feed.Like>
    //             <Icon name="like" />1 Like
    //           </Feed.Like>
    //         </Feed.Meta>
    //       </Feed.Content>
    //     </Feed.Event>
    //
    //     <Feed.Event>
    //       <Feed.Label image="/images/avatar/small/jenny.jpg" alt={"alt"} />
    //       <Feed.Content>
    //         <Feed.Summary
    //           date="2 Days Ago"
    //           user="Jenny Hess"
    //           content="add you as a friend"
    //         />
    //         <Feed.Meta>
    //           <Feed.Like>
    //             <Icon name="like" />8 Likes
    //           </Feed.Like>
    //         </Feed.Meta>
    //       </Feed.Content>
    //     </Feed.Event>
    //
    //     <Feed.Event>
    //       <Feed.Label image="/images/avatar/small/joe.jpg" alt={"alt"} />
    //       <Feed.Content>
    //         <Feed.Summary>
    //           <a>Joe Henderson</a> posted on his page
    //           <Feed.Date>3 days ago</Feed.Date>
    //         </Feed.Summary>
    //         <Feed.Extra text>
    //           Ours is a life of constant reruns. We're always circling back to
    //           where we'd we started, then starting all over again. Even if we
    //           don't run extra laps that day, we surely will come back for more
    //           of the same another day soon.
    //         </Feed.Extra>
    //         <Feed.Meta>
    //           <Feed.Like>
    //             <Icon name="like" />5 Likes
    //           </Feed.Like>
    //         </Feed.Meta>
    //       </Feed.Content>
    //     </Feed.Event>
    //
    //     <Feed.Event>
    //       <Feed.Label image="/images/avatar/small/justen.jpg" alt={"alt"} />
    //       <Feed.Content>
    //         <Feed.Summary>
    //           <a>Justen Kitsune</a> added <a>2 new photos</a> of you
    //           <Feed.Date>4 days ago</Feed.Date>
    //         </Feed.Summary>
    //         <Feed.Extra images>
    //           <a>
    //             <img src="/images/wireframe/image.png" alt={"alt"} />
    //           </a>
    //           <a>
    //             <img src="/images/wireframe/image.png" alt={"alt"} />
    //           </a>
    //         </Feed.Extra>
    //         <Feed.Meta>
    //           <Feed.Like>
    //             <Icon name="like" />
    //             41 Likes
    //           </Feed.Like>
    //         </Feed.Meta>
    //       </Feed.Content>
    //     </Feed.Event>
    //   </Feed>
    // );

    return (
      <div id="component" className="troubleshootPanelOpenDefault">
        {/*{feedPanel}*/}
        <Divider hidden fitted clearing />
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={6} className="rootLayout">
            <Segment className="wtf" inverted>
              <div>Circle: {this.state.circleName}</div>
              <div>Owner: {this.state.circleOwner}</div>
              <div>{this.state.formattedWTFTimer}</div>
              <Button
                onClick={this.onClickStopTroubleshooting}
                size="big"
                color="purple"
                animated="fade"
                attached="bottom"
              >
                <Button.Content visible>Solved!</Button.Content>
                <Button.Content hidden>YAY!</Button.Content>
              </Button>
            </Segment>
          </Grid.Column>
          <Grid.Column width={6} className="rootLayout">
            <Segment inverted />
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
