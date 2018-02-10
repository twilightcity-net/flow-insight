import UtilRenderer from "../UtilRenderer";
import { RendererEventFactory } from "../RendererEventFactory";

//
// this base class is used for Stores
//
export class DataStore {
  constructor(scope) {
    this.name = this.constructor.name;
    this.scope = scope;
    this.context = scope.constructor.name;
    this.guid = UtilRenderer.getGuid();
    this.data = {};
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

  load(dto, callback) {
    this.callback = callback;
    this.timestamp = new Date().getTime();
    this.events.load.dispatch(
      {
        name: this.name,
        context: this.context,
        guid: this.guid,
        timestamp: this.timestamp,
        dto: dto
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
    this.data = arg.data;
    this.error = arg.error;

    if (!this.error) {
      this.dto = new this.dtoClass(this.data);
    }
    this.callback();
  }
}
