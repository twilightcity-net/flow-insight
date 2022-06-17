/**
 * Creates a global inventory to display globally when toggling with a key
 */

export default class Store {

  static WINDOW_WIDTH = 280;
  static WINDOW_HEIGHT = 225;

  static LEFT_MARGIN = 6;
  static TOP_MARGIN = 24;

  static LEFT_STORE_MARGIN = 100;

  static VERTICAL_MARGIN = 10;
  static HORIZONTAL_MARGIN = 11;

  static LABEL_WIDTH = 20;

  static ICON_WIDTH = 46;
  static STORE_ICON_WIDTH = 82;

  static INVENTORY_OFFSET_SHIFT = 231;

  static STORE_IMAGE = "./assets/animation/hud/store.png";
  static CLOSE_IMAGE = "./assets/animation/hud/close_icon.png";

  static YUMMY_OWNER_ICON_IMAGE = "./assets/animation/store/cow_yummies_icon.png";

  static SODA_ICON_IMAGE = "./assets/animation/inventory/soda_icon.png";
  static POPCORN_ICON_IMAGE = "./assets/animation/inventory/popcorn_icon.png";
  static PIZZA_ICON_IMAGE = "./assets/animation/inventory/pizza_icon.png";
  static MUFFIN_ICON_IMAGE = "./assets/animation/inventory/muffin_icon.png";
  static ICECREAM_ICON_IMAGE = "./assets/animation/inventory/icecream_icon.png";
  static CANDY_ICON_IMAGE = "./assets/animation/inventory/candy_icon.png";


  constructor(animationLoader, width, height, globalHud) {
    this.globalHud = globalHud;
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.leftSideOfWindow = this.width - Store.WINDOW_WIDTH - 20 + Store.LEFT_MARGIN;
    this.topOfWindow = this.height - Store.WINDOW_HEIGHT - 20 + Store.TOP_MARGIN;

    this.activeItemSelection = null;

    this.iconLookup = [];

    this.isInventoryOpen = false;
  }

  static get ItemType() {
    return {
      POPCORN : "Popcorn",
      PIZZA : "Pizza",
      MUFFIN: "Muffin",
      ICE_CREAM: "Ice Cream",
      SODA: "Soda",
      CHOCOLATE: "Chocolate"
    }
  }

  preload(p5) {
    this.animationLoader.getStaticImage(p5, Store.STORE_IMAGE);
    this.animationLoader.getStaticImage(p5, Store.CLOSE_IMAGE);
    this.animationLoader.getStaticImage(p5, Store.YUMMY_OWNER_ICON_IMAGE);

    this.inventoryItems = [
      Store.ItemType.POPCORN,
      Store.ItemType.SODA,
      Store.ItemType.MUFFIN,
      Store.ItemType.PIZZA,
      Store.ItemType.ICE_CREAM,
      Store.ItemType.CHOCOLATE];

    this.inventoryAmounts = [];
    this.inventoryAmounts[Store.ItemType.POPCORN] = 5;
    this.inventoryAmounts[Store.ItemType.SODA] = 5;
    this.inventoryAmounts[Store.ItemType.MUFFIN] = 5;
    this.inventoryAmounts[Store.ItemType.PIZZA] = 5;
    this.inventoryAmounts[Store.ItemType.ICE_CREAM] = 5;
    this.inventoryAmounts[Store.ItemType.CHOCOLATE] = 5;

    this.iconLookup = [];
    this.iconLookup[Store.ItemType.SODA] =  this.animationLoader.getStaticImage(p5, Store.SODA_ICON_IMAGE);
    this.iconLookup[Store.ItemType.POPCORN] = this.animationLoader.getStaticImage(p5, Store.POPCORN_ICON_IMAGE);
    this.iconLookup[Store.ItemType.CHOCOLATE] = this.animationLoader.getStaticImage(p5, Store.CANDY_ICON_IMAGE);
    this.iconLookup[Store.ItemType.MUFFIN] = this.animationLoader.getStaticImage(p5, Store.MUFFIN_ICON_IMAGE);
    this.iconLookup[Store.ItemType.PIZZA] = this.animationLoader.getStaticImage(p5, Store.PIZZA_ICON_IMAGE);
    this.iconLookup[Store.ItemType.ICE_CREAM] = this.animationLoader.getStaticImage(p5, Store.ICECREAM_ICON_IMAGE);
  }

