import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  JournalEntryDto = remote.require("./dto/JournalEntryDto");

//
// this class is used to manage DataClient requests for Stores
//
export class NewJournalEntryStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = JournalEntryDto;
    this.urn = "/journal/entry/intention";
    this.loadRequestType = DataStore.RequestTypes.POST;
  }
}
