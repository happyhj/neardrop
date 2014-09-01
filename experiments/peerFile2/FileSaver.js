(function(window) {
	'use strict';
	var document = window.document;
	var console = window.console;
	//var FileSaver = window.FileSaver || {};
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
		this.meta; // name, size, type, chunkUnitSize, totalChunk
		this.chunkMap; // { "0" : true, "1": false, ...  }
		this.receivedChunkCount;
		
		this._fileSystem;
		this._fileEntry;
		this._fileWriter;
		this._eventEmitter = {
			'initialized': new _EventEmitter(),
			'chunkSaved': new _EventEmitter(),
			'fileCompleted': new _EventEmitter()	
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
	
	FileSaver.prototype.getNextChunkIndexNeeded = function() {
		var index = -1;
		//  TODO : 탐색 알고리즘이 o(n) 이다 ㅠㅠ o(1) 로 개선하자 
		for(var i in this.chunkMap) {
			if(this.chunkMap[i] == false) {
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
		
		
			
	FileSaver.prototype.init = function(metaInfo) {
		this.meta = {
			name: metaInfo.name,
			size: metaInfo.size,
			type: metaInfo.type,
			lastModifiedDate: metaInfo.lastModifiedDate,
			chunkUnitSize: metaInfo.chunkUnitSize,
			totalChunk: Math.floor(metaInfo.size / metaInfo.chunkUnitSize) + 1
		};	
						

		var name = this.meta.name;
		var size = this.meta.size;
		console.log("[FileSaver :init] requesting FileSystem");
		requestFileSystem(window.TEMPORARY , size, function(fileName, fs){
				console.log("[FileSaver :init] creating blank file in FileSystem");
				this._fileSystem = fs;
				console.log(this._fileSystem);
				console.log(fileName);

				this._fileSystem.root.getFile(
					fileName
					, {create: true}
					, function(fileEntry){
						this._fileEntry = fileEntry;
						this._fileEntry.createWriter(function(fileWriter) {
							this._fileWriter = fileWriter;
//							debugger;

							this._fileWriter.onwriteend = function() {
								//this._fileWriter.onwriteend = undefined;													
								this.receivedChunkCount++;
								// 파일 쓰기가 종료되면 chunkSaved 이벤트를 trigger 한다.
								console.log('Chunk saved!');		
								this._eventEmitter.chunkSaved.trigger();
								// 판단해서 파일이 모두 완성되었다고 생각 되면 fileCompleted 이벤트를 trigger 한다.
								if(this.receivedChunkCount === this.meta.totalChunk) {
									console.log("File Completed!");
									this._eventEmitter.fileCompleted.trigger();
								}
							}.bind(this);								
												// chunkMap 초기화, receivedChunkCount 초기화;
							this._initChunkMap();
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
	
	FileSaver.prototype._initChunkMap = function() {
		this.chunkMap = {};
		for(var i=0 ; i< this.meta.totalChunk ; i++ ){
			this.chunkMap[""+i] = false;
		}
		this.receivedChunkCount = 0;
	};
	
	FileSaver.prototype.saveChunk = function(data) {
		// 해당 데이타가 쓰여져야할 곳으로 커서를 이동시킨다.
		this._fileWriter.seek(data.index * this.meta.chunkUnitSize); // Start write position at EOF.
		var blob = new Blob([data.arrayBuffer]);
		this.chunkMap[""+data.index] = true;

		this._fileWriter.write(blob);
		
		// 여기서 강제 GC blob을 수행시켜야함
		// AB만? blob만? 둘다?
		this._eraseBuffer(data.arrayBuffer);
		this._eraseBuffer(blob);

	};
	
	FileSaver.prototype.downloadFile = function() {
		if(this.receivedChunkCount === this.meta.totalChunk) {
			console.log("Downloading File...");
			var link = document.createElement("a");
			link.href = this._fileEntry.toURL();
			link.download = this.meta.name;
			this._simulatedClick(link);
		} else {
			console.log("File NOT Completed. You cannot download it yet.");		
		}
	};
	
	// 웹 워커를 이용해서 강제로 GC를 수행하는 메소드
	FileSaver.prototype._garbageCollector = (function(){
		var ef = URL.createObjectURL(new Blob([''],{type: 'text/javascript'})),
				w = new Worker(ef);
		
		URL.revokeObjectURL(ef);
		return w;
	})();

	FileSaver.prototype._eraseBuffer = function(arrayBuffer){
		this._garbageCollector.postMessage(arrayBuffer,[arrayBuffer]);
	}	

	
	FileSaver.prototype._simulatedClick = function(ele) {
		var evt = document.createEvent("MouseEvent");
		evt.initMouseEvent("click", true, true, null,0, 0, 0, 80, 20, false, false, false, false, 0, null);
		ele.dispatchEvent(evt);
	};

	FileSaver = FileSaver;
	/*  public은 
			생성자함수
			init
			saveChunk
			downloadFile
			on
			off
		뿐입니다.
	*/ 

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = FileSaver;
		// browser export
	} else {
		window.FileSaver = FileSaver;
	}    	

}(this));