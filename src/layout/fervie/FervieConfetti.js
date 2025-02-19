import React, {Component} from "react";
import ConfettiExplosion from "react-confetti-explosion";

export default class FervieConfetti extends Component {
  /**
   * Builds our fervie confetti animations that can explode in random positions
   * with time delays
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FervieConfetti]";
    this.state = {
      confettiCount: FervieConfetti.cappedCount(props.count),
      isExplodingList: FervieConfetti.createInitialStateMap(FervieConfetti.cappedCount(props.count)),
    }
  }

  static MAX_CONFETTI = 15;

  componentDidMount() {
    let totalDelay = 0;

    for (let i = 0; i < this.state.isExplodingList.length; i++) {
      totalDelay += this.getRandomDelayMs(i);
      setTimeout(() => {
        this.setState((prevState) => {
          prevState.isExplodingList[i] = true;
          return {
            isExplodingList: prevState.isExplodingList
          };
        });
      }, totalDelay);
    }

    setTimeout(() => {
      this.props.onComplete();
    }, (totalDelay + 2000));

  }

  static cappedCount(numConfettis) {
    if (numConfettis < FervieConfetti.MAX_CONFETTI) {
      return numConfettis;
    } else {
      return FervieConfetti.MAX_CONFETTI;
    }
  }

  static createInitialStateMap(numConfettis) {
    console.log("creating map for "+numConfettis+ "confettis");
    let isExplodingList = [];
    for (let i = 0; i < numConfettis; i++) {
      isExplodingList[i] = false;
    }
    return isExplodingList;
  }


  /**
   * Create confetti explosion objects based on the number of confettis in props,
   * randomly distributed in position
   */
  createConfettis() {
    return this.state.isExplodingList.map((isExploding, i) => {
      return isExploding && <ConfettiExplosion key={"confetti"+i}
        style={{position:'absolute', right: this.getRandomX(), top: this.getRandomY()}}
        colors={['#ff00ff','#9C6EFA','#f0bf81', '#6435c9' ]}
        particleSize={8}
      />;
    });
  }

  getRandomX() {
    return Math.floor(Math.random() * 400) + "px";
  }

  getRandomY() {
    return (50 + Math.floor(Math.random() * 200)) + "px";
  }

  getRandomDelayMs(confettiIndex) {
    let extraDelay = 0;
    if (confettiIndex > 0 && confettiIndex%5 === 0 ) {
      extraDelay = 1000;
    }
    if (confettiIndex > 0 && confettiIndex%10 === 0 ) {
      extraDelay = 2000;
    }

    return (extraDelay + 200 + Math.floor(Math.random() * 200));
  }


  render() {
    return (<div>
      {this.createConfettis()}
    </div>);
  }

}
