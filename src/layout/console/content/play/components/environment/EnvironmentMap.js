/**
 * Responsible for changing the environment context when fervie walk off the edge of a screen
 */
import ShroomHouseInTheWoods from "./ShroomHouseInTheWoods";
import BigTreeInTheWoods from "./BigTreeInTheWoods";


export default class EnvironmentMap {
  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.loadEnvironmentMap();

    this.activeEnvironment = this.environmentMap[EnvironmentMap.ENVIRONMENT_SHROOMHOUSE];
    this.activeMapId = EnvironmentMap.ENVIRONMENT_SHROOMHOUSE;

    this.mapShiftInProgress = false;
  }

  static ENVIRONMENT_BIG_TREE = "BigTreeInTheWoods";
  static ENVIRONMENT_SHROOMHOUSE = "ShroomHouseInTheWoods";

  static MAP_LEFT = "-left";
  static MAP_RIGHT = "-right";
  static MAP_NORTH = "-north";


  loadEnvironmentMap() {

    this.environmentMap = [];
    this.environmentMap[EnvironmentMap.ENVIRONMENT_SHROOMHOUSE] = new ShroomHouseInTheWoods(this.animationLoader, this.width, this.height);
    this.environmentMap[EnvironmentMap.ENVIRONMENT_BIG_TREE] = new BigTreeInTheWoods(this.animationLoader, this.width, this.height);

    this.travelMap = [];

    this.travelMap[EnvironmentMap.ENVIRONMENT_BIG_TREE + EnvironmentMap.MAP_RIGHT] = EnvironmentMap.ENVIRONMENT_SHROOMHOUSE;
    this.travelMap[EnvironmentMap.ENVIRONMENT_SHROOMHOUSE + EnvironmentMap.MAP_LEFT] = EnvironmentMap.ENVIRONMENT_BIG_TREE;
    this.travelMap[EnvironmentMap.ENVIRONMENT_BIG_TREE + EnvironmentMap.MAP_NORTH] = EnvironmentMap.ENVIRONMENT_SHROOMHOUSE;

  }

  moveMapLeft(p5) {
    if (this.mapShiftInProgress === true) {
      return;
    }

    this.mapShiftInProgress = true;

    console.log("Shifting map left!");
    let newMapId = this.travelMap[this.activeMapId + EnvironmentMap.MAP_LEFT];
    if (!newMapId) {
      console.error("Walked off the left of the screen and no environment destination set!");
      this.mapShiftInProgress = false;
      return;
    } else {
      console.log("Moving to map: "+newMapId);
    }

    this.loadNewEnvironment(p5, newMapId);
    this.mapShiftInProgress = false;

    let spawnPoint = this.activeEnvironment.getRightSpawnPoint();
    console.log(spawnPoint);
    return spawnPoint;
  }

  moveMapRight(p5) {
    if (this.mapShiftInProgress === true) {
      return;
    }

    this.mapShiftInProgress = true;
    console.log("Shifting map right!");
    let newMapId = this.travelMap[this.activeMapId + EnvironmentMap.MAP_RIGHT];
    if (!newMapId) {
      this.mapShiftInProgress = false;
      console.error("Walked off the right of the screen and no environment destination set!");
      return;
    } else {
      console.log("Moving to map: "+newMapId);
    }

    this.loadNewEnvironment(p5, newMapId);
    this.mapShiftInProgress = false;

    let spawnPoint = this.activeEnvironment.getLeftSpawnPoint();
    console.log(spawnPoint);
    return spawnPoint;
  }

  moveMapNorth(p5) {
    if (this.mapShiftInProgress === true) {
      return;
    }

    this.mapShiftInProgress = true;
    console.log("Shifting map north!");
    let newMapId = this.travelMap[this.activeMapId + EnvironmentMap.MAP_RIGHT];
    if (!newMapId) {
      this.mapShiftInProgress = false;
      console.error("Walked to the north of the screen and no environment destination set!");
      return;
    } else {
      console.log("Moving to map: "+newMapId);
    }

    this.loadNewEnvironment(p5, newMapId);
    this.mapShiftInProgress = false;

    let spawnPoint = this.activeEnvironment.getSouthSpawnPoint();
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
  getDefaultSpawnPoint() {
    return this.activeEnvironment.getDefaultSpawnPoint();
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
   * Allows fervie to check if he's moving to a valid position
   * @param p5
   * @param footPositionX
   * @param footPositionY
   * @returns {boolean}
   */
  isValidPosition(p5, footPositionX, footPositionY) {
    return this.activeEnvironment.isValidPosition(p5, footPositionX, footPositionY);
  }

  /**
   * Update the environment according to where fervie has moved
   */
  update(p5, fervie) {
    this.activeEnvironment.update(p5, fervie);

    if (this.isEdgeOfScreenLeft(fervie.getFervieFootX(), fervie.getFervieFootY())) {
      let newSpawnPosition = this.moveMapLeft(p5);
      if (newSpawnPosition) {
        fervie.moveToPoint(newSpawnPosition[0], newSpawnPosition[1]);
        fervie.resetDownTheHill();
      }
    }

    if (this.isEdgeOfScreenRight(fervie.getFervieFootX(), fervie.getFervieFootY())) {
      let newSpawnPosition = this.moveMapRight(p5);

      if (newSpawnPosition) {
        fervie.moveToPoint(newSpawnPosition[0], newSpawnPosition[1]);
        fervie.resetDownTheHill();
      }
    }

    if (this.activeEnvironment.hasFervieMovingNorth(fervie)) {
      let newSpawnPosition = this.moveMapNorth(p5);
      if (newSpawnPosition) {
        fervie.moveToPoint(newSpawnPosition[0], newSpawnPosition[1]);
        fervie.resetDownTheHill();
      }
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



}
