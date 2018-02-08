//
// model class for ActivationToken
//
module.exports = class ActivationTokenDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.activationToken = json.activationToken;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ActivationTokenDto' : " + e.message
      );
    }
  }
};
