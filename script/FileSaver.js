function FileSaver() {
	if (!(this instanceof FileSaver)) return new FileSaver(args);
	EventEmitter.call(this);

	this.init();
	this.initListeners();
}
inherits(FileSaver, EventEmitter);

FileSaver.prototype.init = function() {
	// 쳥크들을 임시저장할 장소
	this.chunkBlock = [];
	this.fileInfo = null;
	this.file = null;
	
	var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

	// 파일시스템 초기화 작업
	requestFileSystem(window.TEMPORARY ,1, function(fs){
		// 파일 시스템에 존재하는 파일을 모두 지우기
		(function removeAllFiles(fs) {
			fs.root.getDirectory('/', {}, function(dirEntry){
				var dirReader = dirEntry.createReader();
				dirReader.readEntries(function(entries) {
					for(var i = 0; i < entries.length; i++) {
						var entry = entries[i];
						// if (entry.isDirectory){
						// 	console.log('Directory: ' + entry.fullPath);
						// }
						// else 
						if (entry.isFile){
						    entry.remove(function() {
						    	console.log('File removed - '+ entry.fullPath);
							}, this._errorHandler);
						}
					}
				}.bind(this), this._errorHandler);
			}.bind(this), this._errorHandler);
		}.bind(this))(fs);

		// fileSaver 인스턴스가 준비되면 DataController가 파일을 지정해주게 된다
		this.emit('instancePrepared');
	}.bind(this), this._errorHandler);
};

FileSaver.prototype.initListeners = function() {
	this.on('blockSaved', function() {
		if(this.blockTranferContext.receivedBlockCount === this.blockTranferContext.totalBlockCount) {
			console.log("쳥크 다바다따!!: "+Date.now());
			this.emit('transferEnd');
			this.downloadFile();
			// this.off("blockSaved", blockSavedCallback);	
		}
		// 다 안받았으면 다음 블록을 보내달라고 송신자에게 응답을 보낸다.
		else {
			var blockIndex = this.getNextBlockIndexNeeded();
			this.emit('nextBlock', blockIndex);
		} 
	})

};

// 파일을 지정해주는 것은 DataController의 작업
FileSaver.prototype.setFile = function(fileInfo, chunkSize, blockSize) {
	this.fileInfo = fileInfo;
	this.fileInfo.sizeStr = getSizeExpression(fileInfo.size);

	this.blockTranferContext = {
		"chunkSize": chunkSize,
		"blockSize": blockSize,
		"receivedBlockCount": 0,
		"receivedChunkCount": 0,
		"totalBlockCount": Math.ceil(fileInfo.size / (chunkSize * blockSize)),
		"totalChunkCount": Math.ceil(fileInfo.size / (chunkSize)),
		"blockMap": undefined, // init시 생성
		"blockIndex": undefined // 현재 받고 있는 블록의 인덱스
	};	

	this._initBlockMap();
	
	// 저장할 준비
	this.readyToWrite();
};

FileSaver.prototype.readyToWrite = function() {
	// fileWriter를 만들어낸다. 
	var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

	console.log("[FileSaver :init] requesting FileSystem");
	requestFileSystem(window.TEMPORARY, this.fileInfo.size, function(fileName, fs){
		console.log("[FileSaver :init] creating blank file in FileSystem");
		fs.root.getFile(fileName, {create: true}, function(fileEntry){
			this.file = fileEntry;
			this.file.createWriter(function(fileWriter) {
				this._fileWriter = fileWriter;
				this._fileWriter.onwriteend = function() {
					this.chunkBlock = [];
					this.blockTranferContext.receivedBlockCount++;
					// blockMap 업데이트하기
					delete this.blockTranferContext.blockMap[""+this.blockTranferContext.blockIndex];	
					//this.blockTranferContext.blockMap[""+this.blockTranferContext.blockIndex] = true;								
					// 파일 쓰기가 종료되면 chunkSaved 이벤트를 trigger 한다.
					console.log('Block saved!');		
					this.emit('blockSaved', this.blockTranferContext.blockIndex);
				}.bind(this);
				
				// 저장을 위한 사전작업이 끝났으니 팝업창을 띄워 동의를 구한다.
				// FileSaver -> DataController -> UIController가 이벤트를 받는다.		
				console.log("[FileSaver: event] fileSavePrepared triggered");
				this.emit('fileSavePrepared', this.fileInfo);
			}.bind(this));	
		}.bind(this), this._errorHandler);	
	}.bind(this, this.fileInfo.name), this._errorHandler);
}

