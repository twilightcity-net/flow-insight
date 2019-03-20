import { DataModel } from "./DataModel";

export class WTFTimer extends DataModel {
  constructor(scope) {
    super(scope);
    this.name = "[WTFTimer]";

    this.durationInSeconds = 0;

    this.wtfTimerInMinutes = "";
    this.wtfTimerInSeconds = "00:00";

    this.running = false;
    this.intervalTicker = null;

    this.circleModel = null;
  }

  static get CallbackEvent() {
    return {
      WTF_TIMER_MINUTES_UPDATE: "wtf-timer-minutes-update",
      WTF_TIMER_SECONDS_UPDATE: "wtf-timer-seconds-update"
    };
  }

  setDependentModel(circleModel) {
    this.circleModel = circleModel;
  }

  resetTimer() {
    this.durationInSeconds = this.calculateTimer(
      this.circleModel.getActiveScope().activeCircle
    );
    console.log(this.name + " - resetTimer: " + this.durationInSeconds);

    this.refreshFormattedTimers();
  }

  /**
   * Starts the intervalTicker ticking
   */
  startTimer = () => {
    this.running = true;

    if (this.intervalTicker) {
      clearInterval(this.intervalTicker);
    }

    this.intervalTicker = setInterval(this.tick, 1000);
  };

  /**
   * Stop the intervalTicker so it no longer ticks
   */
  stopTimer = () => {
    this.running = false;
    // console.log("clearing this.intervalTicker..." + this.intervalTicker);
    if (this.intervalTicker) {
      clearInterval(this.intervalTicker);
      this.intervalTicker = null;
    }
  };

  calculateTimer = circleDto => {
    let startingSeconds = 0;

    if (circleDto && circleDto.durationInSeconds) {
      startingSeconds = circleDto.durationInSeconds;
    }

    return startingSeconds;
  };

  getUTCNow() {
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  }

  convertToDate(d) {
    return new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);
  }

  /**
   * Ticks the intervalTicker up one second, recalculates display values, and sends notifications
   */
  tick = () => {
    this.durationInSeconds = Number(this.durationInSeconds) + 1;
    this.refreshFormattedTimers();

    if (Number(this.durationInSeconds % 60) === 0) {
      this.notifyListeners(WTFTimer.CallbackEvent.WTF_TIMER_MINUTES_UPDATE);
    }

    this.notifyListeners(WTFTimer.CallbackEvent.WTF_TIMER_SECONDS_UPDATE);
  };

  /**
   * After intervalTicker is ticked up one second, recalculate the WTF Timer display values
   */
  refreshFormattedTimers = () => {
    let totalSeconds = this.durationInSeconds;

    this.wtfTimerInMinutes = WTFTimer.formatWTFTimerInMinutes(totalSeconds);
    this.wtfTimerInSeconds = WTFTimer.formatWTFTimerInSeconds(totalSeconds);
  };

  static formatWTFTimerInMinutes = totalSeconds => {
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);

    let wtfTimerInMinutes = "";

    if (hours > 0) {
      wtfTimerInMinutes += hours + "h";
    }
    if (hours === 0 && minutes > 0) {
      wtfTimerInMinutes += minutes + "m";
    }

    return wtfTimerInMinutes;
  };

  static formatWTFTimerInSeconds = totalSeconds => {
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    let wtfTimerInSeconds = "";

    if (hours > 0) {
      wtfTimerInSeconds += WTFTimer.zeroPad(hours) + ":";
    }
    wtfTimerInSeconds += WTFTimer.zeroPad(minutes) + ":";
    wtfTimerInSeconds += WTFTimer.zeroPad(seconds);

    return wtfTimerInSeconds;
  };

  static zeroPad = time => {
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
