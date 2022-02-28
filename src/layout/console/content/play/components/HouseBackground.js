/**
 * Creates our fervie sprite animation
 */

export default class HouseBackground {

  constructor(animationLoader, width, height) {
    this.animationLoader = animationLoader;
    this.animationFrame = 1;
    this.width = width;
    this.height = height;
    this.farAwayXMargin = 200;
    this.yMargin = 30;
  }

  /**
   * Preload any necessary images before our animation starts
   * @param p5
   */
  preload(p5) {
  }

  /**
   * Draw the background to the screen
   * @param p5
   */
  draw(p5) {
    p5.background('#77aaff');

    //so each side of a building should fade into the background, with the vanishing point
    //at width/2
    // s.quad(0, this.yMargin,
    //   0, this.height - this.yMargin,
    //   this.width/2 , this.height/2,
    //   this.width/2 , this.height/2)
    //
    // s.quad(this.width/2 , this.height/2,
    //   this.width/2 , this.height/2,
    //   this.width, this.yMargin,
    //   this.width, this.height - this.yMargin)

    // s.fill('orange');

    p5.fill('#777777')
    p5.rect(0, this.height/2, this.width, this.height);

    p5.fill('purple');

    p5.quad(0, this.yMargin,
      0, this.height - this.yMargin,
      this.width/2 - this.farAwayXMargin, this.getYBottom(this.width/2 - this.farAwayXMargin),
      this.width/2 - this.farAwayXMargin, this.getYTop(this.width/2 - this.farAwayXMargin))

    p5.quad(this.width/2 + this.farAwayXMargin, this.getYBottom(this.width/2 - this.farAwayXMargin),
      this.width/2 + this.farAwayXMargin, this.getYTop(this.width/2 - this.farAwayXMargin),
      this.width, this.yMargin,
      this.width, this.height - this.yMargin)

  }

  getYBottom(x) {
    let slope = -1*(this.height - this.yMargin - this.height/2)/(this.width/2);
    return (slope * x) + (this.height - this.yMargin);
  }

  getYTop(x) {
    let slope = -1*(this.yMargin - this.height/2)/(this.width/2);
    return slope * x + this.yMargin;
  }

  /**
   * Update any animation properties for the background
   */
  update() {
    this.animationFrame++;

    if (this.animationFrame > 24) {
      this.animationFrame = 1;
    }
  }
}
