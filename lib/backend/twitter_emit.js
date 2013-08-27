exports.emit = function(data, count, event_name) {
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
};