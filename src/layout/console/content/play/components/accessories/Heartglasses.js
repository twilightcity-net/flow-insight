import React from "react";
import AnimationId from "../AnimationId";

/**
 * Creates an overlay image of heartglasses that can be placed on top of
 * a walking fervie animation.
 */

export class Heartglasses {

  /**
   * Gets the svg for the heartglasses positioned as an accessory
   * with fervie facing to the right
   * @param accessoryColor
   */
  static getFervieRight(accessoryColor) {
    const id = AnimationId.Accessory.HeartglassRight;
    return Heartglasses.getFervieRightSvg(id, accessoryColor);
  }

  /**
   * Gets the svg for the heartglasses positioned as an accessory
   * with fervie facing downward
   * @param accessoryColor
   */
  static getFervieDown(accessoryColor) {
    const id = AnimationId.Accessory.HeartglassDown;
    return Heartglasses.getFervieDownSvg(id, accessoryColor);
  }

  static getFervieDownSvg(id, accessoryColor) {
    return (
      <svg id={id} preserveAspectRatio="xMinYMin meet" x="0px" y="0px" width="543px" height="433px" viewBox="0 0 543 433">
          <defs>
            <linearGradient id="Gradient_1" gradientUnits="userSpaceOnUse" x1="242.475" y1="97.9" x2="246.025" y2="46.599999999999994" spreadMethod="pad">
              <stop  offset="0%" stopColor="#00C8FF"/>

              <stop  offset="100%" stopColor="#7F00FF"/>
            </linearGradient>

            <linearGradient id="Gradient_2" gradientUnits="userSpaceOnUse" x1="332.98749999999995" y1="103.02499999999999" x2="341.3125" y2="53.175" spreadMethod="pad">
              <stop  offset="0%" stopColor="#00C8FF"/>

              <stop  offset="100%" stopColor="#7F00FF"/>
            </linearGradient>
          </defs>

          <g id="Layer_1">
            <g>
              <g>
                <g>
                  <path fill={accessoryColor} stroke="none" d="
M 208.05 48.05
Q 205.15 46.75 203.4 47.3 200.6 48.05 200.45 50 201.8 54.25 204.05 55.8 204.9 53.45 206.1 51.1 207.1 49.5 208.05 48.05
M 299.6 57.1
Q 300.5 55.5 301.6 54.1 293.05 46.7 283.55 53 284.35 54.55 285 56.2 285.6 57.55 286.05 58.85 292.75 54.2 298.15 59.8 298.75 58.45 299.6 57.1
M 379.4 65.05
Q 384 63.7 384.6 60 384.85 58.4 382.85 57.2 379.25 56.4 375.8 57.25 377.5 59.95 378.45 62.25 378.95 63.7 379.4 65.05 Z"/>

                  <path fill={accessoryColor} stroke="none" d="
M 267.55 40.85
Q 255.65 39.8 246.8 47.25 237.35 38.65 225.45 38.1 214.2 39.7 208.05 48.05 207.1 49.5 206.1 51.1 204.9 53.45 204.05 55.8 199.45 68.1 204.9 80.5 211.3 95.35 224.25 103.85 230.95 110.1 241.55 115.4 252.8 111.55 260.2 106.15 274.8 99.15 283.15 85.4 290.8 72.8 286.05 58.85 285.6 57.55 285 56.2 284.35 54.55 283.55 53 278.45 43.9 267.55 40.85
M 275.15 46.2
Q 264.75 42.3 254.85 44.85 265.35 38.7 275.15 46.2
M 271.6 49.55
Q 274.15 51 275.95 52.9 281.3 58.4 280.85 67.95 280.7 70.9 280 74.3 278.75 86.7 259.9 99.25 252.45 104.3 242.1 109.35 228.95 100.7 220.95 92.75 208.45 80.3 208.8 69.7 207.65 55.45 215.35 49.15 217.45 47.4 220.2 46.25 223.15 45.1 226.15 44.9 236.15 44.1 246.3 54.1 259.55 42.9 271.6 49.55
M 270.8 95.1
Q 279.4 85.2 283.65 75 282.45 86.95 270.8 95.1
M 236.45 43.3
Q 228.35 40.45 219.8 42.2 228.45 37.95 236.45 43.3
M 208 56.25
Q 203.45 71.85 213.15 88.3 206.55 81.3 205.2 72.4 203.8 63.45 208 56.25
M 379.4 65.05
Q 378.95 63.7 378.45 62.25 377.5 59.95 375.8 57.25 371.3 49.7 361.05 46.85 349.1 45.85 338.7 53.15 330.85 44.65 318.9 44.15 307.75 45.7 301.6 54.1 300.5 55.5 299.6 57.1 298.75 58.45 298.15 59.8 291.7 72.95 297.6 86.25 304.2 101.05 317.65 109.8 324.4 116.2 335.1 121.45 346.3 117.6 353.7 112.15 367.6 105.4 375.95 91.55 383.4 78.95 379.4 65.05
M 338.25 60.05
Q 348.7 52.15 357.85 53.25 361.5 53.65 365 55.65 369.7 58.15 372 62.3 375.8 69.15 373.45 80.4 372.5 90.05 360.65 99.9 351.3 107.55 335.3 115.35 321.95 106.6 313.95 98.5 301.95 86.25 302.2 75.8 302.05 73.4 302.05 71.2 302.35 62.35 306.7 57.25 309.4 54.05 313.75 52.25 326.55 47.2 338.25 60.05
M 377.45 83.55
Q 375 92.25 367.55 98.3 379.3 83.2 376.85 67.15 380.1 74.8 377.45 83.55
M 366.95 51.7
Q 358.8 48.95 350.25 50.7 358.95 46.4 366.95 51.7
M 299.35 76
Q 302.3 86.65 309.6 97.65 299.05 88.05 299.35 76
M 331.85 49.85
Q 322.25 46.05 311.55 48.55 322.15 42.45 331.85 49.85 Z"/>

                  <path fill="#FFFFFF" stroke="none" d="
M 213.15 88.3
Q 203.45 71.85 208 56.25 203.8 63.45 205.2 72.4 206.55 81.3 213.15 88.3
M 219.8 42.2
Q 228.35 40.45 236.45 43.3 228.45 37.95 219.8 42.2
M 283.65 75
Q 279.4 85.2 270.8 95.1 282.45 86.95 283.65 75
M 254.85 44.85
Q 264.75 42.3 275.15 46.2 265.35 38.7 254.85 44.85
M 311.55 48.55
Q 322.25 46.05 331.85 49.85 322.15 42.45 311.55 48.55
M 309.6 97.65
Q 302.3 86.65 299.35 76 299.05 88.05 309.6 97.65
M 350.25 50.7
Q 358.8 48.95 366.95 51.7 358.95 46.4 350.25 50.7
M 367.55 98.3
Q 375 92.25 377.45 83.55 380.1 74.8 376.85 67.15 379.3 83.2 367.55 98.3 Z"/>

                  <path fill="url(#Gradient_1)" stroke="none" d="
M 275.95 52.9
Q 274.15 51 271.6 49.55 259.55 42.9 246.3 54.1 236.15 44.1 226.15 44.9 223.15 45.1 220.2 46.25 217.45 47.4 215.35 49.15 207.65 55.45 208.8 69.7 208.45 80.3 220.95 92.75 228.95 100.7 242.1 109.35 252.45 104.3 259.9 99.25 278.75 86.7 280 74.3 280.7 70.9 280.85 67.95 281.3 58.4 275.95 52.9 Z"/>

                  <path fill="url(#Gradient_2)" stroke="none" d="
M 357.85 53.25
Q 348.7 52.15 338.25 60.05 326.55 47.2 313.75 52.25 309.4 54.05 306.7 57.25 302.35 62.35 302.05 71.2 302.05 73.4 302.2 75.8 301.95 86.25 313.95 98.5 321.95 106.6 335.3 115.35 351.3 107.55 360.65 99.9 372.5 90.05 373.45 80.4 375.8 69.15 372 62.3 369.7 58.15 365 55.65 361.5 53.65 357.85 53.25 Z"/>
                </g>
              </g>

              <g>
                <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 335.3 115.35
Q 321.95 106.6 313.95 98.5 301.95 86.25 302.2 75.8 302.05 73.4 302.05 71.2 302.35 62.35 306.7 57.25 309.4 54.05 313.75 52.25 326.55 47.2 338.25 60.05 348.7 52.15 357.85 53.25 361.5 53.65 365 55.65 369.7 58.15 372 62.3 375.8 69.15 373.45 80.4 372.5 90.05 360.65 99.9 351.3 107.55 335.3 115.35 Z
M 375.8 57.25
Q 379.25 56.4 382.85 57.2 384.85 58.4 384.6 60 384 63.7 379.4 65.05 383.4 78.95 375.95 91.55 367.6 105.4 353.7 112.15 346.3 117.6 335.1 121.45 324.4 116.2 317.65 109.8 304.2 101.05 297.6 86.25 291.7 72.95 298.15 59.8 292.75 54.2 286.05 58.85 290.8 72.8 283.15 85.4 274.8 99.15 260.2 106.15 252.8 111.55 241.55 115.4 230.95 110.1 224.25 103.85 211.3 95.35 204.9 80.5 199.45 68.1 204.05 55.8 201.8 54.25 200.45 50 200.6 48.05 203.4 47.3 205.15 46.75 208.05 48.05 214.2 39.7 225.45 38.1 237.35 38.65 246.8 47.25 255.65 39.8 267.55 40.85 278.45 43.9 283.55 53 293.05 46.7 301.6 54.1 307.75 45.7 318.9 44.15 330.85 44.65 338.7 53.15 349.1 45.85 361.05 46.85 371.3 49.7 375.8 57.25 377.5 59.95 378.45 62.25 378.95 63.7 379.4 65.05
M 242.1 109.35
Q 252.45 104.3 259.9 99.25 278.75 86.7 280 74.3 280.7 70.9 280.85 67.95 281.3 58.4 275.95 52.9 274.15 51 271.6 49.55 259.55 42.9 246.3 54.1 236.15 44.1 226.15 44.9 223.15 45.1 220.2 46.25 217.45 47.4 215.35 49.15 207.65 55.45 208.8 69.7 208.45 80.3 220.95 92.75 228.95 100.7 242.1 109.35 Z
M 301.6 54.1
Q 300.5 55.5 299.6 57.1 298.75 58.45 298.15 59.8
M 283.55 53
Q 284.35 54.55 285 56.2 285.6 57.55 286.05 58.85
M 208.05 48.05
Q 207.1 49.5 206.1 51.1 204.9 53.45 204.05 55.8"/>
              </g>
            </g>
          </g>
        </svg>

    );
  }

