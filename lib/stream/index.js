var common = require('../common')
,   async = require('async')
,   twitter = require('ntwitter');

var collection = common.collection
,   emit_tweet = common.emit_tweet;

var tweets = new twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_KEY,
    access_token_secret: process.env.ACCESS_SECRET
});

exports.new_stream = function(io) {
    tweets.stream('statuses/filter', { track: common.all_keywords}, function(stream) {
        stream.on('data', function(data) {
            async.each(common.trackers, function(tracker, callback) {
                if (!data.text)
                    return;
                var regex = tracker.regex;
                if (data.text.match(regex)) {
                    if (tracker.exclude && data.text.match(tracker.exclude))
                        return;
                    tracker.count += 1;
                    io.sockets.emit('tweet', emit_tweet(data, tracker.count, tracker.event_name));
                    data['event'] = tracker.event_name;
                    collection.save(data, function(err, saved) {
                        if (err || !saved)
                            console.warn("Tweet not saved!");
                    });
                }
            }, function(err) {
                if (err)
                    console.warn("ERROR iterating through trackers!");
            });
        });
        stream.on('limit', function(data) {
            console.warn('LIMIT:', data);
        });
    });
};
