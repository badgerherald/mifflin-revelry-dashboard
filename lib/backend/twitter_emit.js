var make_tweet = exports.make_tweet = function(data, count, event_name) {
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
         , count: count
         , event: event_name
         , img: img
         };
};

exports.emit = function(io) {
  'use strict';
  io.sockets.emit('tweet', make_tweet(data, count, event_name));
};