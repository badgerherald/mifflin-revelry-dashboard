var async = require('async')
;

function MifflinOut(output) {
  'use strict';
  this.output = output;
}

MifflinOut.prototype.make_tweet = function(data, event_name) {
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

MifflinOut.prototype.send_tweet = function(doc, event_name) {
  'use strict';
  this.io.emit('tweet', this.make_tweet(doc, event_name));
};

MifflinOut.prototype.get_tweets = function(db, names, count) {
  'use strict';
  var _this = this
    , event_name = names.join('_') + '_fetched'
  ;
  db.once(event_name, function onTweets(docs) {
    async.eachSeries(docs.sort(function(a, b) {
      return b.id - a.id;
    })
    , function forEachTweet(doc, callback) {
        _this.send_tweet(doc, event_name);
        callback();
      }
    );
  });
  db.load(names, count);
};

MifflinOut.prototype.get_counts = function(db, names) {
  'use strict';
  var _this = this
    , event_name = names.join('_') + '_counted'
  ;
  db.once(event_name, function onCounted(data) {
    _this.emit('tweet_count', data);
  });
  db.get_counts(names);
};