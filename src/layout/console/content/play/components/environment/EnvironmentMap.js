/**
 * Responsible for changing the environment context when fervie walk off the edge of a screen
 */
import ShroomHouseInTheWoods from "./ShroomHouseInTheWoods";
import BigTreeInTheWoods from "./BigTreeInTheWoods";
import LakeInTheWoods from "./LakeInTheWoods";
import HouseInsideEntry from "./HouseInsideEntry";
import HouseInsideKitchen from "./HouseInsideKitchen";
import HouseInsideBedroom from "./HouseInsideBedroom";
import CityEntrance from "./CityEntrance";
import CityTransition from "./CityTransition";
import CityStreet from "./CityStreet";
import FervieGarden from "./FervieGarden";

export default class EnvironmentMap {
  constructor(animationLoader, width, height, globalHud) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;
    this.globalHud = globalHud;

    this.loadEnvironmentMap();

    this.activeEnvironment = this.environmentMap[EnvironmentMap.LAKE];
    this.activeMapId = EnvironmentMap.LAKE;

    this.mapShiftInProgress = false;
  }

  static BIG_TREE = "BigTreeInTheWoods";
  static SHROOMHOUSE = "ShroomHouseInTheWoods";
  static GARDEN = "FervieGarden";
  static LAKE = "LakeInTheWoods";
  static HOUSE_INSIDE_ENTRY = "HouseInsideEntry";
  static HOUSE_INSIDE_KITCHEN = "HouseInsideKitchen";
  static HOUSE_INSIDE_BEDROOM = "HouseInsideBedroom";
  static CITY_ENTRANCE = "CityEntrance";
  static CITY_TRANSITION = "CityTransition";
  static CITY_STREET = "CityStreet";



  static MAP_LEFT = "-left";
  static MAP_RIGHT = "-right";
  static MAP_NORTH = "-north";
  static MAP_SOUTH = "-south";

  loadEnvironmentMap() {
    this.environmentMap = [];
    this.environmentMap[EnvironmentMap.SHROOMHOUSE] = new ShroomHouseInTheWoods(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.BIG_TREE] = new BigTreeInTheWoods(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.LAKE] = new LakeInTheWoods(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.HOUSE_INSIDE_ENTRY] = new HouseInsideEntry(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.HOUSE_INSIDE_KITCHEN] = new HouseInsideKitchen(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.HOUSE_INSIDE_BEDROOM] = new HouseInsideBedroom(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.CITY_ENTRANCE] = new CityEntrance(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.CITY_TRANSITION] = new CityTransition(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.CITY_STREET] = new CityStreet(this.animationLoader, this.width, this.height, this.globalHud);
    this.environmentMap[EnvironmentMap.GARDEN] = new FervieGarden(this.animationLoader, this.width, this.height, this.globalHud);


    this.travelMap = [];
    this.travelMap[EnvironmentMap.BIG_TREE + EnvironmentMap.MAP_RIGHT] = EnvironmentMap.SHROOMHOUSE;
    this.travelMap[EnvironmentMap.SHROOMHOUSE + EnvironmentMap.MAP_LEFT] = EnvironmentMap.BIG_TREE;
    this.travelMap[EnvironmentMap.SHROOMHOUSE + EnvironmentMap.MAP_RIGHT] = EnvironmentMap.GARDEN;
    this.travelMap[EnvironmentMap.GARDEN + EnvironmentMap.MAP_LEFT] = EnvironmentMap.SHROOMHOUSE;
    this.travelMap[EnvironmentMap.BIG_TREE + EnvironmentMap.MAP_NORTH] = EnvironmentMap.LAKE;
    this.travelMap[EnvironmentMap.BIG_TREE + EnvironmentMap.MAP_LEFT] = EnvironmentMap.CITY_TRANSITION;
    this.travelMap[EnvironmentMap.CITY_TRANSITION + EnvironmentMap.MAP_RIGHT] = EnvironmentMap.BIG_TREE;
    this.travelMap[EnvironmentMap.CITY_TRANSITION + EnvironmentMap.MAP_LEFT] = EnvironmentMap.CITY_ENTRANCE;
    this.travelMap[EnvironmentMap.CITY_ENTRANCE + EnvironmentMap.MAP_RIGHT] = EnvironmentMap.CITY_TRANSITION;
    this.travelMap[EnvironmentMap.LAKE + EnvironmentMap.MAP_SOUTH] = EnvironmentMap.BIG_TREE;
    this.travelMap[EnvironmentMap.LAKE + EnvironmentMap.MAP_NORTH] = EnvironmentMap.HOUSE_INSIDE_ENTRY;
    this.travelMap[EnvironmentMap.SHROOMHOUSE + EnvironmentMap.MAP_NORTH] = EnvironmentMap.HOUSE_INSIDE_ENTRY;
    this.travelMap[EnvironmentMap.HOUSE_INSIDE_ENTRY + EnvironmentMap.MAP_SOUTH] = EnvironmentMap.SHROOMHOUSE;
    this.travelMap[EnvironmentMap.HOUSE_INSIDE_ENTRY + EnvironmentMap.MAP_LEFT] = EnvironmentMap.HOUSE_INSIDE_KITCHEN;
    this.travelMap[EnvironmentMap.HOUSE_INSIDE_ENTRY + EnvironmentMap.MAP_NORTH] = EnvironmentMap.HOUSE_INSIDE_BEDROOM;
    this.travelMap[EnvironmentMap.HOUSE_INSIDE_KITCHEN + EnvironmentMap.MAP_RIGHT] = EnvironmentMap.HOUSE_INSIDE_ENTRY;
    this.travelMap[EnvironmentMap.HOUSE_INSIDE_BEDROOM + EnvironmentMap.MAP_SOUTH] = EnvironmentMap.HOUSE_INSIDE_ENTRY;
    this.travelMap[EnvironmentMap.CITY_STREET + EnvironmentMap.MAP_SOUTH] = EnvironmentMap.CITY_ENTRANCE;
    this.travelMap[EnvironmentMap.CITY_STREET + EnvironmentMap.MAP_RIGHT] = EnvironmentMap.CITY_ENTRANCE;
    this.travelMap[EnvironmentMap.CITY_ENTRANCE + EnvironmentMap.MAP_NORTH] = EnvironmentMap.CITY_STREET;
  }

  moveMapLeft(p5) {
    if (this.mapShiftInProgress === true) {
      return;
    }

    this.mapShiftInProgress = true;

    console.log("Shifting map left!");
    let newMapId =
      this.travelMap[
        this.activeMapId + EnvironmentMap.MAP_LEFT
      ];
    if (!newMapId) {
      console.error("Walked off the left of the screen and no environment destination set!");
      this.mapShiftInProgress = false;
      return;
    } else {
      console.log("Moving to map: " + newMapId);
    }

    this.loadNewEnvironment(p5, newMapId);
    this.mapShiftInProgress = false;

    let spawnPoint =
      this.activeEnvironment.getRightSpawnProperties();
    console.log(spawnPoint);
    return spawnPoint;
  }

  moveMapRight(p5) {
    if (this.mapShiftInProgress === true) {
      return;
    }

    this.mapShiftInProgress = true;
    console.log("Shifting map right!");
    let newMapId =
      this.travelMap[
        this.activeMapId + EnvironmentMap.MAP_RIGHT
      ];
    if (!newMapId) {
      this.mapShiftInProgress = false;
      console.error(
        "Walked off the right of the screen and no environment destination set!"
      );
      return;
    } else {
      console.log("Moving to map: " + newMapId);
    }

    this.loadNewEnvironment(p5, newMapId);
    this.mapShiftInProgress = false;

    let spawnPoint =
      this.activeEnvironment.getLeftSpawnProperties();
    console.log(spawnPoint);
    return spawnPoint;
  }

  moveMapSouth(p5) {
    if (this.mapShiftInProgress === true) {
      return;
    }

    this.mapShiftInProgress = true;

    console.log("Shifting map south!");
    let newMapId =
      this.travelMap[this.activeMapId + EnvironmentMap.MAP_SOUTH];
    if (!newMapId) {
      console.error("Walked off the south of the screen and no environment destination set!");
      this.mapShiftInProgress = false;
      return;
    } else {
      console.log("Moving to map: " + newMapId);
    }

    this.loadNewEnvironment(p5, newMapId);
    this.mapShiftInProgress = false;

    let spawnPoint = this.activeEnvironment.getNorthSpawnProperties();
    console.log(spawnPoint);
    return spawnPoint;
  }

  moveMapNorth(p5) {
    if (this.mapShiftInProgress === true) {
      return;
    }

    this.mapShiftInProgress = true;
    console.log("Shifting map north!");
    let newMapId =
      this.travelMap[this.activeMapId + EnvironmentMap.MAP_NORTH];
    if (!newMapId) {
      this.mapShiftInProgress = false;
      console.error("Walked to the north of the screen and no environment destination set!");
      return;
    } else {
      console.log("Moving to map: " + newMapId);
    }

    this.loadNewEnvironment(p5, newMapId);
    this.mapShiftInProgress = false;

    let spawnPoint = this.activeEnvironment.getSouthSpawnProperties();
    console.log(spawnPoint);
    return spawnPoint;
  }

  loadNewEnvironment(p5, newMapId) {
    let newActiveMap = this.environmentMap[newMapId];
    newActiveMap.preload(p5);

    let oldEnvironment = this.activeEnvironment;
    this.activeEnvironment = newActiveMap;
    this.activeMapId = newMapId;

    oldEnvironment.unload(p5);
  }

  preload(p5) {
    this.activeEnvironment.preload(p5);
  }

  unload(p5) {
    this.activeEnvironment.unload(p5);
  }

  /**
   * Get the default spawn point for the environment (if starting on this screen)
   * @returns {*}
   */
  getDefaultSpawnProperties() {
    return this.activeEnvironment.getDefaultSpawnProperties();
  }

  /**
   * Draw the environment background layer
   * @param p5
   * @param fervie
   */
  drawBackground(p5, fervie) {
    this.activeEnvironment.drawBackground(p5, fervie);
  }

  /**
   * Draw the environment overlay layer
   * @param p5
   * @param fervie
   */
  drawOverlay(p5, fervie) {
    this.activeEnvironment.drawOverlay(p5, fervie);
  }

  /**
   * Trigger the button mouse pressed in the active environment
   * @param p5
   * @param fervie
   */
  mousePressed(p5, fervie, globalHud) {
    this.activeEnvironment.mousePressed(p5, fervie, globalHud);
  }

  /**
   * Allows fervie to check if he's moving to a valid position
   * @param p5
   * @param footPositionX
   * @param footPositionY
   * @returns {boolean}
   */
  isValidPosition(p5, footPositionX, footPositionY) {
    return this.activeEnvironment.isValidPosition(
      p5,
      footPositionX,
      footPositionY
    );
  }

  /**
   * Determines if fervie is colliding with a moving object in the environment
   * @param direction
   * @param footPositionX
   * @param footPositionY
   * @returns {boolean}
   */
  isColliding(direction, footPositionX, footPositionY) {
    return this.activeEnvironment.isColliding(
      direction,
      footPositionX,
      footPositionY
    );
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie, globalHud) {
    this.activeEnvironment.update(p5, fervie, globalHud);

    if (
      this.isEdgeOfScreenLeft(
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      let newSpawnProperties = this.moveMapLeft(p5);
      fervie.spawn(newSpawnProperties);
    }

    if (
      this.isEdgeOfScreenRight(
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      let newSpawnProperties = this.moveMapRight(p5);
      fervie.spawn(newSpawnProperties);
    }

    if (
      this.isEdgeOfScreenSouth(
        fervie.getFervieFootX(),
        fervie.getFervieFootY()
      )
    ) {
      let newSpawnProperties = this.moveMapSouth(p5);
      fervie.spawn(newSpawnProperties);
    }

    if (
      this.activeEnvironment.hasFervieMovingNorth(fervie)
    ) {
      let newSpawnProperties = this.moveMapNorth(p5);
      fervie.spawn(newSpawnProperties);
    }
  }

  /**
   * Position is walking off the left of the screen
   * @param x
   * @param y
   * @returns {boolean}
   */
  isEdgeOfScreenLeft(x, y) {
    if (x < 10) {
      return true;
    }
    return false;
  }

  /**
   * Position is walking off the right of the screen
   * @param x
   * @param y
   * @returns {boolean}
   */
  isEdgeOfScreenRight(x, y) {
    if (x > this.width - 10) {
      return true;
    }
    return false;
  }

  /**
   * Position is walking off the south of the screen
   * @param x
   * @param y
   * @returns {boolean}
   */
  isEdgeOfScreenSouth(x, y) {
    if (y > this.height - 10) {
      return true;
    }
    return false;
  }
}
