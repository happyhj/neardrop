(function(window) {
	'use strict';
	var document = window.document;
	var console = window.console;

	var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	
	// EventEmitter
	function _EventEmitter() {
		this.events = [];
	}
	
	_EventEmitter.prototype.on = function(fn) {
		this.events.push(fn);
	};
	
	_EventEmitter.prototype.off = function(fn) {
		var newEvents = [];
		// 입력받은 함수와 같은것만 빼고 유지. 
		for (var i=0, len=this.events.length; i<len; ++i) {
			//var curEvent = this.events[i];
			//
			if (this.events[i] !== fn) {
				newEvents.push(this.events[i]);
			}
		}
		this.events = newEvents;
	};
	
	_EventEmitter.prototype.trigger = function() {
		for (var i=0, len=this.events.length; i<len; ++i) {
			this.events[i](arguments);
		}
	};

	function FileSaver() {
		this.fileInfo; // name, size, type

		this.blockTranferContext;

		this.shouldCreateFile = true;
        
        // 쳥크들을 임시저장할 장소
        this.chunkBlock = [];
       
		this._fileSystem;
		this._fileEntry;
		this._fileWriter;
		this._eventEmitter = {
			'initialized': new _EventEmitter(),
			'blockSaved': new _EventEmitter(),
			'fileCompleted': new _EventEmitter(),
			'chunkStored': new _EventEmitter()
		};
		requestFileSystem(window.TEMPORARY ,1, function(fs){
				// 파일 시스템에 존재하는 파일을 모두 지우기
				this._fileSystem = fs;
				// 모든 파일을 삭제
				fs.root.getDirectory('/', {}, function(dirEntry){
					var dirReader = dirEntry.createReader();
					dirReader.readEntries(function(entries) {
						for(var i = 0; i < entries.length; i++) {
							var entry = entries[i];
							if (entry.isDirectory){
								console.log('Directory: ' + entry.fullPath);
							}
							else if (entry.isFile){
							    entry.remove(function() {
							    	console.log('File removed - '+ entry.fullPath);
							    }, this._errorHandler);
							}
						}
					}, this._errorHandler);
				}, this._errorHandler);
			}.bind(this)
			,this._errorHandler
		);	
	}
	
	FileSaver.prototype.getNextBlockIndexNeeded = function() {
		var blockMap = this.blockTranferContext.blockMap;
		var index = -1;
		//  TODO : 탐색 알고리즘이 o(n) 이다 ㅠㅠ o(1) 로 개선하자 
		for(var i in blockMap) {
			if(blockMap[i] == false) {
				index = parseInt(i);
				break;
			}
		}
		return index;
	};

	FileSaver.prototype.on = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].on(fn);	
		}
	};
	
	FileSaver.prototype.off = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].off(fn);	
		}
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
		
		
			
	FileSaver.prototype.init = function(initParam) {
		this.fileInfo = {
			name: initParam.file.name,
			size: initParam.file.size,
			type: initParam.file.type,
			lastModifiedDate: initParam.file.lastModifiedDate,
		};
			
		this.blockTranferContext = {
			"chunkSize": initParam.chunkSize,
			"blockSize": initParam.blockSize,
			"receivedBlockCount": undefined,
			"totalBlockCount": Math.floor(this.fileInfo.size / (initParam.chunkSize * initParam.blockSize)) + 1,
			"totalChunkCount": Math.floor(this.fileInfo.size / (initParam.chunkSize)) + 1,
			"blockMap": undefined, // init시 생성
			"blockIndex": undefined // 현재 받고 있는 블록의 인덱스
		};	

		var name = this.fileInfo.name;
		var size = this.fileInfo.size;
		console.log("[FileSaver :init] requesting FileSystem");
		requestFileSystem(window.TEMPORARY , size, function(fileName, fs){
				console.log("[FileSaver :init] creating blank file in FileSystem");
				this._fileSystem = fs;

				this._fileSystem.root.getFile(
					fileName
					, {create: true}
					, function(fileEntry){
						this._fileEntry = fileEntry;
						this._fileEntry.createWriter(function(fileWriter) {
							this._fileWriter = fileWriter;
							this._fileWriter.onwriteend = function() {
								this.chunkBlock = [];
								this.blockTranferContext.receivedBlockCount++;
								// blockMap 업데이트하기
								this.blockTranferContext.blockMap[""+this.blockTranferContext.blockIndex] = true;								
								// 파일 쓰기가 종료되면 chunkSaved 이벤트를 trigger 한다.
								console.log('Block saved!');		
								this._eventEmitter.blockSaved.trigger();
								// 판단해서 파일이 모두 완성되었다고 생각 되면 fileCompleted 이벤트를 trigger 한다.
								if(this.blockTranferContext.receivedBlockCount === this.blockTranferContext.totalBlockCount) {
									console.log("File Completed!");
									this._eventEmitter.fileCompleted.trigger();
								}
							}.bind(this);								
							// chunkMap 초기화, receivedChunkCount 초기화;
							this._initBlockMap();
							// initialized 이벤트를 trigger 한다.
							console.log("[FileSaver: event] initialized triggered");
							this._eventEmitter.initialized.trigger();
						}.bind(this));	
					}.bind(this)
					, this._errorHandler
				);	
			}.bind(this, name)
			,this._errorHandler
		);	
			
	};
	
	FileSaver.prototype._initBlockMap = function() {
		var blockMap = {}; // { "0" : true, "1": false, ...  }
		for(var i=0,len=this.blockTranferContext.totalBlockCount;i<len;i++){
			blockMap[i+""] = false;
		}
		this.blockTranferContext.blockMap = blockMap;	
		this.blockTranferContext.receivedBlockCount = 0;
	};

	FileSaver.prototype.saveChunk = function(chunk) {
		var blockSize = this.blockTranferContext.blockSize,
		receivedBlockCount = this.blockTranferContext.receivedBlockCount,
		totalBlockCount = this.blockTranferContext.totalBlockCount,
		totalChunkCount = this.blockTranferContext.totalChunkCount,
		blockIndex = this.blockTranferContext.blockIndex,
		chunkSize = this.blockTranferContext.chunkSize;
		
		// 데이터를 일단 주머니에 담고 
		this.chunkBlock.push(chunk);

		// 한계치까지 담겼는지 확인 후 	
    	var isLastChunkInBlock = (this.chunkBlock.length >= blockSize)?true:false;
		// 현재 블록번호와 this.chunkBlock.length 로 receivedChunkCount를 

		if(isLastChunkInBlock) {
			var blob = new Blob(this.chunkBlock);
			this._fileWriter.seek(blockIndex * blockSize * chunkSize);
			this._fileWriter.write(blob);
		} else {
			var isLastChunkInFile = false; 
			// 지금까지 받은 블록의 수가 totalBlockCount - 1 과 같으며, 
			// 총 chunk의 갯수 / blockSize 의 나머지가 this.chunkBlock.length 와 같으면 
			if((receivedBlockCount === (totalBlockCount - 1))
			&&
			((totalChunkCount % blockSize) === this.chunkBlock.length)) {
				isLastChunkInFile = true;	
			}		
			if(isLastChunkInFile) {
				var blob = new Blob(this.chunkBlock);
				this._fileWriter.seek(blockIndex * blockSize * chunkSize);
				this._fileWriter.write(blob);
			} else {
				console.log('chunk stored!');		
				this._eventEmitter.chunkStored.trigger();
			}		
		}
	};
	
	FileSaver.prototype.downloadFile = function() {
		if(this.blockTranferContext.receivedBlockCount === this.blockTranferContext.totalBlockCount) {
			console.log("Downloading File...");
			var link = document.createElement("a");
			link.href = this._fileEntry.toURL();
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

	FileSaver = FileSaver; 

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = FileSaver;
		// browser export
	} else {
		window.FileSaver = FileSaver;
	}    	

}(this));