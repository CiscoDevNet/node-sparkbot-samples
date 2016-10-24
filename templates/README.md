# Templates for the node-sparkbot library

A set of templates to quickly bootstrap a Cisco Spark bot

- [onEvent-all-all](onEvent-all-all.js), [onEvent-messages-created](onEvent-messages-created.js): examples of listeners to specific Webhook (Resources/Event) triggers. Leverages Sparkbot function: webhook.onEvent().

- [onMessage](onMessage.js): examples of listeners invoked when new message contents are succesfully fetched from Spark. Leverages Sparkbot function: webhook.onMessage(). 

- [onMessage-asCommand](onMessage-asCommand.js): illustrates how to interpret the message as a bot command. Leverages Sparkbot function: webhook.onMessage().

- [onCommand](onCommand.js): shortcut to listen to a specific command. Leverages Sparkbot function: webhook.onCommand().


If you're looking for something even lighter, check [express-spark-webhook.js](express-spark-webhook.js) which illustrates how to create a bot from pure nodejs code (without any magic library).

- [express-spark-webhook](express-spark-webhook.js): a simple HTTP service based on Express, listening to incoming Resource/Events from Cisco Spark


## Run locally

Each template can be launched from the command line.

Note that the SPARK_TOKEN env variable is required to read message contents.

Once your bot is started, read this [guide to expose it publically and create a Cisco Spark webhook to have it start receiving events](../docs/GuideToRunLocally.md).



 