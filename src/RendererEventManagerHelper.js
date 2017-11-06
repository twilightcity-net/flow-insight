/*
 * This class is used as a helper class to store event names from 
 * ./public/EventManager. When adding a new event make sure to update
 * the other file if you wish to listen to the events
 */
export class RendererEventManagerHelper {
  /*
   * static enum subclass to store event names
   */
  static get Events() {
    let prefix = "metaos-ipc-";
    return {
      APPLOADER_LOAD: prefix + "apploader-load"
    };
  }
}
