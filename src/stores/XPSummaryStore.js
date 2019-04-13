import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  XPSummaryDto = remote.require("./dto/XPSummaryDto");

//
// this class is used to manage DataClient requests for Stores
//
export class XPSummaryStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = XPSummaryDto;
    this.urn = "/spirit/xp";
    this.loadRequestType = DataStore.RequestTypes.GET;
  }
}
