const log = require("electron-log");
const Util = require("../Util");
const path = require("path");
const fs = require("fs");
const {DtoClient} = require("../managers/DtoClientFactory");
const WindowManagerHelper = require("../managers/WindowManagerHelper");
const moment = require("moment");
const EventFactory = require("../events/EventFactory");

/**
 * Detects when a fervie help request is needed and makes request
 */
module.exports = class FervieHelpRequestor {
  /**
   * builds the flow state detection and fervie triggers
   */
  constructor() {
    this.name = "[FervieHelpRequestor]";
    this.lastTriggerCircuitId = null;
    this.circuitTriggerCount = 0;

    this.troubleThresholdEventNotifier =
      EventFactory.createEvent(
        EventFactory.Types.TROUBLE_THRESHOLD_EVENT,
        this
      );
  }

  static STATE_TROUBLESHOOT = "TROUBLESHOOT";
  static OWNER_JOIN_TYPE = "OWNER";

  static HELP_THRESHOLD_IN_SECONDS = 60 * 20;

  /**
   * If we are troubleshooting longer than threshold, send a fervie request to find us some help
   */
  triggerFervieOnTroubleThreshold() {
    let me = global.App.MemberManager.getMe();

    this.resetTriggerCountOnCircuitChange(me);

    if (this.isOverTroubleThreshold(me, FervieHelpRequestor.HELP_THRESHOLD_IN_SECONDS)) {

      this.troubleThresholdEventNotifier.dispatch({});

      this.fetchListOfTroubleFiles((fileList) => {
        console.log(fileList);

        let activityContextInputDto = {
           circuitId: me.activeCircuit.id,
           fileActivityList: fileList
        };

        this.doPostFervieHelp(activityContextInputDto, ( store ) => {
          if (store.error) {
            log.error(this.name + " Failed to send help request!!" + store.error);
          } else {
            this.lastTriggerCircuitId = me.activeCircuit.id;
            this.circuitTriggerCount++;
            log.debug(this.name + " Fervie help request sent, status: "+store.data.status );
          }
        });
      });
    }
  }

  /**
   * Fetch a list of all the files we've been navigating around in since we started this troubleshooting
   * session.
   * @param callback
   */
  fetchListOfTroubleFiles(callback) {
    global.App.CodeModuleConfigHandler.getLastLocationAcrossPlugins((lastLocation) => {
      if (callback) {
        const fileList = this.createSingleFileList(lastLocation);
        callback(fileList);
      }
    });
  }

  /**
   * Create a single map with one file to send with our post
   * @param lastLocationObj
   */
  createSingleFileList(lastLocationObj) {
    let element = {};
    element.module = lastLocationObj.module;
    element.filePath = lastLocationObj.lastLocation;
    element.durationInSeconds = 1;

    return[element];
  }


  /**
   * Detect if our state is troubleshooting and the timer is over the threshold
   * @param currentMe
   * @param thresholdInSeconds
   */
  isOverTroubleThreshold(currentMe, thresholdInSeconds) {

    if (this.hasActiveCircuit(currentMe)) {

       const secondsOpen = this.getWtfTimerSeconds(currentMe.activeCircuit);
       return secondsOpen > thresholdInSeconds * (this.circuitTriggerCount+1);
    }

    return false;
  }

  /**
   * If I've got an active troubleshoot circuit that I own not one I joined
   * @param currentMe
   * @returns {LearningCircuitDto|null|*|boolean}
   */
  hasActiveCircuit(currentMe) {
    return (currentMe && currentMe.activeCircuit && currentMe.activeJoinType === FervieHelpRequestor.OWNER_JOIN_TYPE
      && currentMe.activeCircuit.circuitState === FervieHelpRequestor.STATE_TROUBLESHOOT);
  }

  /**
   * Reset the counter for how many help requests we've triggered everytime
   * we end up with a new circuitId so that we can wait additional time before making more help requests
   * but start over with each new circuit
   * @param currentMe
   */
  resetTriggerCountOnCircuitChange(currentMe) {
    if (this.hasActiveCircuit(currentMe)) {

      let currentCircuitId = currentMe.activeCircuit.id;
      if (currentCircuitId !== this.lastTriggerCircuitId) {
        this.circuitTriggerCount = 0;
        this.lastTriggerCircuitId = currentCircuitId;
      }
    }
  }

  /**
   * Retrieve all the module configs, across all modules
   * @param activityContextInputDto
   * @param callback
   */
  doPostFervieHelp(activityContextInputDto, callback) {
    this.urn = "/fervie/me/help/troubleshoot";

    this.callback = callback;
    this.store = {
      context: "FervieHelpRequestor",
      dto: activityContextInputDto,
      guid: Util.getGuid(),
      name: "FervieHelpRequestorStore",
      requestType: "post",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug(this.name + " trigger fervie help request -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }

  /**
   * Get the number of seconds this circuit has been running it's timer for
   * @param circuit
   */
  getWtfTimerSeconds(circuit) {
    let openUtcTime = moment.utc(circuit.openTime);
    let totalPauseNanoTime = circuit.totalCircuitPausedNanoTime;

    return moment().diff(openUtcTime, "s") -
      this.getSecondsFromNanoseconds(totalPauseNanoTime);
  }

  /**
   * converts a nanosecond value to seconds
   * @param nanoseconds
   */
  getSecondsFromNanoseconds(nanoseconds) {
    return (nanoseconds / 1000000000) | 0;
  }

};
