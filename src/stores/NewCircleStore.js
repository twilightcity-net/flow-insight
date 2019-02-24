import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  CircleDto = remote.require("./dto/CircleDto");

//
// this class is used to manage DataClient requests for Stores
//
export class NewCircleStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = CircleDto;
    this.urn = "/circle";
    this.loadRequestType = DataStore.RequestTypes.POST;
  }
}
