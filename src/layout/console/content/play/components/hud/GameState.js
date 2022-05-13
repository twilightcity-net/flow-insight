/**
 * Creates a global game state that can be persisted and restored
 */

export default class GameState {


  constructor() {
    this.props = new Map();

    this.props.set(GameState.Property.IS_ROPE_PICKED_UP, false);
    this.props.set(GameState.Property.IS_TOWEL_PICKED_UP, false);
    this.props.set(GameState.Property.IS_ROPE_ON_TREE, false);
    this.props.set(GameState.Property.IS_SWING_ON_TREE, false);
    this.props.set(GameState.Property.IS_FISH_SUMMONED, false);
    this.props.set(GameState.Property.IS_LADY_KISSED, false);
    this.props.set(GameState.Property.HAS_ENTERED_BEDROOM, false);
    this.props.set(GameState.Property.HAS_SETTLED_IN_HOUSE, false);
  }

  static get Property() {
    return {
      IS_ROPE_PICKED_UP : "isRopePickedUp",
      IS_TOWEL_PICKED_UP: "isTowelPickedUp",
      IS_ROPE_ON_TREE: "isRopeOnTree",
      IS_SWING_ON_TREE: "isSwingOnTree",
      IS_FISH_SUMMONED: "isFishSummoned",
      IS_LADY_KISSED: "isLadyKissed",
      HAS_ENTERED_BEDROOM: "hasEnteredBedroom",
      HAS_SETTLED_IN_HOUSE: "hasSettledInHouse"
    }
  }

  /**
   * Get the value of a game state property
   * @param property
   * @returns {unknown}
   */
  get(property) {
    let prop = this.props.get(property);
    console.log("get prop : "+property + " "+prop);
    return prop;
  }

  /**
   * Sets the value of a game state property
   * @param property
   * @param value
   */
  set(property, value) {
    console.log("set "+property + " = "+value);
    this.props.set(property, value);
  }





}
