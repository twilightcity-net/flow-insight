import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  JournalEntryDto = remote.require("./dto/JournalEntryDto");

//
// this class is used to manage DataClient requests for Stores
//
export class UpdatedFlameStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = JournalEntryDto;
    this.urn = "/journal/entry/flame";
    this.loadRequestType = DataStore.RequestTypes.POST;
  }
}
