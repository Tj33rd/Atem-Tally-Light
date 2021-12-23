# Atem-Tally-Light

This tally light system is specifically designed for Koningskerk Zwolle-zuid. It may or may not work propperly or suit your needs.

# Setup

To set the system up, follow these steps:

1. Install the latest version of [node.js](https://nodejs.org/en/download/) 
2. Clone this repository to a folder on the machine
3. Make sure you are on the same subnet as the ATEM
3. Open the command prompt, and cd into the folder
4. Run the following command: `node . --atem [AtemIp]`

The application runs on port 8080 by default. 

If you want to run the application on a different port, enter the following command instead: `node . --port [PORT] --atem [AtemIp]`

To check whether or not the application is running, go to `[LocalIP]:[PORT]`
|Variable                |Description|Default|
|----------------|-------------------------------|-|
|LocalIp|The IP-address of the machine on which the application is running. `ipconfig` in Command prompt to find IP|N/A|
|Port          |The port you defined on startup with `--port [PORT]` | 8080|
|AtemIp          |The IP-address of the ATEM you want to connect to. Use a tool such as [IP-scanner](https://www.advanced-ip-scanner.com/) to find the ATEM's IP| N/A|

# Questions
If you are struggling to get it up and running or have other questions regarding this system, please create an issue or send me a message.
