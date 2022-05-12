/**
 * Creates a transition screen by focusing in on a heart area
 */

export default class HeartTransition {

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.width = width;
    this.height = height;

    this.isStarted = false;
    this.isFinishing = false;

    this.sizeIncrement = 30;

    this.heartCount = 0;
    this.heartLimit = 67;

    this.insideHeartCount = 0;
    this.insideHeartLimit = 7;

  }

  preload(p5) {
    this.heartGraphics = p5.createGraphics(this.width, this.height);
  }

  start() {
    this.isStarted = true;
    this.heartCount = 0;
  }

  finish() {
    this.isFinishing = true;
  }

  draw(p5) {
    p5.push();

    p5.image(this.heartGraphics, 0, 0);

    p5.pop();
  }

  heart(p5, x, y, size) {
    p5.noFill();
    p5.strokeWeight(20);
    p5.stroke(0);
    p5.beginShape();
    p5.vertex(x, y);
    p5.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size - (size*0.2));
    p5.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    p5.endShape(p5.CLOSE);
  }

  addHeartToGraphics() {
    if (this.heartCount < this.heartLimit) {
      this.heartCount ++;
      let heartSize = (this.heartLimit - this.heartCount) * this.sizeIncrement;
      this.heart(this.heartGraphics, this.width/2 - 380, this.height/2 - 65 - (heartSize/3), 200 + heartSize);
    }
  }

  addInsideHeartToGraphics() {
    if (this.insideHeartCount < this.insideHeartLimit) {
      this.insideHeartCount ++;
      let heartSize = -1 * (this.insideHeartCount * this.sizeIncrement);
      this.heart(this.heartGraphics, this.width/2 - 380, this.height/2 - 65 - (heartSize/3), 200 + heartSize);
    }
  }

  update(p5) {
    if (this.isStarted ) {
      this.addHeartToGraphics();
      this.addHeartToGraphics();
    }

    if (this.isFinishing) {
      this.addInsideHeartToGraphics();
    }
  }

}
