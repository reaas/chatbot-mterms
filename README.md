# Chatbot mTerms - NTNU - Microsoft Teams App

## Configuration

Configuration is stored in the `.env` file.
The tokens in this file must match the tokens in Microsoft Azure bot channels registration.

## Building the app

``` bash
npm install
gulp build
```

## Run the local server

``` bash
gulp ngrok-serve
```
This command gives a url that you must copy paste into the bot messaging endpoint in Microsoft Azure. 
