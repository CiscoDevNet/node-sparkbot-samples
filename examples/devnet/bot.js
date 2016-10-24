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

// Starts your Bot with default configuration. The SPARK API access token is read from the SPARK_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });

var Events = require("./events.js");


bot.onCommand("about", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "```\n{\n   'author':'Brought to you by Cisco DevNet',\n   'code':'https://github.com/ObjectIsAdvantag/sparkbot-webhook-samples/blob/master/examples/devnet/bot.js',\n   'description':'shows upcoming DevNet events',\n   'healthcheck':'GET https://devnet-events-sparkbot.herokuapp.com/',\n   'webhook':'POST https://devnet-events-sparkbot.herokuapp.com/'\n}\n```"
    });
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
bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});
function showHelp(roomId) {
    spark.messageSendRoom(roomId, {
        markdown: "I can tell about DevNet events\n- /about\n- /help\n- /next [#max]: show upcoming #max events, defaults to 5\n- /now: show events happening now\n"
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
