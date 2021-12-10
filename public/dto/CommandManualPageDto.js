//
// dto class for CommandManualPageDto
//
module.exports = class CommandManualPageDto {

  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.contextName = json.contextName;
      this.commandDescriptors = json.commandDescriptors;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'CommandManualPageDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.contextName != null && this.contextName != null)
      return true;
    return false;
  }
};
