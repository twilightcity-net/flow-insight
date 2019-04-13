import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  RecentJournalDto = remote.require("./dto/RecentJournalDto");

//
// this class is used to manage DataClient requests for Stores
//
export class RecentJournalStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = RecentJournalDto;
    this.urn = "/journal/entry/recent";
    this.loadRequestType = DataStore.RequestTypes.GET;
  }
}
