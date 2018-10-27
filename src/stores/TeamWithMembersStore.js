import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  TeamWithMembersDto = remote.require("./dto/TeamWithMembersDto");

//
// this class is used to manage DataClient requests for Stores
//
export class TeamWithMembersStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = TeamWithMembersDto;
    this.urn = "/organization/team";
    this.loadRequestType = DataStore.RequestTypes.GET;
  }
}

