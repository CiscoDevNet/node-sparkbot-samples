//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//


/* 
 * a Cisco Spark Bot that listens to specific Webhooks events, leverages node-sparkbot webhook.onEvent() function.
 * note : this example requires that you've set a SPARK_TOKEN env variable to read messages contents.
 */

var SparkBot = require("node-sparkbot");

// Starts your Webhook with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 
var bot = new SparkBot();

bot.onEvent('messages', 'created', function(trigger) {
  console.log("new message from: " + trigger.data.personEmail + ", in room: " + trigger.data.roomId);
  
  bot.decryptMessage(trigger, function (err, message) {

    if (err) {
      console.log("could not fetch message contents, err: " + err.message); 
      return;
    }

    //
    // YOUR CODE HERE
    //
    console.log("processing message contents: " + message.text);

  });
  
});