  static getFervieRightSvg(id, accessoryColor) {
    return (
      <svg id={id} preserveAspectRatio="xMinYMin meet"  x="0px" y="0px" width="543px" height="443px" viewBox="0 0 543 442">
        <defs>
          <linearGradient id="Gradient_1" gradientUnits="userSpaceOnUse" x1="328.15000000000003" y1="110.35000000000001" x2="331.05" y2="62.55" spreadMethod="pad">
            <stop  offset="0%" stopColor="#00C8FF"/>

            <stop  offset="100%" stopColor="#7F00FF"/>
          </linearGradient>

          <linearGradient id="Gradient_2" gradientUnits="userSpaceOnUse" x1="390.0125" y1="99.8375" x2="394.28749999999997" y2="57.262499999999996" spreadMethod="pad">
            <stop  offset="0%" stopColor="#00C8FF"/>

            <stop  offset="100%" stopColor="#7F00FF"/>
          </linearGradient>

          <linearGradient id="Gradient_3" gradientUnits="userSpaceOnUse" x1="391.1125" y1="99.8375" x2="393.78749999999997" y2="57.262499999999996" spreadMethod="pad">
            <stop  offset="0%" stopColor="#00C8FF"/>

            <stop  offset="100%" stopColor="#7F00FF"/>
          </linearGradient>
        </defs>

        <g id="heartglasses">
          <g>
            <g>
              <g>
                <path fill={accessoryColor} stroke="none" d="
M 298.25 71.7
Q 299.05 70.15 299.9 68.7 297.5 67.8 296.05 68.55 293.7 69.6 293.6 71.4 294.75 75.15 296.55 76.35 297.25 74.05 298.25 71.7
M 362.05 63.85
Q 362.7 65.2 363.25 66.65 363.7 67.75 364.1 68.95 366.1 67.05 368 66.5
L 368 65.15
Q 368.3 65.05 368.55 65 370.4 64.5 372 66.95 372.35 65.75 372.75 64.5 373.25 63.05 373.8 61.85 371.25 58.7 368.55 59.4 368.3 59.45 368 59.55
L 368 60.3
Q 365.05 61.1 362.05 63.85 Z"/>

                <path fill={accessoryColor} stroke="none" d="
M 362.05 63.85
Q 357.85 56 348.9 54.6 339.05 55.1 331.75 63.05 324 56.35 314.2 57.35 304.95 60.2 299.9 68.7 299.05 70.15 298.25 71.7 297.25 74.05 296.55 76.35 292.8 88.25 297.25 99.1 302.55 112 313.2 118.15 318.75 123.15 327.45 126.75 336.75 121.75 342.8 115.9 354.85 107.6 361.75 93.8 368.05 81.25 364.1 68.95 363.7 67.75 363.25 66.65 362.7 65.2 362.05 63.85
M 352.2 62.15
Q 354.3 63.15 355.8 64.7 360.2 69.15 359.85 77.95 359.7 80.75 359.15 83.95 358.1 95.6 342.55 109.55 336.45 115.15 327.95 121.1 317.05 114.75 310.5 108.4 300.2 98.4 300.5 88.6 299.55 75.55 305.85 68.75 307.6 66.85 309.85 65.5 312.3 64.05 314.8 63.5 323 61.5 331.4 69.5 342.3 57.5 352.2 62.15
M 338.4 59.9
Q 347.1 52.9 355.1 58.55 346.55 56.3 338.4 59.9
M 351.55 104.4
Q 358.6 94.1 362.1 84.2 361.2 95.35 351.55 104.4
M 309.55 61.8
Q 316.65 56.8 323.25 60.7 316.6 59.1 309.55 61.8
M 297.5 91.55
Q 296.4 83.35 299.8 76.25 296.1 91.3 304.05 105.2 298.65 99.65 297.5 91.55
M 405.05 86.4
Q 407.5 75.15 406.2 63.8 406.1 62.7 405.9 61.55 405.6 59.65 405.05 57.6 403.55 51.7 400.25 50.25 396.35 50.5 393 57.6 388.95 51.2 382.75 51.85 377 54.25 373.8 61.85 373.25 63.05 372.75 64.5 372.35 65.75 372 66.95 368.7 78.55 371.75 89.15 375.15 101.05 382.1 107.1 385.6 111.8 391.1 115.25 392.1 114.55 393 113.8 395.85 110.1 397.9 105.75 402.35 98.8 405.05 86.4
M 405.4 65.85
Q 406.4 71.95 405.55 79.5 404.8 87.05 402.35 92.8 406.15 79.05 405.4 65.85
M 399.25 55.85
Q 400.4 55.9 401.55 57.2 403.05 58.9 403.8 62.15 405.05 67.55 404.3 77.25 403.95 85.4 400.1 94.85 397.4 101.25 393 108.3 392.1 109.2 391.15 110.15 384.35 104 380.2 97.9 374 88.75 374.1 79.95 374.05 77.95 374.05 76.1 374.2 68.7 376.45 64 377.85 61.05 380.1 59.2 386.7 53.7 392.75 63.45 392.9 63.25 393 63.05 396.3 55.75 399.25 55.85
M 396.75 54.4
Q 399.55 50.05 402.15 53.75 399.5 52.2 396.75 54.4
M 377.9 97.6
Q 372.45 90.5 372.65 80.45 374.15 89.05 377.9 97.6
M 389.45 55.45
Q 384.45 53.15 378.95 56.15 384.4 50.1 389.45 55.45 Z"/>

                <path fill="#FFFFFF" stroke="none" d="
M 299.8 76.25
Q 296.4 83.35 297.5 91.55 298.65 99.65 304.05 105.2 296.1 91.3 299.8 76.25
M 323.25 60.7
Q 316.65 56.8 309.55 61.8 316.6 59.1 323.25 60.7
M 362.1 84.2
Q 358.6 94.1 351.55 104.4 361.2 95.35 362.1 84.2
M 355.1 58.55
Q 347.1 52.9 338.4 59.9 346.55 56.3 355.1 58.55
M 378.95 56.15
Q 384.45 53.15 389.45 55.45 384.4 50.1 378.95 56.15
M 372.65 80.45
Q 372.45 90.5 377.9 97.6 374.15 89.05 372.65 80.45
M 402.15 53.75
Q 399.55 50.05 396.75 54.4 399.5 52.2 402.15 53.75
M 405.55 79.5
Q 406.4 71.95 405.4 65.85 406.15 79.05 402.35 92.8 404.8 87.05 405.55 79.5 Z"/>

                <path fill="url(#Gradient_1)" stroke="none" d="
M 355.8 64.7
Q 354.3 63.15 352.2 62.15 342.3 57.5 331.4 69.5 323 61.5 314.8 63.5 312.3 64.05 309.85 65.5 307.6 66.85 305.85 68.75 299.55 75.55 300.5 88.6 300.2 98.4 310.5 108.4 317.05 114.75 327.95 121.1 336.45 115.15 342.55 109.55 358.1 95.6 359.15 83.95 359.7 80.75 359.85 77.95 360.2 69.15 355.8 64.7 Z"/>

                <path fill="url(#Gradient_2)" stroke="none" d="
M 393 63.05
Q 392.9 63.25 392.75 63.45 386.7 53.7 380.1 59.2 377.85 61.05 376.45 64 374.2 68.7 374.05 76.1 374.05 77.95 374.1 79.95 374 88.75 380.2 97.9 384.35 104 391.15 110.15 392.1 109.2 393 108.3
L 393 63.05 Z"/>

                <path fill="url(#Gradient_3)" stroke="none" d="
M 401.55 57.2
Q 400.4 55.9 399.25 55.85 396.3 55.75 393 63.05
L 393 108.3
Q 397.4 101.25 400.1 94.85 403.95 85.4 404.3 77.25 405.05 67.55 403.8 62.15 403.05 58.9 401.55 57.2 Z"/>
              </g>
            </g>

            <g>
              <path stroke="#000000" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" d="
M 372 66.95
Q 368.7 78.55 371.75 89.15 375.15 101.05 382.1 107.1 385.6 111.8 391.1 115.25 392.1 114.55 393 113.8 395.85 110.1 397.9 105.75 402.35 98.8 405.05 86.4 407.5 75.15 406.2 63.8 406.1 62.7 405.9 61.55 405.6 59.65 405.05 57.6 403.55 51.7 400.25 50.25 396.35 50.5 393 57.6 388.95 51.2 382.75 51.85 377 54.25 373.8 61.85 373.25 63.05 372.75 64.5 372.35 65.75 372 66.95 370.4 64.5 368.55 65 368.3 65.05 368 65.15
M 368 66.5
Q 366.1 67.05 364.1 68.95 368.05 81.25 361.75 93.8 354.85 107.6 342.8 115.9 336.75 121.75 327.45 126.75 318.75 123.15 313.2 118.15 302.55 112 297.25 99.1 292.8 88.25 296.55 76.35 294.75 75.15 293.6 71.4 293.7 69.6 296.05 68.55 297.5 67.8 299.9 68.7 304.95 60.2 314.2 57.35 324 56.35 331.75 63.05 339.05 55.1 348.9 54.6 357.85 56 362.05 63.85 365.05 61.1 368 60.3
M 368 59.55
Q 368.3 59.45 368.55 59.4 371.25 58.7 373.8 61.85
M 327.95 121.1
Q 336.45 115.15 342.55 109.55 358.1 95.6 359.15 83.95 359.7 80.75 359.85 77.95 360.2 69.15 355.8 64.7 354.3 63.15 352.2 62.15 342.3 57.5 331.4 69.5 323 61.5 314.8 63.5 312.3 64.05 309.85 65.5 307.6 66.85 305.85 68.75 299.55 75.55 300.5 88.6 300.2 98.4 310.5 108.4 317.05 114.75 327.95 121.1 Z
M 362.05 63.85
Q 362.7 65.2 363.25 66.65 363.7 67.75 364.1 68.95
M 393 63.05
Q 396.3 55.75 399.25 55.85 400.4 55.9 401.55 57.2 403.05 58.9 403.8 62.15 405.05 67.55 404.3 77.25 403.95 85.4 400.1 94.85 397.4 101.25 393 108.3 392.1 109.2 391.15 110.15 384.35 104 380.2 97.9 374 88.75 374.1 79.95 374.05 77.95 374.05 76.1 374.2 68.7 376.45 64 377.85 61.05 380.1 59.2 386.7 53.7 392.75 63.45 392.9 63.25 393 63.05 Z
M 299.9 68.7
Q 299.05 70.15 298.25 71.7 297.25 74.05 296.55 76.35"/>
            </g>
          </g>
        </g>
      </svg>

    );
  }
}
