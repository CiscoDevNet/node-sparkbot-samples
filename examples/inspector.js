//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a bot that gives you instant access to Webex Teams technical data
 * 
 * note : this example can work with any type of token (from a developer or bot account)
 *  
 */

const debug = require("debug")("samples");
const fine = require("debug")("samples:fine");

// Start your Bot with default configuration where the Webex Teams API access token is read from the ACCESS_TOKEN env variable 
const WebexChatBot = require("node-sparkbot");
const bot = new WebexChatBot();

// Do not listen to ourselves
// Uncomment if you're running the bot a 'User' developer access token
//bot.interpreter.ignoreSelf = false; 

// Overloading the bot default triggering '/' filter
bot.interpreter.prefix = ""; // no prefix

const SparkClient = require("node-sparky");
const sparky = new SparkClient({ token: process.env.ACCESS_TOKEN || process.env.SPARK_TOKEN });


bot.onCommand("about", function (command) {
    sparky.messageSend({
        roomId: command.message.roomId, 
        markdown: "```\n{\n   'author':'Stève Sfartz <stsfartz@cisco.com>',\n   'code':'https://github.com/CiscoDevNet/node-sparkbot-samples/blob/master/examples/inspector.js',\n   'description':'an handy tool to reveal Webex Teams technical data',\n   'healthcheck':'GET https://sparkbot-inspector.herokuapp.com',\n   'webhook':'POST https://sparkbot-inspector.herokuapp.com'\n}\n```"
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
        markdown: "I can give you quick access to Webex Teams technical data. Simply type:\n- **about**\n- **help**\n- **roomId**: reveals this room identifier\n- **whoami**: shows your account info\n- **whois @mention**: inquire about other participants"
    });
}


bot.onCommand("roomId", function (command) {
    sparky.messageSend({
        roomId: command.message.roomId,
        markdown: "roomId: " + command.message.roomId
    });
});


bot.onCommand("whoami", function (command) {
    sparky.messageSend({
        roomId: command.message.roomId,
        markdown: "personId: " + command.message.personId + "\n\nemail: " + command.message.personEmail
    });
});


bot.onCommand("whois", function (command) {
    // Check usage
    if ((!command.message.mentionedPeople) || (command.message.mentionedPeople.length != 2)) {
        sparky.messageSend({
            roomId: command.message.roomId,
            markdown: "sorry, I cannot proceed if you do not mention a room participant"
        });
        return;
    }

    let participant = command.message.mentionedPeople[1];

    sparky.personGet(participant).then(function (person) {
        sparky.messageSend({
            roomId: command.message.roomId,
            markdown: "personId: " + person.id + "\n\ndisplayName: " + person.displayName + "\n\nemail: " + person.emails[0]
        });
    });
});


bot.onEvent("memberships", "created", function (trigger) {
    let newMembership = trigger.data; // see specs here: https://developer.ciscosparky.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        sparky.messageSend({
            roomId: trigger.data.roomId,
            text: "Hi, I am the Inspector Bot!"
        })
            .then(function (message) {
                if (message.roomType == "group") {
                    sparky.messageSend({
                        roomId: message.roomId, 
                        markdown: "**Note that this is a 'Group' room. I will wake up only when mentionned.**"
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
