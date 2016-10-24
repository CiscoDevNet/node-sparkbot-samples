//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License 
//

var debug = require("debug")("samples");
var fine = require("debug")("samples:fine");

var request = require("request");


module.exports.fetchNext = function(limit, cb) {

    // Get list of upcoming events
    var options = {
        method: 'GET',
        url: "https://devnet-events-api.herokuapp.com/api/v1/events/next?limit=" + limit
    };

    request(options, function (error, response, body) {
        if (error) {
            debug("could not retreive list of events, error: " + error);
            cb(new Error("Could not retreive upcoming events, sorry [Events API not responding]"), null);
            return;
        }

        if ((response < 200) || (response > 299)) {
            console.log("could not retreive list of events, response: " + response);
            sparkCallback(new Error("Could not retreive upcoming events, sorry [bad anwser from Events API]"), null);
            return;
        }

        var events = JSON.parse(body);
        debug("fetched " + events.length + " events");
        fine(JSON.stringify(events));

        if (events.length == 0) {
            cb(null, "**Guess what? No upcoming event!**");
            return;
        }

        var nb = events.length;
        var msg = "**" + nb + " upcoming events:**";
        if (nb == 1) {
            msg = "**1 upcoming event:**";
        }
        for (var i = 0; i < nb; i++) {
            var current = events[i];
            msg += "\n- " + current.beginDay + " - " + current.endDay + ": [" + current.name + "](" + current.url + "), " + current.city + " (" + current.country + ")";
        }

        cb(null, msg);
    });
}


 module.exports.fetchCurrent = function (cb) {

    // Get list of upcoming events
    var options = {
        method: 'GET',
        url: "https://devnet-events-api.herokuapp.com/api/v1/events/current"
    };

    request(options, function (error, response, body) {
        if (error) {
            debug("could not retreive list of events, error: " + error);
            cb(new Error("Could not retreive current events, sorry [Events API not responding]"), null);
            return;
        }

        if ((response < 200) || (response > 299)) {
            console.log("could not retreive list of events, response: " + response);
            sparkCallback(new Error("Could not retreive current events, sorry [bad anwser from Events API]"), null);
            return;
        }

        var events = JSON.parse(body);
        debug("fetched " + events.length + " events");
        fine(JSON.stringify(events));

        if (events.length == 0) {
            cb(null, "**No event is currently going on. May you check for upcoming events...**");
            return;
        }

        var nb = events.length;
        var msg = "**" + nb + " events are running now:**";
        if (nb == 1) {
            msg = "**1 event is running now:**";
        }
        for (var i = 0; i < nb; i++) {
            var current = events[i];
            msg += "\n- " + current.beginDay + " - " + current.endDay + ": [" + current.name + "](" + current.url + "), " + current.city + " (" + current.country + ")";
        }

        cb(null, msg);
    });
}


