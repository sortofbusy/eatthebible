'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Badge = mongoose.model('Badge');

/**
 * Globals
 */
var user, badge;

/**
 * Unit tests
 */
describe('Badge Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			badge = new Badge({
				name: 'Badge Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return badge.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

	});

	afterEach(function(done) { 
		Badge.remove().exec();
		User.remove().exec();

		done();
	});
});