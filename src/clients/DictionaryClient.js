import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that pulls data from our dictionary service
 */
export class DictionaryClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for the Dictionary in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[DictionaryClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.DICTIONARY_CLIENT,
      this,
      null,
      this.onDictionaryEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{LOAD_DICTIONARY: string, GET_FULL_DICTIONARY: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_DICTIONARY: "load-dictionary",
      GET_FULL_DICTIONARY: "get-full-dictionary"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!DictionaryClient.instance) {
      DictionaryClient.instance = new DictionaryClient(scope);
    }
  }

  /**
   * gets our locally stored dictionary for use in the UI,
   * the DB is kept up to date via events
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getTeamDictionary(scope, callback) {
    let event = DictionaryClient.instance.createClientEvent(
      DictionaryClient.Events.GET_FULL_DICTIONARY,
      {},
      scope,
      callback
    );
    DictionaryClient.instance.notifyDictionary(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onDictionaryEventReply = (event, arg) => {
    let clientEvent = DictionaryClient.replies.get(arg.id);
    this.logReply(
      DictionaryClient.name,
      DictionaryClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      DictionaryClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process team that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyDictionary(clientEvent) {
    console.log(
      "[" +
        DictionaryClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    DictionaryClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
