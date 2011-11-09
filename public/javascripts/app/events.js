App.Events = (function(lng, app, undefined) {
	lng.Dom.Event.live('#loadfriends', 'TAP', function() {
		//Call the web service we set up.
		app.Services.getFriends();
	});

    return {

    };

})(LUNGO, App);
