var common = require('../common')
,   async = require('async')

var collection = common.collection
,   emit_tweet = common.emit_tweet;

exports.track = function(io, trackers) {

    io.sockets.on('connection', function(socket) {
        socket.emit('clear_all', {});

        socket.on('need_tweets', function() {
            async.each(trackers, function(tracker, callback_outer) {
                async.series([
                    function(callback) {
                        collection.find({event: tracker.event_name}).count(function(error, count) {
                            tracker.count = count;
                            callback();
                        }, function(err) {
                            if (err)
                                console.warn("ERROR counting for the first time!");
                        });
                    }, function(callback) {
                        collection.find({event: tracker.event_name}).sort({ id: -1 }).limit(100, function(err, docs) {
                            async.eachSeries(docs.sort(function(a, b) {
                                return b.id - a.id;
                            }), function(doc, callback_inner) {
                                socket.emit('first_tweet', emit_tweet(doc, tracker.count, tracker.event_name));
                                callback_inner();
                            }, function(err) {
                                if (err)
                                    console.warn("ERROR inside connection event!");
                                callback();
                            });
                        });
                    }], function(err) {
                        if (err)
                            console.warn("ERROR getting first tweets!");
                        callback_outer();
                    });
            }, function(err) {
                if (err)
                    console.log("ERROR in outside of need_tweets!");
                socket.emit('first_tweets_done', {});
            });
        });
    });
}