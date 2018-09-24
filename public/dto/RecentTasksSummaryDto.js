//
// dto class for RecentTasksSummaryDto
//
module.exports = class RecentTasksSummaryDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.activeTask = json.activeTask;
      this.recentProjects = json.recentProjects;
      this.recentTasksByProjectId = json.recentTasksByProjectId;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'RecentTasksSummaryDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.recentProjects != null && this.recentProjects.length > 0) return true;
    return false;
  }
};