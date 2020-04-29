/**
 * this class is used to send a screenshot reference (no binary) message
 * to another client or room on our network
 */
class ScreenshotReferenceInputDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.fileName = json.fileName;
      this.filePath = json.filePath;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'ScreenshotReferenceInputDto' : " +
          e.message
      );
    }
  }
}

module.exports = ScreenshotReferenceInputDto;
