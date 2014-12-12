(function(window) {
	'use strict';
	var console = window.console;

	var FileSaver = window.FileSaver;
	var FileSender = window.FileSender;
	
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

	function ConnectionHandler(initArgs) {
		this.CHUNK_SIZE = initArgs.CHUNK_SIZE;
		this.BLOCK_SIZE = initArgs.BLOCK_SIZE;
		
		this.connection;
		
		// 전송시간, 전송속도 계산에 관련된 것 - 별로 안중요함
		this.transferStart;
		this.transferEnd;
		this.duration;
		
		this.fileSaver;
		this.fileSender;
			
		this.peer = initArgs.userPeer;
	
		this._eventEmitter = {
			'connect': new _EventEmitter(),
			'disconnect': new _EventEmitter(),
			'peerIDAcquire': new _EventEmitter(),
			'filePrepared': new _EventEmitter(),
			'transferStart': new _EventEmitter(),
			'transferEnd': new _EventEmitter(),
			'blockTransfered': new _EventEmitter()
		};	
	
		this.initPeerEventHandler();
	}
	
	ConnectionHandler.prototype.getProgress = function() {
		// 내가 수신측일 경우
		if(this.fileSaver){
			if( this.fileSaver.blockTranferContext.receivedChunkCount >= 0  && this.fileSaver.blockTranferContext.totalChunkCount) {
			var progress = this.fileSaver.blockTranferContext.receivedChunkCount / this.fileSaver.blockTranferContext.totalChunkCount;
				//debugger;
				return progress;
			} 
			//debugger;
			return undefined;
		}
		if(this.fileSender){
			// 내가 송신측일 경우
			if( this.fileSender.blockTranferContext.sentChunkCount >= 0  && this.fileSender.blockTranferContext.totalChunkCount) {
				var progress = this.fileSender.blockTranferContext.sentChunkCount / this.fileSender.blockTranferContext.totalChunkCount;
				return progress;
			}
			//debugger; 
			return undefined;		
		} else {
			//debugger;
			return undefined;
		}
		//debugger;
	};
				
	ConnectionHandler.prototype.on = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].on(fn);	
		}
	};
	
	ConnectionHandler.prototype.off = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].off(fn);	
		}
	};
		
	ConnectionHandler.prototype.initPeerEventHandler = function() {
		// 내 연결 아이디를 발급 받았을 때
		
		this.peer.on('open', function(id){
			this._eventEmitter.peerIDAcquire.trigger(id);
		}.bind(this));
		// 상대방과 연결을 수립했을 때
		this.peer.on('connection', function(dataConnection) {
			this.connection = dataConnection;
			this.initConnectionHandler();
		}.bind(this));
	}
	
	ConnectionHandler.prototype._handleMessage = function(message) {
		if( message.byteLength !== undefined ) { // ArrayBuffer 가 도착한 것
			console.log("Received ByteLength : "+message.byteLength);
			this.fileSaver.saveChunk(message);
		}
		else { // JSON이 도착한 것 
			var kind = message.kind; // chunk, meta, request
			switch (kind) {
				case "fileInfo": // 송신자가 보낸 파일 정보가 도착했다. 이를 가지고 file saver 를 초기화한다.
					console.log("[Connection : _handleMessage] incoming message file info");
					var fileInfo = message.fileInfo;
					this.initSaver({
						"file": fileInfo,
						"chunkSize": this.CHUNK_SIZE,
						"blockSize": this.BLOCK_SIZE
					});
					break;
				case "requestBlock":  // 수신자가 보낸 요청 블록 정보가 도착했다. 이를 통해 현재 블록전송 콘텍스트를 초기화 한다.
					console.log("[Connection : _handleMessage] incoming message requestBlock");
					console.log("blockIndex : " + message.blockIndex);	
					var blockIndex = message.blockIndex;
					
					this.fileSender.initBlockContext(blockIndex);
					// 보내는 쪽의 전송시작 이벤트 
					if(blockIndex == 0) {
						this._eventEmitter.transferStart.trigger();
						this.transferStart = Date.now();
					}
				break;
				case "requestChunk": // 수신자가 다 받았음을 알리면 다음 쳥크를 보낸다.
					//console.log("[Connection : _handleMessage] incoming message requestChunk");
					this.sendDataChunk();
				break;
				default:
					break;
			};
		}
	};
	
	ConnectionHandler.prototype.sendDataChunk = function() {
		var getNextChunkHandler = function(chunk){
			//console.log(chunk);
			if(chunk) {
				if(this.connection && this.connection.open===true) {
					this.connection.send(chunk);
					this.fileSender.blockTranferContext.sentChunkCount++;
					// 근데 이 시점에서 보낸 쳥크수가 총 쳥크와 같다면 transferEnd 가 된다.
					if(this.fileSender.blockTranferContext.sentChunkCount === this.fileSender.blockTranferContext.totalChunkCount) {
						this.transferEnd = Date.now();
						console.log("쳥크 다 줬따!!: "+this.transferEnd);
						this._eventEmitter.transferEnd.trigger();
					}
				}
			}
		}.bind(this);
	
		this.fileSender.getNextChunk(getNextChunkHandler);
	}
	
	ConnectionHandler.prototype.initConnectionHandler = function() {
		this.connection.on('open', function(){
			this._eventEmitter.connect.trigger(this.connection.peer);
		}.bind(this));	
		this.connection.on('close', function(){
			this._eventEmitter.disconnect.trigger(this.connection.peer);
		}.bind(this));		
		this.connection.on('data', function(message){
			this._handleMessage(message);
		}.bind(this));
	};
	
	// 상대방과 연결을 맺기 
	ConnectionHandler.prototype.connect = function(peer_id){
		// Connection을 요청한다.
		this.connection = this.peer.connect(peer_id);

		// 커넥션이 맺어졌을때의 콜백 
		this.initConnectionHandler(this.connection);
	};

	ConnectionHandler.prototype.disconnect = function(){
		// Connection을 요청한다.
		//this.peer.disconnect();
	};
		
	// TODO : UI 관련 인데 돔 작업은 아님. 어쩔?!
	ConnectionHandler.prototype._getSizeExpression = function(size) { // byte
		var result = size;
		if(result < 1024) {
			return result + "Byte";
		}
		result = Math.floor(result / 1024.0 * 10)/10;
		if(result < 1024) {
			return result + "KB";
		}
		result = Math.floor(result / 1024.0 * 10)/10;
		if(result < 1024) {
			return result + "MB";
		}
		result = Math.floor(result / 1024.0 * 10)/10;
		if(result < 1024) {
			return result + "GB";
		}
		result = Math.floor(result / 1024.0 * 10)/10;
		if(result < 1024) {
			return result + "TB";
		}
	};
	
	ConnectionHandler.prototype.initSaver = function(initParam) {	
		this.fileSaver = new FileSaver();
		
		var initializeCallback = function(){	
			this.fileSaver.fileInfo.sizeStr = this._getSizeExpression(this.fileSaver.fileInfo.size);			
			this._eventEmitter.filePrepared.trigger(this.fileSaver.fileInfo);
		}.bind(this);
		
		this.fileSaver.on("initialized", initializeCallback);		
	
		// 세이브 완료 시 : 다음 쳥크 요청하거나 수신 완료여부 체크 후
		var blockSavedCallback = function(){
			// 다 받았는지 확인.
			// 판단해서 파일이 모두 완성되었다고 생각 되면 fileCompleted 이벤트를 trigger 한다.
			if(this.fileSaver.blockTranferContext.receivedBlockCount === this.fileSaver.blockTranferContext.totalBlockCount) {
				this.transferEnd = Date.now();
				console.log("쳥크 다바다따!!: "+this.transferEnd);
				this._eventEmitter.transferEnd.trigger();
				this.fileSaver.off("blockSaved", blockSavedCallback);	
			}
			// 다 안받았으면 다음 블록을 보내달라고 송신자에게 응답을 보낸다.
			else {
				this.requestBlockTransfer();
			} 
		}.bind(this);
					
		this.fileSaver.on("blockSaved", blockSavedCallback);	
		
		var chunkStoredCallback = function(){
			this.connection.send({
				  "kind": "requestChunk"
			});		
		}.bind(this);
		
		this.fileSaver.on("chunkStored", chunkStoredCallback);		


		var blockSavedCallback = function(blockIndex){
			this._eventEmitter.blockTransfered.trigger(blockIndex[0]);
		}.bind(this);
		
		this.fileSaver.on("blockSaved", blockSavedCallback);
			
	
		var instancePreparedCallback = function() {
			this.fileSaver.init({
				file: initParam.file,
				chunkSize: this.CHUNK_SIZE,
				blockSize: this.BLOCK_SIZE
			});				
		}.bind(this);
		
		this.fileSaver.on("instancePrepared", instancePreparedCallback);		
	};
		
	ConnectionHandler.prototype.initSender = function(initParam) {
		//	
		this.fileSender = new FileSender();
		
		var blockContextInitializedCallback = function(e) {
			this.sendDataChunk();
		}.bind(this);
		this.fileSender.on("blockContextInitialized", blockContextInitializedCallback);	
		
		var blockSentCallback = function(blockIndex){
			this._eventEmitter.blockTransfered.trigger(blockIndex[0]);
		}.bind(this);
		this.fileSender.on("blockSent", blockSentCallback);
						
		this.fileSender.on("initialized", function() {
			console.log("메타 정보 보내기 - 시작!");

			if(this.connection && this.connection.open === true) {
				console.log("메타 정보 보내기");
				this.connection.send({
					  "kind": "fileInfo"
					, "fileInfo": {
						"lastModifiedDate": initParam.file.lastModifiedDate,
						"name": initParam.file.name,
						"size": initParam.file.size,
						"type": initParam.file.type	
					}
					, "chunkSize": this.CHUNK_SIZE
					, "blockSize": this.BLOCK_SIZE
				});
	
				this.fileSender.fileInfo.sizeStr = this._getSizeExpression(this.fileSender.fileInfo.size);			
				this._eventEmitter.filePrepared.trigger(this.fileSender.fileInfo);
			}		
		}.bind(this));
		initParam.chunkSize = this.CHUNK_SIZE;
		initParam.blockSize = this.BLOCK_SIZE;
		this.fileSender.init(initParam);
	};
	
	ConnectionHandler.prototype.makeConnection = function(peerId) {
		this.connect(peerId,
		{
			reliable: false,
			serialization: "none"
		});
	};
	
	ConnectionHandler.prototype.requestBlockTransfer = function() {
		if(this.connection && this.connection.open===true) {	
			this.fileSaver.blockTranferContext.blockIndex = this.fileSaver.getNextBlockIndexNeeded();
			this.connection.send({
				  "kind": "requestBlock",
				  "blockIndex": this.fileSaver.blockTranferContext.blockIndex
			});
			// 받는 쪽의 전송시작 이벤트 
			if(this.fileSaver.blockTranferContext.blockIndex == 0)
				this._eventEmitter.transferStart.trigger();
		}
	};
	ConnectionHandler = ConnectionHandler;

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = ConnectionHandler;
		// browser export
	} else {
		window.ConnectionHandler = ConnectionHandler;
	}    	

}(this));
