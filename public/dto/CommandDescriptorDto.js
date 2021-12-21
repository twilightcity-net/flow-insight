//
// dto class for CommandDescriptorDto
//
module.exports = class CommandDescriptorDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.command = json.command;
      this.description = json.description;

      this.terminalRoutes = json.terminalRoutes;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'CommandDescriptorDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (this.command != null && this.command != null)
      return true;
    return false;
  }
};