  draw(p5) {
    p5.fill(30, 30, 30, 200);

    let storeImage = this.animationLoader.getStaticImage(p5, Store.STORE_IMAGE);
    let closeImage = this.animationLoader.getStaticImage(p5, Store.CLOSE_IMAGE);

    p5.push();
      p5.tint(255, 235);
      p5.image(storeImage,
        this.width - Store.WINDOW_WIDTH - 20 - (this.isInventoryOpen? Store.INVENTORY_OFFSET_SHIFT : 0),
        this.height - Store.WINDOW_HEIGHT - 20
      );
    this.drawCloseIcon(p5, closeImage);

    this.drawStoreIcon(p5);
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

  drawCloseIcon(p5, closeImage) {

    p5.push();
    p5.translate(this.width - 20 - 25 - (this.isInventoryOpen ? Store.INVENTORY_OFFSET_SHIFT : 0),
      this.height - Store.WINDOW_HEIGHT - 20 + 10);
    p5.scale(0.5, 0.5);

    if (this.isOverCloseIcon(p5)) {
      p5.blendMode(p5.ADD);
      this.globalHud.setIsPointerHover(true);
    } else {
      this.globalHud.setIsPointerHover(false);
    }

    p5.image(closeImage, 0, 0);

    p5.pop();
  }

  isOverCloseIcon(p5) {
    let xPosition = this.width - 20 - 25 - (this.isInventoryOpen ? Store.INVENTORY_OFFSET_SHIFT : 0);
    let yPosition = this.height - Store.WINDOW_HEIGHT - 20 + 10;

    return (p5.mouseX > xPosition && p5.mouseX < (xPosition + 20)
      && (p5.mouseY > yPosition && p5.mouseY < (yPosition + 20)));
  }

  drawStoreIcon(p5) {
    p5.push();
    let storeOwner = this.animationLoader.getStaticImage(p5, Store.YUMMY_OWNER_ICON_IMAGE);
    p5.translate( this.leftSideOfWindow + Store.LEFT_MARGIN, this.topOfWindow + Store.TOP_MARGIN);
    p5.scale(0.5, 0.5);
    p5.image(storeOwner,0, 0);
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

     let x = this.leftSideOfWindow + Store.LEFT_STORE_MARGIN + (col * (Store.VERTICAL_MARGIN + Store.ICON_WIDTH));
     let y = this.topOfWindow + Store.TOP_MARGIN + (row * (Store.HORIZONTAL_MARGIN + Store.ICON_WIDTH));

     p5.image(icon, x, y);

     const labelX = x + Store.ICON_WIDTH - Store.LABEL_WIDTH - 2;
     const labelY = y + Store.ICON_WIDTH - 12;

     p5.fill(0);
     p5.noStroke();
     p5.rect(labelX, labelY, Store.LABEL_WIDTH, 10);

     p5.textSize(10);
     p5.fill(255);
     p5.textFont('sans-serif');
     p5.textAlign(p5.CENTER);
     p5.text(this.getInventoryAmount(item), labelX, labelY, Store.LABEL_WIDTH, 10);
  }

  // clearActiveSelection() {
  //   this.setActiveItemSelection(null);
  // }

  getInventoryAmount(item) {
    const amount = this.inventoryAmounts[item];
    return amount + "";
  }

  reduceInventoryAmount(item) {
    let amount = this.inventoryAmounts[item];
    amount--;

    if (amount > 0) {
      this.inventoryAmounts[item] = amount;
    } else {
      this.removeItemFromStore(item);
    }
  }

  removeItemFromStore(item) {
    for (let i = 0; i < this.inventoryItems.length; i++) {
      if (this.inventoryItems[i] === item) {
        this.inventoryItems.splice(i, 1);
        break;
      }
    }
  }

  setInventoryOpen(isOpen) {
    this.isInventoryOpen = isOpen;

    this.leftSideOfWindow = this.width - Store.WINDOW_WIDTH - 20 + Store.LEFT_MARGIN - (this.isInventoryOpen? Store.INVENTORY_OFFSET_SHIFT: 0);
    this.topOfWindow = this.height - Store.WINDOW_HEIGHT - 20 + Store.TOP_MARGIN;
  }

  getActiveItemSelection() {
    return this.activeItemSelection;
  }

  isOverIcon(x, y) {
    return !!this.getIconAtPosition(x, y);
  }

  isOverInventory(x, y) {
    return x > this.leftSideOfWindow && y > this.topOfWindow;
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
    if (x > this.leftSideOfWindow + Store.LEFT_STORE_MARGIN && y > this.topOfWindow) {
      //[]x[]x[]x
      let xOffset = x - this.leftSideOfWindow - Store.LEFT_STORE_MARGIN;
      let col = Math.floor(xOffset / (Store.ICON_WIDTH + Store.VERTICAL_MARGIN));
      let xRemainder = xOffset % (Store.ICON_WIDTH + Store.VERTICAL_MARGIN);
      if (xRemainder > Store.ICON_WIDTH) {
        //clicked the margin
        return null;
      }

      let yOffset = y - this.topOfWindow - Store.TOP_MARGIN;
      let row = Math.floor(yOffset / (Store.ICON_WIDTH + Store.HORIZONTAL_MARGIN));
      let yRemainder = yOffset % (Store.ICON_WIDTH + Store.HORIZONTAL_MARGIN);
      if (yRemainder > Store.ICON_WIDTH) {
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
    //
    let clickedIcon = this.getIconAtPosition(p5.mouseX, p5.mouseY);
    console.log("clicked "+clickedIcon);

    if (this.isOverCloseIcon(p5)) {
      this.globalHud.closeStore();
    }

    if (clickedIcon) {
      this.reduceInventoryAmount(clickedIcon);
      this.globalHud.addInventoryItem(clickedIcon);
    }
  }
}
