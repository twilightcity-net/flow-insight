//
// dto class for AccountActivation
//
module.exports = class AccountActivationDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.validate(json);
      this.apiKey = json.apiKey;
      this.email = json.email;
      this.message = json.message;
      this.status = json.status;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'AccountActivationDto' : " + e.message
      );
    }
  }

  validate(json) {
    if (!json.apiKey) throw new Error("null property 'apiKey'");
    if (!json.email) throw new Error("null property 'email'");
    if (!json.message) throw new Error("null property 'message'");
    if (!json.status) throw new Error("null property 'status'");
  }
};
