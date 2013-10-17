var mongojs = require('mongojs');

var db = mongojs('bh-may4', ['mifflin']);
var collection = exports.collection = db.mifflin;

// Production trackers
var trackers = exports.trackers = [
    {
        'keywords': ['#mifflin', '#mifflin2013', 'mifflin'],
        'exclude': new RegExp("Dunder|Houghton|Karen Mifflin|Mifflin County", "i"),
        'event_name': 'mifflin_tweet'
    },
    {
        'keywords': ['#revelry', '#springrevelry', '@revelryfest', 'Revelry Fest', 'Revelry Music'],
        'event_name': 'revelry_tweet'
    }
];

// Computed tracker settings
var all_keywords = [];
trackers.forEach(function(tracker) {
    all_keywords = all_keywords.concat(tracker.keywords);
    tracker.regex = new RegExp('[\\b]*' + tracker.keywords.join('[\\b]*|[\\b]*') + '[\\b]*', 'i');
});

exports.all_keywords = all_keywords;

exports.emit_tweet = function(data, count, event_name) {
    var img = undefined;
    if (data.entities.media && data.entities.media.length > 0)
        img = data.entities.media[0].media_url;
    return {
        id: data.id,
        user: data.user.screen_name,
        text: data.text,
        avi: data.user.profile_image_url,
        time: Date.parse(data.created_at),
        count: count,
        event: event_name,
        img: img
    };
}