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

// Starts a bot with default configuration, access token read from the ACCESS_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();
// removing the bot default triggering filter
bot.interpreter.prefix = ""; // not more "/" prepend to commands

// nodejs client to write back to Cisco Spark
var SparkClient = require("node-sparky");
var sparky = new SparkClient({ token: process.env.ACCESS_TOKEN });

// event API wrapper that preformats markdown messages to send back to Webex Teams
var Events = require("./events.js");



bot.onCommand("help", function (command) {
    showHelp(command.message.roomId);
});
bot.onCommand("fallback", function (command) {
    // so happy to join
    sparky.messageSend({
        roomId: command.message.roomId,
        markdown: "**sorry, I did not understand.**"
    })
        .then(function (message) {
            // show how to use
            showHelp(command.message.roomId);
        });
});
function showHelp(roomId) {
    sparky.messageSend({
        roomId: roomId,
        markdown: "I can tell about upcoming events at DevNet. Try:\n- about\n- help\n- next [#max]: upcoming events, defaults to 5\n- now: events happening now\n"
    });
}


bot.onCommand("about", function (command) {
    sparky.messageSend({
        roomId: command.message.roomId, 
        markdown: "```\n{\n   'author':'Stève Sfartz <stsfartz@cisco.com>',\n   'code':'https://github.com/CiscoDevNet/node-sparkbot-samples/blob/master/examples/devnet/bot.js',\n   'description':'inquire about upcoming events at DevNet',\n   'healthcheck':'GET https://devnet-events-sparkbot.herokuapp.com'\n}\n```"
    });
});

bot.onCommand("next", function (command) {

    // let's acknowledge we received the order
    sparky.messageSend({
        roomId: command.message.roomId,
        markdown: "_heard you! asking my crystal ball..._"
    });

    var limit = parseInt(command.args[0]);
    if (!limit) limit = 5;
    if (limit < 1) limit = 1;

    Events.fetchNext(limit, function (err, events) {
        if (err) {
            sparky.messageSend( {
                roomId: command.message.roomId,
                markdown: "**sorry, ball seems broken :-(**"
            });
            return;
        }

        sparky.messageSend({
            roomId: command.message.roomId, 
            markdown: events
        });  
    });
});


bot.onCommand("now", function (command) {
    // let's acknowledge we received the order
    sparky.messageSend({
        roomId: command.message.roomId, 
        markdown: "_heard you! let's check what's happening now..._"
    });

    Events.fetchCurrent(function (err, events) {
        if (err) {
            sparky.messageSend({
                roomId: command.message.roomId, 
                 markdown: "**sorry, could not contact the organizers :-(**"
            });
            return;
        }

        sparky.messageSend({
            roomId: command.message.roomId, 
            markdown: events
        });  
    });
});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.webex.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        sparky.messageSend({
            roomId: trigger.data.roomId, 
            text: "Hi, I am the DevNet Bot !"
        })
            .then(function (message) {
                if (message.roomType == "group") {
                    sparky.messageSend({
                        roomId: message.roomId, 
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
