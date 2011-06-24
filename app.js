/**
 * Module dependencies.
 */

var express = require('express'),
    jsdom = require('jsdom');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

// Quick and dirty 

function extractOpenGraph (url, fn) {
    var og = [];
    jsdom.env({
        html: url,
        done: function(errors, window) {
            
            jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.4.2.min.js' , function() {
                window.$('meta[property^=og]').each(function (i, tem) {
                    og.push([ tem.getAttribute('property'), tem.getAttribute('content')]);
                });
                fn(og);
            });

        }
    });
}

// Routes

app.get('/', function(req, res){
    res.render('index', {
        title: 'OG Parser'
    });
});

app.get('/lookup', function(req, res){
    res.redirect('/');
});

app.post('/lookup', function(req, res) {
    var url = req.body.urlToCheck;
    extractOpenGraph( url, function (data) {
        res.render('data', {
            title: "Results",
            data: data,
            url: url
        });
    });
});

var port = process.env.PORT || 3000;
app.listen(port);

console.log("Express server listening on port %d", app.address().port);
