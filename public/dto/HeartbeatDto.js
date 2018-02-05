//
// model class for ActivationToken
//
module.exports = class HeartbeatDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.validateJson(json);
      this.idleTime = json.idleTime;
      this.deltaTime = json.deltaTime;
    } catch (e) {
      throw new Error("Unable to create dto 'HeartbeatDto' : " + e.message);
    }
  }

  validateJson(json) {
    if (!json.idleTime) throw new Error("null property 'idleTime'");
    if (!json.deltaTime) throw new Error("null property 'deltaTime'");
  }
};
