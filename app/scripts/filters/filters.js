'use strict';

/**
 * @ngdoc function
 * @name APP.services:Filters
 * @description
 * # StorageService
 * Filters of the APP
 */
angular.module('APP')
.filter('highlight', function($sce) {
	return function (text, phrase) {
		if (phrase && text) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
			'<span class="highlight\">$1</span>')

		return $sce.trustAsHtml(text)
	}
})

.filter('standarddate', function($filter, $translate){
    var dateFilterFn = $filter('date');
    var dateFormat = $translate.instant('dateFormat');
    return function(dateToFormat){
     return dateFilterFn(dateToFormat, dateFormat);
    };
})
.filter('standarddatetime', function($filter, $translate){
    var dateFilterFn = $filter('date');
    var dateFormat = $translate.instant('dateTimeFormat');
    return function(dateToFormat){
     return dateFilterFn(dateToFormat, dateFormat);
    };
})
.filter('shortdate', function($filter, $translate){
    var dateFilterFn = $filter('date');
    var dateFormat = $translate.instant('shortDateFormat');
    return function(dateToFormat){
     return dateFilterFn(dateToFormat, dateFormat);
    };
})
.filter('filterEncounterByFolder', function() {
	return function(encounters,folders) {
		var out = [];
		//if (!filters || filters.length == 0)
		//  return items;
		// Filter logic here, adding matches to the out var.
		angular.forEach(encounters, function (encounter, key) {
			//If none filters selected, return all
			if (folders.length==0){
				this.push(encounter);
			}
			else
			{
				if (encounter.folder && folders.indexOf(encounter.folder.id)>=0){
					this.push(encounter);
				}
				if (!encounter.folder && folders.indexOf(0)>=0){
					this.push(encounter);
				}
			}
		},out);
		return out;
	};
})
.filter('filterItemByClassname', function() {
	return function(items,filters) {
		var out = [];
		//if (!filters || filters.length == 0)
		//  return items;
		// Filter logic here, adding matches to the out var.
		angular.forEach(items, function (item, key) {
			if (filters.length==0){
				this.push(item);
			}
			if (filters.indexOf(item.object.className)>=0){
				this.push(item);
			}
		},out);
		return out;
	};
})
.filter('surveyStatusLabel', function() {
  return function(input) {
    return input == 0 ? 'Disponibile' : (input == 1 ? 'Prenotato' : 'Annullato');
  };
})
.filter('json__', function() {
  return function(text) {
    return JSON.stringify(text, null, 2);
  };
})
.filter('hours', function() {
  return function(value) {

    var hours = parseInt(value);

  	if(hours != 'NaN')
  		return hours == 1 ? hours + ' ora': hours + ' ore';

    return null;
  };
})
.filter('bytes', function() {
  return function(value) {

    var bytes = parseInt(value);

  	if(bytes != 'NaN')
  	{
  		if( bytes < 1024 )
  			return bytes + ' bytes';

  		if( bytes < 1024*1024)
  			return Math.round(bytes/1024) + ' KB';

  		return (Math.round(bytes/1024)/1024).toFixed(2) + ' MB';
  	}

    return null;
  };
})
.filter('unique', function() {
	return function(collection, keyname, keyname2) {
		var output = [],
			keys = [];

		angular.forEach(collection, function(item) {
			// check to see whether object exists
			var key = eval('item.' + keyname);

			if(keyname2 != null) {
				key += ',' + eval('item.' + keyname2);
			}
			// if it's not already part of keys array
			if(key != null && keys.indexOf(key) === -1) {
				// add it to keys array
				keys.push(key);
				// push this item to final output array
				output.push(item);
			}
		});
		// return array which should be devoid of
		// any duplicates
		return output;
	};
})

.filter('frequency', function() {
	return function(frequency) {
		if(frequency) {
			if(frequency.justOnce) {
				return 'just once';
			}

			if(frequency.asNeeded) {
				return 'as needed';
			}

			return 'every ' + frequency.value + ' ' + frequency.scale;
 		}
	};
})

.filter('map', function() {
	return function(array, fieldName) {
		if(array) {

			return array.map(function(a){
				return a[fieldName];
			});
		}
	};
})

.filter('linkedName', function() {
	return function(link) {
		if(link) {

			if(link.indexOf('/') != -1){
				return link.substr(link.lastIndexOf('/')+1);
			}

			return link;
		}
	};
})


;