FileSaver.prototype._initBlockMap = function() {
	var blockMap = {}; // { "0" : true, "1": false, ...  }
	for(var i=0,len=this.blockTranferContext.totalBlockCount;i<len;i++){
		blockMap[i+""] = false;
	}
	this.blockTranferContext.blockMap = blockMap;
};

FileSaver.prototype.getNextBlockIndexNeeded = function() {
	// ???? 이렇게 한 이유는 뭘까나요?
	var blockMap = this.blockTranferContext.blockMap;
	var blockKeys = Object.keys(blockMap);
//		var index = Math.floor(Math.random() * blockKeys.length);
	return blockKeys[0];
};

// MAIN. 
FileSaver.prototype.saveChunk = function(chunk) {
	var blockSize = this.blockTranferContext.blockSize,
	blockIndex = this.blockTranferContext.blockIndex,
	chunkSize = this.blockTranferContext.chunkSize;
	
	// 데이터를 일단 주머니에 담고 
	this.chunkBlock.push(chunk);
	this.blockTranferContext.receivedChunkCount++;

	// 한계치까지 담겼다면
	var isLastChunkInBlock = (this.chunkBlock.length >= blockSize);
	// 혹은 파일의 마지막 블록이라면
	var isLastChunkInFile = this.isLastChunkInFile(); 

	if (isLastChunkInBlock || isLastChunkInFile) {
		var blob = new Blob(this.chunkBlock);
		this._fileWriter.seek(blockIndex * blockSize * chunkSize);
		this._fileWriter.write(blob);
		// writeEnd시 blockSaved 이벤트 발생
		return;
	}

	// 일반적인 상황에서는
	console.log("!");	
	this.emit('chunkStored');
};

FileSaver.prototype.isLastChunkInFile = function() {
	var blockSize = this.blockTranferContext.blockSize,
	receivedBlockCount = this.blockTranferContext.receivedBlockCount,
	totalBlockCount = this.blockTranferContext.totalBlockCount,
	totalChunkCount = this.blockTranferContext.totalChunkCount
	
	// 지금까지 받은 블록의 수가 totalBlockCount - 1 과 같으며, 
	// 총 chunk의 갯수 / blockSize 의 나머지가 this.chunkBlock.length 와 같으면 
	if((receivedBlockCount === (totalBlockCount - 1))
		&& ((totalChunkCount % blockSize) === this.chunkBlock.length)) {
		return true;
	}
	return false;
}

FileSaver.prototype.downloadFile = function() {
	if (!this.file) return;
	if(this.blockTranferContext.receivedBlockCount === this.blockTranferContext.totalBlockCount) {
		console.log("Downloading File...");
		var link = document.createElement("a");
		link.href = this.file.toURL();
		link.download = this.fileInfo.name;
		this._simulatedClick(link);
	} else {
		console.log("File NOT Completed. You cannot download it yet.");		
	}
};

FileSaver.prototype._simulatedClick = function(ele) {
	var evt = document.createEvent("MouseEvent");
	evt.initMouseEvent("click", true, true, null,0, 0, 0, 80, 20, false, false, false, false, 0, null);
	ele.dispatchEvent(evt);
};

FileSaver.prototype._errorHandler = function(e) {
	var msg = '';
	switch (e.name) {
	case FileError.QUOTA_EXCEEDED_ERR:
	  msg = 'QUOTA_EXCEEDED_ERR';
	  break;
	case FileError.NOT_FOUND_ERR:
	  msg = 'NOT_FOUND_ERR';
	  break;
	case FileError.SECURITY_ERR:
	  msg = 'SECURITY_ERR';
	  break;
	case FileError.INVALID_MODIFICATION_ERR:
	  msg = 'INVALID_MODIFICATION_ERR';
	  break;
	case FileError.INVALID_STATE_ERR:
	  msg = 'INVALID_STATE_ERR';
	  break;
	default:
	  msg = 'Unknown Error';
	  break;
	};
	msg += '\n' + e.message;
	console.log('Error: ' + msg);
}
