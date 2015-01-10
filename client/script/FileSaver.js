function FileSaver() {
	if (!(this instanceof FileSaver)) return new FileSaver(args);
	EventEmitter.call(this);

	this.init();
	this.initListeners();
}
inherits(FileSaver, EventEmitter);

FileSaver.prototype.init = function() {
	var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

	requestFileSystem(window.TEMPORARY ,1, function(fs){
		// 파일 시스템에 존재하는 파일을 모두 지우기
		this._fileSystem = fs;
		// 모든 파일을 삭제
		var removeAllFiles = function(fs) {
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
					console.log(this);
				}.bind(this), this._errorHandler);
			}.bind(this), this._errorHandler);
		}
		
		removeAllFiles(fs);
		// fileSaver 인스턴스가 준비되면 DataController가 파일을 지정해주게 된다
		this.emit('instancePrepared');
	}.bind(this), this._errorHandler);
};

FileSaver.prototype.initListeners = function() {


};

// 파일을 지정해주는 것은 DataController의 작업
FileSaver.prototype.setFile = function(fileInfo, chunkSize, blockSize) {
	this.fileInfo = fileInfo;

	this.blockTranferContext = {
		"chunkSize": chunkSize,
		"blockSize": blockSize,
		"receivedBlockCount": 0,
		"receivedChunkCount": 0,
		"totalBlockCount": Math.ceil(this.fileInfo.size / (chunkSize * blockSize)),
		"totalChunkCount": Math.ceil(this.fileInfo.size / (chunkSize)),
		"blockMap": undefined, // init시 생성
		"blockIndex": undefined // 현재 받고 있는 블록의 인덱스
	};	

	this._initBlockMap();

	this.fileInfo.sizeStr = getSizeExpression(this.fileInfo.size);
	// 저장을 위한 사전작업이 끝났으니 팝업창을 띄워 동의를 구한다.
	// FileSaver -> DataController -> UIController가 이벤트를 받는다.		
	this.emit('fileSavePrepared', this.fileInfo);
};

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