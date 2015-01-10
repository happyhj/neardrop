function AirDrop(args) {
	if (!(this instanceof AirDrop)) return new AirDrop(args);
	EventEmitter.call(this);
	// me
	this.me = null;

	// Neighbors
	this.nearByMe = {};

	// peer 객체
	this.peer = new Peer({
		key: '4uur7cd24jzwipb9'
		, debug: true
	});

	this.connectionHandler = new ConnectionHandler({
		'CHUNK_SIZE': CHUNK_SIZE,  // 16000 byte per binary chunk
		'BLOCK_SIZE': BLOCK_SIZE, // 10 binary chunks per one block
		'userPeer':	this.peer
	});
	
	console.log("connectionHandler 의 이벤트 초기화");
	this.initConnectionHandler();
	// connection을 가진 id
	//	this.connectedPeers = {};

	// eventEmitter
	// this.eventEmitter = {
	// 	'adduser': new EventEmitter(),
	// 	'removeuser': new EventEmitter()
	// };

	// 초기화
	this.confirmPopup = new ConfirmPopup();
	this._init(args);

	// 종료시 호출 요청
	window.onbeforeunload = this._destory.bind(this);
}
inherits(AirDrop, EventEmitter);

AirDrop.prototype.initConnectionHandler = function() {

	this.connectionHandler.on('connect', function(args) {
		// 
		var peerId = args[0];
		//alert(peerId + " 에게 연결되었습니다.");
		if(this.fileEntry !== undefined) {
			//alert("연결이 되었으니 파일 정보를 보내야 할 것 같은 기분이 든다.");				
			console.log("connectionHandler의 FileSender를 file로 초기화합니다");		
			this.connectionHandler.initSender({
				"file": this.fileEntry
			});	
		}
		// initSender or
	}.bind(this));
	
	this.connectionHandler.on('disconnect', function(args) {
		var peerId = args[0];
		//alert(peerId + " 과 연결이 끊어졌습니다.");
	});

	this.connectionHandler.on('filePrepared', function() {
		// 파일 정보를 표시할 수 있다.
		var fileInfo;
		if( this.connectionHandler.fileSaver ) { // 내가 받는 측이라면 바로 달라고 요청을 보낸다. 여기에서 수신수락에 대한 질문을 할 수 있다.
			fileInfo = this.connectionHandler.fileSaver.fileInfo;
			var opponentId = this.connectionHandler.connection.peer;
			
			
			
			var yesCallback = function(){ // YES 를 눌렀을 경우 실행하는 함수.
				this.connectionHandler.transferStart = Date.now();
				this.connectionHandler.requestBlockTransfer();				
			}.bind(this);
			//debugger;
			this.confirmPopup.open({
				templateSelector: "#confirm-popup-template-receiver",
				opponentName: this.nearByMe[opponentId].name,
				fileName: fileInfo.name,
				fileSize: Math.floor(fileInfo.size/1024),
				fileType: fileInfo.type,
				yesCallback: yesCallback
			});
			
		} else if(this.connectionHandler.fileSender){
			fileInfo = this.connectionHandler.fileSender.fileInfo;
		}
	}.bind(this));

	this.connectionHandler.on('transferStart', function() {
		//alert("전송시작");
		// 프로그래스 바를 만들기 
		//document.getElementById(this.connectionHandler.connection)

		var opponentId = this.connectionHandler.connection.peer;
		var opponentDiv = document.getElementById(opponentId);
		var progressContainer = opponentDiv.querySelector(".progress-container");
		var streamLoaderContainer = opponentDiv.querySelector(".stream-loader-container");
		
		//  fileSaver 나 fileSender 의 blockcontext객체 레퍼런스를 가져온다.
		this.connectionHandler.loader = new PieLoader({
			container: progressContainer
			, color: 'rgba(255,255,255,.97)'
			, fill: false
			, sourceObject: this.connectionHandler
			, progressAdapter: function(source) { // 소스에서 progress 값을 리턴하는 함수를 만든다. progress 는 0 ~ 1 이다.
				return source.getProgress();
			}
		});
		
		this.connectionHandler.loader.startAnimation();
		
		var streamLoaderInitParam = {
			containerEl: streamLoaderContainer
		};
		// 내가 ConnectionHandler
		if(this.connectionHandler.fileSender)
			streamLoaderInitParam.direction = 'up';
			
		this.connectionHandler.streamLoader = new StreamLoader(streamLoaderInitParam);
		
		this.connectionHandler.streamLoader.on("loadEnd", function() {
			this.connectionHandler.disconnect();
			this.fileEntry = undefined;
			this.connectionHandler.streamLoader = undefined;
			/*
			this.connectionHandler.streamLoader = undefined;
						//debugger;

			this.fileEntry = undefined;
			this.connectionHandler = new ConnectionHandler({
				'CHUNK_SIZE': CHUNK_SIZE,  // 16000 byte per binary chunk
				'BLOCK_SIZE': BLOCK_SIZE, // 10 binary chunks per one block
				'userPeer':	this.peer
			});
			*/
			
		}.bind(this));
		
		var container = document.getElementById(this.connectionHandler.connection.peer);
		container.setAttribute("class", "avatar in-process");		
	}.bind(this));

	this.connectionHandler.on('transferEnd', function() {
		//alert("전송끝");
		//		
		this.connectionHandler.streamLoader.finishStream();
		
		var fileInfo;
		if( this.connectionHandler.fileSaver ) {
			this.connectionHandler.fileSaver.downloadFile();
			fileInfo = this.connectionHandler.fileSaver.fileInfo;
		} else if(this.connectionHandler.fileSender){
			fileInfo = this.connectionHandler.fileSender.fileInfo;
		}
		
		// 걸린 시간과 속도 화면에 표시
		var duration = (this.connectionHandler.transferEnd - this.connectionHandler.transferStart)/1000;
		var sizeExpression = this.connectionHandler._getSizeExpression(fileInfo.size);
		var speed = parseInt((parseFloat(sizeExpression)/ duration)*10)/10;
		var unit = sizeExpression.replace(/[^a-zA-Z]/g,'');
		
		console.log("총 "+duration+"초 걸렸고 속도는 "+ speed+unit+"/s");
		var container = document.getElementById(this.connectionHandler.connection.peer);
		
		container.querySelector(".avatar-pic>.message").innerHTML = "";
		container.setAttribute("class", "avatar");					
		this.connectionHandler.loader.stopAnimation();
		this.connectionHandler.loader.destroyLoader();
		
		/*
		// 새로운 커넥션 핸들러를 가짐.
		this.connectionHandler = new ConnectionHandler({
			'CHUNK_SIZE': 16000,  // 16000 byte per binary chunk
			'BLOCK_SIZE': 64, // 10 binary chunks per one block
			'userPeer':	this.peer
		});
		*/
	}.bind(this));
	
	this.connectionHandler.on('blockTransfered', function(blockIndex) {
		// 블록이 저장될 때 마다 현재 평균속도에 따른 남은 시간을 업데이트해준다.
		this.connectionHandler.transferEnd = Date.now();

		var timeDiff = this.connectionHandler.transferEnd - this.connectionHandler.transferStart;
		var processor = this.connectionHandler.fileSaver || this.connectionHandler.fileSender;
		var totalSize = processor.fileInfo.size;
		var progression = this.connectionHandler.getProgress();

		var transferVelocity = (progression * totalSize) / timeDiff;
		var remainTime = ((1-progression)*totalSize)/transferVelocity;
		remainTime = Math.floor(remainTime/1000);
		var expression;
		if(remainTime < 60) {
			expression = remainTime + "s";
		} else if (remainTime < 3600) {
			if(remainTime%60 > 0)
				expression = Math.floor(remainTime/60) + "m " + remainTime%60 + "s";
			else 
				expression = Math.floor(remainTime/60) + "m";
		} else if (remainTime < (3600*24)) {
			if(remainTime%3600 > 0)
				expression = Math.floor(remainTime/3600) + "h "+ Math.floor((remainTime%3600)/60) + "m";
			else
				expression = Math.floor(remainTime/3600) + "h";
		} else if (remainTime < (3600*24)*7) {
			expression = Math.floor(remainTime/(3600*24)) + "d";
		} else {
			expression = "∞";
		}
		//console.log("남은시간 " +remainTime + " 초");
		// connectionHandler 에서 알 수 있는 상대방 ID에 대해 남은 초를 표시할 엘리먼트를 얻고 이의 내용을 업데이트 해준다.
		var container = document.getElementById(this.connectionHandler.connection.peer);
		container.querySelector(".avatar-pic>.message").innerHTML = expression;

	}.bind(this));

};

