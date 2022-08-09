import React, {Component} from "react";

export default class FerviePeekAnimation extends Component {
  /**
   * builds our fervie peek animation using svg, css, and a bit of state management
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FerviePeekAnimation]";
  }

  static get Position() {
    return {
      PEEK: "peek",
      BARELY_PEEK: "barely-peek",
      HIDE: "hide",
    }
  }

  render() {
    if (this.props.position === FerviePeekAnimation.Position.PEEK) {
      return (<div>{this.getFerviePeekSvg()}</div>);
    } else {
      return (<div>{this.getFerviePeekSvg()}</div>);
    }
  }


  getFerviePeekSvg() {
    let fervieColor = "#B042FF";
    let fervieAccessory;
    let fervieTertiaryColor;
    if (this.props.me) {
      if (this.props.me.fervieColor) {
        fervieColor = this.props.me.fervieColor;
      }
      fervieAccessory = this.props.me.fervieAccessory;
      fervieTertiaryColor = this.props.me.fervieTertiaryColor;
    }

    return (
      <svg
        preserveAspectRatio="none"
        x="0px"
        y="0px"
        width="136px"
        height="109px"
        viewBox="0 0 136 109"
      >
          <defs/>

          <g id="shadow_behind">
            <g>
              <g>
                <g>
                  <path fill="#000000" stroke="none" d="
M 115.7 58.2
Q 135.5 56.55 135.5 54.15 135.5 51.75 115.7 50.05 95.95 48.4 68 48.4 40.05 48.4 20.25 50.05 0.5 51.75 0.5 54.15 0.5 56.55 20.25 58.2 40.05 59.9 68 59.9 95.95 59.9 115.7 58.2 Z"/>
                </g>
              </g>

              <g>
                <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 135.5 54.15
Q 135.5 56.55 115.7 58.2 95.95 59.9 68 59.9 40.05 59.9 20.25 58.2 0.5 56.55 0.5 54.15 0.5 51.75 20.25 50.05 40.05 48.4 68 48.4 95.95 48.4 115.7 50.05 135.5 51.75 135.5 54.15 Z"/>
              </g>
            </g>
          </g>

          <g id="fervie" className="fervieBody">
            <g id="base" transform="matrix( 1, 0, 0, 1, 65.15,0.5) ">
              <g>
                <g>
                  <g>
                    <path fill={fervieColor} stroke="none" d="
M 35.6 23.55
Q 24.35 9.2 6.25 7 -11.85 4.75 -26.15 16 -40.55 27.25 -42.75 45.35 -43.2 48.95 -43.1 52.4 1.9 55.35 44.95 52.4 45.7 36.45 35.6 23.55 Z"/>
                  </g>
                </g>

                <g>
                  <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M -43.1 52.4
Q -43.2 48.95 -42.75 45.35 -40.55 27.25 -26.15 16 -11.85 4.75 6.25 7 24.35 9.2 35.6 23.55 45.7 36.45 44.95 52.4"/>
                </g>
              </g>

              <g>
                <g>
                  <g>
                    <path fill={fervieColor} stroke="none" d="
M -52.7 44.1
Q -46.8 38.95 -43.85 44.15 -47 47.4 -48.6 52.4
L -31.5 52.4 -31.2 21
Q -50.2 33.65 -52.7 44.1
M 39.4 28.6
L 35.1 52.4 52.7 52.4
Q 50.05 41.2 39.4 28.6 Z"/>
                  </g>
                </g>

                <g>
                  <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 39.4 28.6
Q 50.05 41.2 52.7 52.4
M -31.2 21
Q -50.2 33.65 -52.7 44.1 -46.8 38.95 -43.85 44.15 -47 47.4 -48.6 52.4"/>
                </g>
              </g>
            </g>

            <g id="hair_right" transform="matrix( 1, 0, 0, 1, 65.15,0.5) ">
              <g>
                <g>
                  <g>
                    <path fill={fervieColor} stroke="none" d="
M 7 6.7
L 7 12.35 26.65 14.75
Q 17.95 7.55 28.8 9.4 18.7712890625 -1.1775390625 7 6.7 Z"/>
                  </g>
                </g>

                <g>
                  <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 26.65 14.75
Q 17.95 7.55 28.8 9.4 18.7712890625 -1.1775390625 7 6.725"/>
                </g>
              </g>
            </g>

            <g id="hair_left" transform="matrix( 1, 0, 0, 1, 65.15,0.5) ">
              <g>
                <g>
                  <g>
                    <path fill={fervieColor} stroke="none" d="
M 7 6.7
Q 6.975 6.733203125 6.95 6.75 0.8 -4.55 -19.75 3 -6.7 3 -4.1 11
L 7 12.35 7 6.7 Z"/>
                  </g>
                </g>

                <g>
                  <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M -4.1 11
Q -6.7 3 -19.75 3 0.8 -4.55 6.95 6.75 6.975 6.733203125 7 6.725"/>
                </g>
              </g>
            </g>

            <g id="eyes" transform="matrix( 1, 0, 0, 1, 65.15,0.5) ">
              <g id="right_eye" transform="matrix( 1, 0, 0, 1, 3.4,20) ">
                <g id="eye_white" transform="matrix( 1, 0, 0, 1, 11.65,2.5) ">
                  <g>
                    <g>
                      <g>
                        <path fill="#FFFFFF" stroke="none" d="
M 6.75 20.25
Q 10.5 17.5 11.15 12.85 11.8 8.3 9.05 4.55 6.25 0.75 1.6 0.1 -3 -0.55 -6.75 2.25 -10.45 5.05 -11.1 9.65 -11.75 14.3 -8.95 18.05 -6.2 21.7 -1.6 22.35 3.05 23.05 6.75 20.25 Z"/>
                      </g>
                    </g>

                    <g>
                      <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 11.15 12.85
Q 10.5 17.5 6.75 20.25 3.05 23.05 -1.6 22.35 -6.2 21.7 -8.95 18.05 -11.75 14.3 -11.1 9.65 -10.45 5.05 -6.75 2.25 -3 -0.55 1.6 0.1 6.25 0.75 9.05 4.55 11.8 8.3 11.15 12.85 Z"/>
                    </g>
                  </g>
                </g>

                <g id="eye_pupil" transform="matrix( 1, 0, 0, 1, 11.65,2.5) ">
                  <g>
                    <g>
                      <g>
                        <path fill="#000000" stroke="none" d="
M -5.65 14.5
Q -3.5 14.8 -1.8 13.45 -0.05 12.1 0.25 9.95 0.55 7.8 -0.75 6.1 -2 4.4 -4.15 4.1 -6.3 3.75 -8.1 5.05 -9.8 6.35 -10.1 8.5 -10.4 10.65 -9.15 12.4 -7.8 14.15 -5.65 14.5 Z"/>
                      </g>
                    </g>

                    <g>
                      <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 0.25 9.95
Q -0.05 12.1 -1.8 13.45 -3.5 14.8 -5.65 14.5 -7.8 14.15 -9.15 12.4 -10.4 10.65 -10.1 8.5 -9.8 6.35 -8.1 5.05 -6.3 3.75 -4.15 4.1 -2 4.4 -0.75 6.1 0.55 7.8 0.25 9.95 Z"/>
                    </g>
                  </g>
                </g>
              </g>

              <g id="left_eye" transform="matrix( 1, 0, 0, 1, 3.4,20) ">
                <g id="eye_white" transform="matrix( 1, 0, 0, 1, -12.6,0) ">
                  <g>
                    <g>
                      <g>
                        <path fill="#FFFFFF" stroke="none" d="
M 6.2 18.45
Q 9.5 15.9 10.2 11.75 10.75 7.5 8.2 4.15 5.65 0.75 1.45 0.15 -2.75 -0.5 -6.15 2.05 -9.6 4.6 -10.15 8.8 -10.8 13 -8.25 16.45 -5.65 19.8 -1.45 20.45 2.7 21 6.2 18.45 Z"/>
                      </g>
                    </g>

                    <g>
                      <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 10.2 11.75
Q 9.5 15.9 6.2 18.45 2.7 21 -1.45 20.45 -5.65 19.8 -8.25 16.45 -10.8 13 -10.15 8.8 -9.6 4.6 -6.15 2.05 -2.75 -0.5 1.45 0.15 5.65 0.75 8.2 4.15 10.75 7.5 10.2 11.75 Z"/>
                    </g>
                  </g>
                </g>

                <g id="eye_pupil" transform="matrix( 1, 0, 0, 1, -12.6,0) ">
                  <g transform="matrix( 0.69970703125, 0.100341796875, -0.100341796875, 0.69970703125, -92.7,-128.1) ">
                    <g>
                      <g>
                        <path fill="#000000" stroke="none" d="
M 154.85 177.35
Q 156.8 175.35 156.8 172.55 156.8 169.75 154.85 167.8 152.85 165.8 150.05 165.8 147.25 165.8 145.25 167.8 143.3 169.75 143.3 172.55 143.3 175.35 145.25 177.35 147.25 179.35 150.05 179.35 152.85 179.35 154.85 177.35 Z"/>
                      </g>
                    </g>

                    <g transform="matrix( 1.400360107421875, -0.2008056640625, 0.2008056640625, 1.400360107421875, 155.5,160.75) ">
                      <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M -0.29991455078123863 8.368041992187528
Q -0.5808715820312358 10.327221679687511 -2.145983886718753 11.530969238281244 -3.746081542968753 12.729699707031244 -5.705261230468736 12.448742675781261 -7.664440917968747 12.16778564453125 -8.863171386718747 10.56768798828125 -10.026916503906236 8.972607421875011 -9.745959472656239 7.013427734375028 -9.465002441406241 5.054248046875017 -7.9049072265625 3.885485839843767 -6.3048095703125 2.686755371093767 -4.345629882812489 2.9677124023437784 -2.3864501953125057 3.2486694335937614 -1.1877197265625057 4.848767089843761 -0.018957519531241473 6.408862304687517 -0.29991455078123863 8.368041992187528 Z"/>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>

          <g id="white_cover"/>

          <g id="shadow_top">
            <g>
              <g>
                <g>
                  <path fill="#000000" stroke="none" d="
M 117.2 50.2
L 117.15 50.2
Q 121.2 51.75 110.1 52.9 67.05 55.85 16.3 52.5 17.95 51.65 17 50.35 0.5 51.95 0.5 54.15 0.5 56.55 20.25 58.2 40.05 59.9 68 59.9 95.95 59.9 115.7 58.2 135.5 56.55 135.5 54.15 135.5 51.85 117.35 50.2 117.25 50.2 117.2 50.2 Z"/>
                </g>
              </g>

              <g>
                <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 17 50.35
Q 0.5 51.95 0.5 54.15 0.5 56.55 20.25 58.2 40.05 59.9 68 59.9 95.95 59.9 115.7 58.2 135.5 56.55 135.5 54.15 135.5 51.85 117.35 50.2 117.25 50.2 117.2 50.2
L 117.15 50.2"/>
              </g>
            </g>
          </g>
        </svg>


        );
  }
}
