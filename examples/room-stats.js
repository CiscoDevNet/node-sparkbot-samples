//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a Webex Teams bot that computes stats for a space
 * 
 * note : this example requires you set up an ACCESS_TOKEN env variable for a human account (NOT a bot account), 
 *     as this code reads past, and all messages in the space
 *  
 */

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts your Bot with default configuration. The Webex Teams API access token is read from the ACCESS_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();

// Change command prefix to #
// As this bot uses a 'HUMAN' account, it is necessary to have him invoked only if the prefix is used
bot.interpreter.prefix = "#";

var SparkClient = require("node-sparky");
var sparky = new SparkClient({ token: process.env.ACCESS_TOKEN });


bot.onCommand("about", function (command) {
    sparky.messageSend({
        roomId: command.message.roomId,
        markdown: "```\n{\n   'author':'Stève Sfartz <stsfartz@cisco.com>',\n   'code':'https://github.com/CiscoDevNet/node-sparkbot-samples/blob/master/examples/room-stats.js',\n   'description':'computes the top contributors for a space',\n   'healthcheck':'GET https://sparkbot-room-stats.herokuapp.com',\n   'webhook':'POST https://sparkbot-room-stats.herokuapp.com'\n}\n```"
    });
});


bot.onCommand("fallback", function (command) {
    // so happy to join
    sparky.messageSend({
        roomId: command.message.roomId,
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
    sparky.messageSend({
        roomId: roomId,
        markdown: "I am all about Stats for your spaces\n- "
        + "\\" + bot.interpreter.prefix + "about\n- "
        + "\\" + bot.interpreter.prefix + "help\n- "
        + "\\" + bot.interpreter.prefix + "stats [nb_messages] : computes stats from past messages, defaults to 100"
    });
}


bot.onCommand("stats", function (command) {

    // Max number of fetched messages, default is 100
    var max = command.args[0];
    if (!max) {
        max = 100;
    }

    // As computing stats takes time, let's acknowledge we received the order
    sparky.messageSend({
        roomId: command.message.roomId,
        markdown: "_heard you ! now computing stats from past " + max + " messages..._"
    });

    // Build a map of participations by participant email
    var participants = {};
    var totalMessages = 0; // used to get %ages of participation
    sparky.messagesGet({roomId: command.message.roomId}, max)
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
                    sparky.messageSend({
                        roomId: command.message.roomId,
                        text: "did not find any participant! is the space active?"
                    });
                    break;
                case 1:
                    sparky.messageSend({
                        roomId: command.message.roomId,
                        markdown: "**kudos to <@personEmail:" + top[0] + ">" + ", the only active participant in here!**"
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
                    sparky.messageSend({
                        roomId: command.message.roomId,
                        markdown: stats
                    });
                    break;
            }
        });

});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.webex.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        sparky.messageSend({
            roomId: trigger.data.roomId,
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