AirDrop.prototype._init = function(args) {

}

// AirDrop객체 초기화
AirDrop.prototype._init = function(args) {
	this.url = args.url;

	// 내 peer id 생성
	this.peer.on('open', function(id) {
		// 
		this._createMe(id);
		// 직전에 로그인한 내 접속이 상대방으로 나오지 않게 이전 접속id를 기록해둠
		this._logPreviousId(id);

		// 나의 위도와 경도를 확보한다.
		// 여기에 정보요청 -> 모델 업뎃 -> UI싱크(상대유저목록) 과정을 1초당 한번씩 수행하도록 하는 콜백을 달았다.
		this._getLocation();

	}.bind(this));

	// 나에게 connection 요청시 이벤트핸들러듣 초기화해야할 것 같다.
//	this.peer.on('connection', this._connect);
};


// 창이 닫히는 경우 자동적으로 내 정보를 지울 수 있도록 요청한다
AirDrop.prototype._destory = function() {
	// 
	// mypeer connection 종료, signaling server와 종료
	if (!!this.peer && !this.peer.destroyed) {
		this.peer.destroy();
	}

	// server에서 내 정보 삭제
	var myId = this.me.id;
	var xmlhttp = this._getXMLHttp();
	
	xmlhttp.open("POST",this.url,true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send("cmd=deleteMe&id="+myId);
};


// public
AirDrop.prototype.initializeTransfer = function(targetEl, file) {
	console.log("InitializeTransfer");					
	// targetId 가져오기
	var id = this._getIdByEl(targetEl);

	console.log("주고자 하는 상대방의 ID는 "+id);					
	// 연결되지 않았던 peer의 경우
	//	if (id !== undefined && this.connectionHandlers[id] === undefined) {
	// 
	// file 이름을 가진 connection 생성, (remotePeer);
	// 상대방과 커넥션을 맺고 
	console.log("이 상대와 연결을 시도합니다.");					

		this.connectionHandler.connect(id, {
			reliable: true,
			serialization: "none"
		});
};

// public
AirDrop.prototype.on = function(evtName, fn) {
	// eventEmitter key에 존재시 사용
	if (this.eventEmitter[evtName]) {
		this.eventEmitter[evtName].on(fn);	
	}
};

// public
AirDrop.prototype.off = function(evtName, fn) {
	// eventEmitter key에 존재시 사용
	if (this.eventEmitter[evtName]) {
		this.eventEmitter[evtName].off(fn);	
	}
};


AirDrop.prototype._createMe = function(id) {
	var me = new Neighbor(id, true);
	this.me = me;
	this.emit('adduser', me);
};

AirDrop.prototype._closeConnection = function(id) {
	var remotePeer = this.connectedPeers[id];
	if (remotePeer !== undefined) {
		// connection 종료
		remotePeer.close();
		// user 삭제
		this._removeUser(id);
	}
};

AirDrop.prototype._addUser = function(id) {
	// 
	var nearByMe = this.nearByMe;

	// others에서 존재여부를 확인
	if (!nearByMe.hasOwnProperty(id)) {
		nearByMe[id] = new Neighbor(id);
		// avatar 추가
		this.emit('adduser', nearByMe[id]);
	}
};

AirDrop.prototype._removeUser = function(id) {
	var nearByMe = this.nearByMe;

	// 기존 존재하는 유저를 삭제한다.
	if (nearByMe[id] !== undefined) {
		// avatar 제거
		this.emit('removeuser', nearByMe[id]);
		delete nearByMe[id];
	}
};


// user location 정보를 server에 전달하여 가까운 곳에 있는 user정보를 받아온다
AirDrop.prototype._sendRequest = function(coords) {
	var myId = this.me.id;

	// 유저의 정보를 담아 요청 보내기
	var xmlhttp = this._getXMLHttp();

	xmlhttp.open("POST", this.url, true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send("cmd=getNeighbors&id="+myId+"&longitude="+coords.longitude+"&latitude="+coords.latitude);	
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200 && xmlhttp.responseText.length>0){
			var neighbors = JSON.parse(xmlhttp.responseText);
			// 왜인지 몰라도 핸들러없이 콜백이 설정될 때가 있으므로 있을때만 요청결과 처리하도록 한다.

			// handler를 조금 더 깔끔하게 처리할 수 있을 것 같음
			// if (handler) handler(neighbors);
			this._requestHandler(neighbors);
		}
	}.bind(this);
};



