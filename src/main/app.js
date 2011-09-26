/**
 * app.js
 *
 * Module dependencies.
 */

var express = require('express'), app = module.exports = express.createServer();

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set("view options", {
    layout : false
  });
  app.register('.html', {
    compile : function(str, options) {
      return function(locals) {
        return str;
      };
    }
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret : 'your secret here'
  }));
  // TODO I don't know much about sessions and what this secret is, but we need to pick a secret!
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});
// Routes

app.get('/', function(req, res) {
  res.render('index', {
    layout : true,
  });
});

app.get('/game/:gameId', function(req, res) {
  res.render('game', {
    gameId : req.params.gameId
  });
});

app.post('/game', function(req, res) {
    console.log(req.body);
    // console.log(res);
    res.contentType('application/json');
    res.send(JSON.stringify({test: 1, test2: "two"}));
});

app.get('/zombietest', function(req, res) {
  res.render('zombieTest');
});

app.get('/zombietesthtml', function(req, res) {
  res.render('zombieTest.html');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);