const log = require("electron-log"),
  chalk = require("chalk"),
  EventFactory = require("../events/EventFactory");
const AppFeatureToggle = require("./AppFeatureToggle");
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Util = require("../Util");
const {DtoClient} = require("../managers/DtoClientFactory");
/**
 * Application class that handles integration with external devices
 * @type {AppDeviceRelayJob}
 */

module.exports = class AppDeviceRelayJob {
  /**
   * builds the device integration loop
   */
  constructor() {
    this.name = "[AppDeviceRelayJob]";
    log.info(this.name + " create device relay extension -> okay");
    this.intervalMs = 60000;
    this.initialDelayMs = 20000;
    this.timeout = {
      response: 30000,
      deadline: 30000,
    };
    this.url = "";
    this.events = {
    };

    this.port = null;
    this.portIsOpen = false;
  }

  /**
   * starts our fervie help mechanism
   */
  start() {
    if (AppFeatureToggle.isMoovieApp || !AppFeatureToggle.isARDeviceEnabled) {
      return;
    }

    log.info(
      this.name +
        " start device relay -> interval : " +
        this.intervalMs
    );

    setTimeout(() => {
      this.pulse();
      this.interval = setInterval(() => {
        this.pulse();
      }, this.intervalMs);
    }, this.initialDelayMs);

  }

  /**
   * stops our device relay loop
   */
  stop() {
    log.info(this.name + " stop device relay -> okay");
    clearTimeout(this.interval);
  }

  /**
   * Try to initialize our serial port, open if not open, reset config if needed
   */
  initSerialPortIfNeeded() {
    console.log("Initializing Serial Port...");
    if (this.portIsOpen) {
      console.log("Port is open and ready.");
      return;
    }

    if (this.port === null) {
      this.port = new SerialPort({
        path: '/dev/cu.usbmodem1101',
        baudRate: 9600,
        autoOpen: false
      });
    }

    this.tryToOpenPort();
  }

  /**
   * Try to manually open this port, the open might fail if it's misconfigured, for example
   */
  tryToOpenPort() {
    this.port.open((err) => {
      if (err) {
        log.error('Error opening port: ', err.message);
      } else {
        log.debug("listening now open on serial port...");
        this.configurePortListeners();
        this.portIsOpen = true;
      }
    });

  }

  /**
   * Configure the serial port to listen to errors and allow for resetting the port if the connection fails
   */
  configurePortListeners() {
    this.port.on('error', (err) => {
      log.debug('Error: ' + err.message);
      this.portIsOpen = false;
      this.port.close((err) => {
        log.error('Error closing port', err);
      });
      this.port = null;
    });

    const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
    parser.on('data', (data) => {
      this.sendEventsToServer(data);
    });
  }

  /**
   * Sends a serial device command to the server relay
   * @param serialCmd
   */
  sendEventsToServer(serialCmd) {
    var dto = {
      deviceMessage : serialCmd
    };

    this.doDevicePublish(dto, (store) => {
        if (store.error) {
          console.error("Error: "+store.error);
        } else {
          console.log("device command sent: "+dto.deviceMessage);
        }
    });
  }

  /**
   * fires a device relay pulse that health checks the port connections, and reconnects if necessary
   */
  pulse() {
    log.info(this.name +" Device relay pulse starting...");

    try {
      this.doLoopProcessing();
    } catch (e) {
      log.error(
        chalk.red(this.name) +
          " " +
          e +
          "\n\n" +
          e.stack +
          "\n"
      );
    }
  }

  /**
   * Each loop pulse runs this code
   */
  doLoopProcessing() {
    this.initSerialPortIfNeeded();
  }


  /**
   * Publish the device commands to the server
   * @param deviceMessageDto
   * @param callback
   */
  doDevicePublish(deviceMessageDto, callback) {
    this.urn = "/talk/to/device";

    this.callback = callback;
    this.store = {
      context: "AppDeviceRelay",
      dto: deviceMessageDto,
      guid: Util.getGuid(),
      name: "AppDeviceRelayJob",
      requestType: "post",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug(this.name + " send device command batch -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }


};
