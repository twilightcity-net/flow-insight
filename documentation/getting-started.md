    .*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.
    :    ____________ _______       _______________ ____        ____          /         :
    :   |       _____|       |     |               |    |  __  |    |      /\/          :
    :   |       __|  |       |_____|       |       |     \/  \/     |     /             :
    :   |______|_____|_____________|_______________|________________|_________________  :
    :          |     |        |    |   _______|    |      ___|      |     |           | :
    :          |     |     |       |_______   |    |     |_+-|            |_         _| :
    :       /  |_____|_____|_______|__________|____|_________|______|_____| |_______|   :
    :    /\/                                                                            :
    :   /                              T W I L I G H T  C I T Y , I N C  © 2 0 2 2      :
    :.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.:

# Getting Started

FlowInsight is a toolset designed to optimize team flow for software teams.  This guide is intended to help you get started with installing and configuring FlowInsight for use by your team.

FlowInsight is current in beta testing, and free to use and evaluate during this time.  We are looking for teams interested in pilot testing FlowInsight and collaborate with us on a research effort for how to best optimize team flow.

You can sign up for a team account at https://www.flowinsight.com/get-started , and you'll be sent an activation code and a link to download the software.

## Installing the Flow Console 

FlowInsight is a desktop console application packaged for your specific operating system.  We currently support MacOS, MacOS (Apple Silicon), and Windows.  First, install the appropriate application package using the links provided in your introduction email.  

When you first start up the app, you will be prompted for the activation code, which will activate your account.  This activation code will expire after 3 days, so if your code expires, please send us an email, and we will send you a new code.

## Installing the FlowInsight Metrics plugin

Next, you will need the FlowInsight Metrics plugin for your specific IDE coding environment.  We currently support Jetbrains Intellij environment (and all package variations, WebStorm, RubyMine, etc), and will soon have a plugin for Microsoft VSCode as well.

To install the Intellij plugin, go to Preferences > Plugins in your IDE, and search for FlowInsight Metrics, and install the latest version of the plugin.

Once you restart your IDE, the FlowInsight Metrics plugin will prompt you to opt-in for tracking activity metrics for each code module, or you can opt-in to track all modules.   

The metrics plugin tracks basic IDE flow activity, such as which files you are looking at, the tests being executed, and detects whether you are reading or modifying code.  The IDE activity is spooled to an active.flow file in your `~/.flow/plugins/com.jetbrains.intellij` directory.  If you tail this file, you can watch specifically what the plugin is tracking, and make sure you are comfortable with the data being collected.

Once the plugin is installed, the Flow Console application will detect the plugin, and ask to register the plugin.  Once the plugin is registered, the FlowInsight application will start publishing the data from the plugin's flow feed, and you'll see flow activity metrics start to show up in the application.

## Configuring your Code Modules

Many of the features of the Flow Console will work without configuration, however, if you'd like to get the most out of the friction/flow reports, and identify which parts of the code have the most friction, we suggest configuring each of the code modules used by your team.

To configure a code module, you'll need to add a flowinsight-config.json file to the root of your code module directory.  Below is a sample of what your config file might look like:

`
    {
      "boxes": [
        {
          "box": "electron",
          "include": [
            "/public/*",
            "/resources/*"
          ],
          "exclude": [
            "/public/index.html",
            "/publci/css/*"
          ]
        },
        {
          "box": "renderer",
          "include": [
            "/src/*",
          ]
        },
        {
          "box": "css",
          "include": [
            "/public/index.html",
            "/public/css/*.css"
          ]
        }]
    }
`

The flowinsight-config.json file describes one or more "box configurations" that will group files together into a "box", i.e. code area, based on a match of their included file paths.  These boxes are used in several reports, such as calculating friction/flow per box and familiarity metrics per box.  

You can use 1 or more include paths, and 0 or more exclude paths, to create a valid box.  The * wildcard will match any number of subfolders or part of a file name, such as `*.css`.

The scope of the configuration file is for the whole team.  Once one person on the team loads the configuration file, it will be used to generate box metrics across the entire team.  If anyone on the team updates the configuration, all team member metrics will be affected.

### Loading the Code Module Configuration

If this is the first time you are configuring your code modules, when the Flow Console detects the configuration file, you will be prompted and asked if you want to load the config file.  If you're not ready yet, it's okay to say no, and you will be prompted again later (about 20 minutes).

You can also reload a code module configuration at any time, by opening up the Flow Console terminal.  Type 'terminal' in the talk browser bar to open a terminal command line.

Then type `reload {moduleName}` where {moduleName} is the top level folder name of your code module.

If you'd like to see the actively loaded configurations, you can find all related commands in the 'code' subshell.  Type `code` to enter the code subshell.  When you type `help`, you'll see a list of available commands.  If you type `help reload` you'll see the help documentation for the command we just typed in.

You can also use `show module configs` to show the active team configuration.  Or use `show structure for box {module}.{box}` to see which files are being matched inside a particular box.


contact: [admin@twilightcity.net](mailto:admin@twilightcity.net)
