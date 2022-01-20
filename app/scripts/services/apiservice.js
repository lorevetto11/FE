'use strict';

/**
 * @ngdoc function
 * @name APP.services:APIService
 * @description
 * # APIService
 * Service of the APP
 */
angular.module('APP')
.factory('APIService', function ($resource, $rootScope, $q, $http, $log,
								 Layout, WaterSupply, AirConditioning, Cleaning, WasteDisposal, Equipment, PestControl, StaffHygiene,
								 Monitoring, Procedure, Person, Organization, OrganizationPlace, OrganizationCertification,
								 UserRole, Profile, Outcome, Training, Course, Frequency, EEquipment, EquipmentType,
								 ProcessCheck, SystemCheck, SystemCheckRequirement, SystemCheckPlanning, ProcessCheckPlanning,
								 SystemCheckOutcome, ProcessCheckOutcome, Noncompliance, Danger, Floor, AnalysisParameter, AnalysisParameterValue,
								 Attachment, ResourceService, StorageService, Chart, RiskClass, Grant, Shape, Participant, PrerequisiteType,
								 AirConditioningType, WasteDisposalType, MaterialCategory, WaterSupplyType, PestControlType, Supplier, PackagingMaterial, ENV,
								 Diagram, DiagramShape, Rectangle, Ellipse, Rhombus, Parallelogram, AnchorPoint, Arrow, Entity, RiskMap) {
	var _apiEndpoint = '';
	if (ENV.hostEndpoint) {
		_apiEndpoint += ENV.hostEndpoint;
	}
	_apiEndpoint += 'rest/';

	var _call = function (_method, _path, _object, _isArray, _headers) {
		return $q(function (resolve, reject) {

			var var_headers = {
				'Authorization': StorageService.getLocalStorage('Authorization')
			};
			if (_method != 'GET') {
				var_headers['Content-Type'] = 'application/json';
			}
			if (_headers && _headers.length > 0) {
				for (var i = 0; i < _headers.length; i++) {
					var_headers[_headers[i].key] = _headers[i].value;
				}
			}
			var call = {
				method: _method,
				url: _apiEndpoint + _path,
				isArray: _isArray,
				headers: var_headers
			};
			if (_method != 'GET') {
				call.data = _object;
			}
			$http(call).then(
				function success(response) {
					var token = response.headers('token');
					if (token) {
						StorageService.putLocalStorage('Authorization', 'Bearer ' + token);
					}

					resolve(response);
				},
				reject
			);
		});
	};

	//INTERNAL METHODS
	var _login = function (_username, _password) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', 'roles/login', {
				"username": _username,
				"password": _password
			}, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299) {
						return reject(response);
					}

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _changePassword = function (userId, oldPassword, newPassword) {
		return $q(function (resolve, reject) {
			var resource = _call('PUT', 'roles/login', null, false, [{
				key: 'username',
				value: _username
			}, {
				key: 'password',
				value: _password
			}]);
			resource.then(
				function successCallback(response) {
					if (response.status > 299) {
						reject(response);
					}

					StorageService.putLocalStorage('Authorization', response.data.token);
					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};
	//INTERNAL METHODS
	// var _getUserById = function (_userId) {
	//     return $q(function (resolve, reject) {
	//         var resource = _call('GET', 'roles/' + _userId + '/findById', null, false, null);
	//         resource.then(
	//             function successCallback(response) {
	//                 if (response.status > 299) {
	//                     reject(response);
	//                 }
	//
	//                 resolve(response.data);
	//             },
	//             function errorCallback(response) {
	//                 reject(response);
	//             });
	//     });
	// };
	var _logout = function () {
		return $q(function (resolve, reject) {
			var resource = _call('PUT', 'roles/logout', null, false, null);
			resource.then(
				function successCallback(response) {
					StorageService.putLocalStorage('Authorization', null);
					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};
	var _search = function (_query) {
		return $q(function (resolve, reject) {
			var resource = _call('GET', 'common/search', null, false, [{
				key: 'queryString',
				value: _query
			}]);
			resource.then(
				function successCallback(response) {
					if (response.status > 299) {
						reject(response);
					}

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};
	var _log = function (_level, _message) {
		return $q(function (resolve, reject) {
			var log = {
				level: _level,
				text: _message
			};
			var resource = _call('POST', 'log/log', log, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299) {
						reject(response);
					}

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};
	var _getApplicationInfo = function () {
		return $q(function (resolve, reject) {
			var resource = _call('GET', 'common/applicationInfo', null, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299) {
						reject(response);
					}

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _areas = null;
	var _tasks = null;
	var _availableSurveys = null;
	var _functions = null;
	var _audits = null;
	var _organizations = null;


	var _getOrganizations = function () {
		return $q(function (resolve, reject) {

			var resource = _call('GET', 'roles/organizations', null, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _enableOrganization = function (organizationId) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', 'organizations/organization/' + organizationId + '/enable', null, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _disableOrganization = function (organizationId) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', 'organizations/organization/' + organizationId + '/disable', null, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _updateOrganization = function (organization) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', 'organizations/organization/' + organization.id + '/update',
				organization, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _createOrganization = function (organization) {
		return $q(function (resolve, reject) {
			var resource = _call('POST', 'organizations/organization/create',
				organization, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	// USER
	var _getUsers = function () {
		return $q(function (resolve, reject) {

			var resource = _call('GET', 'roles/users', null, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _getUserById = function (userId) {
		return $q(function (resolve, reject) {

			var resource = _call('GET', 'roles/users' + "/" + userId, null, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _createUser = function (user) {
		return $q(function (resolve, reject) {

			var resource = _call('POST', 'roles/users', user, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _updateUser = function (user) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', 'roles/users', user, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _deleteUser = function (userId) {
		return $q(function (resolve, reject) {

			var resource = _call('DELETE', 'roles/users' + "/" + userId, null, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};


	var _enableUser = function (userId) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', 'roles/user/' + userId + '/enable', null, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _disableUser = function (userId) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', 'roles/user/' + userId + '/disable', null, false, null);
			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	/*
	 var _find = function(url, headers) {
	 return $q(function(resolve, reject) {
	 var resource = _call('GET', url, null, false, headers);
	 resource.then(
	 function successCallback(response) {
	 if (response.status > 299)
	 reject(response);

	 resolve(response.data);
	 },
	 function errorCallback(response) {
	 reject(response);
	 });
	 });
	 };

	 var _findAll = function(url, headers) {
	 return $q(function(resolve, reject) {

	 var resource = _call('GET', url, null, false, headers);
	 resource.then(
	 function successCallback(response) {
	 if (response.status > 299)
	 reject(response);

	 resolve(response.data);
	 },
	 function errorCallback(response) {
	 reject(response);
	 });
	 });
	 };

	 var _create = function(url, obj, headers) {
	 return $q(function(resolve, reject) {
	 var resource = _call('POST', url, obj, false, headers);
	 resource.then(
	 function successCallback(response) {
	 if (response.status > 299)
	 reject(response);

	 resolve(response.data);
	 },
	 function errorCallback(response) {
	 reject(response);
	 });
	 });
	 };

	 var _update = function(url, obj, headers) {
	 return $q(function(resolve, reject) {

	 var resource = _call('PUT', url, obj, false, headers);
	 resource.then(
	 function successCallback(response) {
	 if (response.status > 299)
	 reject(response);

	 resolve(response.data);
	 },
	 function errorCallback(response) {
	 reject(response);
	 });
	 });
	 };

	 var _delete = function(url, headers) {
	 return $q(function(resolve, reject) {

	 var resource = _call('DELETE', url, null, false, headers);
	 resource.then(
	 function successCallback(response) {
	 if (response.status > 299)
	 reject(response);

	 resolve(response.data);
	 },
	 function errorCallback(response) {
	 reject(response);
	 });
	 });
	 };
	 */

	var _exportLocalStorage = function (contexts) {
		var storage = {};
		if (contexts) {
			contexts.forEach(function (context) {
				storage['context'] = StorageService.getLocalStorage(context);
			});
		}
		return storage;
	};

	var _importLocalStorage = function (storage) {
		return $q(function (resolve, reject) {
			if (storage) {
				for (var context in storage) {
					if (storage.hasOwnProperty(context)) {

						$log.info('importing context:', context);
						StorageService.putLocalStorage(context, storage[context]);
					}
				}
				resolve();
			} else {
				reject();
			}
		});
	};

	var _asyncFindAll = function (path, Model, organizationId, header) {
		return $q(function (resolve, reject) {

			var headers = null;

			if (organizationId) {
				headers = [{
					key: 'organizationId',
					value: organizationId
				}]
			}

			if (header) {
				headers = header;
			}

			var resource = _call('GET', path, null, false, headers);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve((response.data || []).map(function (item) {

						if (Model === null) {

							if (item.type === 'RECTANGLE') {
								return Rectangle.parse(item);
							} else if (item.type === 'ELLIPSE') {
								return Ellipse.parse(item);
							} else if (item.type === 'RHOMBUS') {
								return Rhombus.parse(item);
							} else if (item.type === 'PARALLELOGRAM') {
								return Parallelogram.parse(item);
							} else {
								return null;
							}

						} else {
							return Model.parse(item);
						}

					}));
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _asyncFindById = function (path, Model) {
		return $q(function (resolve, reject) {

			var resource = _call('GET', path, null, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);
					resolve(Model.parse(response.data));
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _asyncCreate = function (path, payload, Model) {
		return $q(function (resolve, reject) {


			var resource = _call('POST', path, payload, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					if (Model === null) {

						if (response.data.type === 'RECTANGLE') {
							Model = Rectangle;
						} else if (response.data.type === 'ELLIPSE') {
							Model = Ellipse;
						} else if (response.data.type === 'RHOMBUS') {
							Model = Rhombus;
						} else if (response.data.type === 'PARALLELOGRAM') {
							Model = Parallelogram;
						}

					}

					resolve(Model.parse(response.data));
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _asyncCreateAll = function (path, payload, Model) {
		return $q(function (resolve, reject) {

			var resource = _call('POST', path, payload, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve((response.data || []).map(function (item) {

						if (Model === null) {

							if (response.data.type === 'RECTANGLE') {
								Model = Rectangle;
							} else if (response.data.type === 'ELLIPSE') {
								Model = Ellipse;
							} else if (response.data.type === 'RHOMBUS') {
								Model = Rhombus;
							} else if (response.data.type === 'PARALLELOGRAM') {
								Model = Parallelogram;
							}

						} else {
							return Model.parse(item);
						}

					}));
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};


	var _asyncEdit = function (path, payload, Model) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', path, payload, false);
			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					if (Model === null) {

						if (response.data.type === 'RECTANGLE') {
							Model = Rectangle;
						} else if (response.data.type === 'ELLIPSE') {
							Model = Ellipse;
						} else if (response.data.type === 'RHOMBUS') {
							Model = Rhombus;
						} else if (response.data.type === 'PARALLELOGRAM') {
							Model = Parallelogram;
						}

					}

					resolve(Model.parse(response.data));
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _asyncEditAll = function (path, payload, Model) {
		return $q(function (resolve, reject) {

			var resource = _call('PUT', path, payload, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299) {
						reject(response);
					}

					resolve((response.data || []).map(function (item) {
						if (Model === null) {
							if (response.data.type === 'RECTANGLE') {
								Model = Rectangle;
							} else if (response.data.type === 'ELLIPSE') {
								Model = Ellipse;
							} else if (response.data.type === 'RHOMBUS') {
								Model = Rhombus;
							} else if (response.data.type === 'PARALLELOGRAM') {
								Model = Parallelogram;
							}
						} else {
							return Model.parse(item);
						}
					}));
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};

	var _asyncDelete = function (path) {
		return $q(function (resolve, reject) {

			var resource = _call('DELETE', path, null, false);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};


	var _findAll = function (context, Model) {
		return $q(function (resolve, reject) {
			var items = [];
			(StorageService.getLocalStorage(context) || []).forEach(function (item) {
				items.push(Model.parse(item));
			});
			resolve(items);
		});
	};

	var _findById = function (context, Model, itemId) {
		return $q(function (resolve, reject) {
			_findAll(context, Model).then(function (data) {
				var item = (data || []).find(function (i) {
					return i.id == itemId;
				});

				if (item != null) {
					return resolve(item);
				} else {
					return reject();
				}
			});
		});
	};

	var _deleteAll = function (context) {
		return $q(function (resolve, reject) {
			var items = [];
			StorageService.putLocalStorage(context, null);
			resolve(items);
		});
	};

	var _create = function (context, Model, item) {
		return $q(function (resolve, reject) {
			_findAll(context, Model).then(function (data) {
				var items = data;
				if (typeof item != Model.type) {
					item = Model.parse(item);
				}

				if (items.length > 0) {
					var maxId = items.sort(function (a, b) {
						return b.id - a.id;
					})[0].id;
					item.id = maxId != null ? (maxId + 1) : 0;
				} else {
					item.id = 0;
				}
				item.selected = null;
				item.createDate = new Date();

				items.push(item);
				StorageService.putLocalStorage(context, items);
				resolve(item);
			});
		});
	};

	var _update = function (context, Model, item) {

		return $q(function (resolve, reject) {
			_findAll(context, Model).then(function (data) {
				var items = data;

				if (typeof item != Model.type) {
					item = Model.parse(item);
				}
				item.selected = null;
				item.updateDate = new Date();

				var idx = -1;
				items.forEach(function (i, index) {
					if (i.id == item.id) {
						idx = index;
					}
				});

				if (idx != -1) {
					items.splice(idx, 1, item);
					StorageService.putLocalStorage(context, items);
					resolve(item);
				} else {
					reject({
						error: 'item not found for Id: ' + item
					});
				}
			});
		});
	};

	var _delete = function (context, Model, itemId) {
		return $q(function (resolve, reject) {
			_findAll(context, Model).then(function (data) {
				var items = data;
				var idx = -1;

				items.forEach(function (i, index) {
					if (i.id == itemId) {
						idx = index;
					}
				});

				if (idx != -1) {
					items.splice(idx, 1);
					StorageService.putLocalStorage(context, items);
					resolve();
				} else {
					reject({
						error: 'Element not found for Id: ' + itemId
					});
				}
			});
		});
	};

	var _getAllPrerequisites = function (organizationId) {
		return $q(function (resolve, reject) {

			var prerequisites = [];

			_asyncFindAll('prerequisites/layouts', Layout, organizationId).then(function (data) {
				prerequisites = prerequisites.concat(data);
				_asyncFindAll('prerequisites/waterSupplies', WaterSupply, organizationId).then(function (data) {
					prerequisites = prerequisites.concat(data);
					_asyncFindAll('prerequisites/airConditioning', AirConditioning, organizationId).then(function (data) {
						prerequisites = prerequisites.concat(data);
						_asyncFindAll('prerequisites/cleanings', Cleaning, organizationId).then(function (data) {
							prerequisites = prerequisites.concat(data);
							_asyncFindAll('prerequisites/wasteDisposal', WasteDisposal, organizationId).then(function (data) {
								prerequisites = prerequisites.concat(data);
								_asyncFindAll('prerequisites/equipments', Equipment, organizationId).then(function (data) {
									prerequisites = prerequisites.concat(data);
									_asyncFindAll('prerequisites/pestControls', PestControl, organizationId).then(function (data) {
										prerequisites = prerequisites.concat(data);
										_asyncFindAll('prerequisites/staffHygiene', StaffHygiene).then(function (data) {
											prerequisites = prerequisites.concat(data);
											_asyncFindAll('danger', Danger, organizationId).then(function (data) {
												resolve(prerequisites.concat(data));
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	};

	var _getPrerequisiteByContext = function (context) {

		if(!context) {
			return $q(function (resolve, reject) {
				resolve();
			})
		}

		switch (context.className) {
			case 'WaterSupplyBean' :
				return _asyncFindById('prerequisites/waterSupplies/context' + "/" + context.id, WaterSupply);
			case 'WasteDisposalBean' :
				return _asyncFindById('prerequisites/wasteDisposal/context' + "/" + context.id, WasteDisposal);
			case 'CleaningBean' :
				return _asyncFindById('prerequisites/cleanings/context' + "/" + context.id, Cleaning);
			case 'EquipmentPrerequisiteBean' :
				return _asyncFindById('prerequisites/equipments/context' + "/" + context.id, Equipment);
			case 'PestControlBean' :
				return _asyncFindById('prerequisites/pestControls/context' + "/" + context.id, PestControl);
			case 'StaffHygieneBean' :
				return _asyncFindById('prerequisites/staffHygiene/context' + "/" + context.id, StaffHygiene);
			case 'DangerBean' :
				return _asyncFindById('danger/context' + "/" + context.id, Danger);
			case 'AirConditioningBean' :
				return _asyncFindById('prerequisites/airConditioning/context' + "/" + context.id, AirConditioning);
			case 'FlowElement' :
				return _asyncFindById('flow/elements/context' + "/" + context.id, Entity);
			default: {
				return $q(function (resolve, reject) {
					resolve();
				})
			}
		}
	};

	var _recursiveCall = function (items, predicate, deferred, results) {

		if (!deferred) {
			deferred = $q.defer();
		}

		if (results == null) {
			results = [];
		}

		var item = items ? items.shift() : null;

		if (item == null) {
			deferred.resolve(results != null ? results : []);
			return deferred.promise;
		}

		predicate(item).then(
			function (data) {

				if( data ) {
					results = results.concat(data);
				}

				return _recursiveCall(items, predicate, deferred, results);
			}, function () {
				return deferred.reject();
			}
		);

		return deferred.promise;
	}

	var _getOutcomesByOrganizationId = function (organizationId) {
		return $q(function (resolve, reject) {

			_findAll('context.outcomes', Outcome).then(
				function success(data) {
					var items = data;

					/*


					 (items || []).forEach(function(item){
					 if(item.attachmentId !== null) {
					 _findById('context.attachment', Attachment, item.attachmentId).then(
					 function success(attach) {
					 item.attachment = attach;
					 }
					 )
					 }
					 });
					 */
					resolve(items);
				},
				reject);
		});
	}

	var _getUserRoles = function (organizationId) {
		return $q(function (resolve, reject) {

			var header = null;

			if (organizationId != null) {
				header = [{
					key: 'organizationId',
					value: organizationId
				}];
			}

			var resource = _call('GET', 'roles/roles', null, false, header);

			resource.then(
				function successCallback(response) {
					if (response.status > 299)
						reject(response);

					resolve(response.data);
				},
				function errorCallback(response) {
					reject(response);
				});
		});
	};


//EXTERNAL METHODS
	return {

		login: function (_username, _password) {
			return _login(_username, _password);
		},
		logout: function () {
			return _logout();
		},
		exportLocalStorage: function () {
			return _exportLocalStorage();
		},
		importLocalStorage: function (storage) {
			return _importLocalStorage(storage);
		},
		deleteAll: function (context) {
			return _deleteAll(context);
		},

		changePassword: function (userId, oldPassword, newPassword) {
			return _update('roles/user/' + userId + '/changePassword', null, [{
				key: 'oldPassword',
				value: oldPassword
			}, {
				key: 'newPassword',
				value: newPassword
			}]);
		},

		// IMPORT & EXPORT
		recursiveCall: function (items, predicate) {
			return _recursiveCall(items, predicate);
		},

		// ROLES
		// GRANTS
		getGrants: function () {
			return _asyncFindAll('roles/grants', Grant);
		},

		// ORGANIZATIONS
		getOrganizations: function (rootId) {
			return _asyncFindAll('roles/organizations', Organization, rootId);
		},
		getOrganizationById: function (organizationId) {
			return _asyncFindById('roles/organizations' + "/" + organizationId, Organization);
		},
		createOrganization: function (organization) {
			return _asyncCreate('roles/organizations', organization, Organization);
		},
		updateOrganization: function (organization) {
			return _asyncEdit('roles/organizations', organization, Organization);
		},
		deleteOrganization: function (organizationId) {
			return _asyncDelete('roles/organizations' + "/" + organizationId);
		},

		// ORGANIZATION PLACES
		getOrganizationPlaces: function (rootId) {
			return _asyncFindAll('roles/places', OrganizationPlace, rootId);
		},
		getOrganizationPlaceById: function (organizationPlaceId) {
			return _asyncFindById('roles/places' + "/" + organizationPlaceId, OrganizationPlace);
		},
		createOrganizationPlace: function (organizationPlace) {
			return _asyncCreate('roles/places', organizationPlace, OrganizationPlace);
		},
		updateOrganizationPlace: function (organizationPlace) {
			return _asyncEdit('roles/places', organizationPlace, OrganizationPlace);
		},
		deleteOrganizationPlace: function (organizationPlaceId) {
			return _asyncDelete('roles/places' + "/" + organizationPlaceId);
		},

		// ORGANIZATION CERTIFICATIONS
		getOrganizationCertifications: function (rootId) {
			return _asyncFindAll('roles/certifications', OrganizationCertification, rootId);
		},
		getOrganizationCertificationById: function (organizationCertificationId) {
			return _asyncFindById('roles/certifications' + "/" + organizationCertificationId, OrganizationCertification);
		},
		createOrganizationCertification: function (organizationCertification) {
			return _asyncCreate('roles/certifications', organizationCertification, OrganizationCertification);
		},
		updateOrganizationCertification: function (organizationCertification) {
			return _asyncEdit('roles/certifications', organizationCertification, OrganizationCertification);
		},
		deleteOrganizationCertification: function (organizationCertificationId) {
			return _asyncDelete('roles/certifications' + "/" + organizationCertificationId);
		},

		// PROFILES
		getProfiles: function (rootId) {
			return _asyncFindAll('roles/profiles/all', Profile, rootId);
		},
		getProfileById: function (profileId) {
			return _asyncFindById('roles/profiles' + "/" + profileId, Profile);
		},
		getProfilesByOrganizationId: function (organizationId) {
			return _asyncFindAll('roles/profiles', Profile, organizationId);
		},
		createProfile: function (profile) {
			return _asyncCreate('roles/profiles', profile, Profile);
		},
		updateProfile: function (profile) {
			return _asyncEdit('roles/profiles', profile, Profile);
		},
		deleteProfile: function (profileId) {
			return _asyncDelete('roles/profiles' + "/" + profileId);
		},

		// ROLES
		getRoles: function (rootId) {
			return _asyncFindAll('roles/roles/all', UserRole, rootId);
		},
		getRoleById: function (roleId) {
			return _asyncFindById('roles/roles' + "/" + roleId, UserRole);
		},
		getRolesByOrganizationId: function (organizationId) {
			return _asyncFindAll('roles/roles', UserRole, organizationId);
		},
		createRole: function (role) {
			return _asyncCreate('roles/roles', role, UserRole);
		},
		updateRole: function (role) {
			return _asyncEdit('roles/roles', role, UserRole);
		},
		deleteRole: function (roleId) {
			return _asyncDelete('roles/roles' + "/" + roleId);
		},

		// USERS
		getUsers: function (rootId) {
			return _asyncFindAll('roles/users', Person, rootId);
		},
		getUserById: function (userId) {
			return _asyncFindById('roles/users' + "/" + userId, Person);
		},
		getUsersByOrganizationId: function (organzationId) {
			return _asyncFindAll('roles/users', Person, organzationId);
		},
		createUser: function (user) {
			return _asyncCreate('roles/users', user, Person);
		},
		updateUser: function (user) {
			return _asyncEdit('roles/users', user, Person);
		},
		deleteUser: function (userId) {
			return _asyncDelete('roles/users' + "/" + userId);
		},
		// Do we need them?
		enableUser: function (userId) {
			return _enableUser(userId);
		},
		disableUser: function (userId) {
			return _disableUser(userId);
		},

		// PREREQUISITES
		getAllPrerequisitesByOrganizationId: function (organizationId) {
			return _getAllPrerequisites(organizationId);
		},

		getPrerequisiteByContext : function(context) {
			return _getPrerequisiteByContext(context);
		},

		// RISKCLASSES
		getRiskClass: function () {
			return _asyncFindAll('prerequisites/riskClasses', RiskClass);
		},
		getRiskClassById: function (riskClassId) {
			return _asyncFindById('prerequisites/riskClasses' + "/" + riskClassId, RiskClass);
		},
		getRiskClassesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/riskClasses', RiskClass, organizationId);
		},
		createRiskClass: function (riskClass) {
			return _asyncCreate('prerequisites/riskClasses', riskClass, RiskClass);
		},
		updateRiskClass: function (riskClass) {
			return _asyncEdit('prerequisites/riskClasses', riskClass, RiskClass);
		},
		deleteRiskClass: function (riskClassId) {
			return _asyncDelete('prerequisites/riskClasses' + "/" + riskClassId);
		},


		// FLOORS
		getFloors: function () {
			return _asyncFindAll('prerequisites/floors', Floor);
		},
		getFloorById: function (floorId) {
			return _asyncFindById('prerequisites/floors' + "/" + floorId, Floor);
		},
		getFloorsByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/floors', Floor, organizationId);
		},
		createFloor: function (floor) {
			return _asyncCreate('prerequisites/floors', floor, Floor);
		},
		updateFloor: function (floor) {
			return _asyncEdit('prerequisites/floors', floor, Floor);
		},
		deleteFloor: function (floorId) {
			return _asyncDelete('prerequisites/floors' + "/" + floorId);
		},

		// CHARTS
		getChartsByOrganizationId: function (organizationId) {
			return _findAll('context.charts', Chart);
		},
		createChart: function (item) {
			return _create('context.charts', Chart, item);
		},
		updateChart: function (item) {
			return _update('context.charts', Chart, item)
		},
		deleteChart: function (itemId) {
			return _delete('context.charts', Chart, itemId);
		},

		// LAYOUTS
		getLayouts: function () {
			return _asyncFindAll('prerequisites/layouts', Layout);
		},
		getLayoutById: function (layoutId) {
			return _asyncFindById('prerequisites/layouts' + "/" + layoutId, Layout);
		},
		getLayoutsByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/layouts', Layout, organizationId);
		},
		createLayout: function (layout) {
			return _asyncCreate('prerequisites/layouts', layout, Layout);
		},
		updateLayout: function (layout) {
			return _asyncEdit('prerequisites/layouts', layout, Layout);
		},
		deleteLayout: function (layoutId) {
			return _asyncDelete('prerequisites/layouts' + "/" + layoutId);
		},

		// WATER SUPPLIES
		getWaterSupplies: function () {
			return _asyncFindAll('prerequisites/waterSupplies', WaterSupply);
		},
		getWaterSupplyById: function (waterSupplyId) {
			return _asyncFindById('prerequisites/waterSupplies' + "/" + waterSupplyId, WaterSupply);
		},
		getWaterSuppliesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/waterSupplies', WaterSupply, organizationId);
		},
		getWaterSupplyByContextId: function (contextId) {
			return _asyncFindById('prerequisites/waterSupplies/context' + "/" + contextId, WaterSupply);
		},
		createWaterSupply: function (waterSupply) {
			return _asyncCreate('prerequisites/waterSupplies', waterSupply, WaterSupply);
		},
		updateWaterSupply: function (waterSupply) {
			return _asyncEdit('prerequisites/waterSupplies', waterSupply, WaterSupply);
		},
		deleteWaterSupply: function (waterSupplyId) {
			return _asyncDelete('prerequisites/waterSupplies' + "/" + waterSupplyId);
		},
		// WATER SUPPLIES TYPES
		getWaterSupplyTypes: function () {
			return _asyncFindAll('prerequisites/waterSupplies/types', WaterSupplyType);
		},
		getWaterSupplyTypesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/waterSupplies/types', WaterSupplyType, organizationId);
		},
		createWaterSupplyType: function (item) {
			return _asyncCreate('prerequisites/waterSupplies/types', item, WaterSupplyType);
		},
		updateWaterSupplyType: function (item) {
			return _asyncEdit('prerequisites/waterSupplies/types', item, WaterSupplyType);
		},
		deleteWaterSupplyType: function (itemId) {
			return _asyncDelete('prerequisites/waterSupplies/types' + "/" + itemId);
		},

		// AIR CONDITIONING
		getAirConditionings: function () {
			return _asyncFindAll('prerequisites/airConditioning', AirConditioning);
		},
		getAirConditioningById: function (airConditioningId) {
			return _asyncFindById('prerequisites/airConditioning' + "/" + airConditioningId, AirConditioning);
		},
		getAirConditioningsByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/airConditioning', AirConditioning, organizationId);
		},
		createAirConditioning: function (airConditioning) {
			return _asyncCreate('prerequisites/airConditioning', airConditioning, AirConditioning);
		},
		updateAirConditioning: function (airConditioning) {
			return _asyncEdit('prerequisites/airConditioning', airConditioning, AirConditioning);
		},
		deleteAirConditioning: function (airConditioningId) {
			return _asyncDelete('prerequisites/airConditioning' + "/" + airConditioningId);
		},
		// AIR CONDITIONING TYPES
		getAirConditioningTypes: function () {
			return _asyncFindAll('prerequisites/airConditioning/types', AirConditioningType);
		},
		getAirConditioningTypesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/airConditioning/types', AirConditioningType, organizationId);
		},
		createAirConditioningType: function (item) {
			return _asyncCreate('prerequisites/airConditioning/types', item, AirConditioningType);
		},
		updateAirConditioningType: function (item) {
			return _asyncEdit('prerequisites/airConditioning/types', item, AirConditioningType);
		},
		deleteAirConditioningType: function (itemId) {
			return _asyncDelete('prerequisites/airConditioning/types' + "/" + itemId);
		},

		// CLEANING
		getCleanings: function () {
			return _asyncFindAll('prerequisites/cleanings', Cleaning);
		},
		getCleaningById: function (cleaningId) {
			return _asyncFindById('prerequisites/cleanings' + "/" + cleaningId, Cleaning);
		},
		getCleaningsByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/cleanings', Cleaning, organizationId);
		},
		createCleaning: function (cleaning) {
			return _asyncCreate('prerequisites/cleanings', cleaning, Cleaning);
		},
		updateCleaning: function (cleaning) {
			return _asyncEdit('prerequisites/cleanings', cleaning, Cleaning);
		},
		deleteCleaning: function (cleaningId) {
			return _asyncDelete('prerequisites/cleanings' + "/" + cleaningId);
		},

		// WASTE DISPOSAL
		getWasteDisposals: function () {
			return _asyncFindAll('prerequisites/wasteDisposal', WasteDisposal);
		},
		getWasteDisposalById: function (wasteDisposalId) {
			return _asyncFindById('prerequisites/wasteDisposal' + "/" + wasteDisposalId, WasteDisposal);
		},
		getWasteDisposalsByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/wasteDisposal', WasteDisposal, organizationId);
		},
		createWasteDisposal: function (wasteDisposal) {
			return _asyncCreate('prerequisites/wasteDisposal', wasteDisposal, WasteDisposal);
		},
		updateWasteDisposal: function (wasteDisposal) {
			return _asyncEdit('prerequisites/wasteDisposal', wasteDisposal, WasteDisposal);
		},
		deleteWasteDisposal: function (wasteDisposalId) {
			return _asyncDelete('prerequisites/wasteDisposal' + "/" + wasteDisposalId);
		},
		// WASTE DISPOSAL TYPES
		getWasteDisposalTypes: function () {
			return _asyncFindAll('prerequisites/wasteDisposal/types', WasteDisposalType);
		},
		getWasteDisposalTypesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/wasteDisposal/types', WasteDisposalType, organizationId);
		},
		createWasteDisposalType: function (item) {
			return _asyncCreate('prerequisites/wasteDisposal/types', item, WasteDisposalType);
		},
		updateWasteDisposalType: function (item) {
			return _asyncEdit('prerequisites/wasteDisposal/types', item, WasteDisposalType);
		},
		deleteWasteDisposalType: function (itemId) {
			return _asyncDelete('prerequisites/wasteDisposal/types' + "/" + itemId);
		},

		// EQUIPMENT
		getEquipments: function () {
			return _asyncFindAll('prerequisites/equipments', Equipment);
		},
		getEquipmentById: function (equipmentId) {
			return _asyncFindById('prerequisites/equipments' + "/" + equipmentId, Equipment);
		},
		getEquipmentsByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/equipments', Equipment, organizationId);
		},
		createEquipment: function (equipment) {
			return _asyncCreate('prerequisites/equipments', equipment, Equipment);
		},
		updateEquipment: function (equipment) {
			return _asyncEdit('prerequisites/equipments', equipment, Equipment);
		},
		deleteEquipment: function (equipmentId) {
			return _asyncDelete('prerequisites/equipments' + "/" + equipmentId);
		},

		// PEST CONTROL
		getPestControls: function () {
			return _asyncFindAll('prerequisites/pestControls', PestControl);
		},
		getPestControlById: function (pestControlId) {
			return _asyncFindById('prerequisites/pestControls' + "/" + pestControlId, PestControl);
		},
		getPestControlsByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/pestControls', PestControl, organizationId);
		},
		createPestControl: function (pestControl) {
			return _asyncCreate('prerequisites/pestControls', pestControl, PestControl);
		},
		updatePestControl: function (pestControl) {
			return _asyncEdit('prerequisites/pestControls', pestControl, PestControl);
		},
		deletePestControl: function (pestControlId) {
			return _asyncDelete('prerequisites/pestControls' + "/" + pestControlId);
		},
		// PEST CONTROL TYPES
		getPestControlTypes: function () {
			return _asyncFindAll('prerequisites/pestControls/types', PestControlType);
		},
		getPestControlTypesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/pestControls/types', PestControlType, organizationId);
		},
		createPestControlType: function (item) {
			return _asyncCreate('prerequisites/pestControls/types', item, PestControlType);
		},
		updatePestControlType: function (item) {
			return _asyncEdit('prerequisites/pestControls/types', item, PestControlType);
		},
		deletePestControlType: function (itemId) {
			return _asyncDelete('prerequisites/pestControls/types' + "/" + itemId);
		},

		// STAFF HYGIENE
		getStaffHygienes: function () {
			return _asyncFindAll('prerequisites/staffHygiene', StaffHygiene);
		},
		getStaffHygienesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/staffHygiene', StaffHygiene, organizationId);
		},
		createStaffHygiene: function (item) {
			return _asyncCreate('prerequisites/staffHygiene', item, StaffHygiene);
		},
		updateStaffHygiene: function (item) {
			return _asyncEdit('prerequisites/staffHygiene', item, StaffHygiene);
		},
		deleteStaffHygiene: function (itemId) {
			return _asyncDelete('prerequisites/staffHygiene' + "/" + itemId);
		},

		// MATERIAL
		getMaterials: function () {
			return _asyncFindAll('material/materials', PackagingMaterial);
		},
		getMaterialsByOrganizationId: function (organizationId) {
			return _asyncFindAll('material/materials', PackagingMaterial, organizationId);
		},
		createMaterial: function (item) {
			return _asyncCreate('material/materials', item, PackagingMaterial);
		},
		updateMaterial: function (item) {
			return _asyncEdit('material/materials', item, PackagingMaterial);
		},
		deleteMaterial: function (itemId) {
			return _asyncDelete('material/materials' + "/" + itemId);
		},

		// MATERIAL CATEGORIES
		getMaterialCategories: function () {
			return _asyncFindAll('material/categories', MaterialCategory);
		},
		getMaterialCategoriesByOrganizationId: function (organizationId) {
			return _asyncFindAll('material/categories', MaterialCategory, organizationId);
		},
		createMaterialCategory: function (item) {
			return _asyncCreate('material/categories', item, MaterialCategory);
		},
		updateMaterialCategory: function (item) {
			return _asyncEdit('material/categories', item, MaterialCategory);
		},
		deleteMaterialCategory: function (itemId) {
			return _asyncDelete('material/categories' + "/" + itemId);
		},

		// SUPPLIER
		getSuppliers: function () {
			return _asyncFindAll('material/suppliers', Supplier);
		},
		getSuppliersByOrganizationId: function (organizationId) {
			return _asyncFindAll('material/suppliers', Supplier, organizationId);
		},
		createSupplier: function (item) {
			return _asyncCreate('material/suppliers', item, Supplier);
		},
		updateSupplier: function (item) {
			return _asyncEdit('material/suppliers', item, Supplier);
		},
		deleteSupplier: function (itemId) {
			return _asyncDelete('material/suppliers' + "/" + itemId);
		},

		// SHAPES
		getShapes: function () {
			return _asyncFindAll('prerequisites/shapes', Shape);
		},
		getShapeById: function (shapeId) {
			return _asyncFindById('prerequisites/shapes' + "/" + shapeId, Shape);
		},
		getShapesByOrganizationId: function (organizationId) {
			return _asyncFindAll('prerequisites/shapes', Shape, organizationId);
		},
		createShape: function (shape) {
			return _asyncCreate('prerequisites/shapes', shape, Shape);
		},
		updateShape: function (shape) {
			return _asyncEdit('prerequisites/shapes', shape, Shape);
		},
		deleteShape: function (shapeId) {
			return _asyncDelete('prerequisites/shapes' + "/" + shapeId);
		},

		//PROCEDURES
		getProcedures: function () {
			return _asyncFindAll('monitoring/procedures', Procedure);
		},
		getProcedureById: function (procedureId) {
			return _asyncFindById('monitoring/procedures' + "/" + procedureId, Procedure);
		},
		getProceduresByOrganizationId: function (organizationId) {
			return _asyncFindAll('monitoring/procedures', Procedure, organizationId);
		},
		createProcedure: function (procedure) {
			return _asyncCreate('monitoring/procedures', procedure, Procedure);
		},
		updateProcedure: function (procedure) {
			return _asyncEdit('monitoring/procedures', procedure, Procedure);
		},
		deleteProcedure: function (procedureId) {
			return _asyncDelete('monitoring/procedures' + "/" + procedureId);
		},

		//MONITORING
		getMonitorings: function () {
			return _asyncFindAll('monitorings/monitorings', Monitoring);
		},
		getMonitoringById: function (monitoringId) {
			return _asyncFindById('monitorings/monitorings' + "/" + monitoringId, Monitoring);
		},
		getMonitoringsByOrganizationId: function (organizationId) {
			return _asyncFindAll('monitorings/monitorings', Monitoring, organizationId);
		},
		getMonitoringsByRoleId: function (userRoleId, organizationId) {
			var headers = [{
					key: 'organizationId',
					value: organizationId
				}]

			if(userRoleId) {
				headers.push({
					key: 'userRoleId',
					value: userRoleId
				});
			}
			return _asyncFindAll('monitorings/monitorings', Monitoring, null, headers);
		},
		createMonitoring: function (monitoring) {
			return _asyncCreate('monitorings/monitorings', monitoring, Monitoring);
		},
		updateMonitoring: function (monitoring) {
			return _asyncEdit('monitorings/monitorings', monitoring, Monitoring);
		},
		deleteMonitoring: function (monitoringId) {
			return _asyncDelete('monitorings/monitorings' + "/" + monitoringId);
		},

		// PEOPLE
		getPeopleByOrganizationId: function (organizationId) {
			return _findAll('context.people', Person);
		},
		createPerson: function (item) {
			return _create('context.people', Person, item);
		},
		updatePerson: function (item) {
			return _update('context.people', Person, item);
		},
		deletePerson: function (itemId) {
			return _delete('context.people', Person, itemId);
		},

		// USER ROLES
		getUserRoles: function (organizationId) {
			return _getUserRoles(organizationId);
		},
		createUserRole: function (item) {
			return _create('context.userroles', UserRole, item);
		},
		updateUserRole: function (item) {
			return _update('context.userroles', UserRole, item);
		},
		deleteUserRole: function (itemId) {
			return _delete('context.userroles', UserRole, itemId);
		},
		/*
		 // AUDIT
		 getAuditsByOrganizationId : function(organizationId) {
		 return  _findAll('context.audits', Audit);
		 },
		 createAudit : function(item) {
		 return _create('context.audits', Audit, item);
		 },
		 updateAudit : function(item) {
		 return _update('context.audits', Audit, item);
		 },
		 deleteAudit : function(itemId) {
		 return _delete('context.audits', Audit, itemId);
		 },
		 */
		// OUTCOME
		getOutcomeByMonitoringId: function (monitoringId) {
			return _asyncFindById('monitorings/outcome' + "/" + monitoringId, Outcome);
		},
		createOutcome: function (outcome) {
			return _asyncCreate('monitorings/outcome', outcome, Outcome);
		},
		updateOutcome: function (outcome) {
			return _asyncEdit('monitorings/outcome', outcome, Outcome);
		},
		deleteOutcome: function (outcomeId) {
			return _asyncDelete('monitorings/outcome' + "/" + outcomeId);
		},

		// COURSE
		getCourses: function () {
			return _asyncFindAll('trainings/courses', Course);
		},
		getCourseById: function (courseId) {
			return _asyncFindById('trainings/courses' + "/" + courseId, Course);
		},
		getCoursesByOrganizationId: function (organizationId) {
			return _asyncFindAll('trainings/courses', Course, organizationId);
		},
		createCourse: function (course) {
			return _asyncCreate('trainings/courses', course, Course);
		},
		updateCourse: function (course) {
			return _asyncEdit('trainings/courses', course, Course);
		},
		deleteCourse: function (courseId) {
			return _asyncDelete('trainings/courses' + "/" + courseId);
		},

		// TRAINING
		getTrainings: function () {
			return _asyncFindAll('trainings/trainings', Training);
		},
		getTrainingById: function (itemId) {
			return _asyncFindById('trainings/trainings' + "/" + itemId, Training);
		},
		getTrainingsByOrganizationId: function (organizationId) {
			return _asyncFindAll('trainings/trainings', Training, organizationId);
		},
		createTraining: function (item) {
			return _asyncCreate('trainings/trainings', item, Training);
		},
		updateTraining: function (item) {
			return _asyncEdit('trainings/trainings', item, Training);
		},
		deleteTraining: function (itemId) {
			return _asyncDelete('trainings/trainings' + "/" + itemId);
		},

		// PARTICIPANTS
		getParticipants: function () {
			return _asyncFindAll('trainings/participants', Participant);
		},
		getParticipantById: function (itemId) {
			return _asyncFindById('trainings/participants' + "/" + itemId, Participant);
		},
		getParticipantsByOrganizationId: function (organizationId) {
			return _asyncFindAll('trainings/participants', Participant, organizationId);
		},
		createParticipant: function (item) {
			return _asyncCreate('trainings/participants', item, Participant);
		},
		updateParticipant: function (item) {
			return _asyncEdit('trainings/participants', item, Participant);
		},
		deleteParticipant: function (itemId) {
			return _asyncDelete('trainings/participants' + "/" + itemId);
		},

		// EEQUIPMENT
		getEEquipments: function () {
			return _asyncFindAll('equipments', EEquipment);
		},
		getEEquipmentsByOrganizationId: function (organizationId) {
			return _asyncFindAll('equipments', EEquipment, organizationId);
		},
		createEEquipment: function (item) {
			return _asyncCreate('equipments', item, EEquipment);
		},
		updateEEquipment: function (item) {
			return _asyncEdit('equipments', item, EEquipment);
		},
		deleteEEquipment: function (itemId) {
			return _asyncDelete('equipments' + "/" + itemId);
		},

		// EQUIPMENT TYPES
		getEquipmentTypes: function (rootId) {
			return _asyncFindAll('equipments/types/all', EquipmentType, rootId);
		},
		getEquipmentTypesByOrganizationId: function (organizationId) {
			return _asyncFindAll('equipments/types', EquipmentType, organizationId);
		},
		createEquipmentType: function (item) {
			return _asyncCreate('equipments/types', item, EquipmentType);
		},
		updateEquipmentType: function (item) {
			return _asyncEdit('equipments/types', item, EquipmentType);
		},
		deleteEquipmentType: function (itemId) {
			return _asyncDelete('equipments/types' + "/" + itemId);
		},

		// FREQUENCY
		getFrequenciesByOrganizationId: function (organizationId) {
			return _asyncFindAll('monitorings/frequencies', Frequency, organizationId);
		},
		createFrequency: function (item) {
			return _asyncCreate('monitorings/frequencies', item, Frequency);
		},
		updateFrequency: function (item) {
			return _asyncEdit('monitorings/frequencies', item, Frequency);
		},
		deleteFrequency: function (itemId) {
			return _asyncDelete('monitorings/frequencies' + "/" + itemId);
		},

		// PROCESS CHECK
		getProcessChecks: function () {
			return _asyncFindAll('check/process', ProcessCheck);
		},
		getProcessChecksByOrganizationId: function (organizationId) {
			return _asyncFindAll('check/process', ProcessCheck, organizationId);
		},
		createProcessCheck: function (item) {
			return _asyncCreate('check/process', item, ProcessCheck);
		},
		updateProcessCheck: function (item) {
			return _asyncEdit('check/process', item, ProcessCheck);
		},
		deleteProcessCheck: function (itemId) {
			return _asyncDelete('check/process' + "/" + itemId);
		},

		// PROCESS CHECK PLANNING
		getProcessCheckPlannings: function () {
			return _asyncFindAll('check/process/planning', ProcessCheckPlanning);
		},
		getProcessCheckPlanningsByOrganizationId: function (organizationId) {
			return _asyncFindAll('check/process/planning', ProcessCheckPlanning, organizationId);
		},
		createProcessCheckPlanning: function (item) {
			return _asyncCreate('check/process/planning', item, ProcessCheckPlanning);
		},
		updateProcessCheckPlanning: function (item) {
			return _asyncEdit('check/process/planning', item, ProcessCheckPlanning);
		},
		deleteProcessCheckPlanning: function (itemId) {
			return _asyncDelete('check/process/planning' + "/" + itemId);
		},

		// PROCESS CHECK OUTCOME
		getProcessCheckOutcomesByProcessCheckPlanningAndProcessCheck: function (processCheckPlanningId, processCheckId) {
			var headers = null;
			if (processCheckPlanningId != null) {
				headers = [{
					key: 'processCheckPlanningId',
					value: processCheckPlanningId
				}, {
					key: 'processCheckId',
					value: processCheckId
				}];
			}
			return _asyncFindAll('check/process/outcome', ProcessCheckOutcome, null, headers);
		},
		createProcessCheckOutcome: function (item) {
			return _asyncCreate('check/process/outcome', item, ProcessCheckOutcome);
		},
		updateProcessCheckOutcome: function (item) {
			return _asyncEdit('check/process/outcome', item, ProcessCheckOutcome);
		},
		deleteProcessCheckOutcome: function (itemId) {
			return _asyncDelete('check/process/outcome' + "/" + itemId);
		},

		// SYSTEM CHECK
		getSystemChecks: function () {
			return _asyncFindAll('check/system', SystemCheck);
		},
		getSystemChecksByOrganizationId: function (organizationId) {
			return _asyncFindAll('check/system', SystemCheck, organizationId);
		},
		createSystemCheck: function (item) {
			return _asyncCreate('check/system', item, SystemCheck);
		},
		updateSystemCheck: function (item) {
			return _asyncEdit('check/system', item, SystemCheck);
		},
		deleteSystemCheck: function (itemId) {
			return _asyncDelete('check/system' + "/" + itemId);
		},

		// SYSTEM CHECK PLANNING
		getSystemChecksPlannings: function () {
			return _asyncFindAll('check/system/planning', SystemCheckPlanning);
		},
		getSystemCheckPlanningsByOrganizationId: function (organizationId) {
			return _asyncFindAll('check/system/planning', SystemCheckPlanning, organizationId);
		},
		createSystemCheckPlanning: function (item) {
			return _asyncCreate('check/system/planning', item, SystemCheckPlanning);
		},
		updateSystemCheckPlanning: function (item) {
			return _asyncEdit('check/system/planning', item, SystemCheckPlanning);
		},
		deleteSystemCheckPlanning: function (itemId) {
			return _asyncDelete('check/system/planning' + "/" + itemId);
		},

		// SYSTEM CHECK REQUIREMENTS
		getSystemCheckRequirementsBySystemCheckId: function (systemCheckId) {
			var headers = null;
			if (systemCheckId != null) {
				headers = [{
					key: 'systemCheckId',
					value: systemCheckId
				}]
			}
			return _asyncFindAll('check/system/requirements', SystemCheckRequirement, null, headers);
		},
		createSystemCheckRequirement: function (item) {
			return _asyncCreate('check/system/requirements', item, SystemCheckRequirement);
		},
		updateSystemCheckRequirement: function (item) {
			return _asyncEdit('check/system/requirements', item, SystemCheckRequirement);
		},
		deleteSystemCheckRequirement: function (itemId) {
			return _asyncDelete('check/system/requirements' + "/" + itemId);
		},

		// SYSTEM CHECK OUTCOMES
		getSystemCheckOutcomesBySystemCheckRequirementId: function (systemCheckRequirementId) {
			var headers = null;
			if (systemCheckRequirementId != null) {
				headers = [{
					key: 'systemCheckRequirementId',
					value: systemCheckRequirementId
				}]
			}
			return _asyncFindAll('check/system/outcome', SystemCheckOutcome, null, headers);
		},
		createSystemCheckOutcome: function (item) {
			return _asyncCreate('check/system/outcome', item, SystemCheckOutcome);
		},
		updateSystemCheckOutcome: function (item) {
			return _asyncEdit('check/system/outcome', item, SystemCheckOutcome);
		},
		deleteSystemCheckOutcome: function (itemId) {
			return _asyncDelete('check/system/outcome' + "/" + itemId);
		},

		// NON-COMPLIANCES
		getNoncompliancesByOrganizationId: function (organizationId) {
			return _asyncFindAll('check/noncompliance', Noncompliance, organizationId);
		},
		getNoncompliancesBySystemCheckRequirementId: function (systemCheckRequirementId) {
			var headers = null;
			if (systemCheckRequirementId != null) {
				headers = [{
					key: 'systemCheckRequirementId',
					value: systemCheckRequirementId
				}]
			}
			return _asyncFindAll('check/noncompliance', Noncompliance, null, headers);
		},
		getNoncompliancesByProcessCheckId: function (processCheckId) {
			var headers = null;
			if (processCheckId != null) {
				headers = [{
					key: 'processCheckId',
					value: processCheckId
				}]
			}
			return _asyncFindAll('check/noncompliance', Noncompliance, null, headers);
		},
		getNoncompliancesByPrerequisisteContextId: function (prerequisisteContextId) {
			var headers = null;
			if (prerequisisteContextId != null) {
				headers = [{
					key: 'prerequisisteContextId',
					value: prerequisisteContextId
				}]
			}
			return _asyncFindAll('check/noncompliance', Noncompliance, null, headers);
		},
		createNoncompliance: function (item) {
			return _asyncCreate('check/noncompliance', item, Noncompliance);
		},
		updateNoncompliance: function (item) {
			return _asyncEdit('check/noncompliance', item, Noncompliance);
		},
		deleteNoncompliance: function (itemId) {
			return _asyncDelete('check/noncompliance' + "/" + itemId);
		},

		// DANGER
		getDangers: function () {
			return _asyncFindAll('danger', Danger);
		},
		getDangersByOrganizationId: function (organizationId) {
			return _asyncFindAll('danger', Danger, organizationId);
		},
		createDanger: function (item) {
			return _asyncCreate('danger', item, Danger);
		},
		updateDanger: function (item) {
			return _asyncEdit('danger', item, Danger);
		},
		deleteDanger: function (itemId) {
			return _asyncDelete('danger' + "/" + itemId);
		},

		// RISKMAP
		getRiskMap: function (dangerId, elementId) {
			var headers = null;
			if ( dangerId != null
				&& elementId != null ) {
				headers = [
					{
						key: 'dangerId',
						value: dangerId
					},
					{
						key: 'elementId',
						value: elementId
					}
				]
			}
			return _asyncFindAll('danger/riskMap', RiskMap, null, headers);
		},
		getRiskMapsByOrganizationId: function (organizationId) {
			return _asyncFindAll('danger/riskMap', RiskMap, organizationId);
		},
		createRiskMap: function (item) {
			return _asyncCreate('danger/riskMap', item, RiskMap);
		},
		updateRiskMap: function (item) {
			return _asyncEdit('danger/riskMap', item, RiskMap);
		},
		deleteRiskMap: function (itemId) {
			return _asyncDelete('danger/riskMap' + "/" + itemId);
		},

		// ANALYSIS PARAMETERS
		getAnalysisParameters: function () {
			return _asyncFindAll('analysis/parameter', AnalysisParameter);
		},
		getAnalysisParametersByOrganizationId: function (organizationId) {
			return _asyncFindAll('analysis/parameter', AnalysisParameter, organizationId);
		},
		createAnalysisParameter: function (item) {
			return _asyncCreate('analysis/parameter', item, AnalysisParameter);
		},
		updateAnalysisParameter: function (item) {
			return _asyncEdit('analysis/parameter', item, AnalysisParameter);
		},
		deleteAnalysisParameter: function (itemId) {
			return _asyncDelete('analysis/parameter' + "/" + itemId);
		},

		// ANALYSIS PARAMETER VALUES
		getAnalysisParameterValues: function () {
			return _asyncFindAll('analysis/value', AnalysisParameterValue);
		},
		getAnalysisParameterValuesByAnalysisParameterId: function (analysisParameterId) {
			var headers = null;
			if (analysisParameterId != null) {
				headers = [{
					key: 'analysisParameterId',
					value: analysisParameterId
				}]
			}
			return _asyncFindAll('analysis/value', AnalysisParameterValue, null, headers);
		},
		createAnalysisParameterValue: function (item) {
			return _asyncCreate('analysis/value', item, AnalysisParameterValue);
		},
		updateAnalysisParameterValue: function (item) {
			return _asyncEdit('analysis/value', item, AnalysisParameterValue);
		},
		deleteAnalysisParameterValue: function (itemId) {
			return _asyncDelete('analysis/value' + "/" + itemId);
		},

		// ATTACHMENT
		getAttachmentsByContextId: function (contextId) {
			return _asyncFindAll('context/attachments' + "/" + contextId, Attachment);
		},
		createAttachment: function (attachment) {
			return _asyncCreate('context/attachments', attachment, Attachment);
		},
		updateAttachment: function (attachment) {
			return _asyncEdit('context/attachments', attachment, Attachment);
		},
		deleteAttachment: function (attachmentId) {
			return _asyncDelete('context/attachments' + "/" + attachmentId);
		},

		// PREREQUISITE TYPE
		getPrerequisiteTypes: function () {
			return _asyncFindAll('prerequisites/prerequisiteTypes', PrerequisiteType);
		},

		// DIAGRAMS
		getDiagrams: function () {
			return _asyncFindAll('flow/diagrams', Diagram);
		},
		getDiagramsByOrganizationId: function (organizationId) {
			return _asyncFindAll('flow/diagrams', Diagram, organizationId);
		},
		createDiagram: function (item) {
			return _asyncCreate('flow/diagrams', item, Diagram);
		},
		updateDiagram: function (item) {
			return _asyncEdit('flow/diagrams', item, Diagram);
		},
		deleteDiagram: function (itemId) {
			return _asyncDelete('flow/diagrams' + "/" + itemId);
		},

		// DIAGRAM SHAPES
		getDiagramShapes: function () {
			return _asyncFindAll('flow/shapes', DiagramShape, null, null, true);
		},
		getDiagramShapesByDiagramId: function (diagramId) {
			var headers = null;
			if (diagramId != null) {
				headers = [{
					key: 'diagramId',
					value: diagramId
				}]
			}
			return _asyncFindAll('flow/shapes', null, null, headers);
		},
		createDiagramShape: function (item) {
			return _asyncCreate('flow/shapes', item, null);
		},
		updateDiagramShape: function (item) {
			return _asyncEdit('flow/shapes', item, null);
		},
		deleteDiagramShape: function (itemId) {
			return _asyncDelete('flow/shapes' + "/" + itemId);
		},

		//DIAGRAM ELEMENTS
		getEntitiesByDiagramId: function (diagramId) {

			var headers = null;
			if (diagramId != null) {
				headers = [{
					key: 'diagramId',
					value: diagramId
				}]
			}
			return _asyncFindAll('flow/elements', Entity, null, headers);
		},
		getEntityByShapeId: function (shapeId) {
			var headers = null;
			if (shapeId != null) {
				headers = [{
					key: 'shapeId',
					value: shapeId
				}]
			}
			return _asyncFindAll('flow/elements', Entity, null, headers);
		},
		createEntity: function (item) {
			return _asyncCreate('flow/elements', item, Entity);
		},
		updateEntity: function (item) {
			return _asyncEdit('flow/elements', item, Entity);
		},
		deleteEntity: function (itemId) {
			return _asyncDelete('flow/elements' + "/" + itemId);
		},

		// ANCHOR POINTS
		getAnchorPoints: function () {
			return _asyncFindAll('flow/anchorPoints', AnchorPoint, null, null, true);
		},
		getAnchorPointsByDiagramId: function (diagramId) {
			var headers = null;
			if (diagramId != null) {
				headers = [{
					key: 'diagramId',
					value: diagramId
				}]
			}
			return _asyncFindAll('flow/anchorPoints', AnchorPoint, null, headers);
		},
		createAnchorPoint: function (item) {
			return _asyncCreate('flow/anchorPoints', item, AnchorPoint);
		},
		updateAnchorPoint: function (item) {
			return _asyncEdit('flow/anchorPoints', item, AnchorPoint);
		},
		createAnchorPointAll: function (items) {
			return _asyncCreateAll('flow/anchorPoints/all', items, AnchorPoint);
		},
		updateAnchorPointAll: function (items) {
			return _asyncEditAll('flow/anchorPoints/all', items, AnchorPoint);
		},
		deleteAnchorPoint: function (itemId) {
			return _asyncDelete('flow/anchorPoints' + "/" + itemId);
		},

		// RELATIONS
		getRelations: function () {
			return _asyncFindAll('flow/relations', Arrow, null, null, true);
		},
		getRelationsByDiagramId: function (diagramId) {
			var headers = null;
			if (diagramId != null) {
				headers = [{
					key: 'diagramId',
					value: diagramId
				}]
			}
			return _asyncFindAll('flow/relations', Arrow, null, headers);
		},
		createRelation: function (item) {
			return _asyncCreate('flow/relations', item, Arrow);
		},
		updateRelation: function (item) {
			return _asyncEdit('flow/relations', item, Arrow);
		},
		deleteRelation: function (itemId) {
			return _asyncDelete('flow/relations' + "/" + itemId);
		}


	};

});
