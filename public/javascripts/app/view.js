App.View = (function(lng, app, undefined) {
    lng.View.Template.create('twitterfriends','<li id="{{id}}"><strong>@{{screen_name}}</strong></li>')

	 var todo = function(id) {
        lng.Data.Sql.select('todo', {id:id}, function(result){
            if (result.length > 0) {
                var data = result[0];
                lng.Data.Cache.set('current_todo', data);
                $('#txtEditName').val(data.name);
                $('#txtEditDescription').val(data.description);
                $('#txtEditName').val(data.name);

                lng.Router.section('view');
            }
        });
	};

	var returnToMain = function(message, icon) {
		lng.Sugar.Growl.show(message, icon, true);
	//	App.Data.refresh();

		setTimeout(function() {
			lng.Router.back();
			lng.Sugar.Growl.hide();
		}, 500);
	};

	return{
		todo: todo,
		returnToMain: returnToMain
	}

})(LUNGO, App);
