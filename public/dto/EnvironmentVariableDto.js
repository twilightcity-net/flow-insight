//
// dto class for EnvironmentVariableDto
//
module.exports = class EnvironmentVariableDto {

  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.variableName = json.variableName;
      this.value = json.value;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'EnvironmentVariableDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.variableName != null && this.variableName != null)
      return true;
    return false;
  }
};
