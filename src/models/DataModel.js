import UtilRenderer from "../UtilRenderer";
import { RendererEventFactory } from "../RendererEventFactory";

//
// this base class is used for Stores
//
export class DataModel {

  static activeWaitDelay = 100;

  constructor(scope) {
    this.name = this.constructor.name;
    this.scope = scope;
    this.context = scope.constructor.name;
    this.guid = UtilRenderer.getGuid();
    this.events = {
      load: RendererEventFactory.createEvent(
        RendererEventFactory.Events.DATASTORE_LOAD,
        this
      ),
      loaded: RendererEventFactory.createEvent(
        RendererEventFactory.Events.DATASTORE_LOADED,
        this,
        this.onLoadedCb
      )
    };
  }

  /**
   * Makes a remote fetch call to populate the model, useing a shared event bus, so the calls must
   * essentially be synchronous, otherwise the fetch will return an error.
   *
   * Returns the data results, and any errors to the caller
   *
   * @param remoteArgs
   * @param remoteUrn
   * @param loadRequestType
   * @param dtoClass
   * @param callback (dtoResults, error)
   */
  remoteFetch(remoteArgs, remoteUrn, loadRequestType, dtoClass, callback ) {
    if (this.callInProgress === true) {
      callback(null, "Call already in progress");
    }

    this.callInProgress = true;

    this.dtoClass = dtoClass;
    this.callback = callback;
    this.timestamp = new Date().getTime();
    this.events.load.dispatch(
      {
        name: this.name,
        context: this.context,
        guid: this.guid,
        timestamp: this.timestamp,
        dto: remoteArgs,
        urn: remoteUrn,
        requestType: loadRequestType
      },
      true
    );
  }


  onLoadedCb(event, arg) {
    if (
      arg.name !== this.name ||
      arg.context !== this.context ||
      arg.guid !== this.guid
    ) {
      return;
    }

    let dtoResults = null;
    if (!arg.error) {
      if (Array.isArray(arg.data)) {
        dtoResults = [];
        for (var i in arg.data) {
          dtoResults[i] = new this.dtoClass(arg.data[i]);
        }
      } else {
        dtoResults = new this.dtoClass(arg.data);
      }

      this.callInProgress = false;
      this.callback(dtoResults, arg.error);
    } else {
      this.callInProgress = false;
    }
  }

  /// enum class of all of http requests
  static get RequestTypes() {
    return {
      POST: "post",
      GET: "get"
    };
  }
}
