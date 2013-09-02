var async = require('async')
  , twitter = require('ntwitter')
;

var make_tweet = function(data, count, event_name) {
  'use strict';
  var img;
  if (data.entities.media && data.entities.media.length > 0) {
    img = data.entities.media[0].media_url;
  }
  return { id: data.id
         , user: data.user.screen_name
         , text: data.text
         , avi: data.user.profile_image_url
         , time: Date.parse(data.created_at)
         , event: event_name
         , img: img
         };
};

function TwitterStreamer(args) {
  'use strict';
  // Create twitter instance
  this.tweets = new twitter(args.auth);

  // Compiles list of all tracked keywords and regexes to direct tweets
  this.trackers = args.trackers;
  this.all_keywords = [];
  this.trackers.forEach(function makeTrackerRegex(tracker) {
    this.all_keywords = this.all_keywords.concat(tracker.keywords);
    tracker.regex = new RegExp(
        '[\\b]*'
        + tracker.keywords.join('[\\b]*|[\\b]*')
        + '[\\b]*', 'i'
    );
  }, this);
}

TwitterStreamer.prototype.stream = function(store) {
  'use strict';
  var _this = this;
  this.tweets.stream('statuses/filter', { track: this.all_keywords }
  , function onStream(stream) {
      stream.on('data'
      , function onStreamData(data) {
          async.each(_this.trackers
          , function forEachTracker(tracker, callback) {
              if (!data.text) {
                return;
              }
              var regex = tracker.regex;
              if (data.text.match(regex)) {
                if (tracker.exclude && data.text.match(tracker.exclude)) {
                  return;
                }
                store.save(make_tweet(data, tracker.event_name));
              }
            }
          , function onTrackerError(err) {
              if (err) {
                console.warn('ERROR iterating through trackers!');
              }
            }
          );
        }
      );
      stream.on('limit', function onStreamLimit(data) {
        console.warn('LIMIT:', data);
      });
      stream.on('error', function onStreamError(data) {
        console.warn(data);
      });
    }
  );
};

module.exports = TwitterStreamer;