//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a Cisco Spark bot that computes stats for a room
 * 
 * note : this example requires you set up a SPARK_TOKEN env variable for a real account (not a bot account), 
 *     as this code reads past messages in the room 
 *  
 */

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts your Bot with default configuration. The SPARK API access token is read from the SPARK_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();

// Change command prefix to #
bot.interpreter.prefix = "#";

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });



bot.onCommand("about", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "```\n{\n   'author':'Stève Sfartz <stsfartz@cisco.com>',\n   'code':'https://github.com/ObjectIsAdvantag/sparkbot-webhook-samples/blob/master/examples/room-stats.js',\n   'description':'computes the top contributors in a spark room',\n   'healthcheck':'GET https://sparkbot-room-stats.herokuapp.com',\n   'webhook':'POST https://sparkbot-room-stats.herokuapp.com'\n}\n```"
    });
});


bot.onCommand("fallback", function (command) {
    // so happy to join
    spark.messageSendRoom(command.message.roomId, {
        text: "sorry, I did not understand"
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
        markdown: "I am all about Stats for your Spark rooms\n- "
        + "\\" + bot.interpreter.prefix + "about\n- "
        + "\\" + bot.interpreter.prefix + "help\n- "
        + "\\" + bot.interpreter.prefix + "stats [#messages] : computes stats from past messages, defaults to 100"
    });
}


bot.onCommand("stats", function (command) {

    // Max number of fetched messages, default is 100
    var max = command.args[0];
    if (!max) {
        max = 100;
    }

    // As computing stats takes time, let's acknowledge we received the order
    spark.messageSendRoom(command.message.roomId, {
        markdown: "_heard you ! now computing stats from past " + max + " messages..._"
    });

    // Build a map of participations by participant email
    var participants = {};
    var totalMessages = 0; // used to get %ages of participation
    spark.messagesGet(command.message.roomId, max)
        .then(function (messages) {
            // Process messages 
            messages.forEach(function (message) {
                totalMessages++;

                // [WORKAROUND] Remove incoming integrations as they are not supported in mentions
                if (!isIncomingIntegration(message)) {
                    var current = participants[message.personEmail];
                    if (!current) {
                        participants[message.personEmail] = 1;
                    }
                    else {
                        participants[message.personEmail] = current + 1;
                    }
                }
            });

            // Sort participants by participation DESC
            var top = Object.keys(participants) //Create a list from the keys of your map. 
                .sort( //Sort it ...
                function (a, b) { // using a custom sort function that...
                    // compares (the keys) by their respective values.
                    return participants[b] - participants[a]; // DESC order
                });

            // Display top 10 participants 
            var length = top.length;
            var limit = Math.min(length, 10);
            switch (limit) {
                case 0:
                    spark.messageSendRoom(command.message.roomId, {
                        text: "did not find any participant! is the room active?"
                    });
                    break;
                case 1:
                    spark.messageSendRoom(command.message.roomId, {
                        markdown: "**kudos to <@personEmail:" + top[0] + ">" + ", the only 1 active participant in here !**"
                    });
                    break;
                default:
                    var stats = "**kudos to the top participants**";
                    for (var i = 0; i < limit; i++) {
                        var email = top[i];
                        var number = participants[email];
                        var pourcentage = Math.round(number * 100 / totalMessages);

                        // Display only relevant contributors
                        if (pourcentage >= 2) {
                            stats += "\n\n" + (i + 1) + ". <@personEmail:" + email + ">, " + pourcentage + "% (" + number + ")";
                        }
                    }
                    spark.messageSendRoom(command.message.roomId, {
                        markdown: stats
                    });
                    break;
            }
        });

});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, I am so happy to join !"
        })
            .then(function (message) {
                showHelp(trigger.data.roomId);
            });
    }
});


// Filter for incoming integration as these are automatically created by Spark back-end by creating a fake account
// This fake account has an email built from the owner email and suffixed with a number
// email: <owner-email>-<suffix-digits>@<owner-domain>
function isIncomingIntegration(message) {
    var matched = message.personEmail.match(/-\d+@/);
    if (!matched) {
        return false;
    }

    fine("identified as integration: " + message.personEmail);
    return true;
}


