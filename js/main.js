(function($) {
    var main_tweets = [];
    var herald_articles = [];
    var filtered_tweets = {
        regex: ''
        // More?
    };

    // Meta-information about the post sources.
    var streams = {
        'mifflin_tweet': {
            base: '#mifflin-stream .stream-social-posts',
            total: 7120,
            class_char: 'm'
        },
        'revelry_tweet': {
            base: '#revelry-stream .stream-social-posts',
            total: 1001,
            class_char: 'r'
        },
        'herald': {
            base: '.stream-herald-posts',
            class_char: 'b'
        }
    };

    var MAX_LENGTH = 500;

    // In addition to showing images that are caught by the Twitter API, if a link in
    // the page goes directly to an image, we'll also show it. This function tests if
    // a link leads to an image.
    function IsValidImageUrl(elem, callback) {
        var img = new Image();
        img.onerror = function() { return; }
        img.onload =  function() { $(img).css('width', '100%'); elem.html(img); return; }
        img.src = $(elem).attr('href')
    }

    // Super-hacky function for formatting text better in the tweets
    function format_tweet(text) {
        // Links
        text = text.replace(/(https?:\/\/[^\s]+)/gi,
                    '<a class="testable_link" target="_blank" href="$1">$1</a>');
        // #tags
        text = text.replace(/(#[A-Za-z_]\w*)/gi, function($1) {
            var escaped_tag = encodeURIComponent($1);
            return '<a target="_blank" href="http://twitter.com/search?q='
            + escaped_tag
            + '">' + $1 + '</a>';
        });
        // @mentions
        text = text.replace(/(@\w+)/gi, function($1) {
            var username = $1.substr(1);
            return '<a target="_blank" href="http://twitter.com/' + username + '">' + $1 + '</a>';
        });
        return text;
    }

    // Super-function (read: in need of refactoring) for making posts from the main_posts array
    // Can be given a parameter telling it to hide new posts. This is used when
    // changing filters, so they can be sorted into the right order first
    // without the jarring visuals of seeing the posts reordered.
    function make_post(data, settings, via, hide) {
        var base = $(settings.base),
        class_char = settings.class_char;

        settings.total = data.count;

        var post = $('<div>').attr('class', 'stream-post clearfix');
        if (hide)
            post.css('display', 'none');
        post.attr('id', data.id);
        var post_content = $('<div>').attr('class', 'stream-post-content');

        var post_meta = $('<p>').attr('class', 'post-content-meta ' + class_char)
        var post_body = $('<p>').attr('class', 'post-content-body ' + class_char);

        if (!data.category) {
            var meta = '<a target="_blank" class="username" href="http://twitter.com/' + data.user + '">@' + data.user + '</a>'
            + ' Via ' + via + ' &middot; '
            + '<time>' + moment(data.time).startOf('minute').fromNow() + '</time>';
            post_meta.html(meta);
            var text = format_tweet(data.text);
            post_body.html(text);
        } else {
            post_body = undefined;
            var cat = data.category.toLowerCase();
            var meta = '<a target="_blank" href="http://badgerherald.com/' + cat + '">' + data.category + ' </a>'
            + '<time>' + moment(data.time).startOf('minute').fromNow() + '</time>'
            + '<br/>' + '<a target="_blank" class="title" href="' + data.url + '">' + data.title + '</a>';
            post_meta.html(meta);
        }

        var post_avatar = $('<div>').attr('class', 'stream-post-avatar');

        var avi = undefined;
        var img = undefined;

        async.series([function(callback) {
            if (!data.avi) {
                callback();
            } else {
                avi = $('<img/>').attr('src', data.avi);
                avi.on('load', function() {
                    callback();
                });
            }
        }, function(callback) {
            if (!data.img) {
                callback();
            } else {
                img = $('<img/>').attr('src', data.img).css('width', '100%');
                img.on('load', function() {
                    callback();
                });
            }
        }, function(callback) {
            $(post_body).find('a.testable_link').each(function(i, a) {
                IsValidImageUrl($(a), callback);
            });
            callback();
        }], function(err) {
            if (err)
                console.log('ERROR making post ' + data.id + '!');
            if (img)
                post_body.append(img);
            post_avatar.append(avi);
            post.append(post_avatar);
            post_content.append(post_meta);
            post_content.append(post_body);
            post.append(post_content);
            post.find('time').data('time', data.time);
            base.prepend(post);

            // Trim DOM. Basically the worst way to do this. Oh well.
            if (base.children().length > MAX_LENGTH) {
                base.children().last().remove();
            }

            // Keep scroll locked if not at top.
            var stream;
            if (post.is(':visible')) {
                if ($(window).width() > 768) {
                    stream = base.parent();
                } else {
                    stream = $(document);
                }
                if (stream.scrollTop() > 0) {
                    var post_height = post.outerHeight();
                    var new_top = stream.scrollTop() + post_height + parseInt(post.css('marginBottom'));
                    stream.scrollTop(new_top);
                }
            }
        });

        // Try to reload images after a small delay

        if (img) {
            img.on('error', {'img': this, 'data': data}, function() {
                setTimeout(function() {
                    img.attr('src', data.img);
                }, 500);
            });
        }

        if (avi) {
            avi.on('error', {'img': this, 'data': data}, function() {
                setTimeout(function() {
                    avi.attr('src', data.avi);
                }, 500);
            });
        }
    }

    // When a stream is (re)loaded, it's sorted before being displayed again.
    function show_streams() {
        $('#mifflin-stream .stream-post').sortElements(function(a, b) {
            return parseInt($(b).attr('id')) - parseInt($(a).attr('id'));
        });
        $('#revelry-stream .stream-post').sortElements(function(a, b) {
            return parseInt($(b).attr('id')) - parseInt($(a).attr('id'));
        });
        $('.stream-post').css('display', 'block');
    }

    // Function for changing the tweet filter. If the filter is an empty
    // string (or not specified, for the lazy), then all tweets are shown.
    function change_filter(regex, callback_done) {
        if (!regex)
            regex = "";

        $('#stream-container .stream-post').remove();

        filtered_tweets.regex = regex;
        async.each(main_tweets, function(element, callback) {
            if (element.text.match(new RegExp(regex, "i"))) {
                make_post(element, streams[element.event], 'Twitter', true);
            }
            callback();
        }, function(err) {
            if (err)
                console.warn("ERROR in change_filter!");
            if (callback_done)
                callback_done();
        });
    }


    // Update the times of all of the posts on the page.
    function update_times() {
        $('time').each(function() {
            var time = $(this).data('time');
            if (!time) {
                time = moment("20130505", "YYYYMMDD")
            }
            $(this).html(moment(time).startOf('minute').fromNow());
        });
    }


    // These functions (clearly by a different author, in this case @mjneil) do the hard work of
    // parsing an XML feed of the latest articles about mifflin/revelry.
    function bhArticle(author, title, blog, image, content, category, timestamp, url){
        this.user = author;
        this.title = title;
        this.blog = blog;
        this.avi = image;
        this.content = content;
        this.category = category;
        this.time = timestamp;
        this.url = url;
        this.img = undefined;
    }

    function insert_articles(data) {
        var x = data.getElementsByTagName('article');
        var articles = new Array();
        for (i = 0 ; i < x.length; i++) {
            var curr = x[i];
            var author = curr.getElementsByTagName('author')[0].childNodes[0].nodeValue;
            var title = curr.getElementsByTagName('title')[0].childNodes[0].nodeValue;
            var blog = curr.getElementsByTagName('blog')[0].childNodes[0].nodeValue;
            var image = 'http://badgerherald.com/' + curr.getElementsByTagName('image')[0].childNodes[0].nodeValue;
            var content = curr.getElementsByTagName('content')[0].childNodes[0].nodeValue;
            var category = curr.getElementsByTagName('blog')[0].childNodes[0].nodeValue;
            var time_parts = curr.getElementsByTagName('time')[0].childNodes[0].nodeValue.match(/(\d+)/g);
            var timestamp = Date.parse(new Date(time_parts[0], time_parts[1]-1, time_parts[2], time_parts[3], time_parts[4], time_parts[5]));
            var url = curr.getElementsByTagName('url')[0].childNodes[0].nodeValue;
            var currArticle = new bhArticle(author, title, blog, image, content, category, timestamp, url);
            articles[i] = currArticle;
        }
        
        $('.stream-herald-posts .stream-post').remove();
        articles.sort(function(a, b) {
            return a.time - b.time;
        }).forEach(function(a) {
            make_post(a, streams['herald'], undefined, false)
        });
    }

    // This is a special function for getting data out of the DOM elements.
    // Most functionality comes from the tweets being stored in JS. Since
    // the static page only has DOM, we turn them back into data.
    function make_stream_data(stream_name, stream_obj) {
        var tweets = [];
        $(stream_obj.base).find('.stream-post').each(function(i, d) {
            var img = $(d).find('.post-content-body img').attr('src')
            tweets.push({
                'event': stream_name,
                'text': $(d).find('.post-content-body').text(),
                'user': $(d).find('.post-content-meta .username').text().trim().substr(1),
                'count': stream_obj['total'],
                'id': $(d).attr('id'),
                'avi': $(d).find('.stream-post-avatar img').attr('src'),
                'img': img,
                'time': moment("20130505", "YYYYMMDD")
            });
        });
        return tweets;
    }

    function remake_data() {
        var mifflin = streams['mifflin_tweet'],
            revelry = streams['revelry_tweet'];
        mifflin.total = parseInt($('.mifflin-number .the-number').text());
        revelry.total = parseInt($('.revelry-number .the-number').text()); 
        main_tweets = make_stream_data('mifflin_tweet', mifflin);
        main_tweets = main_tweets.concat(make_stream_data('revelry_tweet', revelry));
        console.log(main_tweets);
        change_filter("");
    }

    // Set up DOM events:
    // * resizing
    // * the Herald post sliders
    // * activating filters
    $(document).ready(function(){
        remake_data();
        update_times();
        setTimeout(show_streams, 1000);

        setTimeout(function() {
            $('.herald-nav-right').effect("highlight", {color: "#FFD900"}, 700);
            $('.herald-nav-right').effect("highlight", {color: "#FFD900"}, 700);
            $('.herald-nav-right').effect("highlight", {color: "#FFD900"}, 700);
        }, 15000);
        var $slideAmount = 0;

        $('.herald-nav-right').click(function() {
            $(this).effect("highlight", {color: "#FFD900"}, 400);
            if($slideAmount > -$('.stream-herald-posts').width() + 2 * $('.stream-herald-container .stream-post:first').width()){
                $slideAmount = $slideAmount - $('.stream-herald-container .stream-post:first').width();
                $('.stream-herald-posts').animate({left:$slideAmount}, 400);
            }

        });

        $('.herald-nav-left').click(function() {
            $(this).effect("highlight", {color: "#FFD900"}, 400);
            if($slideAmount < 0){
                $slideAmount = $slideAmount + $('.stream-herald-container .stream-post:first').width();
                $('.stream-herald-posts').animate({left:$slideAmount}, 400);
            }
        });

        $('.stream-social').css('height', '');

        $(window).on('resize', function() {
            $('#ticker-bar li.r span').css('font-size', $(window).width() <= 1000 ? '0.5em' : '0.7em'); 
            $('.stream-herald-container').css('height', $(window).width() <= 768 ? '0px' : '120px');
            var top = $('.header-container').height();
            $('.stream-social').css('top', top);
            if ($(window).width() > 768) {
                var bottom = $('.stream-herald-container').position().top
                $('.stream-social').css({
                    'height' : bottom-top,
                    'overflow-y' : 'scroll'
                });
            } else {
                $('.stream-social').css({
                    'height' : 'inherit',
                    'overflow-y' : 'hidden'
                });
            }
        }).resize();

        $('#mobile-nav li').on('click', function(e) {
            e.preventDefault();
            var index = $(this).parent('#mobile-nav').find('li').index($(this));
            $('.stream').each(function() {
                $(this).removeClass('active');
            });
            $(this).siblings('li').removeClass('active');
            $(this).addClass('active');
            $($('.stream').get(index)).each(function() {
                $(this).addClass('active');
            });

        });

        $('#topic-list li a').on('click', function() {
            if ($(this).attr('class') === 'inactive') {
                $('#topic-list li a').attr('class', 'inactive');
                $(this).attr('class', 'active');
                var category = $(this).data('category');
                change_filter(category, function() {
                    setTimeout(show_streams, 1000);
                });
            } else {
                $(this).attr('class', 'inactive');
                $('#topic-list li a:first').attr('class', 'active');
                change_filter("", function() {
                    setTimeout(show_streams, 1000);
                });
            }
        });
    });
})(jQuery);
