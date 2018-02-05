//
// dto class for SimpleStatus
//
module.exports = class SimpleStatusDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.validateJson(json);
      this.message = json.message;
      this.status = json.status;
    } catch (e) {
      throw new Error("Unable to create dto 'SimpleStatusDto' : " + e.message);
    }
  }

  validateJson(json) {
    if (!json.message) throw new Error("null property 'message'");
    if (!json.status) throw new Error("null property 'status'");
  }
};
