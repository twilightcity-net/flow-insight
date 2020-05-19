    "                                                                                               ",
    "     .:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.     ",
    "     :    __________ __________ __________ _________ _____ _____ _________ __________    :     ",
    "     :   |          |          |    __   \\\\         |     |     |_       _|        __|   :     ",
    "     :   |_        _|    __    |         <|       __|           |_|     |_|        __|   :     ",
    "     :    _|______|_|__________|_____|____|_________|_____|_____|_________|__________|   :     ",
    "     :   |      ______|     |     |         __|          |________|          |_______    :     ",
    "     :   |______      |           |         __|                   |                  |   :     ",
    "     :   |____________|_____|_____|___________|___________________|__ZoeDreams_800XL |   :     ",
    "     :                                           D R E A M S C A L E © 2 0 2 0           :     ",
    "     :                                                                                   :     ",
    "     :.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:     ",
    "                                                                                               \n"
    
## Torchie Desktop Application ##
Electron desktop application which provides dev workflow & team collaborative troubleshooting tools

### Install from Source ###
The following will descrive how to install 'torchie' from source code, and run using @DreamScale production api for GridTime "https://torchie.dreamscale.io" and for Talk "https://talk.dreamscale.io".  

Requirements:
- Node v11.15.x
- Xcode-CLI (`xcode-select --install`)
- Yarn v1.2.x
- Git w/ CLI

0) Install git version control system from here:

https://git-scm.com/downloads

1) Install the latest version of NodeJS following these instructions: 

https://nodejs.org/en/ 

2) Install yarn package system using the following these instructions:

https://yarnpkg.com/lang/en/docs/install/#mac-stable

3) Open up a terminal window and navigate into a secure place where you store source code. The run the  git command:

`git clone https://github.com/dreamscale-io/torchie-desktop.git`

4) Using yarn, install the projects module dependencies with the following command in the terminal: 

`yarn install`

5) Done! Run the following command in your terminal to start the application:

`yarn dev`

***OPTIONAL:*** To run the project using the local development mock api, use:

`yarn dev:local`

Note: hit `ctrl+c` to terminate the project.

### Running Integration and Unit Tests ###

1) Run the following command in the terminal to execute the entire sweet of tests:

`yarn test`

1) Run the following command in the terminal to execute a specific test (talk service for example:

`yarn test:talk`

***NOTE:*** These test files are found in './test/.' Certain configuration is required if you wish to create a new category of tests to be added. These files can also be executed without executing via our test framework.

### Updating Your Source Code From Repo ###

1) Run the following command in the terminal after making some file changes:

`yarn update`

### Install React Development Tools ###

1) Run the application using 

`yarn dev`

2) Wait for the app to load, and open the chrome dev window for the console window

3) copy paste the follow javascript code into your console window, and press enter to execute

    `const {default: installExtension, REACT_DEVELOPER_TOOLS} = require("electron-devtools-installer");
    installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => { 
        console.log("Added Extension: " + name);
     })
    .catch((err) => {
        console.log("An error occurred: " + err);
     });`

4) Done. Yay. Have cake.

### Code Documentation

Thank you first for commenting your code. This project uses the module jsdoc to generate a static html API website that outlines all of our modules, classes, and functions. You can find documentation help and examples at the following links:

- https://github.com/jsdoc3/jsdoc
- http://usejsdoc.org/index.html

To generate the static html documentation, run the following command:
`yarn docs`

* please note that you may need to prefix `sudo` or `su`

Documentation files will be exported to ~/torchie-desktop/docs.

### Package & Release Torchie ###

1) Run the following command in the terminal:

`yarn release`

### Pushing Source Code To Repository ###

1) Run the following command in the terminal after making some file changes:

`yarn stage`

2) Commit your changes with this command: 

`git commit -m 'some descriptive message'`

3) Then push your changes with:

`git push`

### Publish Torchie Release ###

1) Save a copy of `electron-builder.env.sample` -> `electron-builder.env` in the root directory of the project.

2) Insert your GitHub Personal Access Token in `electron-builder.env`. You can generate a token here:

https://github.com/settings/tokens

GitHub personal access token is required. You can generate by going to https://github.com/settings/tokens/new. The access token should have the repo scope/permission. Define GH_TOKEN environment variable.

3) Run the following command in the terminal:

`yarn release`

--------------------------
contact: [janelle@dreamscale.io](mailto:janelle@dreamscale.io) // [kara@dreamscale.io](mailto:kara@dreamscale.io)
