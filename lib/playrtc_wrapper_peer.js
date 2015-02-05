function Peer() {
	if (!(this instanceof Peer)) return new Peer(args);
	EventEmitter.call(this);

	this.config = {
		url: "http://neardrop.heej.net:5400",
		userMedia: {
			audio: false,
			video: false
		},
		dataChannelEnalbled: true
	};

	// 이 Peer의 Listen Channel Id
	this.id = null;
	this.playListen = null;
	this.destroyed = false;

	this.init();
}
inherits(Peer, EventEmitter);

Peer.prototype.init = function() {
	// 남이 들어올 수 있게 열어놓는 채널 
	this.playListen = new PlayRTC(this.config);
	this.playListen.on("createChannel", function(channelId){
		channelId = ""+channelId;
		this.id = channelId;
		// 내 peerId 생성된 것을 UserController에 전달
		this.emit('open', this.id);
	}.bind(this));
	
	// dataChannel이 생성되면
	this.playListen.on("addDataStream", this.onConnection.bind(this));

	// 수신용 채널 생성
	this.playListen.createChannel();
};

Peer.prototype.onConnection = function(peerId, userId, dataChannel) {
	var playReceive = new PlayRTC(this.config);

	// 새로운 채널을 생성하고 해당 채널 아이디를 알려준다.
	playReceive.on("createChannel", function(privateId){
		console.log("사설 채널 생성 완료 : " + privateId);
		var data = JSON.stringify({
			privateChannelId: privateId
		});
		this.playListen.dataSend(data);
	}.bind(this));

	playReceive.on("addDataStream", function(peerId, userId, dataChannel) {
		console.log("사설 채널에 누군가 접속함");
		var dataConnection = new DataConnection(userId);
		this.emit("connection", dataConnection);
		dataConnection.setDataChannel(dataChannel);
		dataConnection.setPlayConn(playReceive);
	}.bind(this));


	playReceive.createChannel();
};

Peer.prototype.connect = function(publicId) {
	// 접속용 채널 준비
	var playConnect = new PlayRTC(this.config);
	// 공용 채널 접속일 때는 아직 데이터채널과 커넥션이 생기지 않음
	var connection = new DataConnection(publicId);

	// 공용 채널에 접속한다
	playConnect.connectChannel(publicId, {
		peer: {
			uid: this.id
		}
	});
	playConnect.on("connectChannel", function() {
		this.emit("playRTC_phase1");
	}.bind(this));

	playConnect.on("addDataStream", function(connection, peerId, userId, dataChannel) {
		console.log("공용 채널에 접속");
		dataChannel.on("message", function(connection, message) {
			var result = JSON.parse(message.data);
			var privateId = result.privateChannelId;
			console.log("사설 채널 ID 발급받음 : "+ privateId);
			// 임시로 들어온 채널에서는 사설 채널 아이디만 받고 나간다.
			this.emit("playRTC_phase2");
			// 완전히 나간 후에야
			// 사설 일대일 연결을 시작한다.
			playConnect.on("disconnectChannel", function(){
				this._connect(connection, privateId);
			}.bind(this));
			playConnect.disconnectChannel(playConnect.getPeerId());
		}.bind(this, connection));
	}.bind(this, connection));

	return connection;
};

Peer.prototype._connect = function(connection, privateId) {
	// 데이터 전송용 채널 준비
	var playSend = new PlayRTC(this.config);

	console.log("사설 채널 접속 시도");
	// 사설 채널에 접속한다
	playSend.connectChannel(privateId, {
		peer: {
			uid: this.id
		}
	});

	playSend.on("addDataStream", function(connection, peerId, userId, dataChannel) {
		console.log("사설 채널 접속 완료");
		this.emit("playRTC_phase3");
		// 사설 일대일 채널에 접속했을 때
		// 늦게나마 참조를 통해 데이터채널 정보를 입력해준다
		connection.setDataChannel(dataChannel);
		connection.setPlayConn(playSend);
		// connection 이벤트는 외부로부터 접속이 연결되었을 때에만 발생
		// Don't do -> this.emit("connection", connection);
	}.bind(this, connection));
	
};

Peer.prototype.destroy = function() {
	this.playListen.deleteChannel();
	this.destroyed = true;
};
