/**
 * Creates a global inventory to display globally when toggling with a key
 */

export default class Inventory {

  static INVENTORY_WIDTH = 191;
  static INVENTORY_HEIGHT = 280;

  static LEFT_MARGIN = 16;
  static TOP_MARGIN = 11;

  static VERTICAL_MARGIN = 10;
  static HORIZONTAL_MARGIN = 10;

  static ICON_WIDTH = 46;

  static INVENTORY_IMAGE = "./assets/animation/hud/inventory.png";

  static ROPE_ICON_IMAGE = "./assets/animation/inventory/rope_icon.png";
  static TOWEL_ICON_IMAGE = "./assets/animation/inventory/towel_icon.png";

  static ROPE_CURSOR_IMAGE = "./assets/animation/hud/rope_cursor.png";
  static TOWEL_CURSOR_IMAGE = "./assets/animation/hud/towel_cursor.png";

  constructor(animationLoader, width, height, globalHud, onActiveItemChangeCallback) {
    this.globalHud = globalHud;
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.leftSideOfInventoryWindow = this.width - Inventory.INVENTORY_WIDTH - 20 + Inventory.LEFT_MARGIN;
    this.topOfInventoryWindow = this.height - Inventory.INVENTORY_HEIGHT - 20 + Inventory.TOP_MARGIN;

    this.inventoryItems = [];
    this.activeItemSelection = null;

    this.iconLookup = [];
    this.cursorLookup = [];

    this.onActiveItemChangeCallback = onActiveItemChangeCallback;
  }

  static get ItemType() {
    return {
      ROPE : "Rope",
      TOWEL : "Blue Towel"
    }
  }

  addItem(itemType) {
    this.inventoryItems.push(itemType);
  }

  removeActiveItem() {
    for (let i = 0; i < this.inventoryItems.length; i++) {
      if (this.inventoryItems[i] === this.activeItemSelection) {
        this.inventoryItems.splice(i, 1);
      }
    }

    this.setActiveItemSelection(null);
  }

  setActiveItemSelection(item) {
    this.activeItemSelection = item;
    this.onActiveItemChangeCallback(item);
  }

  preload(p5) {
    this.animationLoader.getStaticImage(p5, Inventory.INVENTORY_IMAGE);

    let ropeIcon = this.animationLoader.getStaticImage(p5, Inventory.ROPE_ICON_IMAGE);
    let towelIcon = this.animationLoader.getStaticImage(p5, Inventory.TOWEL_ICON_IMAGE);

    let ropeCursor = this.animationLoader.getStaticImage(p5, Inventory.ROPE_CURSOR_IMAGE);
    let towelCursor = this.animationLoader.getStaticImage(p5, Inventory.TOWEL_CURSOR_IMAGE);

    this.iconLookup = [];
    this.iconLookup[Inventory.ItemType.ROPE] = ropeIcon;
    this.iconLookup[Inventory.ItemType.TOWEL] = towelIcon;

    this.cursorLookup = [];
    this.cursorLookup[Inventory.ItemType.ROPE] = ropeCursor;
    this.cursorLookup[Inventory.ItemType.TOWEL] = towelCursor;
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

      if (this.isOverInventory(p5.mouseX, p5.mouseY)) {
        if (this.isOverIcon(p5.mouseX, p5.mouseY)) {
          this.globalHud.setIsActionableHover(true, false);
        } else {
          this.globalHud.setIsActionableHover(false, false);
        }
      }

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
    let row = Math.floor(index / 3);
    let col = Math.floor(index % 3);

     let x = this.leftSideOfInventoryWindow + (col * (Inventory.VERTICAL_MARGIN + Inventory.ICON_WIDTH));
     let y = this.topOfInventoryWindow + (row * (Inventory.HORIZONTAL_MARGIN + Inventory.ICON_WIDTH));

     p5.image(icon, x, y);
  }

  clearActiveSelection() {
    this.setActiveItemSelection(null);
  }

  getActiveItemSelection() {
    return this.activeItemSelection;
  }

  isOverIcon(x, y) {
    return this.getIconAtPosition(x, y) !== null;
  }

  isOverInventory(x, y) {
    return x > this.leftSideOfInventoryWindow && y > this.topOfInventoryWindow;
  }

  getIconAtPosition(x, y) {
    if (this.inventoryItems.length > 0) {
      let index = this.getIconIndexAtPosition(x, y);
      if (index !== null && this.inventoryItems.length > index) {
        return this.inventoryItems[index];
      }
    }
    return null;
  }

  getIconIndexAtPosition(x, y) {
    if (x > this.leftSideOfInventoryWindow && y > this.topOfInventoryWindow) {
      //[]x[]x[]x
      let xOffset = x - this.leftSideOfInventoryWindow;
      let col = Math.floor(xOffset / (Inventory.ICON_WIDTH + Inventory.VERTICAL_MARGIN));
      let xRemainder = xOffset % (Inventory.ICON_WIDTH + Inventory.VERTICAL_MARGIN);
      if (xRemainder > Inventory.ICON_WIDTH) {
        //clicked the margin
        return null;
      }

      let yOffset = y - this.topOfInventoryWindow;
      let row = Math.floor(yOffset / (Inventory.ICON_WIDTH + Inventory.HORIZONTAL_MARGIN));
      let yRemainder = yOffset % (Inventory.ICON_WIDTH + Inventory.HORIZONTAL_MARGIN);
      if (yRemainder > Inventory.ICON_WIDTH) {
        //clicked the margin
        return null;
      }
      return (row * 3) + col;
    } else {
      return null;
    }
  }

  mousePressed(p5, fervie) {
    console.log("mousex = "+p5.mouseX + ", mousey = "+p5.mouseY);

    let clickedIcon = this.getIconAtPosition(p5.mouseX, p5.mouseY);
    console.log("clicked "+clickedIcon);

    if (clickedIcon) {
      if (this.activeItemSelection === null) {
        this.setActiveItemSelection(clickedIcon);
      } else {
        this.setActiveItemSelection(null); //can we combine items?  Maybe in the future, for now this is invalid
      }
    }
  }
}
