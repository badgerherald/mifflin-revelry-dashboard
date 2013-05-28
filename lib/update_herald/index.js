var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

exports.attach = function(app) {
    app.get('/update_herald', function(req, res) {
        var xhr = new XMLHttpRequest;
        xhr.onload = function() {
            res.set({
                'Content-Type': 'text/xml',
                'Content-Length': this.responseText.length
            });
            res.send(this.responseText);
        };
        xhr.open('GET', 'http://badgerherald.com/mifflin-content/pub/bharticles.php');
        xhr.send();
    });
}