/**
 * Creates a global inventory to display globally when toggling with a key
 */
import Inventory from "./Inventory";

export default class Cursor {

  static ROPE_CURSOR_IMAGE = "./assets/animation/cursor/rope_cursor.png";
  static TOWEL_CURSOR_IMAGE = "./assets/animation/cursor/towel_cursor.png";
  static STAR_CURSOR_IMAGE = "./assets/animation/cursor/star_cursor.png";


  static CURSOR_ICON_SIZE = 32;

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.cursorLookup = [];

    this.activeItem = null;
    this.isActionableHover = false;
    this.isItemActionable = false;
  }

  preload(p5) {
    let ropeCursor = this.animationLoader.getStaticImage(p5, Cursor.ROPE_CURSOR_IMAGE);
    let towelCursor = this.animationLoader.getStaticImage(p5, Cursor.TOWEL_CURSOR_IMAGE);
    let starCursor = this.animationLoader.getStaticImage(p5, Cursor.STAR_CURSOR_IMAGE);

    this.cursorLookup = [];
    this.cursorLookup[Inventory.ItemType.ROPE] = ropeCursor;
    this.cursorLookup[Inventory.ItemType.TOWEL] = towelCursor;
  }

  updateActiveItem(item) {
    this.activeItem = item;
  }

  setIsActionableHover(isActionable) {
    this.isActionableHover = isActionable;
  }

  setIsItemActionable(isItemActionable) {
    this.isItemActionable = isItemActionable;
  }

  draw(p5) {
    p5.push();

      if (this.activeItem) {
        let cursor = this.cursorLookup[this.activeItem];
        if (cursor) {
          p5.noCursor();

          if (!this.isActionableHover || !this.isItemActionable) {
            p5.tint(200, 255);
          }
          p5.image(cursor, p5.mouseX - Cursor.CURSOR_ICON_SIZE/2, p5.mouseY - Cursor.CURSOR_ICON_SIZE /2);
        } else {
          p5.cursor(p5.WAIT);
        }
      } else {
        if (this.isActionableHover) {
          let starCursor = this.animationLoader.getStaticImage(p5, Cursor.STAR_CURSOR_IMAGE);
          p5.noCursor();
          p5.image(starCursor, p5.mouseX - Cursor.CURSOR_ICON_SIZE/2, p5.mouseY - Cursor.CURSOR_ICON_SIZE /2);
        } else {
          p5.cursor(p5.ARROW);
        }
      }

    p5.pop();
  }

}
