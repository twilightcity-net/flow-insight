/**
 * the base model all other models should extend from.
 */
export class BaseModel {
  /**
   * builds the model and gets passed in the context scope of where the model is
   * @param scope
   */
  constructor(scope) {
    this.scope = scope;
  }
}
