function SendController(args) {
	if (!(this instanceof SendController)) return new SendController(args);
	EventEmitter.call(this);

	this.connection = args.conn;
	this.CHUNK_SIZE = args.chunkSize;
	this.BLOCK_SIZE = args.blockSize;
	this.fileEntry = null;

	this.init();
}
inherits(SendController, EventEmitter);

SendController.prototype.init = function() {
	this.transferStart = null;
	this.transferEnd = null;

	this.fileSender = new FileSender();

	this.connection.on('data', function(message){
		this._handleMessage(message);
	}.bind(this));

	this.fileSender.on("blockContextInitialized", function() {
		this.fileSender.sendDataChunk(this.connection);
	}.bind(this));
	
	this.fileSender.on("blockSent", function() {
		this.emit('updateProgress', this.getProgress());
	}.bind(this));
	
	this.fileSender.on('transferEnd', function() {
		console.log("fileEnd");
		// this.connection.send({
		// 	"kind": "fileEnd"
		// });
	}.bind(this));

	this.repeat('fileSendPrepared', this.fileSender);
};

SendController.prototype.sendFile = function(file) {
	// 수신자에게 파일 정보를 전달
	this.fileEntry = file;
	this.askOpponent(file);
	// 전송자는 파일 전달 준비
	console.log("fileSender setfile");
	this.fileSender.setFile(file, this.CHUNK_SIZE, this.BLOCK_SIZE);
};

SendController.prototype._handleMessage = function(message) {
	var kind = message.kind; // chunk, meta, request
	switch (kind) {
		case "refusal": // 수신자가 거부하였다. 연결을 종료한다.
			this.getRefused();
			break;
		case "requestBlock":  // 수신자가 i번째 블록을 요청했다. 이를 통해 현재 블록전송 콘텍스트를 초기화 한다.
			// console.log("[Connection : _handleMessage] incoming message requestBlock");
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
		case "requestChunk": // 수신자가 청크를 잘 받았다. 다음 청크를 보낸다.
			//console.log("[Connection : _handleMessage] incoming message requestChunk");
			this.fileSender.sendDataChunk(this.connection);
			break;
		case "thanks": // 볼일이 끝났다. 연결을 끊는다.
			// 송신자가 연결을 끊으면 수신자는 자동적으로 연결이 끊어진다.
			this.connection.close();
			break;
		
		default:
			console.error("Unrecognizable Message");
			console.log(typeof message);
			console.log(message);
			break;
	};
};

SendController.prototype.askOpponent = function(file) {
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
	this.emit("message", "Waiting for Acception");
	this.connection.send(message);
};

SendController.prototype.getRefused = function() {
	// 거절되었다는 메시지를 띄워준다
	this.emit('opponentRefused');
	console.log("당신은 바람맞았습니다.");
	this.connection.close();
};

SendController.prototype.getProgress = function() {
	var context = this.fileSender.blockTranferContext;

	var chunkCount = context.sentChunkCount;
	if (!chunkCount) chunkCount = 0;

	var progress = chunkCount / context.totalChunkCount;
	return progress;
};
