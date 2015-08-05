'use strict';

// Some module dependencies in \chapters\chapters.client.module.js

// Chapters controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$modal', '$http', '$stateParams', '$location', 'Authentication', 'Chapters', 'Users', '$q', 'Plans', 'BibleText', 'ReadingPlan',
	function($scope, $modal, $http, $stateParams, $location, Authentication, Chapters, Users, $q, Plans, BibleText, ReadingPlan) {
		$scope.authentication = Authentication;
		$http.get('/users/me').then(function(response) {
			$scope.user = new Users(response.data);
		});
		$scope.plansTabs = [];

				// Initialize controller
		$scope.init = function() {
			var userId = $scope.authentication.user._id;
			Plans.query({ 
				user: userId
			}, function(plans) {
				ReadingPlan.setPlans(plans, 0);
				if(plans.length)
					$scope.beginPlanPortion();
			});
		};

		$scope.beginPlanPortion = function() {
			$scope.textPromise = ReadingPlan.beginPlanPortion().then( function(response) {
				$scope.chapterText = response;
				$scope.find();
			});
			
		};

		$scope.incrementPlan = function() {
				// advance the reading plan
			$scope.textPromise = ReadingPlan.incrementPlan().then( function(response) {
				$scope.chapterText = response;
				$scope.find();
			});
			
				// set active plan tab to reflect current tab
			$scope.plansTabs[ReadingPlan.getPlanSegment()] = true;					
		};

		$scope.changePlan = function(index) {
			ReadingPlan.setPlanSegment(index);
			$scope.plansTabs[index] = true;
			$scope.textPromise = ReadingPlan.beginPlanPortion().then( function(response) {
				$scope.chapterText = response;
			});
		};

		// Create new Chapter
		$scope.create = function(params) {
			$scope.textPromise = $q(function(resolve) {
				if(!params) params = {name: ReadingPlan.getCurrentChapter()};
					// Create new Chapter object
				var chapter = new Chapters(params);
				
				chapter.plan = ReadingPlan.getCurrentPlan()._id;
				

				$scope.alerts = [];
				
				chapter.$save(function(response) {
					ReadingPlan.addChapter(response._id);
					$scope.incrementPlan();

					$scope.alerts.push({type: 'success', msg: 'Chapter entered', icon: 'check-square-o'});
					resolve();
				}, function(errorResponse) {
					$scope.alerts.push({type: 'danger', msg: 'Chapter entry failed', icon: 'times'});
					resolve();
				});
			});
			return $scope.textPromise;
		};

		// Create new range of Chapters
		$scope.submitChapterRange = function(name) {
			if(!$scope.range) return;

			var range = $scope.range.split('-');
			
			var rangeStart = range[0].trim();
			var rangeEnd = range[1];

			$scope.alerts = [];
				// if a range was entered
			if (rangeEnd) {
				rangeEnd = rangeEnd.trim();
				$http.get('/range', {params: { rangeStart: rangeStart, rangeEnd: rangeEnd}})
					.then(function (response) {
						var calls = [];
							for(var i= response.data.rangeStart; i < response.data.rangeEnd; i++) {
								calls.push($scope.create({absoluteChapter: i}));
							}
							$q.all(calls);
					}, function(err) {
						$scope.alerts.push({type: 'danger', msg: 'Range entry failed.', icon: 'times'});
					});
				// if only one chapter was entered
			} else {
				$scope.create({name: rangeStart});
			}
			$scope.range='';
		};

		// Find a list of Chapters
		$scope.find = function(userId) {
			if(!userId) userId = $scope.authentication.user._id;
			Plans.query({ 
				user: userId
			}, function(plans) {
				$scope.plans = plans;
			});
		};

		$scope.moveChapter = function(increment) {
			$scope.chapterText = null;
			$scope.create({name: ReadingPlan.getCurrentChapter()});
		};

		$scope.openPlansModal = function (size) {
			var modalInstance = $modal.open({
			  animation: true,
			  templateUrl: 'modules/plans/views/plan-modal.html',
			  controller: 'PlansController',
			  size: size,
			  resolve: {
			    plans: function () {
			    	return ReadingPlan.getPlans();
			    },
			    authentication: function () {
			    	return $scope.authentication;
			    }
			  }
			});

			modalInstance.result.then(function (plans) {
				ReadingPlan.setPlans(plans);
				if(plans) 
					$scope.beginPlanPortion();
			}, function () {

			});
		};
	}

]);