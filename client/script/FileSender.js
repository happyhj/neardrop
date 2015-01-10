function FileSender(args) {
	if (!(this instanceof FileSender)) return new FileSender(args);
	EventEmitter.call(this);

	this.init();
	this.initListeners();
};
inherits(FileSender, EventEmitter);

FileSender.prototype.init = function() { 
	this.file; // 사용자가 지정항 파일의 엔트리다.
	this.fileInfo; // name, size, type
	this.fileReader = new FileReader();

	this.blockTranferContext;
};

FileSender.prototype.initListeners = function() { 
	var blockContextInitializedCallback = function(e) {
		this.sendDataChunk();
	}.bind(this);
	this.fileSender.on("blockContextInitialized", blockContextInitializedCallback);	
	
	var blockSentCallback = function(blockIndex){
		this.emit('blockTransfered', blockIndex[0]);
	}.bind(this);
	this.fileSender.on("blockSent", blockSentCallback);
};

FileSender.prototype.setFile = function(file, chunkSize, blockSize) {	
	this.file = file;
	this.fileInfo = {
		name: file.name,
		size: file.size,
		type: file.type,
		lastModifiedDate: file.lastModifiedDate,
		sizeStr: getSizeExpression(file.size);
	};
	
	this.blockTranferContext = {
		"chunkSize": chunkSize,
		"blockSize": blockSize,
		"chunkIndexToSend": undefined, // 이번에 보내야할 쳥크 인덱스. 보내자 마자 ++ 한다.
		"blockIndex": undefined, // 요청이 들어올때 까지는 어떤 블록인지 모르므로..
		"sentChunkCount": 0,
		"totalChunkCount": Math.ceil(file.size / chunkSize)
	};

	// 준비되면 뭘 해야하지????
	// this.emit('fileSendPrepared', this.fileInfo);
};