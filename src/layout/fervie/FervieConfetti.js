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
      isExplodingList: FervieConfetti.createInitialStateMap(props.count),
      isExploding1: false,
      isExploding2: false,
      isExploding3: false,
      isExploding4: false,
      isExploding5: false,
      isExploding6: false,
      isExploding7: false,
      isExploding8: false,
      isExploding9: false,
      isExploding10: false
    }
  }

  componentDidMount() {
    let totalDelay = 0;

    for (let i = 0; i < this.state.isExplodingList.length; i++) {
      totalDelay += this.getRandomDelayMs();
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

  static createInitialStateMap(numConfettis) {
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
      return isExploding && <ConfettiExplosion
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

  getRandomDelayMs() {
    return (200 + Math.floor(Math.random() * 200));
  }


  render() {
    return (<div>
      {this.createConfettis()}
    </div>);
  }

}
