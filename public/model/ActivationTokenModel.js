//
// model class for ActivationToken
//
module.exports = class ActivationTokenModel {
  constructor(activationToken) {
    try {
      if (!activationToken) throw new Error("null property : activationToken");
      this.activationToken = activationToken;
    } catch (e) {
      throw new Error(
        "Unable to create model 'ActivationTokenModel' : " + e.message
      );
    }
  }
};
