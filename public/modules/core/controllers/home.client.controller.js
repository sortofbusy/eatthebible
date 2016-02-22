'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http', '$q', '$sce', '$location', '$anchorScroll',
	function($scope, Authentication, $http, $q, $sce, $location, $anchorScroll) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		
		$scope.read = function() {
			var chapter = $scope.chapterString;
			if ($scope.readChapter) chapter = $scope.readChapter;
			$scope.getBibleText(chapter).then(function(response) {
				$scope.chapterText = response;
				$scope.chapterString = response.inputstring;
				$location.hash('readLocation');
				$anchorScroll();
			}, function(err){
				console.log(err);
			});
			$scope.readChapter = '';
		};

		$scope.books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];

		$scope.getBibleText = function(chapterName) {
			
			return $q(function(resolve) {
				$http.jsonp('https://getbible.net/json', {params: { scripture: chapterName, v: $scope.version.code, callback: 'JSON_CALLBACK'}})
					.then(					
						function (response) {
							
							var json = response.data;
							var combined = {};
							combined.verses = [];
							try {
							combined.inputstring = json.book_name + ' ' + json.chapter_nr;
								for (var i in json.chapter) {
									json.chapter[i].verse = json.chapter[i].verse.split('--').join('&mdash;');
									
									combined.verses.push({ref: json.chapter[i].verse_nr, text: json.chapter[i].verse});
								}
							} catch (e) {
								resolve(e);
								return;
							}
							combined.copyright = $scope.version.name + ' [' + $scope.version.language + '] text from getbible.net.';
							resolve(combined);
						}, function(error) {
							resolve(error);
						});
				
			});
		};

		$scope.sceTrust = function(input) {
			return $sce.trustAsHtml(input);
		};

		$scope.bibleVersions = [
			{ language: 'Afrikaans', name: 'Ou Vertaling', code: 'aov'},
			{ language: 'Albanian', name: 'Albanian', code: 'albanian'},
			{ language: 'Amharic', name: 'Haile Selassie Amharic Bible', code: 'hsab'},
			{ language: 'Arabic', name: 'Smith and Van Dyke', code: 'arabicsv'},
			{ language: 'Chinese', name: 'NCV Traditional', code: 'cnt'},
			{ language: 'Chinese', name: 'Union Simplified', code: 'cus'},
			{ language: 'Chinese', name: 'NCV Simplified', code: 'cns'},
			{ language: 'Chinese', name: 'Union Traditional', code: 'cut'},
			{ language: 'Croatian', name: 'Croatian', code: 'croatia'},
			{ language: 'Danish', name: 'Danish', code: 'danish'},
			{ language: 'Dutch', name: 'Dutch Staten Vertaling', code: 'statenvertaling'},
			{ language: 'English', name: 'American Standard Version', code: 'asv'},
			{ language: 'English', name: 'Amplified Version', code: 'amp'},
			{ language: 'English', name: 'Basic English Bible', code: 'basicenglish'},
			{ language: 'English', name: 'Darby', code: 'darby'},
			{ language: 'English', name: 'King James Version', code: 'kjv'},
			{ language: 'English', name: 'KJV Easy Read', code: 'akjv'},
			{ language: 'English', name: 'New American Standard', code: 'nasb'},
			{ language: 'English', name: 'Young\'s Literal Translation', code: 'ylt'},
			{ language: 'English', name: 'World English Bible', code: 'web'},
			{ language: 'English', name: 'Webster\'s Bible', code: 'wb'},
			{ language: 'Esperanto', name: 'Esperanto', code: 'esperanto'},
			{ language: 'Estonian', name: 'Estonian', code: 'estonian'},
			{ language: 'Finnish', name: 'Finnish Bible (1776)', code: 'finnish1776'},
			{ language: 'French', name: 'Martin (1744)', code: 'martin'},
			{ language: 'German', name: 'Luther (1912)', code: 'luther1912'},
			{ language: 'Greek', name: 'Greek Modern', code: 'moderngreek'},
			{ language: 'Greek', name: 'Textus Receptus', code: 'text'},
			{ language: 'Hebrew', name: 'Aleppo Codex', code: 'aleppo'},
			{ language: 'Hungarian', name: 'Hungarian Karoli', code: 'karoli'},
			{ language: 'Italian', name: 'Giovanni Diodati Bible (1649)', code: 'giovanni'},
			{ language: 'Korean', name: 'Korean', code: 'korean'},
			{ language: 'Norwegian', name: 'Bibelselskap (1930)', code: 'bibelselskap'},
			{ language: 'Portuguese', name: 'Almeida Atualizada', code: 'almeida'},
			{ language: 'Russian', name: 'Synodal Translation (1876)', code: 'synodal'},
			{ language: 'Spanish', name: 'Reina Valera (1909)', code: 'valera'},
			{ language: 'Swahili', name: 'Swahili', code: 'swahili'},
			{ language: 'Swedish', name: 'Swedish (1917)', code: 'swedish'},
			{ language: 'Turkish', name: 'Turkish', code: 'turkish'},
			{ language: 'Vietnamese', name: 'Vietnamese (1934)', code: 'vietnamese'},
			{ language: 'Xhosa', name: 'Xhosa', code: 'xhosa'}
		];

		$scope.version = $scope.bibleVersions[17];
	}


]);