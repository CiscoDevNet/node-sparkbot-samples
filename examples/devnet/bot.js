//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a bot to list current and upcoming DevNet events
 * 
 * reads events from a REST API which reflects https://developer.cisco.com/site/devnet/events-contests/events/
 * 
 */

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts a Spark Bot with default configuration, access token read from the SPARK_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();

// nodejs client to write back to Cisco Spark
var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });

// event API wrapper that preformats markdown messages to send back to Cisco Spark
var Events = require("./events.js");



bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});
bot.onCommand("fallback", function (command) {
    // so happy to join
    spark.messageSendRoom(command.message.roomId, {
        text: "**sorry, I did not understand**"
    })
        .then(function (message) {
            // show how to use
            showHelp(command.message.roomId);
        });
});
function showHelp(roomId) {
    spark.messageSendRoom(roomId, {
        markdown: "I can tell about DevNet events\n- /about\n- /help\n- /next [#max]: upcoming events, defaults to /next 5\n- /now: events happening now\n"
    });
}




bot.onCommand("next", function (command) {

    // let's acknowledge we received the order
    spark.messageSendRoom(command.message.roomId, {
        markdown: "_heard you! asking my crystal ball..._"
    });

    var limit = parseInt(command.args[0]);
    if (!limit) limit = 5;
    if (limit < 1) limit = 1;

    Events.fetchNext(limit, function (err, events) {
        if (err) {
            spark.messageSendRoom(command.message.roomId, {
                 markdown: "**sorry, ball seems broken :-(**"
            });
            return;
        }

        spark.messageSendRoom(command.message.roomId, {
            markdown: events
        });  
    });
});


bot.onCommand("now", function (command) {
    // let's acknowledge we received the order
    spark.messageSendRoom(command.message.roomId, {
        markdown: "_heard you! let's check what's happening now..._"
    });

    Events.fetchCurrent(function (err, events) {
        if (err) {
            spark.messageSendRoom(command.message.roomId, {
                 markdown: "**sorry, could not contact the organizers :-(**"
            });
            return;
        }

        spark.messageSendRoom(command.message.roomId, {
            markdown: events
        });  
    });
});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, I am the DevNet Bot !"
        })
            .then(function (message) {
                if (message.roomType == "group") {
                    spark.messageSendRoom(message.roomId, {
                        markdown: "**Note: this is a 'Group' room,  I will wake up only when mentionned, ex: @" + bot.interpreter.nickName + " " +  bot.interpreter.prefix + "help**"
                    })
                        .then(function (message) {
                            showHelp(message.roomId);
                        });
                }
                else {
                    showHelp(message.roomId);
                }
            });
    }
});
