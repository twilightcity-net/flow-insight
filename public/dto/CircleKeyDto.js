//
// dto class for CircleKeyDto
//
module.exports = class CircleKeyDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.privateKey = json.privateKey;
    } catch (e) {
      throw new Error("Unable to create dto 'CircleKeyDto' : " + e.message);
    }
  }

  isValid() {
    if (this.id) return true;
    return false;
  }
};
