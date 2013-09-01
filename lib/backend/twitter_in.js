var async = require('async')
  , twitter = require('ntwitter')
;

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

TwitterStreamer.prototype.stream = function(tee) {
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
                tee(data);
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