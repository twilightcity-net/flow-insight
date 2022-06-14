/**
 * Loads composite images by creating a graphics
 * canvas, loading multiple overlay images,
 * then returning a final image that can be used in the main canvas.
 */

export default class CompositeAnimationBuilder {

  initGraphics(p5, width, height) {
    this.width = width;
    this.height = height;
    this.baseGraphics = p5.createGraphics(width, height);
  }

  loadBaseImage(image) {
    this.baseGraphics.clear();
    this.baseGraphics.image(image, 0, 0);
  }

  loadOverlay(image, x, y) {
    this.baseGraphics.image(image, x, y);
  }

  getGraphics() {
    return this.baseGraphics;
  }

}
