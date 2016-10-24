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

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

// Starts your Bot with default configuration. The SPARK API access token is read from the SPARK_TOKEN env variable 
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();

// do not listen to ourselves
// comment if you're running the bot from your Developer access token and you want to invoke in a 1-1 room
//bot.interpreter.ignoreSelf = true; 

var SparkClient = require("node-sparky");
var spark = new SparkClient({ token: process.env.SPARK_TOKEN });


bot.onCommand("about", function (command) {
    spark.messageSendRoom(command.message.roomId, {
        markdown: "```\n{\n   'author':'Stève Sfartz <stsfartz@cisco.com>',\n   'code':'https://github.com/ObjectIsAdvantag/sparkbot-webhook-samples/blob/master/examples/roomid-phantom.js',\n   'description':'a handy tool to retreive Spark Rooms identifiers',\n   'healthcheck':'GET https://sparkbot-roomid.herokuapp.com',\n   'webhook':'POST https://sparkbot-roomid.herokuapp.com'\n}\n```"
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
        markdown: "I am an ephemeral bot !\n\nAdd me to a Room: I'll send you back the room id in a private message and leave the room right away.\n- /about\n- /help\n"
    });
}



bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId == bot.interpreter.person.id) {
        debug("bot has just been added to room: " + trigger.data.roomId);

        // only take action if it is not the bot who created the room, to send the message back
        if (trigger.actorId != bot.interpreter.person.id) {

            // Retreive actorEmail
            spark.personGet(trigger.actorId)
                .then(function (person) {
                    var email = person.emails[0];
                    debug("found inquirer: " + email);

                    // Send a direct message
                    spark.messageSendPerson(email, {
                        markdown: "extracted room id: **" + newMembership.roomId + "**\n\nwill now leave the room you asked me to inquire on..."
                    })
                        .then(function (message) {

                            // Leave inquired room
                            spark.membershipRemove(newMembership.id)
                                .then(function () {
                                    spark.messageSendPerson(email, {
                                        markdown: "job done, I have left the inquired room. Au revoir !"
                                    });
                                })
                        });
                })
        }
    }
});

