/**
 * 这里是登录表单
 * @type {[type]}
 */
var loginModule = angular.module("loginModule", []);
loginModule.controller('loginCtrl', function($scope, $http, $rootScope, AUTH_EVENTS, AuthService) {
	$scope.userInfo = {
		username: '',
		password: ''
	};
	$scope.loginfail = false;
	$scope.login = function(userInfo) {
		AuthService.login(userInfo).then(function(data) {
			if (!(data.role === "guest")) {
				$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
				$rootScope.setCurrentUser(data.username);
				$rootScope.first = true;
			} else {

				$scope.loginfail = true;
			}
		}, function() {
			$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
		});
	};
	$scope.resetForm = function() {
		$scope.userInfo = {
			username: "",
			password: ""
		};
	};
});
loginModule.constant('AUTH_EVENTS', {
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	passwordError: 'auth-login-error',
	logoutSuccess: 'auth-logout-success',
	sessionTimeout: 'auth-session-timeout',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
});
loginModule.constant('USER_ROLES', {
	all:'*',
  admin: 'admin',
  teacher: 'teacher',
  student: 'student',
  guest: 'guest'
});




//一些操作的身份认证授权服务 登录的具体实现逻辑应该在这里，登录认证应该解耦，登录Controller应该只关心表单的事情
loginModule.factory('AuthService', function($http, Session) {
	var authService = {};
	authService.login = function(userInfo) {
		return $http
			.post('LoginServlet', userInfo)
			.then(function(res) {
				Session.create(res.data.password, res.data.username,
					res.data.role);
				return res.data;
			});
	}


	authService.isAuthenticated = function() {
		return !!Session.userId;
	};

	authService.isAuthorized = function(authorizedRoles) {
		if (!angular.isArray(authorizedRoles)) {
			authorizedRoles = [authorizedRoles];
		}
		return (authService.isAuthenticated() &&
			authorizedRoles.indexOf(Session.userRole) !== -1);
	};
	return authService;
});


loginModule.service('Session', function($http,$rootScope) {
	this.userRole = "guest";
	this.create = function(sessionId, userId, userRole) {
		this.id = sessionId;
		this.userId = userId;
		this.userRole = userRole;
	};
	this.getRole = function(){
		return this.userRole;
	};
	this.destroy = function() {
		this.id = null;
		this.userId = null;
		this.userRole = null;
	};
	this.getSessionFromServer = function() {
		var that = this;
		$http.post('SessionServlet').then(function(res) {
			that.create(res.data.password, res.data.username,
				res.data.role);
			if(res.data.username){
				$rootScope.setCurrentUser(res.data.username);
				$rootScope.first = true;
			}
		});
	};
	this.toLocalString = function() {
		console.log("localToString----");
		console.log("sessionid=" + this.id + ",userId=" + this.userId);
	};
	return this;
});

/**
 * 这里是数据表单版块
 * 
 */

var gridModule = angular.module('gridModule', []);
gridModule.controller('dropzoneCtrl', function($scope,$rootScope,$http) {
	$scope.downloaddata = {
	};
	$scope.uploaddata = {
	};
	$scope.errord= false;
	$scope.successd = false;
	
	$scope.erroru= false;
	$scope.successu = false;
	$scope.upload = function(){
		$http.post('StudentServlet',{data:uploaddata,method:"commitAll"}).then(function(res) {
			$scope.successu = true;
		});;

	};
	$scope.download = function(){
		$http.post('GirdServlet').then(function(res) {
				$scope.downloaddata = res.data;
				$scope.successd = true;
		});
	};
});
gridModule.controller('passCtrl', function($scope,$rootScope,$http) {
	var name = $rootScope.user.username + "";
	$scope.pass = {
		username: name,
		oldpass:'',
		newpass:'',
		method:'editPass'
	};
	$scope.errorf= false;
	$scope.successf = false;
	
	$scope.editpass = function(pass){
		console.log(pass);

		$http.post('UserServlet',pass).then(function(res) {
			
			if(res.data){
				$scope.successf = true;
			}else{
				$scope.errorf= true;
			}
		});
	};
});
gridModule.controller('StuListCtrl', function($scope,$http) {
	var vm = $scope.vm = {};
	vm.page = {
		size: 5,
		index: 1
	};
	$scope.errorf= false;
	$scope.successf = false;
	vm.setindex = function(index){
		vm.page.index = index;
	};
	vm.addstudent = {};
	vm.addstu = function(addstudent){
		vm.items.push(addstudent);
		vm.addstudent = {};
	};
	vm.commit = function(){
		var data = JSON.stringify(vm.items);
		$http.post('StudentServlet',{data:data,method:"commitAll"}).then(function(res) {
			
			if(res.data){
				$scope.successf = true;
			}else{
				$scope.errorf= true;
			}
		});;
	};
	vm.cancel = function(){
		vm.items = vm.backup;
	};
	vm.sort = {
		column: 'id',
		direction: -1,
		toggle: function(column) {
			if (column.sortable === false)
				return;
			if (this.column === column.name) {
				this.direction = -this.direction || -1;
			} else {
				this.column = column.name;
				this.direction = -1;
			}
		}
	};
	vm.columns = [{
		label: '学号',
		name: 'id',
		type: 'string'
	}, {
		label: '姓名',
		name: 'name',
		type: 'string'
	}, {
		label: '性别',
		name: 'sex',
		type: 'boolean'
	}, {
		label: '班级',
		name: 'sclass',
		type: 'string'
	}, {
		label: '联系电话',
		name: 'phone',
		type: 'string'
	}, {
		label: '地址',
		name: 'phone',
		type: 'string'
	}, {
		label: '政治背景',
		name: 'party',
		type: 'string'
	}, {
		label: '',
		name: 'actions',
		sortable: false
	}];
	
	vm.items = [];
	vm.backup = [];
	$http.post('GirdServlet').then(function(res) {
		vm.items = res.data;
		vm.backup = res.data;		
	});

});
var chartsModule = angular.module('chartsModule',[]);
chartsModule.controller('chartsCtrl', function($scope) {
	$scope.option = {};
	$scope.chartInit = function() {
		var myChart = echarts.init(document.getElementById('main'));
		var option = {
			title: {
				text: '功能尚未完善，请期待',
				x: 'center'
			},
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b} : {c} ({d}%)"
			},
			legend: {
				orient: 'vertical',
				x: 'left',
				data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
			},
			toolbox: {
				show: true,
				feature: {
					mark: {
						show: true
					},
					dataView: {
						show: true,
						readOnly: false
					},
					magicType: {
						show: true,
						type: ['pie', 'funnel'],
						option: {
							funnel: {
								x: '25%',
								width: '50%',
								funnelAlign: 'left',
								max: 1548
							}
						}
					},
					restore: {
						show: true
					},
					saveAsImage: {
						show: true
					}
				}
			},
			calculable: true,
			series: [{
				name: '访问来源',
				type: 'pie',
				radius: '55%',
				center: ['50%', '60%'],
				data: [{
					value: 335,
					name: '直接访问'
				}, {
					value: 310,
					name: '邮件营销'
				}, {
					value: 234,
					name: '联盟广告'
				}, {
					value: 135,
					name: '视频广告'
				}, {
					value: 1548,
					name: '搜索引擎'
				}]
			}]
		};
		myChart.setOption(option);
	}
});