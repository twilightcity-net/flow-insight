//
// dto class for AccountActivation
//
module.exports = class AccountActivationDto {
  constructor(jsonStr) {
    try {
      let json = JSON.parse(jsonStr);
      this.validateJson(json);
    } catch (e) {
      throw new Error(
        "Unable to create dto 'AccountActivationDto' : " + e.message
      );
    }
  }

  validateJson(json) {
    if (!json.status) throw new Error("null property 'status'");
    if (!json.message) throw new Error("null property 'message'");
    if (!json.email) throw new Error("null property 'email'");
    if (!json.apiKey) throw new Error("null property 'apiKey'");
  }
};
