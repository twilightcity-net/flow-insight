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
    console.log("ticking...");

    this.durationInSeconds = new Number(this.durationInSeconds) + 1;
    console.log(this.durationInSeconds);
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

    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    console.log("hours: "+hours + ", min: "+minutes + ", seconds: "+seconds);

    this.wtfTimerInMinutes = "";

    if (hours > 0) {
      this.wtfTimerInMinutes += this.zeroPad(hours) + "h ";
    }
    if (minutes > 0) {
      this.wtfTimerInMinutes += this.zeroPad(minutes) + "m ";
    }

    this.wtfTimerInSeconds = "";

    if (hours > 0) {
      this.wtfTimerInSeconds += this.zeroPad(hours) + ":";
    }
    this.wtfTimerInSeconds += this.zeroPad(minutes) + ":";
    this.wtfTimerInSeconds += this.zeroPad(seconds);

  };

  zeroPad = (time) => {
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
