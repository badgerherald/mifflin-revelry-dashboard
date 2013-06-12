(function($) {
    var main_tweets = [];
    var filtered_tweets = {
        regex: ''
        // More?
    };

    // Meta-information about the post sources.
    var streams = {
        'mifflin_tweet': {
            base: '#mifflin-stream .stream-social-posts',
            total: 0,
            class_char: 'm'
        },
        'revelry_tweet': {
            base: '#revelry-stream .stream-social-posts',
            total: 0,
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

    // This function doesn't believe in DRY
    function update_top_bar() {
        // Draw the bar
        var mifflin_total = streams['mifflin_tweet'].total;
        var revelry_total = streams['revelry_tweet'].total;
        var total = mifflin_total + revelry_total;
        var m_pct;
        var r_pct;

        if (total === 0) {
            m_pct = 50;
            r_pct = 50;
        } else {
            m_pct = 100 * mifflin_total / total;
            r_pct = 100 - m_pct;
        }

        if (m_pct < 10) {
            $('li.m span').css('display', 'none');
        } else if (m_pct < 15) {
            $('li.m span').css('display', 'block');
            $('li.m span').css('font-size', '0.7em');
            $('li.m spam').css('padding', '0 5px');
        } else {
            $('li.m span').css('display', 'block');
            $('li.m span').css('font-size', '1em');
            $('li.m span').css('padding', '0 15px');
        }

        if (r_pct < 10) {
            $('li.r span').css('display', 'none');
        } else if (r_pct < 15) {
            $('li.r span').css('display', 'block');
            $('li.r span').css('font-size', '0.7em');
            $('li.r spam').css('padding', '0 5px');
        } else {
            $('li.r span').css('display', 'block');
            $('li.r span').css('font-size', '1em');
            $('li.r span').css('padding', '0 15px');
        }

        $('#ticker-bar li.m').css('width', m_pct + '%');
        $('#ticker-bar li.r').css('width', r_pct + '%');

        // Update the counts
        $('.mifflin-number .the-number').html(streams['mifflin_tweet'].total);
        $('.revelry-number .the-number').html(streams['revelry_tweet'].total);
        $('#mobile-nav .footer-mifflin a .nav-num').html(streams['mifflin_tweet'].total);
        $('#mobile-nav .footer-revelry a .nav-num').html(streams['revelry_tweet'].total);
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

            update_top_bar();

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
            if (element.text.match(regex, "i")) {
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
            $(this).html(moment(time).startOf('minute').fromNow());
        });
    }

    setInterval(update_times, 60000);

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

    function update_herald() {
        $.get('/update_herald/', function(data) {
            insert_articles(data);
        });
    }

    // Set up DOM events:
    // * resizing
    // * the Herald post sliders
    // * activating filters
    $(document).ready(function(){
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
