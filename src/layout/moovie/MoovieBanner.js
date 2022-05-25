import React, {Component} from "react";
import UtilRenderer from "../../UtilRenderer";

/**
 * this component is the moovie banner for the always-on-top chat overlay panel
 */
export default class MoovieBanner extends Component {

  static get MoovieState() {
    return {
      OPEN: "OPEN",
      STARTED: "STARTED",
      PAUSED: "PAUSED",
      CLOSED: "CLOSED"
    }
  }

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

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.moovie !== this.props.moovie) {
      console.log("moovie updated!");
      this.startTimerIfMoovieStarted();
    }
  }

  startTimerIfMoovieStarted() {
    if (this.props.moovie.circuitState === MoovieBanner.MoovieState.STARTED) {
      this.timer = setInterval(() => {
        let el = document.getElementById("moovieTimer");
        el.style.color = "#888888";
        setTimeout(() => {
          el.style.color = "#777777";
        }, 500);
        this.setState({});
      }, 1000);
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
      }
    }
  }

  getBannerPrefix() {
    if (!this.props.moovie) {
      return "";
    }

    switch (this.props.moovie.circuitState) {
      case MoovieBanner.MoovieState.STARTED:
        return "Now Playing: ";
      case MoovieBanner.MoovieState.PAUSED:
        return "Paused: ";
      case MoovieBanner.MoovieState.CLOSED:
        return "Completed: ";
    }
    return "";
  }

  getTimer() {
    if (!this.props.moovie) {
      return "No movie";
    }
    return UtilRenderer.getTimerFromMoovieCircuit(this.props.moovie);
  }

  /**
   * renders the layout of the view
   * @returns {*} - the JSX to render
   */
  render() {
    let title = "";
    let timer = "";
    if (this.props.moovie) {
      title = this.getBannerPrefix() + this.props.moovie.title;
      timer = this.getTimer();
    }
    return (
     <div className="moovieBanner">
       <span className="title"> {title}</span>
       <span id="moovieTimer" className="moovieTimer">{timer}</span>
     </div>
    );
  }
}
