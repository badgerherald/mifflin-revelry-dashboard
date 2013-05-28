var express = require('express')
,   path = require('path')
,   app = express()
,   http = require('http')
,   server = http.createServer(app)
,   io = require('socket.io').listen(server)
,   common = require('./lib/common')
,   update_herald = require('./lib/update_herald')
,   listen = require('./lib/listen')
,   stream = require('./lib/stream')

app.configure(function () {
    app.set('port', 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

update_herald.attach(app);

server.listen(app.get('port'));

listen.track(io, common.trackers);

stream.new_stream(io);