(function(window) {
	'use strict';
	var document = window.document;
	var console = window.console;

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

	function FileSender() {
		this.fileInfo; // name, size, type
		this.blockTranferContext;
		
		this._file; // 사용자가 지정항 파일의 엔트리다.
		this._fileReader = undefined;
				
		this._eventEmitter = {
			'initialized': new _EventEmitter(),
			'blockContextInitialized': new _EventEmitter()
//			, 'chunkSaved': new _EventEmitter()
//			, 'fileCompleted': new _EventEmitter()	
		};

	}
	
	FileSender.prototype.on = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].on(fn);	
		}
	};
	
	FileSender.prototype.off = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].off(fn);	
		}
	};
	
	// 파일엔트리를 가지면 FileSystem에 있는 파일을 이용하는것도 가능하다.
	FileSender.prototype.init = function(initParam) { 
		this.fileInfo = {
			name: initParam.file.name,
			size: initParam.file.size,
			type: initParam.file.type,
			lastModifiedDate: initParam.file.lastModifiedDate,
		};
		
		this.blockTranferContext = {
			"chunkSize": initParam.chunkSize,
			"blockSize": initParam.blockSize,
			"chunkIndexToSend": undefined, // 이번에 보내야할 쳥크 인덱스. 보내자 마자 ++ 한다.
			"blockIndex": undefined, // 요청이 들어올때 까지는 어떤 블록인지 모르므로..
		};
		
		this._fileReader = new FileReader();

		this._file = initParam.file;
		
		console.log("[FileSender: event] initialized triggered");
		this._eventEmitter.initialized.trigger();
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

		var blobSlice = this._sliceBlob(this._file, startByte, endByte);
		
		// 덩어리째로 쓰지말고 미리 arrayBuffer들로 나눠서 준비해 두자.
		this.blockArrayBuffers = [];
		

		// 동기적으로 하나씩 흐름이 이어지므로(블로킹)... 아직은 문제가 없을 것이다. 
		// TODO : this._fileReader 를 함께 사용하므로 getChunk 를 동시에 실행하면(넌블로킹 방식으로 구현) 문제가 발생할 여지가 있다.
		// 	      이점을 고려하여 로직을 개선해야함 
		var fileReaderOnloadCallback = function(event){
	    	var arrayBuffer = event.target.result;			
			for(var chunkIndex=0 ;chunkIndex<blockSize;chunkIndex++){
				var chunkStartByte = chunkIndex * chunkSize;
				var chunkEndByte = (chunkIndex + 1) * chunkSize;
				var blobSlice = this._sliceBlob(arrayBuffer, chunkStartByte, chunkEndByte);
				if(blobSlice.byteLength > 0) {
					this.blockArrayBuffers[chunkIndex] = blobSlice;
				}
			}
			console.log('Block Context Initialized!');		
			this._eventEmitter.blockContextInitialized.trigger();			    	
		}.bind(this);
		this._fileReader.onload = fileReaderOnloadCallback;
		this._fileReader.readAsArrayBuffer(blobSlice);		
	};
	
	// 그냥 한다.  
	// 비동기 작업이므로 콜백함수로 결과값을 넘긴다.
	FileSender.prototype.getNextChunk = function(callback) {
		// 해당 데이타가 쓰여져야할 곳으로 커서를 이동시킨다.
		var chunkIndex = this.blockTranferContext.chunkIndexToSend,
		chunkSize = this.blockTranferContext.chunkSize;
		
		if(this.blockTranferContext.blockSize-1 < chunkIndex) {
			callback(undefined);
			return; 
		}
		this._increaseChunkIndex();
		callback(this.blockArrayBuffers[chunkIndex]);
	};
	
	FileSender.prototype._increaseChunkIndex = function() {
		this.blockTranferContext.chunkIndexToSend++;
	};
	
	FileSender.prototype._sliceBlob = function(blob, start, end) {
	    var type = blob.type;
	    if (blob.slice) {
	        return blob.slice(start, end, type);
	    } 
	    else if (blob.mozSlice) {
	        return blob.mozSlice(start, end, type);
	    } else if (blob.webkitSlice) {
	        return blob.webkitSlice(start, end, type);
	    } else {
	        throw new Error("This doesn't work!");
	    }
	};	

	FileSender = FileSender;

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = FileSender;
		// browser export
	} else {
		window.FileSender = FileSender;
	}    	

}(this));
