//
// model class for ActivationToken
//
module.exports = class ActivationCodeDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.activationCode = json.activationCode;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ActivationCodeDto' : " + e.message
      );
    }
  }
};
