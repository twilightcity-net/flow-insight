import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  TeamMemberWorkStatusDto = remote.require("./dto/TeamMemberWorkStatusDto");

//
// this class is used to manage DataClient requests for Stores
//
export class ResolveWithYayStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = TeamMemberWorkStatusDto;
    this.urn = "/spirit/status/yay";
    this.loadRequestType = DataStore.RequestTypes.POST;
  }
}

