App.Events = (function(lng, app, undefined) {
	lng.Dom.Event.live('#loadfriends','TAP',function(){
		//Call the web service we set up.
		app.Services.getFriends();
	});
	
	//Delegates using Element id
	lng.Dom.Event.delegate('#twitters_list', 'li', 'SWIPE_RIGHT', function(event) {
		alert('double tap');
	});

	lng.Dom.Event.delegate('#twitters_list', 'li', 'SWIPE_RIGHT', function(event) {
		alert('swipe right');
	});
	
	//Delegates using Class
	lng.Dom.Event.delegate('.list', 'li', 'TAP', function(event) {
		/*Using a Class, get the element Clicked*/
		alert(event.currentTarget.childNodes[0].childNodes[0].nodeValue);
		// and the parentNode if we wanted to do something diffent based on the id;
		alert('parentNode: ' + event.currentTarget.parentNode.id);
	});
	
    return {

    }

})(LUNGO, App);
