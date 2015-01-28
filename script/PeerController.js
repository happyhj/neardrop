function PeerController(args) {
	if (!(this instanceof PeerController)) return new PeerController(args);
	EventEmitter.call(this);

	this.CHUNK_SIZE = args.CHUNK_SIZE;
	this.BLOCK_SIZE = args.BLOCK_SIZE;

	this.init();
	this.initListeners();
}
inherits(PeerController, EventEmitter);

PeerController.prototype.init = function() {
	this.peer = null;
	this.connection = null;
	this.fileEntry = null;
	this.isSender = null;
};

PeerController.prototype.initListeners = function() {
	// Connection 연결 수립 이후 대기 상태가 되면
	this.on('ready', function(args) {
		if (this.isSender === null) {
			console.error("Role undefined");
		}
		if (this.isSender) {
			// 내가 송신자라면
			this.dataController = new SendController({
				conn: this.connection, 
				chunkSize: this.CHUNK_SIZE,
				blockSize: this.BLOCK_SIZE
			});
		} else {
			// 내가 수신자라면
			this.dataController = new SaveController({
				conn: this.connection
			});
		}
		this.setEventPipes();

		if (this.isSender) {
			this.dataController.sendFile(this.fileEntry);
		}
	}.bind(this));
	
	// Connection이 close 되면
	this.on('disconnected', function(args) {
		var peerId = args[0];
		console.log(peerId + " 과 연결이 끊어졌습니다.");
		// dataController를 초기화하고
		this.dataController = null;
		// 연결이 끊어졌으니 새로운 연결을 기다림
		this.listen();
	});
};

PeerController.prototype.setPeer = function(peer) {
	this.peer = peer;
	// 최초의 Listening
	this.listen();
};

// 송신자는 이 함수를 통해 connection을 얻는다.
PeerController.prototype.connect = function(opponent, file) {
	console.log(opponent.id +" 와 연결을 시도합니다.");

	this.fileEntry = file;

	this.isSender = true;
	this.connection = this.peer.connect(opponent.id);
	this.afterConnection();
};

// 수신자는 이 함수를 통해 connection을 얻는다.
PeerController.prototype.listen = function() {
	// 연결이 들어오기를 기다린다
	this.peer.removeAllListeners('connection');
	this.peer.on('connection', function(dataConnection) {
		this.isSender = false;
		this.connection = dataConnection;
		this.afterConnection();
	}.bind(this));
};

PeerController.prototype.afterConnection = function() {
	if (!this.connection) {
		console.error("Connection is not valid");
		return;
	}

	this.connection.on('open', function(){
		this.emit('ready', this.connection.peer);
	}.bind(this));
	this.connection.on('close', function(){
		this.emit('disconnected', this.connection.peer);
	}.bind(this));
	
	// 추가적인 연결이 들어오는 것을 막는다
	this.peer.removeAllListeners('connection');
	this.peer.on('connection', function(dataConnection) {
		dataConnection.on('open', function(conn) {
			conn.send({
				"kind": "refusal"
			});
		}.bind(this, dataConnection));
	}.bind(this));
};

PeerController.prototype.setEventPipes = function() {
	// 하부 컨트롤러에서 올라오는 이벤트를 App으로 올려보낸다
	this.dataController.on('fileSendPrepared', function(fileInfo) {
		console.log("fileSendPrepared !!!!! ");
		console.log(fileInfo);
		this.emit('fileSendPrepared', fileInfo);
	}.bind(this));
	this.dataController.on('fileSavePrepared', function(fileInfo) {
		this.emit('fileSavePrepared', fileInfo);
	}.bind(this));
	this.dataController.on('showProgress', function(peer, dir) {
		this.emit('showProgress', peer, dir);
	}.bind(this));
	this.dataController.on('updateProgress', function(progress) {
		this.emit('updateProgress', progress);
	}.bind(this));
	this.dataController.on('transferEnd', function() {
		this.emit('transferEnd');
	}.bind(this));
};

// 거절은 saveController의 역할. 이지만 App이 이걸 실행하므로 아직 여기에
PeerController.prototype.sendRefusal = function() {
	this.connection.send({
		"kind": "refusal"
	});
};
