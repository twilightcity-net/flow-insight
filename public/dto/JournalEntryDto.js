/**
 * our core journal entry item class that is used through the application
 * @type {JournalEntryDto}
 */
module.exports = class JournalEntryDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.position = json.position;
      this.positionStr = json.positionStr;
      this.positionDate = json.positionDate;
      this.userName = json.userName;
      this.description = json.description;
      this.projectId = json.projectId;
      this.taskId = json.taskId;
      this.taskName = json.taskName;
      this.taskSummary = json.taskSummary;
      this.projectName = json.projectName;
      this.flameRating = json.flameRating;
      this.finishStatus = json.finishStatus;
      this.linked = json.linked;
      this.journalEntryType = json.journalEntryType;
    } catch (e) {
      throw new Error("Unable to create dto 'JournalEntryDto' : " + e.message);
    }
  }
};
