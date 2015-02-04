function SaveController(args) {
	if (!(this instanceof SaveController)) return new SaveController(args);
	EventEmitter.call(this);

	this.connection = args.conn;

	this.init();
};
inherits(SaveController, EventEmitter);

SaveController.prototype.init = function() {
	this.transferStart = null;
	this.transferEnd = null;

	this.fileSaver = new FileSaver();

	this.connection.on('data', function(message){
		this._handleMessage(message);
	}.bind(this));

	this.fileSaver.on('chunkStored', function() {
		this.connection.send({
			"kind": "requestChunk"
		});
	}.bind(this));

	// 블록을 다 받았을 때
	this.fileSaver.on('nextBlock', function(blockIdx) {
		this.requestBlockTransfer(blockIdx);
		this.emit('updateProgress', this.getProgress());
	}.bind(this));

	this.fileSaver.on('fileDownloadEnd', function() {
		this.sendThanks();
	}.bind(this));

	this.repeat('fileSavePrepared', this.fileSaver);
};

SaveController.prototype._handleMessage = function(message) {
	if( message.byteLength !== undefined ) { // ArrayBuffer 가 도착한 것
		// console.log("Received ByteLength : "+message.byteLength);
		this.fileSaver.saveChunk(message);
	}
	else { // JSON이 도착한 것 
		var kind = message.kind; // chunk, meta, request
		switch (kind) {

			// 송신자 -> 수신자
			case "fileInfo": // 송신자가 보낸 파일 정보가 도착했다. 이를 가지고 file saver 를 초기화한다.
				console.log("[Connection : _handleMessage] incoming message file info");
				var fileInfo = message.fileInfo;
				var chunkSize = message.chunkSize;
				var blockSize = message.blockSize;
				this.fileSaver.setFile(fileInfo, chunkSize, blockSize);
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

// "이제 블록을 보내라"
SaveController.prototype.requestBlockTransfer = function(blockIdx) {
	// 첫 수락시엔 App에서 인자 없이 실행하므로
	if (!blockIdx) {
		blockIdx = 0;
		this.transferStart = Date.now();
		// 어떤 상대방과 연결되었는지를 UI에 이때 전달, 프로그레스 바 생성
		this.emit('showProgress', this.connection.peer, 'down');
	}
	// 현재 받는 블록이 몇 번 블록인지 저장
	this.fileSaver.blockTranferContext.blockIndex = blockIdx;

	this.connection.send({
		"kind": "requestBlock",
		"blockIndex": blockIdx
	});
};

SaveController.prototype.sendThanks = function() {
	console.log("thanks");
	this.connection.send({
		"kind": "thanks"
	});
}

SaveController.prototype.getProgress = function() {
	var context = this.fileSaver.blockTranferContext;

	var chunkCount = context.receivedChunkCount;
	if (!chunkCount) chunkCount = 0;

	var progress = chunkCount / context.totalChunkCount;
	return progress;
};
