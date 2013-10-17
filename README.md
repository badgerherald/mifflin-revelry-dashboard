The Badger Herald Mifflin-Revelry Dashboard
===========================================

The node.js app that ran the [Mifflin-Revelry Dashboard app](http://badgerherald.com/mifflin/).

How it works
------------

In the backend, it uses [ntwitter](https://github.com/AvianFlu/ntwitter) to listen to a public stream of tweets for a list of Mifflin- and Revelry-related search terms and save them in a MongoDB database. In the frontend, it runs a dashboard that connects to the backend and streams tweets with [Socket.IO](http://socket.io/).

Modules
-------

The code is (somewhat arbitrarily -- see below) divided into a series of smaller modules inside `lib/`:

1. `auth/`: Exports Twitter authentication information. Structure like `index.js.template`.
1. `common/`: Exports objects and functions used in multiple places: The MongoDB collection, the keyword trackers, and the `emit_tweet` function used to send tweets to the client.
1. `listen/`: Exports the `track` function for sending the recent tweet history to clients. This is the main communication from the client to the server -- hence, the server "listens". `track` takes a socket.io object and a list of trackers as arguments.
1. `stream/`: Exports `new_stream`, the function for opening a connection with the Twitter streaming API and emitting them as tweets to the client. `new_stream` takes a socket.io object as its argument.
1. `update_herald/`: Exports a function that adds functionality to GET a custom XML file of Herald articles about Mifflin on the `/update_herald` endpoint to an [Express](http://expressjs.com/) app given as an argument.

# NOTE: This code is the result of a code rush. For posterity's sake, the unpolished code is here.