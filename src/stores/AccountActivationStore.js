import { DataStore } from "./DataStore";

const { remote } = window.require("electron");

//
// this class is used to manage DtoClient requests for Stores
//
export class AccountActivationStore extends DataStore {
  constructor(scope) {
    super(scope);

    remote.info("remote is " + remote);

    // AccountActivationDto = remote.require(
    //   "./dto/AccountActivationDto"
    // );

    //this.dtoClass = AccountActivationDto;
    this.urn = "/account/activate";
    this.loadRequestType = DataStore.RequestTypes.POST;
  }
}
