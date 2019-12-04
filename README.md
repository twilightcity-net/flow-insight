## Torchie Desktop Application ##
Electron desktop application which provides dev workflow & team collaborative troubleshooting tools

### Install from Source ###
The following will descrive how to install 'torchie' from source code, and run using @DreamScale production api "https://torchie.dreamscale.io".  

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

To run the project using the local development mock api, use:

`yarn dev:local`

Note: hit `ctrl+c` to terminate the project.

### Updating Your Source Code From Repo ###

1) Run the following command in the terminal after making some file changes:

`yarn update`

### Code Documentation

This project uses the module jsdoc to generate a static html API website that outlines all of our modules, classes, and functions. You can find documentation help and examples at the following links:

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

`yarn release:publish`

--------------------------
contact: [janelle@dreamscale.io](mailto:janelle@dreamscale.io) // [kara@dreamscale.io](mailto:kara@dreamscale.io)
