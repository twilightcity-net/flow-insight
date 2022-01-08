    .*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.
    :    ____________ _______       _______________ ____        ____          /         :
    :   |       _____|       |     |               |    |  __  |    |      /\/          :
    :   |       __|  |       |_____|       |       |     \/  \/     |     /             :
    :   |______|_____|_____________|_______________|________________|_________________  :
    :          |     |        |    |   _______|    |      ___|      |     |           | :
    :          |     |     |       |_______   |    |     |_+-|            |_         _| :
    :       /  |_____|_____|_______|__________|____|_________|______|_____| |_______|   :
    :    /\/                                                                            :
    :   /                              T W I L I G H T  C I T Y , I N C  © 2 0 2 1      :
    :.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.:

## FlowInsight Desktop Application ##
Flow Insight is a desktop console application that gives you smart stats for your workflow, and helps you learn and improve efficiency of your team.
 
 It works in tandem with a peer-to-peer socket server called Talknet, and a metrics engine called Gridtime. 
 
### Install from Source ###
The following will describe how to install 'FlowInsight' from source code, and connect to production servers: "https://home.flowinsight.com" 
and for Talknet "https://talk.flowinsight.com".  Please contact us for an API key.

Requirements:
- Node v16.13.0
- Xcode-CLI (`xcode-select --install`) (Mac Only)
- Yarn v1.22.x
- Git w/ CLI

0) Install git version control system from here:

https://git-scm.com/downloads

1) Install the required version of NodeJS following these instructions: 

https://nodejs.org/en/ 

2) Install yarn package system using the following these instructions:

https://yarnpkg.com/lang/en/docs/install/

3) Open up a terminal window and navigate into a secure place where you store source code. The run the  git command:

`git clone https://github.com/twilightcity-net/twilightcity-desktop.git`

4) On mac arm64 architecture, electron is not yet supported, workaround this issue by using x64 packages:

`export npm_config_arch=x64`

4) Using yarn, install the projects module dependencies with the following command in the terminal: 

`yarn install`

5) Done! Run the following command in your terminal to start the application:

`yarn dev` or `yarn .` 

***DRYCLEANING:*** Try running `yarn ..` to quickly clean and build: new documentation (for your IDEA), lint, compile, build and run in dev mode.

***OPTIONAL:*** To run the project using the local development mock api, use:

`yarn dev:local`

Note: hit `ctrl+c` to terminate the project.

### Running Integration and Unit Tests ###

1) Run the following command in the terminal to execute the entire sweet of tests:

`yarn test`

1) Run the following command in the terminal to execute a specific test (talknet service for example:

`yarn test:talk`

***NOTE:*** These test files are found in './test/.' Certain configuration is required if you wish to create a new category of tests to be added. These files can also be executed without executing via our test framework.

### Updating Your Source Code From Repo ###

1) Run the following command in the terminal after making some file changes:

`yarn update`

### Install React Development Tools ###

1) Run the application using 

`yarn dev` or `yarn .`

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

Documentation files will be exported to ~/flow-insight/docs.

### Package & Release FlowInsight ###

1) Run the following command in the terminal:

`yarn release`

### Pushing Source Code To Repository ###

1) Run the following command in the terminal after making some file changes:

`yarn stage`

2) Commit your changes with this command: 

`git commit -m '<imperative_voice_description>'`

3) Then push your changes with:

`git push`

### Publish FlowInsight Release ###

1) Save a copy of `electron-builder.env.sample` -> `electron-builder.env` in the root directory of the project.

2) Insert your GitHub Personal Access Token in `electron-builder.env`. You can generate a token here:

https://github.com/settings/tokens

GitHub personal access token is required. You can generate by going to https://github.com/settings/tokens/new. The access token should have the repo scope/permission. Define GH_TOKEN environment variable.

3) Run the following command in the terminal:

`yarn release`

--------------------------
contact: [admin@flowinsight.com](mailto:admin@flowinsight.com)
