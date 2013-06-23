The Badger Herald Mifflin-Revelry Dashboard
===========================================

A slightly-polished version of the code that ran the [Mifflin-Revelry Dashboard app](http://badgerherald.com/mifflin/).

Setting up
----------

- Clone the repository:
    `git clone git@github.com:badgerherald/mifflin-revelry-dashboard.git`

- Get the prerequisites:
    `npm install`
    
- Copy `lib/auth/index.js.template` to `lib/auth/index.js` and fill in your Twitter
authentication information.

- Edit the trackers in `lib/common/index.js`. The app defaults to tracking time-insensitive
keywords for demonstration purposes. We've also included the trackers we used for
the live app.

- Run the app:
    `node app.js`
    
Things it might be nice to do
-----------------------------

- [x] Modularize server-side code
- [ ] Include the Sass sheets, not the generated main.css
- [ ] Refactor the bad parts of the client-side JS
- [ ] Remove internal references to Mifflin or Revelry 
- [x] Add a branch for the static version of the page
- [ ] Tests