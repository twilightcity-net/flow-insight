/**
 * Creates our smoke sprite animation
 */

export default class SmokeSprite {
  constructor(animationLoader, x, y) {
    this.animationLoader = animationLoader;

    this.x = x;
    this.y = y;
    this.psize = 16;
    this.alphaRate = 10;
    this.shade = 200;

    this.newParticlesPerIteration = 2;

    this.isStarted = false;
  }

  /**
   * Reset the state when this is loaded
   * @param p5
   */
  preload(p5) {
    this.particles = [];
  }

  start() {
    this.isStarted = true;
  }

  stop() {
    this.isStarted = false;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setParticleSize(psize) {
    this.psize = psize;
  }

  /**
  @param shade Can be a number between 0 - 255
   */
  setParticleColor(shade) {
    this.shade = shade;
  }

  /**
   * Draw the sprite on the screen based on the properties
   * @param p5
   */
  draw(p5) {
    p5.push();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      this.particles[i].show();
      if (this.particles[i].finished()) {
        // remove this particle
        this.particles.splice(i, 1);
      }
    }
    p5.pop()
  }

  reset() {
    this.alpha = 1;
    this.floatUpAmount = 0;
    this.heartScale = 1;
  }

  /**
   * Update the heart based on where we are in the animation
   */
  update(p5, environment) {
    if (this.isStarted) {
      //each round, give us 5 new particles
      for (let i = 0; i < this.newParticlesPerIteration; i++) {
        let p = new Particle(p5, this.x, this.y, this.psize, this.alphaRate, this.shade);
        this.particles.push(p);
      }
    }
  }

}

class Particle {

  constructor(p5, x, y, psize, alphaRate, shade) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.psize = psize;
    this.alphaRate = alphaRate;
    this.shade = shade;
    this.vx = p5.random(-1, 1);
    this.vy = p5.random(-5, -1);
    this.alpha = 100;
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.alphaRate;
  }

  show() {
    this.p5.noStroke();
    this.p5.fill(this.shade, this.alpha);
    this.p5.ellipse(this.x, this.y, this.psize);
  }

}
