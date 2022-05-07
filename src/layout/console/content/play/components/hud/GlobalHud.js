/**
 * Creates a global hud to manage any global display windows that sit on top of the environment.
 */
import Inventory from "./Inventory";

export default class GlobalHud {

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.isInventoryOpen = false;
  }
  preload(p5) {
    this.inventory = new Inventory(this.animationLoader, this.width, this.height);
    this.inventory.preload(p5);
  }

  draw(p5) {
    if (this.isInventoryOpen) {
      this.inventory.draw(p5);
    }
  }

  mousePressed(p5, fervie) {
    console.log("mousex = "+p5.mouseX + ", mousey = "+p5.mouseY);

    let footX = fervie.getFervieFootX(),
      footY = fervie.getFervieFootY();
    console.log("footX = "+footX + ", footY = "+footY);
  }

  keyPressed(p5) {
    if (p5.keyCode === 73) {
      console.log("toggle inventory!");
      this.isInventoryOpen = !this.isInventoryOpen;
    }
  }
}
