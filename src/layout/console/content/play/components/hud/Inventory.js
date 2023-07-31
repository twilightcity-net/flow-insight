/**
 * Creates a global inventory to display globally when toggling with a key
 */

export default class Inventory {

  static INVENTORY_WIDTH = 191;
  static INVENTORY_HEIGHT = 280;

  static LEFT_MARGIN = 16;
  static TOP_MARGIN = 11;

  static VERTICAL_MARGIN = 11;
  static HORIZONTAL_MARGIN = 12;

  static LABEL_WIDTH = 20;

  static ICON_WIDTH = 46;

  static INVENTORY_IMAGE = "./assets/animation/hud/inventory.png";

  static ROPE_ICON_IMAGE = "./assets/animation/inventory/rope_icon.png";
  static TOWEL_ICON_IMAGE = "./assets/animation/inventory/towel_icon.png";

  static SODA_ICON_IMAGE = "./assets/animation/inventory/soda_icon.png";
  static POPCORN_ICON_IMAGE = "./assets/animation/inventory/popcorn_icon.png";
  static PIZZA_ICON_IMAGE = "./assets/animation/inventory/pizza_icon.png";
  static MUFFIN_ICON_IMAGE = "./assets/animation/inventory/muffin_icon.png";
  static ICECREAM_ICON_IMAGE = "./assets/animation/inventory/icecream_icon.png";
  static CANDY_ICON_IMAGE = "./assets/animation/inventory/candy_icon.png";

  constructor(animationLoader, width, height, globalHud, onActiveItemChangeCallback) {
    this.globalHud = globalHud;
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.leftSideOfInventoryWindow = this.width - Inventory.INVENTORY_WIDTH - 20 + Inventory.LEFT_MARGIN;
    this.topOfInventoryWindow = this.height - Inventory.INVENTORY_HEIGHT - 20 + Inventory.TOP_MARGIN;

    this.inventoryItems = [];
    this.activeItemSelection = null;

    this.inventoryAmounts = [];

    this.iconLookup = [];

    this.onActiveItemChangeCallback = onActiveItemChangeCallback;

    this.listeners = new Map();
  }

  static get ItemType() {
    return {
      ROPE : "Rope",
      TOWEL : "Blue Towel",
      POPCORN : "Popcorn",
      PIZZA : "Pizza",
      MUFFIN: "Muffin",
      ICE_CREAM: "Ice Cream",
      SODA: "Soda",
      CHOCOLATE: "Chocolate"
    }
  }

  addItem(itemType) {
    if (this.hasInventoryItem(itemType)) {
      this.inventoryAmounts[itemType]++;
    } else {
      this.inventoryItems.push(itemType);
      this.inventoryAmounts[itemType] = 1;
    }
  }

  hasInventoryItem(itemType) {
    for (let item of this.inventoryItems) {
      if (item === itemType) {
        return true;
      }
    }
    return false;
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

    this.iconLookup = [];
    this.iconLookup[Inventory.ItemType.ROPE] = this.animationLoader.getStaticImage(p5, Inventory.ROPE_ICON_IMAGE);
    this.iconLookup[Inventory.ItemType.TOWEL] = this.animationLoader.getStaticImage(p5, Inventory.TOWEL_ICON_IMAGE);
    this.iconLookup[Inventory.ItemType.SODA] =  this.animationLoader.getStaticImage(p5, Inventory.SODA_ICON_IMAGE);
    this.iconLookup[Inventory.ItemType.POPCORN] = this.animationLoader.getStaticImage(p5, Inventory.POPCORN_ICON_IMAGE);
    this.iconLookup[Inventory.ItemType.CHOCOLATE] = this.animationLoader.getStaticImage(p5, Inventory.CANDY_ICON_IMAGE);
    this.iconLookup[Inventory.ItemType.MUFFIN] = this.animationLoader.getStaticImage(p5, Inventory.MUFFIN_ICON_IMAGE);
    this.iconLookup[Inventory.ItemType.PIZZA] = this.animationLoader.getStaticImage(p5, Inventory.PIZZA_ICON_IMAGE);
    this.iconLookup[Inventory.ItemType.ICE_CREAM] = this.animationLoader.getStaticImage(p5, Inventory.ICECREAM_ICON_IMAGE);

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
      this.drawIconInPosition(p5, item, image, i);
    }
  }

  drawIconInPosition(p5, item, icon, index) {
    let row = Math.floor(index / 3);
    let col = Math.floor(index % 3);

     let x = this.leftSideOfInventoryWindow + (col * (Inventory.VERTICAL_MARGIN + Inventory.ICON_WIDTH));
     let y = this.topOfInventoryWindow + (row * (Inventory.HORIZONTAL_MARGIN + Inventory.ICON_WIDTH));

     p5.image(icon, x, y);

    this.drawLabel(p5, item, x, y);

  }

  drawLabel(p5, item, x, y) {
    const inventoryAmount = this.getInventoryAmount(item);
    if (inventoryAmount === "1") {
      return;
    }

    const labelX = x + Inventory.ICON_WIDTH - Inventory.LABEL_WIDTH - 2;
    const labelY = y + Inventory.ICON_WIDTH - 12;

    p5.fill(0);
    p5.noStroke();
    p5.rect(labelX, labelY, Inventory.LABEL_WIDTH, 10);

    p5.textSize(10);
    p5.fill(255);
    p5.textFont('sans-serif');
    p5.textAlign(p5.CENTER);
    p5.text(inventoryAmount, labelX, labelY, Inventory.LABEL_WIDTH, 10);
  }

  getInventoryAmount(item) {
    const amount = this.inventoryAmounts[item];
    return amount + "";
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

  isConsumableItem(item) {
    return item === Inventory.ItemType.POPCORN ||
      item === Inventory.ItemType.PIZZA ||
      item === Inventory.ItemType.MUFFIN ||
      item === Inventory.ItemType.ICE_CREAM ||
      item === Inventory.ItemType.SODA ||
      item === Inventory.ItemType.CHOCOLATE;
  }

  consumeItem(item) {
    this.reduceInventoryAmount(item);
    this.notifyListeners(item);
  }


  reduceInventoryAmount(item) {
    let amount = this.inventoryAmounts[item];
    amount--;

    if (amount > 0) {
      this.inventoryAmounts[item] = amount;
    } else {
      this.removeItemFromInventory(item);
    }
  }

  removeItemFromInventory(item) {
    for (let i = 0; i < this.inventoryItems.length; i++) {
      if (this.inventoryItems[i] === item) {
        this.inventoryItems.splice(i, 1);
        break;
      }
    }
  }

  notifyListeners(item) {
    for (let callback of this.listeners.values()) {
      callback(item);
    }
  }

  registerListener(name, callback) {
    this.listeners.set(name, callback);
  }

  removeListener(name) {
    this.listeners.delete(name);
  }


  mousePressed(p5, fervie) {
    console.log("mousex = "+p5.mouseX + ", mousey = "+p5.mouseY);

    let clickedIcon = this.getIconAtPosition(p5.mouseX, p5.mouseY);
    console.log("clicked "+clickedIcon);

    if (clickedIcon) {
      if (this.isConsumableItem(clickedIcon)) {
        this.consumeItem(clickedIcon);
      } else {
        if (this.activeItemSelection === null) {
          this.setActiveItemSelection(clickedIcon);
        } else {
          this.setActiveItemSelection(null); //can we combine items?  Maybe in the future, for now this is invalid
        }
      }
    }
  }
}
