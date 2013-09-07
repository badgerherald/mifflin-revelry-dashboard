var MifflinTee = require('./lib/backend/mifflin_tee')
  , auth = require('./lib/auth/mifflin')
;

var Settings = {
  'db': 'test_db'
, 'collection': 'test_collection'
, 'auth': auth
, 'trackers': [
    {
      'keywords': ['#doctorwho', 'doctor who']
    , 'event_name': 'revelry_tweet'
    }
  , {
      'keywords': ['#breakingbad', 'breaking bad']
    , 'event_name': 'mifflin_tweet'
    }
  ]
};

var tweets = new MifflinTee(Settings);

tweets.stream();