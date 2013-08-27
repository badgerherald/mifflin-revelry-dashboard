var async = require('async')
,   util = require('util')
,   twitter = require('ntwitter');

function TwitterStreamer(args) {
    // Create twitter instance
    this.tweets = new twitter(args.auth);

    // Compiles list of all tracked keywords and regexes to direct tweets
    this.trackers = args.trackers;
    this.all_keywords = [];
    this.trackers.forEach(function(tracker) {
        this.all_keywords = this.all_keywords.concat(tracker.keywords);
        tracker.regex = new RegExp('[\\b]*' + tracker.keywords.join('[\\b]*|[\\b]*') + '[\\b]*', 'i');
    }, this);
}

TwitterStreamer.prototype.stream = function(doathing) {
    var _this = this;
    this.tweets.stream('statuses/filter', { track: this.all_keywords }, function(stream) {
        stream.on('data', function(data) {
            async.each(_this.trackers, function(tracker, callback) {
                if (!data.text)
                    return;
                var regex = tracker.regex;
                if (data.text.match(regex)) {
                    if (tracker.exclude && data.text.match(tracker.exclude))
                        return;
                    doathing(data);
                }
            }, function(err) {
                if (err)
                    console.warn("ERROR iterating through trackers!");
            });
        });
        stream.on('limit', function(data) {
            console.warn('LIMIT:', data);
        });
        stream.on('error', function(data) {
            console.warn(data);
        });
    });
};

module.exports = TwitterStreamer;