// server로부터 전달받은 정보를 처리하는 handler
AirDrop.prototype._requestHandler = function(users) {
	// 상대정보를 받으면 그 정보를 모델에 적용한다.
	var nearByMe = this.nearByMe;
	var myId = this.me.id;

	// 내 id 정보를 삭제한다.
	delete users[myId];


	// 유저 삭제 & 유지 처리 : 응답에 존재하지 않으면 상대목록 모델에서 삭제
	// 
	for(var id in nearByMe) {
		if(!this._containsUserWithSameID(users, nearByMe[id]))
			this._removeUser(id);
	}


	// 유저 추가처리 : 응답에 존재하는데 목록에 없으면 상대목록 모델에 추가	
	users.forEach(function(user) {
		var id = user.id;
		// nearByMe에 요청받은 id가 존재하지 않는 경우 추가
		if(!_.contains(this._getPreviousIds(), id)) {
			this._addUser(id);
		}		
	}.bind(this));	
};

// 현재 위치정보를 불러와 주변 user를 갱신할 수 있는 기본 자료로 사용한다.
AirDrop.prototype._getLocation = function() {
	function success(pos) {
		// 정보요청 -> 모델 업뎃 -> UI싱크(상대유저목록) 과정을 1초당 한번씩 수행하도록 한다.
		setInterval(this._sendRequest.bind(this, pos.coords), 1000);	
	}

	function error(err) {
		console.warn('geolocation error(' + err.code + '): ' + err.message);
	}

	var options = {
		enableHighAccuracy: true,
		timeout: 10000,
		maximumAge: 0
	};

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success.bind(this), error, options);

	// Geolocation 이 지원되지 않는 경우에 서비스 이용 불가 메시지를 남기고 서버로 요청 못 보내게 만들기 
	} else {
		alert("Geolocation is not supported by this browser.");

	}
};


AirDrop.prototype._containsUserWithSameID = function(list, value){
	// 엘리먼트의 id만 비교해서 포함하는지 체크한다.
	var idList = [];
	for(var i in list) {
		idList.push(list[i].id);
	}
	return _.contains(idList, value.id);
} 


AirDrop.prototype._logPreviousId = function(id) {
	var prev_id = JSON.parse(sessionStorage["prev_id"]||"[]");
	prev_id.push(id);
	if(prev_id.length > 1) prev_id.shift();
	sessionStorage["prev_id"] = JSON.stringify(prev_id);
}

AirDrop.prototype._getPreviousIds = function() {
	var prev_id = JSON.parse(sessionStorage["prev_id"]||"[]");
	return prev_id;
}

// el로 id를 찾기
AirDrop.prototype._getIdByEl = function(el) {
	var nearByMe = this.nearByMe;


	for (var id in nearByMe) {
		var curUser = nearByMe[id];

		if (curUser.el === el) {
			return curUser.id;
		}
	}
	return false;
};


AirDrop.prototype._getXMLHttp = function() {
	var xmlhttp = null;

	if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();

	} else {// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

	}

	return xmlhttp;
};