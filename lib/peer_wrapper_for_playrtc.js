(function(window) {
	'use strict';
	var console = window.console;
	var PlayRTC = window.PlayRTC;
	
	// EventEmitter
	function _EventEmitter() {
		this.events = [];
	}
	
	_EventEmitter.prototype.on = function(fn) {
		this.events.push(fn);
	};
	
	_EventEmitter.prototype.off = function(fn) {
		var newEvents = [];
		// 입력받은 함수와 같은것만 빼고 유지. 
		for (var i=0, len=this.events.length; i<len; ++i) {
			if (this.events[i] !== fn) {
				newEvents.push(this.events[i]);
			}
		}
		this.events = newEvents;
	};
	
	_EventEmitter.prototype.trigger = function() {
		for (var i=0, len=this.events.length; i<len; ++i) {
			this.events[i](arguments[0]);
		}
	};
	
	function DataConnection() {
		this._eventEmitter = {
			'data': new _EventEmitter(), // Emitted when data is received from the remote peer.
			'open': new _EventEmitter(), // Emitted when the connection is established and ready-to-use.
			'close': new _EventEmitter() // Emitted when either you or the remote peer closes the data connection.
		};	
		this.peer = ''; // 연결 대상의 channel ID 를 저장한다. 
		this._dataChannel = null;
		this._currentConn = null;
	}
	
	DataConnection.prototype.on = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].on(fn);	
		}
	};
	
	DataConnection.prototype.off = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].off(fn);	
		}
	};
		

			
	DataConnection.prototype.send = function(data) { // [peerjs] You can send any type of data, including objects, strings, and blobs.
		var payload;
		if(data instanceof ArrayBuffer) {
			var chunkFile = new File( [data] , {type: 'application/octet-binary'});
			payload = chunkFile;
		} else {
			var serialized = JSON.stringify(data);
			console.log(serialized);
			payload = serialized;
		}
		
		this._currentConn.dataSend(payload);
	};
	
	DataConnection.prototype.close = function() { 
		this._currentConn.disconnect();
	};

	
	function Peer() {
		this._eventEmitter = {
			'open': new _EventEmitter(), // 내 Peer Id 를 생성했을 때
			'connection': new _EventEmitter() // 상대방과 연결이 수립되어서 dataConnection 객체를 얻었을 때
		};	
		
		this._dataConnection = null;
		
		// playRTC 에서는 따로 내 ID 를 얻어야 되지만 PeerJS 에서는 인스턴스 생성 시 발급받으므로 여기서 playRTC 객체를 생성해서 채널 연결까지 해야한다.	
		var playConfig = {

		    localVideoTarget: "localStream",
		    remoteVideoTarget: "remoteStream",
     
			url: "http://neardrop.heej.net:5400",

//			url: "http://1.234.79.105:5400",
//			url: "http://localhost:5400",
			userMedia: {
				audio: false,
				video: false
			},
			dataChannelEnalbled: true
		};
		 
		 
		// 남이 들어올 수 있게 열어놓는 채널 
		this._playConnReceive = new PlayRTC(playConfig);	
		
		// 남에게 접속하기 위한 connection
		this._playConnSend = new PlayRTC(playConfig);
		
		this._playConnReceive.on("createChannel", function(id){
			//console.log(id);
			var result = ""+id;
			this.peer = result;
			//console.log(this.peer);
			this._eventEmitter.open.trigger(result);
		}.bind(this));		
		// connect 남이 시도해서 발생한 connection 이벤트
		this._dataConnection = new DataConnection();
		this._playConnReceive.on("addDataStream", addDataStreamHandler.bind(this));
		this._dataConnection._currentConn = this._playConnReceive;

		this._playConnReceive.createChannel();
	}
	
	function addDataStreamHandler(peerid, userid, dataChannel){	
		//console.log("userid :"+ userid);	
		if(userid)	
			this._dataConnection.peer = userid;			
		// dataConnection 객체를 획득하고 connection 이벤트를 발생시킨다.
		this._dataConnection.dataChannel = dataChannel;
//		console.log("dataChannel!");
//		console.log(dataChannel);
		this._dataConnection.parent = this;
		
		// dataChannel 에 이벤트 리스너 단다.
//		console.log("dataChannel 에 message 이벤트 리스너 단다.");
		this._dataConnection.dataChannel.on("message", function(message){
			var result;

			if(message.type === "text") {
				result = JSON.parse(message.data);
//				console.log(result + ": 요걸로 data 이벤트 불러야징");
				this._dataConnection._eventEmitter.data.trigger(result);
			} else {
				var resultFile = message.blob;

				// 아마도 파일 아닐까 ArrayBuffer 로 만들자.
				var reader = new FileReader();
				reader.onload = function(event){
					var arrayBuffer = event.target.result;	
//					console.log(arrayBuffer + ": 요걸로 data 이벤트 불러야징");
					this._dataConnection._eventEmitter.data.trigger(arrayBuffer);
				}.bind(this);
				
	    		reader.readAsArrayBuffer(resultFile);
				//result = JSON.parse(message.data);
			}

		}.bind(this));
		
		if(userid)	
			this._eventEmitter.connection.trigger(this._dataConnection);
		this._dataConnection.open = true;
		this._dataConnection._eventEmitter.open.trigger();
	}
	
	Peer.prototype.on = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].on(fn);	
		}
	};
	
	Peer.prototype.off = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].off(fn);	
		}
	};
		
	Peer.prototype.connect = function (peer_id) { // play의 channelId -_-
		// 상대방에게 이미 연결이 되어있으면 바로 addDataStream 이벤트를 Dispatch 한다..
		/*
		if(this._dataConnection.peer === peer_id) {

			console.log("상대방에게 이미 연결이 되어있으");
			console.log(this._dataConnection);
			addDataStreamHandler.apply(this._playConnSend, [undefined, undefined, this._dataConnection.dataChannel])
			return this._dataConnection;
		
		*/
		this._playConnSend.connectChannel(peer_id, {
			peer: {
				uid: this.peer
			}
		});		
		
		this._dataConnection = new DataConnection();
		this._dataConnection.peer = peer_id;
		// connect 내가 시도해서 발생한 connection 이벤트
		this._playConnSend.on("addDataStream", addDataStreamHandler.bind(this));
		this._dataConnection._currentConn = this._playConnSend;
		return this._dataConnection;
	};

	Peer.prototype.disconnect = function () { // play의 channelId -_-
		this._playConnSend.disconnectChannel();
	}
	
	Peer = Peer;

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Peer;
		// browser export
	} else {
		window.Peer = Peer;
	}    	

}(this));