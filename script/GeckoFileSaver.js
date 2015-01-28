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

	this.store = null;
	this.blockTranferContext = {};
};

FileSaver.prototype.openDB = function() {
	// In the following line, you should include the prefixes of implementations you want to test.
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	// DON'T use "var indexedDB = ..." if you're not in a function.
	// Moreover, you may need references to some window.IDB* objects:
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
	// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

	if (!window.indexedDB) {
	    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
	}

	var request = window.indexedDB.open("neardrop");
	request.onerror = function(event) {
		alert("Why didn't you allow my web app to use IndexedDB?!");
	};
	request.onsuccess = function(event) {
		this.db = request.result;
	};

	this.db.onerror = function(event) {
		alert("Database error: " + event.target.errorCode);
	};
};

FileSaver.prototype.initListeners = function() {
	this.on('blockSaved', function() {
		if(this.blockTranferContext.receivedBlockCount === this.blockTranferContext.totalBlockCount) {
			console.log("쳥크 다바다따!!: "+Date.now());
			this.downloadFile();
			this.emit('transferEnd');
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
	var db = this.openDB();
	
	// create index
	db.createObjectStore("fileSaver").createIndex("blocks", "blocks", { unique: false });

	var tx = this.db.transaction("fileSaver", IDBTransaction.READ_WRITE)
	var fileStore = tx.objectStore("fileSaver");
	var emptyStore = fileStore.index("fileSaver").openCursor();
	
	emptyStore.onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
		    emptyStore.delete(cursor.primaryKey);
		    cursor.continue;
		}
	}

	this.store = fileStore;
	this.emit('fileSavePrepared', this.fileInfo);
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
		this.store.put(blob, "block"+blockIndex);
		this.emit('blockSaved');
		return;
	}
	// 일반적인 상황에서는
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
