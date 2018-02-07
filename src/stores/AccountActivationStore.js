import { DataStoreFactory } from "../DataStoreFactory";
import { DataStore } from "./DataStore";

//
// this class is used to manage DataClient requests for Stores
//
export class AccountActivationStore extends DataStore {
  constructor(scope) {
    super(scope);
  }
}
