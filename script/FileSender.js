function FileSender(args) {
	if (!(this instanceof FileSender)) return new FileSender(args);
	EventEmitter.call(this);

	this.init();
	this.initListeners();
};
inherits(FileSender, EventEmitter);

FileSender.prototype.init = function() { 
	this.file = null; // 사용자가 지정항 파일의 엔트리다.
	this.fileInfo = null; // name, size, type
	this.fileReader = new FileReader();

	this.blockTranferContext = {};
	this.chunks = [];
};

FileSender.prototype.initListeners = function() {
	// this.on("blockContextInitialized", this.sendDataChunk);
};

FileSender.prototype.setFile = function(file, chunkSize, blockSize) {	
	this.file = file;
	this.fileInfo = {
		name: file.name,
		size: file.size,
		type: file.type,
		lastModifiedDate: file.lastModifiedDate,
		sizeStr: getSizeExpression(file.size)
	};
	
	this.blockTranferContext = {
		"chunkSize": chunkSize,
		"blockSize": blockSize,
		"chunkIndexToSend": undefined, // 이번에 보내야할 쳥크 인덱스. 보내자 마자 ++ 한다.
		"blockIndex": undefined, // 요청이 들어올때 까지는 어떤 블록인지 모르므로..
		"sentChunkCount": 0,
		"totalChunkCount": Math.ceil(file.size / chunkSize)
	};
	console.log("fileSender setfile complete");
	this.emit('fileSendPrepared', this.fileInfo);
};

FileSender.prototype.initBlockContext = function(blockIndex) {
	this.blockTranferContext.chunkIndexToSend = 0;
	this.blockTranferContext.blockIndex = blockIndex;
	// block slice cache 를 준비한다.
	var chunkSize = this.blockTranferContext.chunkSize,
	blockIndex = this.blockTranferContext.blockIndex,
	blockSize = this.blockTranferContext.blockSize;
	var startByte = blockIndex * blockSize * chunkSize;
	var endByte =  (blockIndex+1) * blockSize * chunkSize;

	var block = this._sliceBlob(this.file, startByte, endByte);
	
	// 덩어리째로 쓰지말고 미리 arrayBuffer들로 나눠서 준비해 두자.
	this.chunks = [];
	

	// 동기적으로 하나씩 흐름이 이어지므로(블로킹)... 아직은 문제가 없을 것이다. 
	// TODO : this._fileReader 를 함께 사용하므로 getChunk 를 동시에 실행하면(넌블로킹 방식으로 구현) 문제가 발생할 여지가 있다.
	// 	      이점을 고려하여 로직을 개선해야함 
	var fileReaderOnloadCallback = function(event){
    	var arrayBuffer = event.target.result;			
		for(var idx=0 ;idx<blockSize;idx++){
			var chunkStartByte = idx * chunkSize;
			var chunkEndByte = (idx + 1) * chunkSize;
			var chunk = this._sliceBlob(arrayBuffer, chunkStartByte, chunkEndByte);
			if(chunk.byteLength > 0) {
				this.chunks[idx] = chunk;
			}
		}
		console.log('Block Context Initialized!');
		// 이 이벤트는 데이터 컨트롤러가 받는다
		this.emit('blockContextInitialized');
	}.bind(this);

	this.fileReader.onload = fileReaderOnloadCallback;
	this.fileReader.readAsArrayBuffer(block);
};

FileSender.prototype._sliceBlob = function(blob, start, end) {
	var type = blob.type;
	if (blob.slice) {
		return blob.slice(start, end, type);
	} else if (blob.mozSlice) {
		return blob.mozSlice(start, end, type);
	} else if (blob.webkitSlice) {
		return blob.webkitSlice(start, end, type);
	} else {
		throw new Error("This doesn't work!");
	}
};

FileSender.prototype.sendDataChunk = function(conn) {
	var chunkIndex = this.blockTranferContext.chunkIndexToSend,
		chunkSize = this.blockTranferContext.chunkSize;

	// 
	if(this.blockTranferContext.blockSize <= chunkIndex) {
		return; 
	}
	var chunkToSend = this.chunks[chunkIndex];
	if(conn && conn.open===true) {
		conn.send(chunkToSend);
		this.blockTranferContext.chunkIndexToSend++;
		this.blockTranferContext.sentChunkCount++;

		// 평가를 해서 현재 쳥크가 블록의 마지막 쳥크라면 이벤트 발생
		var isLastChunkInBlock = (
			(chunkIndex+1) >= this.blockTranferContext.blockSize) ||
			(this.blockTranferContext.sentChunkCount === this.blockTranferContext.totalChunkCount-1);

		if(isLastChunkInBlock) {
			// 뒤의 인자는 사용되지 않음
			this.emit('blockSent', this.blockTranferContext.blockIndex);		
		}
		// 근데 이 시점에서 보낸 쳥크수가 총 쳥크와 같다면 transferEnd 가 된다.
		if(this.blockTranferContext.sentChunkCount === this.blockTranferContext.totalChunkCount) {
			console.log("쳥크 다 줬따!!: "+ Date.now());
			this.emit('transferEnd');
		}
	}	
};
