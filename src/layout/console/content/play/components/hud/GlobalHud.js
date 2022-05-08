/**
 * Creates a global hud to manage any global display windows that sit on top of the environment.
 */
import Inventory from "./Inventory";
import Cursor from "./Cursor";

export default class GlobalHud {

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.isInventoryOpen = false;
  }
  preload(p5) {
    this.inventory = new Inventory(this.animationLoader, this.width, this.height, this, this.onActiveItemChanged);
    this.cursor = new Cursor(this.animationLoader, this.width, this.height);

    this.inventory.preload(p5);
    this.cursor.preload(p5);
  }

  draw(p5) {
    if (this.isInventoryOpen) {
      this.inventory.draw(p5);
    }
    this.cursor.draw(p5);
  }

  mousePressed(p5, fervie) {
    console.log("mousex = "+p5.mouseX + ", mousey = "+p5.mouseY);

    let footX = fervie.getFervieFootX(),
      footY = fervie.getFervieFootY();
    console.log("footX = "+footX + ", footY = "+footY);

    if (this.isInventoryOpen) {
      this.inventory.mousePressed(p5, fervie);
    }
  }

  setIsActionableHover(isActionable, isItemActionable) {
    this.cursor.setIsActionableHover(isActionable);
    this.cursor.setIsItemActionable(isItemActionable);
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

  keyPressed(p5) {
    if (p5.keyCode === 73) {
      //i for inventory
      this.isInventoryOpen = !this.isInventoryOpen;
    }

    if (p5.keyCode === 27) {
      //escape pressed, clear selection
      this.inventory.setActiveItemSelection(null);
    }

  }

  onActiveItemChanged = (item) =>{
    console.log("update active item = "+item);
    this.cursor.updateActiveItem(item);
  }
}
