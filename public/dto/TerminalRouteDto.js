//
// dto class for TerminalRouteDto
//
module.exports = class TerminalRouteDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.command = json.command;
      this.argsTemplate = json.argsTemplate;

      this.optionsHelp = json.optionsHelp;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TerminalRouteDto' : " +
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
