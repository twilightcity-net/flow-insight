import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  CircleDto = remote.require("./dto/CircleDto");

//
// this class is used to manage DataClient requests for Stores
//
export class CloseCircleStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = CircleDto;
    this.urn = "/circle/{id}/transition/close";
    this.loadRequestType = DataStore.RequestTypes.POST;
  }
}
