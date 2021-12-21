//
// dto class for CommandActivityContextDto
//
module.exports = class CommandActivityContextDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.contextName = json.contextName;
      this.description = json.description;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'CommandActivityContextDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (
      this.contextName != null &&
      this.contextName != null
    )
      return true;
    return false;
  }
};
