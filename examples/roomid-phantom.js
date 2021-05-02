//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a bot that gives you instant info about a room id
 * 
 * note : this example could work with both a human (developer) or a bot account, 
 * but the philosophy of this bot is really to use it with a bot account
 *  
 */

const debug = require("debug")("samples");
const fine = require("debug")("samples:fine");

// Starts your Bot with default configuration. The Webex Teams API access token is read from the ACCESS_TOKEN env variable 
const WebexChatBot = require("node-sparkbot");
const bot = new WebexChatBot();

// do not listen to ourselves
// uncomment if you're running the bot from your Developer access token and you want to invoke in a 1-1 room
//bot.interpreter.ignoreSelf = false; 

// Removing the bot default triggering '/' filter
bot.interpreter.prefix = "";

const SparkClient = require("node-sparky");
const sparky = new SparkClient({ token: process.env.ACCESS_TOKEN });

bot.onCommand("about", function (command) {
    sparky.messageSend({
        roomId: command.message.roomId, 
        markdown: "```\n{\n   'author':'Stève Sfartz <stsfartz@cisco.com>',\n   'code':'https://github.com/CiscoDevNet/node-sparkbot-samples/blob/master/examples/roomid-phantom.js',\n   'description':'a handy tool to retreive Webex Teams space identifiers',\n   'healthcheck':'GET https://sparkbot-roomid.herokuapp.com',\n   'webhook':'POST https://sparkbot-roomid.herokuapp.com'\n}\n```"
    });
});


bot.onCommand("fallback", function (command) {
    // so happy to join
    sparky.messageSend({
        roomId: command.message.roomId, 
        text: "sorry, I did not understand. Try help."
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
        markdown: "Well, I am an ephemeral bot, serving developers. My primary mission is to fetch identifiers: add me to a space, and I'll send back - the room's identifier - in a private 1-1 message, then will silently leave the space I just got added to.\n\nAlso, be aware that my skills are limited:\n- about\n- help"
    });
}



bot.onEvent("memberships", "created", function (trigger) {
    let newMembership = trigger.data; // see specs here: https://developer.webex.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot has just been added to space: " + trigger.data.roomId);

        // only take action if it is not the bot who created the room, to send the message back
        if (trigger.actorId != bot.interpreter.person.id) {

            // Retreive actorEmail
            sparky.personGet(trigger.actorId)
                .then(function (person) {
                    let email = person.emails[0];
                    debug("found inquirer: " + email);

                    sparky.roomGet(newMembership.roomId)
                        .then(function (room) {
                            const { id, title } = room;
                            const unencoded = Buffer.from(id, "base64").toString();
                            let msg = "Details for the room you just added me to:\n";
                            msg += `\n* Name: **${title}**`;
                            msg += `\n* Room id (encoded): **${id}**`;
                            msg += `\n* Room id (not encoded): **${unencoded}** \n`;
                            msg += "\nI will now leave that space.";

                            // Send a direct message
                            sparky.messageSend({
                                toPersonEmail: email,
                                markdown: msg,
                            })
                                .then(function (message) {

                                    // Leave inquired room
                                    sparky.membershipRemove(newMembership.id)
                                        .then(function () {
                                            sparky.messageSend({
                                                toPersonEmail: email,
                                                markdown: "Job done: I have silently left the space... Let me know when you need other identifiers ;-)"
                                            });
                                        })
                                });
                            })
                    });


        }
    }
});

