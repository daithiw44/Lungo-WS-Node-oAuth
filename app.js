/**
 * Module dependencies.
 * npm them if you need to.
 */
var express = require('express')
, config = require('./config')
, OAuth = require('oauth').OAuth;

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Helper Functions
//Set up Our Twitter Caller
function makeOAuth() {
	//twitter oAuth.
	var oa = new OAuth('https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	config.settings.twitteroAuth.key,
	config.settings.twitteroAuth.secret,
	'1.0',
	null,
	'HMAC-SHA1');
	return oa;
}

// Routes
/*****
 * The default page.
 *****/
app.get('/', function(req, res) {
// Are they Authenticated?
if (req.session.hasOwnProperty('oAuthVars')) {
  res.render('index', {
    title: 'LungoJS'
  });
  }
  else {
	res.redirect('twitterlogin');
  }
});

/*****
app.get('/twitterlogin',function(req, res) {
* app.get('/twitterlogin',function(req, res) {
*
* Basic just send the User to twitter, Ideally you'd be checking if you can identify the user
* and use stored tokens for them rather then getting them again and again and again for each Session
*****/
app.get('/twitterlogin', function(req, res) {
	var oa;
	function getOAuthRequestTokenFunc(error, oauth_token, oauth_token_secret,results) {
		if (error) return console.log('getOAuthRequestToken Error', error);
		req.session.callmade = true;
		req.session.oAuthVars = {};
		req.session.oAuthVars.oauth_token = oauth_token;
		req.session.oAuthVars.oauth_token_secret = oauth_token_secret;
		res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
	}
	//We could store all this in a DB but for another time
	oa = makeOAuth();
	oa.getOAuthRequestToken(getOAuthRequestTokenFunc);

});

/*****
* app.get('/twitterauth',function(req, res) {...
*
* When we set up our App on  https://dev.twitter.com/apps/
* we specified a Callback URL this is it so we handle the OK from twitter here.
* You'd get the toekens here for the User and store them rather then keeping them around for just the Session.
* Also you would
*****/
app.get('/twitterauth', function(req, res) {
		if (req.session.hasOwnProperty('callmade')) {
			var oa = makeOAuth();
			oa.getOAuthAccessToken(req.session.oAuthVars.oauth_token, req.session.oAuthVars.oauth_token_secret, req.param('oauth_verifier'),
			function(error, oauth_access_token,oauth_access_token_secret, tweetRes) {
			if (error) {
				console.log('getOAuthAccessToken error: ', error);
				//do something here UI wise
				return;
			}
			req.session.oAuthVars.oauth_access_token = oauth_access_token;
			req.session.oAuthVars.oauth_access_token_secret = oauth_access_token_secret;
			req.session.oAuthVars.oauth_verifier = req.param('oauth_verifier');
			//
			var obj = {};
			obj.user_id = tweetRes.user_id;
			obj.screen_name = tweetRes.screen_name;
			obj.oauth_access_token = oauth_access_token;
			obj.oauth_access_token_secret = oauth_access_token_secret;
			obj.profile_image_url = tweetRes.profile_image_url;
			//Here we add the 'obj' contain the details to a DB and user this to get the users access details.
			res.redirect('/');
			});
		}
		else {
			res.redirect('twitterlogin');
		}
});

/*****
* app.post('/getFriends', function(req, res) {..
*
* The Web Service 'POST' Call called from Lungo Event
* ****/
app.post('/getFriends', function(req, res) {
	//Function to Write the JSON
	function writeRes(arg) {
		res.writeHead(200, 'OK', {'content-type': 'text/json'});
		res.write('{"arr":' + arg + '}');
		res.end();
	}
	if (req.session.hasOwnProperty('oAuthVars')) {
		//Set it up.
		var oa = makeOAuth();
		//Two Steps. 1. Get the IDs and then 2 use the IDs to get the details.
		// 1. Get the IDs of a user is following.
		oa.getProtectedResource('http://api.twitter.com/1/friends/ids.json', 'GET', req.session.oAuthVars.oauth_access_token, req.session.oAuthVars.oauth_access_token_secret,
		function(error, data, response) {
			var arrData;
			if (error) {
				console.log('error', error);
				writeRes('');
			}
			else {
				//2. Get their IDs to their Details.... this can be pretty big.. Here we'll just take what we need...
				arrData = JSON.parse(data);
				oa.getProtectedResource('http://api.twitter.com/1/users/lookup.json?user_id=' + arrData.ids, 'GET', req.session.oAuthVars.oauth_access_token, req.session.oAuthVars.oauth_access_token_secret,
				function(error, udata, response) {
					var arr = [], obj, parsedData;
					if (error) {
						console.log('error', error);
						writeRes('');
					}
					else {
						//There is alot of data on all the users you follow so you'd never want to return it all, you'd filter through it
						//and you see in the template in Lungo we just use the screen_name and id
						parsedData = JSON.parse(udata);
						for (var i = 0; i < parsedData.length; i++) {
							obj = {};
							obj.id = parsedData[i].id;
							obj.screen_name = parsedData[i].screen_name;
							arr.push(obj);
						}
						writeRes(JSON.stringify(arr));
					}
				});
			}
		});
	}
	else {
	writeRes('you are not logged in... handle on front end');
	}
});


app.listen(3000);
console.log('Express server listening on port %d', app.address().port);
