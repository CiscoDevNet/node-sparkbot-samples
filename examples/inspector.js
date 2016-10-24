//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

/* 
 * a bot that gives you instant access to Cisco Spark technical data
 * 
 * note : this example can work with any type of spark token (from a developer or bot account)
 *  
 */

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts your Bot with default configuration where the SPARK API access token is read from the SPARK_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();

// do not listen to ourselves
// comment if you're running the bot from your Developer access token and you want to invoke in a 1-1 room
//bot.interpreter.ignoreSelf = true; 

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });


bot.onCommand("about", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "```\n{\n   'author':'Stève Sfartz <stsfartz@cisco.com>',\n   'code':'https://github.com/ObjectIsAdvantag/sparkbot-webhook-samples/blob/master/examples/inspector.js',\n   'description':'an handy tool to reveal spark technical data',\n   'healthcheck':'GET https://sparkbot-inspector.herokuapp.com',\n   'webhook':'POST https://sparkbot-inspector.herokuapp.com'\n}\n```"
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
        markdown: "I can give you quick access to Spark technical data:\n- /about\n- /help\n- /room: reveals this room identifier\n- /whoami: shows your spark info\n- /whois @mention: learn about other participants\n"
    });
}


bot.onCommand("room", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "roomId: " + command.message.roomId
    });

});


bot.onCommand("whoami", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "personId: " + command.message.personId + "\n\nemail: " + command.message.personEmail
    });
});


bot.onCommand("whois", function (command) {
    // Check usage
    if (command.message.mentionedPeople.length != 2) {
        spark.messageSendRoom(command.message.roomId, {
            markdown: "sorry, I cannot proceed if you do not mention a room participant"
        });
        return;
    }

    var participant = command.message.mentionedPeople[1];

    spark.personGet(participant).then(function (person) {
        spark.messageSendRoom(command.message.roomId, {
            markdown: "personId: " + person.id + "\n\ndisplayName: " + person.displayName + "\n\nemail: " + person.emails[0]
        });
    });
});


bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot's just added to room: " + trigger.data.roomId);

        // so happy to join
        spark.messageSendRoom(trigger.data.roomId, {
            text: "Hi, I am the Inspector Bot !"
        })
            .then(function (message) {
                if (message.roomType == "group") {
                    spark.messageSendRoom(message.roomId, {
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

