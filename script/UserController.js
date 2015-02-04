function UserController(args) {
	if (!(this instanceof UserController)) return new UserController(args);
	EventEmitter.call(this);

	this.url = args.url;

	this.init();

	// 종료시 호출 요청
	window.onbeforeunload = this._destory.bind(this);
}
inherits(UserController, EventEmitter);

UserController.prototype.init = function() {
	// Peer 연결시 초기화 됨
	this.me = null;
	this.peer = null;
	// Neighbors = id : neighbor 객체 map
	this.neighbors = {};
};

UserController.prototype.connectPeerServer = function() {
	// peer 객체
	this.peer = new Peer({
		key: '4uur7cd24jzwipb9'
		, debug: true
	});

	// 내 peer id 생성
	this.peer.on('open', function(id) {
		this._createMe(id);
		// 직전에 로그인한 내 접속이 상대방으로 나오지 않게 이전 접속id를 기록해둠
		this._logPreviousId(id);
		// 나의 위도와 경도를 확보한다.
		// 여기에 정보요청 -> 모델 업뎃 -> UI싱크(상대유저목록) 과정을 1초당 한번씩 수행하도록 하는 콜백을 달았다.
		this._getLocation();

		this.emit('peerCreated', this.peer);
	}.bind(this));
};

UserController.prototype._createMe = function(id) {
	var me = new Neighbor(id, true);
	this.me = me;
	this.emit('adduser', me, true);
};

UserController.prototype._logPreviousId = function(id) {
	var prev_id = JSON.parse(sessionStorage["prev_id"]||"[]");
	prev_id.push(id);
	// ????? 왜 굳이 array를 썼지?
	if(prev_id.length > 1) prev_id.shift();
	sessionStorage["prev_id"] = JSON.stringify(prev_id);
}
UserController.prototype._getPreviousIds = function() {
	var prev_id = JSON.parse(sessionStorage["prev_id"]||"[]");
	return prev_id;
}

// 현재 위치정보를 불러와 주변 user를 갱신할 수 있는 기본 자료로 사용한다.
UserController.prototype._getLocation = function() {
	function success(pos) {
		// 정보요청 -> 모델 업뎃 -> UI싱크(상대유저목록) 과정을 1초당 한번씩 수행하도록 한다.
		setInterval(this._sendRequest.bind(this, pos.coords), 1000);	
	}

	function error(err) {
		console.warn('geolocation error(' + err.code + '): ' + err.message);
		// 실패시 5초 간격으로 재시도
		setTimeout(this._getLocation, 5000);
	}

	var options = {
		enableHighAccuracy: true,
		timeout: 10000,
		maximumAge: 0
	};

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success.bind(this), error.bind(this), options);

	// Geolocation 이 지원되지 않는 경우에 서비스 이용 불가 메시지를 남기고 서버로 요청 못 보내게 만들기 
	} else {
		alert("Geolocation is not supported by this browser.");

	}
};

// user location 정보를 server에 전달하여 가까운 곳에 있는 user정보를 받아온다
UserController.prototype._sendRequest = function(coords) {
	var myId = this.me.id;

	// 유저의 정보를 담아 요청 보내기

	// JQuery로 변경해보기
	$.ajax({
		url: this.url,
		type: 'POST',
		data: {
			cmd: "getNeighbors",
			id: myId,
			longitude: coords.longitude,
			latitude: coords.latitude
		},
		headers: {
			"Content-type": "application/x-www-form-urlencoded"
		},
		dataType: 'json',
		success: function (data) {
			var users = data;
			// 왜인지 몰라도 핸들러없이 콜백이 설정될 때가 있으므로 있을때만 요청결과 처리하도록 한다.

			// handler를 조금 더 깔끔하게 처리할 수 있을 것 같음
			// if (handler) handler(neighbors);
			this._requestHandler(users);
		}.bind(this)
	});

	// var xmlhttp = null;

	// if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
	// 	xmlhttp = new XMLHttpRequest();
	// } else {// code for IE6, IE5
	// 	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	// }
	// xmlhttp.open("POST", this.url, true);
	// xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	// xmlhttp.send("cmd=getNeighbors&id="+myId+"&longitude="+coords.longitude+"&latitude="+coords.latitude);	
	// xmlhttp.onreadystatechange = function(){
	// 	if (xmlhttp.readyState==4 && xmlhttp.status==200 && xmlhttp.responseText.length>0){
	// 		var neighbors = JSON.parse(xmlhttp.responseText);
	// 		// 왜인지 몰라도 핸들러없이 콜백이 설정될 때가 있으므로 있을때만 요청결과 처리하도록 한다.

	// 		// handler를 조금 더 깔끔하게 처리할 수 있을 것 같음
	// 		// if (handler) handler(neighbors);
	// 		this._requestHandler(neighbors);
	// 	}
	// }.bind(this);
};

// server로부터 전달받은 정보를 처리하는 handler
UserController.prototype._requestHandler = function(users) {
	// 상대정보를 받으면 그 정보를 모델에 적용한다.
	var neighbors = this.neighbors;

	// users가 배열이라 적용 불가능함
	// var myId = this.me.id;
	// delete users[myId];

	// 응답으로 받아온 유저 아이디 리스트
	var idList = [];
	var neighborIdList = [];

	for(var i in users) {
		idList.push(users[i].id);
	}
	for(var key in neighbors) {
		neighborIdList.push(key);
	}

	// 유저 삭제 & 유지 처리 : 응답에 존재하지 않으면 상대목록 모델에서 삭제
	for(var id in neighbors) {
		if(!_.contains(idList, id))
			this._removeUser(id);
	}

	// 유저 추가처리 : 응답에 존재하는데 목록에 없으면 상대목록 모델에 추가	
	users.forEach(function(user) {
		var id = user.id;
		// 나의 과거 접속 흔적은 무시
		if (_.contains(this._getPreviousIds(), id)) {
			return;
		}
		// neighbors에 요청받은 id가 존재하지 않는 경우 추가
		if (!_.contains(neighborIdList, id)) {
			this._addUser(id);
		}
	}.bind(this));
};


UserController.prototype._addUser = function(id) {
	var neighbors = this.neighbors;

	// others에서 존재여부를 확인
	if (!neighbors.hasOwnProperty(id)) {
		neighbors[id] = new Neighbor(id);
		// avatar 추가
		this.emit('adduser', neighbors[id], false);
	}
};

UserController.prototype._removeUser = function(id) {
	var neighbors = this.neighbors;

	// 기존 존재하는 유저를 삭제한다.
	if (neighbors[id] !== undefined) {
		// avatar 제거
		this.emit('removeuser', neighbors[id]);
		delete neighbors[id];
	}
};

UserController.prototype.getNeighborByEl = function(el) {
	var neighbors = this.neighbors;

	for (var id in neighbors) {
		var curUser = neighbors[id];

		if (curUser.el === el) {
			return curUser;
		}
	}
	return false;
}

// 창이 닫히는 경우 자동적으로 내 정보를 지울 수 있도록 요청한다
UserController.prototype._destory = function() {
	// 
	// mypeer connection 종료, signaling server와 종료
	if (!!this.peer && !this.peer.destroyed) {
		this.peer.destroy();
	}

	// server에서 내 정보 삭제
	var myId = this.me.id;
	
	$.ajax({
		url: this.url,
		type: 'POST',
		data: {
			cmd: "deleteMe",
			id: myId
		},
		headers: {
			"Content-type": "application/x-www-form-urlencoded"
		},
		dataType: 'json'
	});
};
