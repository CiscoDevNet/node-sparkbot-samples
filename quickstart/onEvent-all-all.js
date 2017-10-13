//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//


/* 
 * a Cisco Spark Bot that listens to specific Webhooks events, leverages node-sparkbot webhook.onEvent() function.
 */

var SparkBot = require("node-sparkbot");

// Leverage a simple webhook framework
var bot = new SparkBot();
 
bot.onEvent("all", "all", function(trigger) {
  
    //
    // YOUR CODE HERE
    //
    console.log("EVENT: " + trigger.resource + "/" + trigger.event + ", with data id: " + trigger.data.id + ", triggered by person id:" + trigger.actorId);
  
});

