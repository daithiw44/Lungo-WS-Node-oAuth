App.Services = (function(lng, app, undefined) {
	//Get some Friends
	var getFriends = function() {
		//Show a Modal while we wait
		lng.Sugar.Growl.show('loading', 'points', true);
		var url = 'getFriends';
		//Data if we needed it... we don't but...
		var data = {'1': '1'};
		lng.Service.post(url, data, function(response) {
			//Do something with response
			lng.View.Template.List.create({
				container_id: 'twitters',
				template_id: 'twitterfriends',
				data: response.arr
			});
            lng.Sugar.Growl.hide();
		});
	}

    return {
		getFriends: getFriends
    };

})(LUNGO, App);
