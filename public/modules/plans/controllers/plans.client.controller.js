'use strict';

angular.module('plans').controller('PlansMainController', ['$scope', '$http', 'Authentication', 'Plans', '$location', '$window', 'BibleRef', '$stateParams',
	function($scope, $http, Authentication, Plans, $location, $window, BibleRef, $stateParams) {
		$scope.authentication = Authentication;
		$scope.selected = {
			item: null
		};
		$scope.listStartChapter = [];
		$scope.listEndChapter = [];
		$scope.listCursor = [];
		$scope.listPace = [];
		$scope.listProjected = [];

		$scope.pace = 1;

		$scope.alerts = [];
		$scope.updateAlerts = [];
		$scope.items = [
				{	name: 'Whole Bible (1 year)',
					plans: [{
						name: 'Old Testament (1 year)',
						startChapter: 1,
						endChapter: 929,
						cursor: 1,
						pace: 3
					},
					{
						name: 'New Testament (1 year)',
						startChapter: 930,
						endChapter: 1189,
						cursor: 930,
						pace: 1
					}]
				},
				{	name: 'New Testament (6 months)',
					plans: [{
						name: 'New Testament (6 months)',
						startChapter: 930,
						endChapter: 1189,
						cursor: 930,
						pace: 2
					}]
				} 
			];

		$scope.closeAlert = function(index){
		    $scope.alerts.splice(index, 1);
		};

		$scope.closeUpdateAlert = function(index){
		    $scope.updateAlerts.splice(index, 1);
		};

		$scope.myCreate = function() {
			$http.get('/reference', {params: {chapterInput: [$scope.startChapter, $scope.startChapter, $scope.endChapter]}})
				.then(function(response) {
					var cursorId = response.data[0];
					var startChapterId = response.data[1];
					var endChapterId = response.data[2];
					
						// if the new value is a valid chapter
					if (angular.isNumber(cursorId) && angular.isNumber(startChapterId) && angular.isNumber(endChapterId) && cursorId >= startChapterId && cursorId <= endChapterId) {
							// update all fields
						var plan = new Plans({
							name: $scope.name,
							startChapter: startChapterId,
							endChapter: endChapterId,
							pace: $scope.pace,
							cursor: startChapterId,
							user: $scope.authentication.user._id
						});

						plan.$save(function(response) {
							$location.path('plans');
						}, function(errorResponse) {
							$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
						});

					} else {
						$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
					}
				}, function(error) {
					$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
				});
		};

		$scope.createMultiple = function(item) {
			for(var i = 0; i < item.plans.length; i++) {
				var exists = false;
				for(var j = 0; j < $scope.plans.length; j++) {
					if ($scope.plans[j].name === item.plans[i].name) {
						exists = true;
					}
				}
				if (exists) {
					$scope.alerts.push({msg: 'You\'re already using this plan.', type: 'danger'});
				} else {
					$scope.myCreate(item.plans[i]);
				}
			}
			$scope.selected = null;
			$scope.find();
		};

		$scope.setPlan = function(plan) {
			var usePlan = plan;
			if($scope.plan) usePlan = $scope.plan;
			$scope.startChapter = BibleRef.chapterNameFromId(usePlan.startChapter);
			$scope.endChapter = BibleRef.chapterNameFromId(usePlan.endChapter);
			$scope.cursor = BibleRef.chapterNameFromId(usePlan.cursor);
			$scope.pace = usePlan.pace;

			var projectedDate = new Date();
			projectedDate.setDate(projectedDate.getDate() + (usePlan.endChapter - usePlan.cursor) / usePlan.pace);
			$scope.projected = projectedDate;
		};

		$scope.updatePlan = function() {
			
			$scope.pace = this.pace;
			$http.get('/reference', {params: {chapterInput: [this.cursor, this.startChapter, this.endChapter]}})
				.then(function(response) {
					var cursorId = response.data[0];
					var startChapterId = response.data[1];
					var endChapterId = response.data[2];
					
						// if the new value is a valid chapter
					if (angular.isNumber(cursorId) && angular.isNumber(startChapterId) && angular.isNumber(endChapterId) && cursorId >= startChapterId && cursorId <= endChapterId) {
							// update all fields
						var plan = $scope.plan;
						plan.cursor = cursorId;
						plan.startChapter = startChapterId;
						plan.endChapter = endChapterId;
						plan.pace = $scope.pace;
						
						plan.$update(function(response) {
							$scope.plan = response;
							$scope.setPlan();
							$scope.updateAlerts.push({msg: 'Plan updated.', type: 'success'});
						}, function(errorResponse) {
							$scope.updateAlerts.push({msg: errorResponse.data.message, type: 'danger'});
						});
					} else {
						$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
							// reset form data
						this.cursor = $scope.cursor;
						this.startChapter = $scope.startChapter;
						this.endChapter = $scope.endChapter;
					}
				}, function(error) {
					$scope.updateAlerts.push({msg: 'Invalid input.', type: 'danger'});
				});
		};

		// Remove existing Plan
		$scope.remove = function(plan) {
			
			var areYouSure = $window.confirm('Are you absolutely sure you want to delete this plan? All progress will be permanently lost.');
			if (areYouSure) { 
				$scope.plan.$remove();
				$location.path('plans');
			}
		};

		$scope.activate = function(message) {
			$scope.plan.active = !$scope.plan.active;
			$scope.plan.$update(function(response) {
				$scope.updateAlerts.push({msg: message, type: 'success'});
			});
		};

		// Find a list of Plans
		$scope.find = function() {
			Plans.query({ 
				user: $scope.authentication.user._id
			}, function(plans) {
				for (var i = 0; i < plans.length; i++) {
					$scope.listStartChapter[i] = BibleRef.chapterNameFromId(plans[i].startChapter);
					$scope.listEndChapter[i] = BibleRef.chapterNameFromId(plans[i].endChapter);
					$scope.listCursor[i] = BibleRef.chapterNameFromId(plans[i].cursor);
					$scope.listPace[i] = plans[i].pace;

					var projectedDate = new Date();
					projectedDate.setDate(projectedDate.getDate() + (plans[i].endChapter - plans[i].cursor) / plans[i].pace);
					$scope.listProjected[i] = projectedDate;
				}
				$scope.plans = plans;
			});
		};

		// Find existing Plan
		$scope.findOne = function() {
			$scope.plan = Plans.get({ 
				planId: $stateParams.planId
			}, function(response) {
				$scope.setPlan(response);
			});
		};
	}
]);