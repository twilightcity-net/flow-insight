import {DataModel} from "./DataModel";

const {remote} = window.require("electron");

export class WTFTimerExtension extends DataModel {
  constructor(scope) {
    super(scope);
    this.durationInSeconds = 0;

    this.wtfTimerInMinutes = null;
    this.wtfTimerInSeconds = null;

    this.running = false;
    this.timer = null;
  }

  static get CallbackEvent() {
    return {
      WTF_TIMER_MINUTES_UPDATE: "wtf-timer-minutes-update",
      WTF_TIMER_SECONDS_UPDATE: "wtf-timer-seconds-update"
    };
  }

  startTimer = (durationInSeconds) => {
    if (durationInSeconds) {
      this.durationInSeconds = durationInSeconds;
    }

    this.running = true;

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(this.tick, 1000);
    console.log("ticking..."+this.timer);
  };

  /**
   * Stop the timer so it no longer ticks
   */
  stopTimer = () => {
    this.running = false;
    this.durationInSeconds = 0;
    console.log("clearing this.timer..."+this.timer);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

  };

  /**
   * Ticks the timer up one second, recalculates display values, and sends notifications
   */
  tick = () => {

    this.durationInSeconds = Number(this.durationInSeconds) + 1;
    this.refreshFormattedTimers();

    if (this.durationInSeconds % 60 === 0) {
      this.notifyListeners(WTFTimerExtension.CallbackEvent.WTF_TIMER_MINUTES_UPDATE);
    }

    this.notifyListeners(WTFTimerExtension.CallbackEvent.WTF_TIMER_SECONDS_UPDATE);
  };

  /**
   * After timer is ticked up one second, recalculate the WTF Timer display values
   */
  refreshFormattedTimers = () => {

    let totalSeconds = this.durationInSeconds;

    this.wtfTimerInMinutes = WTFTimerExtension.formatWTFTimerInMinutes(totalSeconds);
    this.wtfTimerInSeconds = WTFTimerExtension.formatWTFTimerInSeconds(totalSeconds);

  };

  static formatWTFTimerInMinutes = (totalSeconds) => {
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    let wtfTimerInMinutes = "";

    if (hours > 0) {
      wtfTimerInMinutes += hours + "h ";
    }
    if (minutes > 0) {
      wtfTimerInMinutes += minutes + "m ";
    }

    return wtfTimerInMinutes;
  };

  static formatWTFTimerInSeconds = (totalSeconds) => {
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    let wtfTimerInSeconds = "";

    if (hours > 0) {
      wtfTimerInSeconds += WTFTimerExtension.zeroPad(hours) + ":";
    }
    wtfTimerInSeconds += WTFTimerExtension.zeroPad(minutes) + ":";
    wtfTimerInSeconds += WTFTimerExtension.zeroPad(seconds);

    return wtfTimerInSeconds;
  };



  static zeroPad = (time) => {
    let timeStr = "";

    if (time === 0) {
      timeStr = "00";
    } else if (time > 0 && time < 10) {
      timeStr = "0" + time;
    } else {
      timeStr = time;
    }
    return timeStr;

  };

}
