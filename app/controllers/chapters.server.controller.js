'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Reference = require('biblejs').Reference,
	errorHandler = require('./errors.server.controller'),
	Chapter = mongoose.model('Chapter'),
	request = require('request'),
	http = require('http'),
	https = require('https'),
	q = require('q'),
	_ = require('lodash');

/**
 * Create a Chapter
 */
exports.create = function(req, res) {
	var chapter = new Chapter(req.body);
	chapter.user = req.user;

		// if the chapter is passed with a chapter number, find and set the chapter name
	if (req.body.absoluteChapter) {
		try {
			chapter.name = Reference.fromChapterId(req.body.absoluteChapter).toString();
		} catch(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		// if the chapter number is not present, assume there's a name passed
	} else {
		try {
			var ref = new Reference(chapter.name);
			chapter.name = ref.toString().split(':')[0];
		} catch(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
	}
		// finally, save the chapter
	chapter.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chapter);
		}
	});
};

/**
 * Show the current Chapter
 */
exports.read = function(req, res) {
	res.jsonp(req.chapter);
};

/**
 * Update a Chapter
 */
exports.update = function(req, res) {
	var chapter = req.chapter ;

	chapter = _.extend(chapter , req.body);

	chapter.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chapter);
		}
	});
};

/**
 * Delete an Chapter
 */
exports.delete = function(req, res) {
	var chapter = req.chapter ;

	chapter.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chapter);
		}
	});
};

/**
 * List of Chapters
 */
exports.list = function(req, res) { 
	var params = '';
	if (req.user) {
		params = '{ user: ObjectId("' + req.user._id + '")}'; 
	}
	Chapter.find(params).sort('-created').populate('user', 'displayName').exec(function(err, chapters) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chapters);
		}
	});
};

/**
 * List of Chapters by Group
 */
exports.listGroupChapters = function(req, res) { 
	var users = [];
	if (req.group) {
		
		for (var i = 0; i < req.group.users.length; i++){
			users.push('ObjectId(\"' + req.group.users[i]._id + '\")');
		}
	}
	var params = '{user: { $in: [' + users.join(', ') + ']}}';
	Chapter.find(params).sort('-created').limit(5).populate('user', 'displayName').exec(function(err, chapters) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chapters);
		}
	});
};

function callRCV (params) {
	var deferred = q.defer();
	http.get('https://api.lsm.org/recver.php', {params: params}, function(res) {
	  res.on('data', function(d) {
	    deferred.resolve(d);
	  });

	}).on('error', function(e) {
	  deferred.resolve(e);
	});
	/*
	request({uri: 'https://api.lsm.org/recver.php', qs: params}, function(error, response, body) {
		console.log('Header: ' + response);
		if (!error) {
			deferred.resolve(body);
		} else {
			deferred.resolve(error);
		}
	});*/
	return deferred.promise;	
	
}

exports.reference = function(req, res) {
	try {
			// handles a chapter number
		if (req.query.chapterNumber) {
			var chapterNumber = +req.query.chapterNumber;
			var refString = Reference.fromChapterId(chapterNumber).toString();
			res.jsonp(refString);
			// handles a chapter name, returns chunks of verses
		} else if (req.query.chapterName) {
			var increment = +req.query.increment;
			var newChapterId = new Reference(req.query.chapterName).toChapterId() + increment;
			var newRefString = Reference.fromChapterId(newChapterId).toString();
			var verses = Reference.versesInChapterId(newChapterId);
			var result = [];
			
			// push chunks of 30 verses onto the array
			for (var i=1; i <= Math.floor(verses/30); i++){
				result.push(newRefString + ':' + ((i-1)*30+1) + '-' + (i * 30));
			}	

			// take care of the chunk less than 30
			if (verses % 30  > 0) {
				var counter = Math.floor(verses/30) * 30;
				result.push(newRefString + ':' + (counter + 1) + '-' + (counter + verses % 30));
			}
			
			// code here to split up the chapter into blocks of 30 and return an array
			res.jsonp(result);
			// handles user input of a chapter, returns chapterNumber if valid
		}
	} catch(err) {
		console.error(errorHandler.getErrorMessage(err));
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	}
};

/**
 * Chapter middleware
 */
exports.chapterByID = function(req, res, next, id) { 
	Chapter.findById(id).populate('user', 'displayName').exec(function(err, chapter) {
		if (err) return next(err);
		if (! chapter) return next(new Error('Failed to load Chapter ' + id));
		req.chapter = chapter ;
		next();
	});
};

/**
 * Chapter authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.chapter.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
