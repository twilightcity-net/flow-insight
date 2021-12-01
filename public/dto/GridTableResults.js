//
// dto class for GridTableResults
//
module.exports = class GridTableResults {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.title = json.title;
      this.headers = json.headers;
      this.rowsOfPaddedCells = json.rowsOfPaddedCells;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'GridTableResults' : " + e.message
      );
    }
  }

  isValid() {
    if (this.title != null && this.title != null)
      return true;
    return false;
  }
};
