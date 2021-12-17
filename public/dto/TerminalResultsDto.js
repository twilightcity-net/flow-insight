//
// dto class for TerminalResultsDto
//
module.exports = class TerminalResultsDto {

  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.resultClass = json.resultClass;
      this.resultString = json.resultString;
      this.commandExecuted = json.commandExecuted;
      this.commandFrom = json.commandFrom;

      this.chartDto = json.chartDto;
      this.gridTableResults = json.gridTableResults;
      this.simpleStatusDto = json.simpleStatusDto;
      this.gridTileDto = json.gridTileDto;
      this.calendarInfoDto = json.calendarInfoDto;
      this.projectDetailsDto = json.projectDetailsDto;
      this.environmentVariableDto = json.environmentVariableDto;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'TerminalResultsDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.circuitName != null && this.circuitName != null)
      return true;
    return false;
  }
};
