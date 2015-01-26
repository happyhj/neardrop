function DataController(args) {
	if (!(this instanceof DataController)) return new DataController(args);
	EventEmitter.call(this);

	this.CHUNK_SIZE = args.CHUNK_SIZE;
	this.BLOCK_SIZE = args.BLOCK_SIZE;

	this.init();
	this.initListeners();
}
inherits(DataController, EventEmitter);

DataController.prototype.init = function() {
	this.peer = null;
	this.connection = null;

	this.fileEntry = null;
	this.fileSaver = new FileSaver();
	this.fileSender = new FileSender();

	this.transferStart = null;
	this.transferEnd = null;
};

DataController.prototype.setPeer = function(peer) {
	this.peer = peer;
	// 연결이 들어오기를 기다린다
	this.peer.on('connection', function(dataConnection) {
		this.connection = dataConnection;
		this._setConnectionHandlers();
	}.bind(this));
};

DataController.prototype.connect = function(opponent, file) {		
	// 연결되지 않았던 peer의 경우
	//	if (id !== undefined && this.connectionHandlers[id] === undefined) {
	// 
	// file 이름을 가진 connection 생성, (remotePeer);
	// 상대방과 커넥션을 맺고 
	console.log(opponent.id +" 와 연결을 시도합니다.");					

	this.fileEntry = file;
	this.connection = this.peer.connect(opponent.id, {
		// reliable: false,
		// serialization: "none"
	});
	this._setConnectionHandlers();
};

DataController.prototype.disconnect = function() {
	//this.peer.disconnect();
};

DataController.prototype._setConnectionHandlers = function() {
	this.connection.on('open', function(){
		this.emit('ready', this.connection.peer);
	}.bind(this));
	this.connection.on('close', function(){
		this.emit('disconnected', this.connection.peer);
	}.bind(this));
	this.connection.on('data', function(message){
		this._handleMessage(message);
	}.bind(this));
}

DataController.prototype.initListeners = function() {
	// Connection 연결 수립 이후 대기 상태가 되면
	this.on('ready', function(args) {
		// var peerId = args[0];
		if(this.fileEntry !== null) {
			// 수신자에게 파일 정보를 전달
			this.askOpponent(this.fileEntry);
			// 전송자는 파일 전달 준비
			this.fileSender.setFile(this.fileEntry, this.CHUNK_SIZE, this.BLOCK_SIZE);
		}
	}.bind(this));
	
	this.on('disconnected', function(args) {
		var peerId = args[0];
		console.log(peerId + " 과 연결이 끊어졌습니다.");
	});

	// 파일 전송 준비가 끝났을 때
	this.fileSender.on('fileSendPrepared', function(fileInfo) {
		// UI에서 다루도록 이벤트를 상위 계층으로 올린다.
		this.emit('fileSendPrepared', fileInfo);
	}.bind(this));
	this.fileSaver.on('fileSavePrepared', function(fileInfo) {
		// UI에서 다루도록 이벤트를 상위 계층으로 올린다.
		this.emit('fileSavePrepared', fileInfo);
	}.bind(this));	

	this.fileSender.on("blockContextInitialized", function() {
		this.fileSender.sendDataChunk(this.connection);
	}.bind(this));	

	this.fileSaver.on('chunkStored', function() {
		this.connection.send({
			"kind": "requestChunk"
		});
	}.bind(this));

	// 블록이 보내졌을 때와 받았을 때
	this.fileSender.on("blockSent", function() {
		this.emit('updateProgress', this.getProgress());
	}.bind(this));
	this.fileSaver.on('nextBlock', function(blockIdx) {
		this.requestBlockTransfer(blockIdx);
		this.emit('updateProgress', this.getProgress());
	}.bind(this));

	// 전송이 끝났을 때
	this.fileSaver.on('transferEnd', function() {
		this.disconnect();
		this.fileEntry = null;
		this.emit('transferEnd');
	}.bind(this));
	this.fileSender.on('transferEnd', function() {
		this.disconnect();
		this.fileEntry = null;
		this.emit('transferEnd');
	}.bind(this));
};

DataController.prototype._handleMessage = function(message) {
	if( message.byteLength !== undefined ) { // ArrayBuffer 가 도착한 것
		console.log("Received ByteLength : "+message.byteLength);
		this.fileSaver.saveChunk(message);
	}
	else { // JSON이 도착한 것 
		var kind = message.kind; // chunk, meta, request
		switch (kind) {
			case "fileInfo": // 송신자가 보낸 파일 정보가 도착했다. 이를 가지고 file saver 를 초기화한다.
				console.log("[Connection : _handleMessage] incoming message file info");
				var fileInfo = message.fileInfo;
				var chunkSize = message.chunkSize;
				var blockSize = message.blockSize;
				this.fileSaver.setFile(fileInfo, chunkSize, blockSize);
				break;
			case "requestBlock":  // 수신자가 보낸 요청 블록 정보가 도착했다. 이를 통해 현재 블록전송 콘텍스트를 초기화 한다.
				console.log("[Connection : _handleMessage] incoming message requestBlock");
				console.log("blockIndex : " + message.blockIndex);	
				var blockIndex = message.blockIndex;
				
				// 블록을 메모리에 로딩 및 청킹
				this.fileSender.initBlockContext(blockIndex);
				// 만약 첫 요청이었다면
				if(blockIndex === 0) {
					// 어떤 상대방과 연결되었는지 정보를 UI에 이때 전달
					this.emit('showProgress', this.connection.peer, 'up');
					// 속도 계산용 기록
					this.transferStart = Date.now();
				}
				break;
			case "requestChunk": // 수신자가 다 받았음을 알리면 다음 쳥크를 보낸다.
				//console.log("[Connection : _handleMessage] incoming message requestChunk");
				this.fileSender.sendDataChunk(this.connection);
				break;
			default:
				debugger;
				console.log("what a fuck...");
				console.log(typeof message);
				console.log(message);
				break;
		};
	}
};

DataController.prototype.askOpponent = function(file) {
	console.log("메타 정보 보내기");
	var message = {
		  "kind": "fileInfo"
		, "fileInfo": {
			"lastModifiedDate": file.lastModifiedDate,
			"name": file.name,
			"size": file.size,
			"type": file.type
		}
		, "chunkSize": this.CHUNK_SIZE
		, "blockSize": this.BLOCK_SIZE
	};
	this.connection.send(message);
};

// "이제 블록을 보내라"
DataController.prototype.requestBlockTransfer = function(blockIdx) {
	// 첫 수락시엔 App에서 인자 없이 실행하므로
	if (!blockIdx) {
		blockIdx = 0;
	}
	// 현재 받는 블록이 몇 번 블록인지 저장
	this.fileSaver.blockTranferContext.blockIndex = blockIdx;

	this.connection.send({
		"kind": "requestBlock",
		"blockIndex": blockIdx
	});
	
	// 만약 첫 요청이었다면 프로그레스 바 생성
	if(blockIdx === 0)
		// 어떤 상대방과 연결되었는지를 UI에 이때 전달
		this.emit('showProgress', this.connection.peer, 'down');
};

DataController.prototype.getProgress = function() {
	var context = this.fileSender.blockTranferContext || this.fileSaver.blockTranferContext;
	// 둘 다 잡히지 않을 경우
	if (!context) {
		return undefined;
	}
	var chunkCount = context.sentChunkCount || context.receivedChunkCount;
	if (!chunkCount) chunkCount = 0;
	var progress = chunkCount / context.totalChunkCount;
	return progress;
};
