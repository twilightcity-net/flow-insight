//
// dto class for ChartDto
//
module.exports = class ChartDto {
  //event series

  static INTENTION_DATA = "@work/intent";
  static HAYSTACK_DATA = "@exec/haystak";

  //feature sets

  static FILE_DATA = "@place/location";
  static BOX_DATA = "@place/box";
  static EXEC_DATA = "@exec/runtime";

  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.target = json.target;
      this.targetType = json.targetType;
      this.location = json.location;
      this.featureName = json.featureName;

      this.chartSeries = json.chartSeries;
      this.eventSeriesByType = json.eventSeriesByType;
      this.featureSeriesByType = json.featureSeriesByType;
      this.featureSetsByType = json.featureSetsByType;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ChartDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.target != null && this.target != null)
      return true;
    return false;
  }
};
