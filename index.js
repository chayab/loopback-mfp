var passport = require('passport-mfp-token-validation').Passport;
var mfpStrategy = require('passport-mfp-token-validation').Strategy;

module.exports = mfp;

/**
 * Example usage:
 *
 * var mfp = require('loopback-mfp');
 * mfp(app, options);
 */

 // Helper functions to have one liner API protection
var cont = function(req, res, next){
	next();
}; 
  
function mfp(app, options) {
  console.log("In mfp");
  passport.use(new mfpStrategy({
    publicKeyServerUrl: options.publicKeyServerUrl,
	cacheSize:0,
    //analytics: options.analytics
  }));

  // IMPORTANT - passport initialization goes to a different phase
  app.middleware('initial', passport.initialize());

  var auth = function(scopes) {
		return passport.authenticate('mobilefirst-strategy', {
			session: false,
			scope: scopes
		});
	}
  
  var authRouter = app.loopback.Router();

  // Setup per-route authentication (and possibly other things too)
  for (var route in options.routes) {
    for (var verb in options.routes[route]) {
      var config = options.routes[route][verb];

      authRouter[verb.toLowerCase()](route, auth(config.authRealm), cont);
	  console.log("Adding to authRouter: route: "+route +".authRealm: "+config.authRealm+". verb = "+verb.toLowerCase());
    }
  }

  // IMPORTANT - auth middleware goes to a dedicated phase
  app.middleware('auth', authRouter);
};