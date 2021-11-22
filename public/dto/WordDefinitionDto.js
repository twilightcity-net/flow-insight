/**
 * the dto class that stores the word definitions for the dictionary
 * @type {WordDefinitionDto}
 */
module.exports = class WordDefinitionDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.wordName = json.wordName;
      this.definition = json.definition;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'WordDefinitionDto' : " +
          e.message
      );
    }
  }
  isValid() {
    return this.id != null && this.wordName != null;
  }
};
