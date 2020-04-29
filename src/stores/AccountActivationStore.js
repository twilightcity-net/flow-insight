import { DataStore } from "./DataStore";

const { remote } = window.require("electron"),
  AccountActivationDto = remote.require(
    "./dto/AccountActivationDto"
  );

//
// this class is used to manage DtoClient requests for Stores
//
export class AccountActivationStore extends DataStore {
  constructor(scope) {
    super(scope);
    this.dtoClass = AccountActivationDto;
    this.urn = "/account/activate";
    this.loadRequestType = DataStore.RequestTypes.POST;
  }
}
