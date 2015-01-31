function DataConnection(args) {
	if (!(this instanceof DataConnection)) return new DataConnection(args);
	EventEmitter.call(this);

	this.peer = '';
	this.channelId = '';
	this.dataChannel = null;
	this.playConn = null;
}
inherits(DataConnection, EventEmitter);

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
	
	this.playConn.dataSend(payload);
};
DataConnection.prototype.close = function() {
	// this._dataChannel.destroy();
	// this._currentConn.destroy();
	console.log("close");
	// 상대방 종료
	// console.log(this.channelId);
	// this.playConn.disconnectChannel(this.channelId);
	// 내가 종료
	this.playConn.disconnectChannel();

	this.emit('close');
};

function Peer() {
	if (!(this instanceof Peer)) return new Peer(args);
	EventEmitter.call(this);
	
	this.id = null;

	// playRTC 에서는 따로 내 ID 를 얻어야 되지만 PeerJS 에서는 인스턴스 생성 시 발급받으므로 여기서 playRTC 객체를 생성해서 채널 연결까지 해야한다.	
	var playConfig = {

	    localVideoTarget: "localStream",
	    remoteVideoTarget: "remoteStream",
 
		url: "http://neardrop.heej.net:5400",

		userMedia: {
			audio: false,
			video: false
		},
		dataChannelEnalbled: true
	};
	
	// 남에게 접속하기 위한 connection
	this._playConnSend = new PlayRTC(playConfig);

	// 남이 들어올 수 있게 열어놓는 채널 
	this._playConnReceive = new PlayRTC(playConfig);
	this._playConnReceive.on("createChannel", function(channelId){
		channelId = ""+channelId;
		this.id = channelId;
		// 내 peerId 생성된 것을 전달
		this.emit('open', this.id);
	}.bind(this));
	this._playConnReceive.on("addDataStream", this.addDataStreamHandler.bind(this));

	// 수신용 채널 생성
	this._playConnReceive.createChannel();
}
inherits(Peer, EventEmitter);

Peer.prototype.addDataStreamHandler = function(){
	var dataConnection;
	var channelId;
	var peerId;
	var dataChannel;

	if (arguments.length == 4) {
		// 송신 시 커넥션은 이미 만들어져 있음
		dataConnection = Array.prototype.shift.apply(arguments);
		dataConnection.playConn = this._playConnSend;
		console.log(arguments);
	} else {
		// 수신 시 커넥션 생성해야 함
		dataConnection = new DataConnection();
		dataConnection.playConn = this._playConnReceive;
	}

	channelId = arguments[0];
	peerId = arguments[1] || dataConnection.peer;
	dataChannel = arguments[2];

	console.log("Channel : "+channelId);
	console.log("Peer : " +peerId);

	// dataConnection 객체에 채널을 연결하고 connection 이벤트를 발생시킨다.
	dataConnection.peer = peerId;
	dataConnection.channelId = channelId;
	dataConnection.dataChannel = dataChannel;
	
	
	// dataChannel 에 이벤트 리스너 단다.
	dataConnection.dataChannel.on("message", function(message){
		console.log("SendMESSAGE wrapper");
		if(message.type === "text") {
			var result = JSON.parse(message.data);
			dataConnection.emit('data', result);
			return;
		} else {
			var blob = message.blob;
			var reader = new FileReader();
			reader.onload = function(event){
				var arrayBuffer = event.target.result;
				dataConnection.emit('data', arrayBuffer);
			}.bind(this);
			
    		reader.readAsArrayBuffer(blob);
    		return;
		}
	}.bind(this));

	this._playConnReceive.on("otherDisconnectChannel", function() {
		dataConnection.emit('close');

		// 수신을 위해 다시 채널 열어야 함
	});
		
	this.emit('connection', dataConnection);
	dataConnection.emit('open');
};
	
Peer.prototype.connect = function (channelId) { // play의 channelId -_-
	this._playConnSend.connectChannel(channelId, {
		peer: {
			uid: this.id
		}
	});
	
	var dataConnection = new DataConnection();
	dataConnection.peer = channelId;

	this._playConnSend.on("addDataStream", this.addDataStreamHandler.bind(this, dataConnection));

	return dataConnection;
};

Peer.prototype.disconnect = function () { // play의 channelId -_-
	// this._playConnSend.disconnectChannel();
}