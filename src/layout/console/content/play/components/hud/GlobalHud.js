/**
 * Creates a global hud to manage any global display windows that sit on top of the environment.
 */
import Inventory from "./Inventory";
import Cursor from "./Cursor";
import GameState from "./GameState";
import Store from "./Store";
import Environment from "../environment/Environment";
import {RendererEventFactory} from "../../../../../../events/RendererEventFactory";

export default class GlobalHud {

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.isInventoryOpen = false;
    this.isMooviePickerOpen = false;
    this.isStoreOpen = false;

    this.areKeysDisabled = false;

    this.gameState = new GameState();

    this.listeners = new Map();

  }
  preload(p5) {
    this.inventory = new Inventory(this.animationLoader, this.width, this.height, this, this.onActiveItemChanged);
    this.store = new Store(this.animationLoader, this.width, this.height, this);
    this.cursor = new Cursor(this.animationLoader, this.width, this.height);

    this.inventory.preload(p5);
    this.store.preload(p5);
    this.cursor.preload(p5);


    this.globalHudInputLockNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.GLOBAL_HUD_INPUT_LOCK,
        this,
        this.onKeylockEvent
      );
  }

  reloadStore(p5) {
    this.store.preload(p5);
  }

  unload() {
    this.globalHudInputLockNotifier.clear();
  }

  draw(p5) {
    if (this.isInventoryOpen) {
      this.inventory.draw(p5);
    }
    if (this.isStoreOpen) {
      this.store.draw(p5);
    }

    this.cursor.draw(p5);
  }

  mousePressed(p5, fervie) {
    console.log("mouseX = "+p5.mouseX + ", mouseY = "+p5.mouseY);

    let adjustMouseX = p5.mouseX / (this.width / Environment.IMAGE_WIDTH);
    let adjustMouseY = p5.mouseY /  (this.height / Environment.IMAGE_HEIGHT)
    console.log("adjMouseX = "+adjustMouseX + ", adjMouseY = "+adjustMouseY);

    console.log("fx = "+fervie.x + ", fy = "+fervie.y);

    let footX = fervie.getFervieFootX(),
      footY = fervie.getFervieFootY();
    console.log("footX = "+footX + ", footY = "+footY);

    let adjustX = footX / (this.width / Environment.IMAGE_WIDTH);
    let adjustY = footY /  (this.height / Environment.IMAGE_HEIGHT)
    console.log("footAdjustX = "+adjustX + ", footAdjustY = "+adjustY);

    if (this.isInventoryOpen) {
      this.inventory.mousePressed(p5, fervie);
    }

    if (this.isStoreOpen) {
      this.store.mousePressed(p5, fervie);
    }
  }

  onKeylockEvent(event, arg) {
    if (arg.lockInput) {
      this.disableKeysWhileFormIsOpen();
    } else {
      this.enableKeys();
    }
  }

  setIsActionableHover(isActionable, isItemActionable) {
    this.cursor.setIsActionableHover(isActionable);
    this.cursor.setIsItemActionable(isItemActionable);
  }

  setIsPointerHover(isActionable) {
    this.cursor.setIsPointerHover(isActionable);
  }

  getGameStateProperty(property) {
    return this.gameState.get(property);
  }

  setGameStateProperty(property, value) {
    this.gameState.set(property, value);
  }

  randomizeGameStateProperty(property) {
    this.gameState.randomizeProperty(property);
  }

  addInventoryItem(item) {
    this.inventory.addItem(item);
  }

  consumeActiveInventoryItem() {
    this.inventory.removeActiveItem();
  }

  getActiveItemSelection() {
    return this.inventory.getActiveItemSelection();
  }

  hasActiveItemSelection() {
    return (this.inventory.getActiveItemSelection() !== null);
  }

  openMooviePicker() {
    this.isMooviePickerOpen = true;
    let el = document.getElementById("playDialog");
    el.style.visibility = "visible";

    this.notifyListeners();
  }

  openStore() {
    this.isStoreOpen = true;
  }

  closeStore() {
    this.isStoreOpen = false;
  }

  getStoreOpen() {
    return this.isStoreOpen;
  }

  getMooviePickerOpen() {
    return this.isMooviePickerOpen;
  }

  disableKeysWhileFormIsOpen() {
    this.areKeysDisabled = true;
  }

  enableKeys() {
    this.areKeysDisabled = false;
  }

  registerListener(name, callback) {
    this.listeners.set(name, callback);
  }

  removeListener(name) {
    this.listeners.delete(name);
  }

  closeMooviePicker() {
    this.isMooviePickerOpen = false;
    let el = document.getElementById("playDialog");
    el.style.visibility = "hidden";

    this.notifyListeners();
  }

  notifyListeners() {
    for (let callback of this.listeners.values()) {
      callback();
    }
  }

  keyPressed(p5) {

    if (!this.areKeysDisabled && p5.keyCode === 73) {
      //i for inventory
      this.isInventoryOpen = !this.isInventoryOpen;
      this.store.setInventoryOpen(this.isInventoryOpen);
    }

    if (p5.keyCode === 27) {
      //escape pressed, clear selection
      this.inventory.setActiveItemSelection(null);
      if (this.isMooviePickerOpen) {
        this.closeMooviePicker();
      }
      if (this.isStoreOpen) {
        this.closeStore();
      }
    }
  }

  onActiveItemChanged = (item) =>{
    console.log("update active item = "+item);
    this.cursor.updateActiveItem(item);
  }
}
