//
// dto class for AccountActivation
//
export class AccountActivationDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.apiKey = json.apiKey;
      this.email = json.email;
      this.message = json.message;
      this.status = json.status;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'AccountActivationDto' : " +
          e.message
      );
    }
  }

  isValidToken() {
    return this.status === "VALID";
  }
};
