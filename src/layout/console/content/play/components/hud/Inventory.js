/**
 * Creates a global inventory to display globally when toggling with a key
 */

export default class Inventory {

  static INVENTORY_WIDTH = 191;
  static INVENTORY_HEIGHT = 280;

  static LEFT_MARGIN = 16;
  static TOP_MARGIN = 11;

  static ICON_WIDTH = 46;

  static INVENTORY_IMAGE = "./assets/animation/hud/inventory.png";

  static ROPE_ICON_IMAGE = "./assets/animation/inventory/rope_icon.png";

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;
    this.inventoryItems = [];

    this.iconLookup = [];
  }

  static get ItemType() {
    return {
      ROPE : "Rope"
    }
  }

  addItem(itemType) {
    this.inventoryItems.push(itemType);
  }

  preload(p5) {
    this.animationLoader.getStaticImage(p5, Inventory.INVENTORY_IMAGE);

    let ropeIcon = this.animationLoader.getStaticImage(p5, Inventory.ROPE_ICON_IMAGE);

    this.iconLookup = [];
    this.iconLookup[Inventory.ItemType.ROPE] = ropeIcon;

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

      this.drawIcons(p5);

    p5.pop();
  }

  drawIcons(p5) {
    for (let i = 0; i < this.inventoryItems.length; i++) {
      let item = this.inventoryItems[i];
      let image = this.iconLookup[item];
      this.drawIconInPosition(p5, image, i);
    }
  }

  drawIconInPosition(p5, icon, index) {
    let row = index / 3;
    let col = index % 3;

     let x = (this.width - Inventory.INVENTORY_WIDTH - 20) + (col * (Inventory.LEFT_MARGIN + Inventory.ICON_WIDTH)) + Inventory.LEFT_MARGIN;
     let y = (this.height - Inventory.INVENTORY_HEIGHT - 20 + Inventory.TOP_MARGIN);

     p5.image(icon, x, y);
  }
}
