//
// model class for ActivationToken
//
module.exports = class HeartbeatDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.idleTime = json.idleTime;
      this.deltaTime = json.deltaTime;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'HeartbeatDto' : " + e.message
      );
    }
  }
};
