# Templates for the node-sparkbot library

A set of templates to quickly bootstrap a Webex Teams chatbot:

- [onEvent-all-all](onEvent-all-all.js), [onEvent-messages-created](onEvent-messages-created.js): examples of listeners to specific Webhook (Resources/Event) triggers. Leverages node-sparkbot function: webhook.onEvent().

- [onMessage](onMessage.js): examples of listeners invoked when new message contents are succesfully fetched from Webex Teams. Leverages node-sparkbot function: webhook.onMessage(). 

- [onMessage-asCommand](onMessage-asCommand.js): illustrates how to interpret the message as a bot command. Leverages node-sparkbot function: webhook.onMessage().

- [onCommand](onCommand.js): shortcut to listen to a specific command. Leverages node-sparkbot function: webhook.onCommand().


If you're looking for something even lighter, check [express-webhook.js](express-webhook.js) which illustrates how to create a bot from pure nodejs code (without any magic library).

- [express-webhook](express-webhook.js): a simple HTTP service based on Express, listening to incoming Resource/Events from Webex Teams.


## Run locally

Each template can be launched from the command line.

Note that the ACCESS_TOKEN environment variable is required to read message contents.

Once your bot is started, read this [guide to expose it to the world and create a webhook and start receiving events from Webex](../docs/README.md).



 