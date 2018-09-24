import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  RecentTasksSummaryDto = remote.require("./dto/RecentTasksSummaryDto");

//
// this class is used to manage DataClient requests for Stores
//
export class RecentTasksStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = RecentTasksSummaryDto;
    this.urn = "/journal/task/recent";
    this.loadRequestType = DataStore.RequestTypes.GET;
  }
}

