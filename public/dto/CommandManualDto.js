//
// dto class for CommandManualDto
//
module.exports = class CommandManualDto {

  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.activityContexts = json.activityContexts;
      this.manualPagesByActivityContext = json.manualPagesByActivityContext;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'CommandManualDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.activityContexts != null && this.activityContexts != null)
      return true;
    return false;
  }
};
