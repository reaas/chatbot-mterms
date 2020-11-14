# Chatbot mTerms - NTNU - Microsoft Teams App

## Pre-requisits
You need an Azure subscruption to run the application. Bot a ResourceGroup and a BotRegistrationChannel needs to be set up. You can find a guide [here](https://docs.microsoft.com/en-gb/learn/modules/msteams-messaging-extensions/3-exercise-action-commands) (follow the steps under _Register a new bot in Microsoft Azure_)

**Make sure you save the _appID_ and _appPassword_ from this guide**

Change the `APPLICATION_ID` and `MICROSOFT_APP_ID` int the `.env` file with the _appID_. Change the `MICROSOFT_APP_PASSWORD` with the _appPassword_.

Next change the `id` and `botId` fields in `src/manifest/manifest.json` with the _appID_ as well.

---

Make sure you have `npm` and `nodejs` installed. How to do this visit the [npm website](https://www.npmjs.com/get-npm).

To run the chatbot you need to enter the following in your terminal/command line tool:
```bash
npm install -g gulp-cli ngrok
```

gulp is a JavaScript framework for streamlining the build process of front-end development projects.

ngrok is a free DNS-tunnel serivce that exposes the application run on your computer to Azure.

## Building the app
Make sure you clone this repository to your local computer by runnning:
```bash
git clone https://github.com/reaas/chatbot-mterms.git
```

To build the app locally, run the following in the root directory of this repository:
``` bash
npm install
gulp build
```

The following image shows a successful build:

![success](https://i.imgur.com/51tLd3G.png)


## Run the local server
Now that the application is built, it is time to run it locally. Enter the following command:
``` bash
gulp ngrok-serve
```

On line 5 of the output from `gulp ngrok-serve` you'll notice a URL. This URL is the URL to the bot service now hosted locally on your computer:
![ngrokserve](https://i.imgur.com/LQ9YNqV.png)

Copy this URL, and paste it in the `Messaging endpoint` field under `Bot Channels Registration->Settings`:

![messagingendpoint](https://i.imgur.com/7r2LbZV.png)

Now you can either test the bot in the webchat in Azure, or upload the `package/chatbot-mterms.zip` to your own Microsoft Teams installation.

**gulp provides the developer with hot realoding of the app. When changes are made, the bot is recompiled on the same URL as earlier, so there is no need to serve the app again.** Each time `gulp ngrok-serve` is run, the URL has to be changed.
