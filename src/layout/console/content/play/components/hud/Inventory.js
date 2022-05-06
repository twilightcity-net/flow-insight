/**
 * Creates a global inventory to display globally when toggling with a key
 */

export default class Inventory {

  static INVENTORY_WIDTH = 191;
  static INVENTORY_HEIGHT = 280;

  static INVENTORY_IMAGE = "./assets/animation/hud/inventory.png";

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;
  }

  preload(p5) {
    this.animationLoader.getStaticImage(p5, Inventory.INVENTORY_IMAGE);
  }

  draw(p5) {
    p5.fill(30, 30, 30, 200);

    let image = this.animationLoader.getStaticImage(p5, Inventory.INVENTORY_IMAGE);

    p5.push();
      p5.tint(255, 235);

      p5.image(image,
        this.width - Inventory.INVENTORY_WIDTH - 20,
        this.height - Inventory.INVENTORY_HEIGHT - 20
      );
    p5.pop();
  }
}
