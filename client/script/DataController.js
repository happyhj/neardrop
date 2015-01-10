function DataController(args) {
	if (!(this instanceof DataController)) return new DataController(args);
	EventEmitter.call(this);

	this.CHUNK_SIZE = args.CHUNK_SIZE;
	this.BLOCK_SIZE = args.BLOCK_SIZE;

	this.init();
	this.initListeners();
}
inherits(DataController, EventEmitter);

DataController.prototype.init = function() {
	this.peer = null;
	this.connection = null;

	this.fileEntry = null;
	this.fileSaver = new FileSaver();
	this.fileSender = new FileSender();
};

DataController.prototype.setPeer = function(peer) {
	this.peer = peer;
	// 연결이 들어오기를 기다린다
	this.peer.on('connection', function(dataConnection) {
		this.connection = dataConnection;
		this._setConnectionHandlers();
	}.bind(this));
};

DataController.prototype.connect = function(opponent, file) {		
	// 연결되지 않았던 peer의 경우
	//	if (id !== undefined && this.connectionHandlers[id] === undefined) {
	// 
	// file 이름을 가진 connection 생성, (remotePeer);
	// 상대방과 커넥션을 맺고 
	console.log(opponent.id +" 와 연결을 시도합니다.");					

	this.fileEntry = file;
	this.connection = this.peer.connect(peer_id, {
		reliable: true,
		serialization: "none"
	});
	this._setConnectionHandlers();
};

DataController.prototype._setConnectionHandlers = function() {
	this.connection.on('open', function(){
		this.emit('ready', this.connection.peer);
	}.bind(this));
	this.connection.on('close', function(){
		this.emit('disconnected', this.connection.peer);
	}.bind(this));
	this.connection.on('data', function(message){
		this._handleMessage(message);
	}.bind(this));
}

DataController.prototype.initListeners = function() {
	// Connection 연결 수립 이후 대기 상태가 되면
	this.on('ready', function(args) {
		var peerId = args[0];
		if(this.fileEntry !== null) {
			// 수신자에게 파일 정보를 전달
			this.askOpponent(this.fileEntry);
			// 전송자는 파일 전달 준비
			this.fileSender.setFile(this.fileEntry, this.CHUNK_SIZE, this.BLOCK_SIZE);
		}
	}.bind(this));
	
	this.on('disconnected', function(args) {
		var peerId = args[0];
		console.log(peerId + " 과 연결이 끊어졌습니다.");
	});

	this.fileSaver.on('fileSendPrepared', function(fileInfo) {
		
	}.bind(this));

	this.fileSaver.on('fileSavePrepared', function(fileInfo) {
		// App에서 다루도록 이벤트를 상위 계층으로 올린다.
		this.emit('fileSavePrepared', fileInfo);
	}.bind(this));

	this.on('transferStart', function() {
		//alert("전송시작");
		// 프로그래스 바를 만들기 
		//document.getElementById(this.connection)

		var opponentId = this.connection.peer;
		var opponentDiv = document.getElementById(opponentId);
		var progressContainer = opponentDiv.querySelector(".progress-container");
		var streamLoaderContainer = opponentDiv.querySelector(".stream-loader-container");
		
		//  fileSaver 나 fileSender 의 blockcontext객체 레퍼런스를 가져온다.
		this.loader = new PieLoader({
			container: progressContainer
			, color: 'rgba(255,255,255,.97)'
			, fill: false
			, sourceObject: this
			, progressAdapter: function(source) { // 소스에서 progress 값을 리턴하는 함수를 만든다. progress 는 0 ~ 1 이다.
				return source.getProgress();
			}
		});
		
		this.loader.startAnimation();
		
		var streamLoaderInitParam = {
			containerEl: streamLoaderContainer
		};
		// 내가
		if(this.fileSender)
			streamLoaderInitParam.direction = 'up';
			
		this.streamLoader = new StreamLoader(streamLoaderInitParam);
		
		this.streamLoader.on("loadEnd", function() {
			this.disconnect();
			this.fileEntry = undefined;
			this.streamLoader = undefined;
			/*
			this.streamLoader = undefined;
						//debugger;

			this.fileEntry = undefined;
			this = new ConnectionHandler({
				'CHUNK_SIZE': CHUNK_SIZE,  // 16000 byte per binary chunk
				'BLOCK_SIZE': BLOCK_SIZE, // 10 binary chunks per one block
				'userPeer':	this.peer
			});
			*/
			
		}.bind(this));
		
		var container = document.getElementById(this.connection.peer);
		container.setAttribute("class", "avatar in-process");		
	}.bind(this));

	this.on('transferEnd', function() {
		//alert("전송끝");
		//		
		this.streamLoader.finishStream();
		
		var fileInfo;
		if( this.fileSaver ) {
			this.fileSaver.downloadFile();
			fileInfo = this.fileSaver.fileInfo;
		} else if(this.fileSender){
			fileInfo = this.fileSender.fileInfo;
		}
		
		// 걸린 시간과 속도 화면에 표시
		var duration = (this.transferEnd - this.transferStart)/1000;
		var sizeExpression = this._getSizeExpression(fileInfo.size);
		var speed = parseInt((parseFloat(sizeExpression)/ duration)*10)/10;
		var unit = sizeExpression.replace(/[^a-zA-Z]/g,'');
		
		console.log("총 "+duration+"초 걸렸고 속도는 "+ speed+unit+"/s");
		var container = document.getElementById(this.connection.peer);
		
		container.querySelector(".avatar-pic>.message").innerHTML = "";
		container.setAttribute("class", "avatar");					
		this.loader.stopAnimation();
		this.loader.destroyLoader();
		
		/*
		// 새로운 커넥션 핸들러를 가짐.
		this = new ConnectionHandler({
			'CHUNK_SIZE': 16000,  // 16000 byte per binary chunk
			'BLOCK_SIZE': 64, // 10 binary chunks per one block
			'userPeer':	this.peer
		});
		*/
	}.bind(this));
	
	this.on('blockTransfered', function(blockIndex) {
		// 블록이 저장될 때 마다 현재 평균속도에 따른 남은 시간을 업데이트해준다.
		this.transferEnd = Date.now();

		var timeDiff = this.transferEnd - this.transferStart;
		var processor = this.fileSaver || this.fileSender;
		var totalSize = processor.fileInfo.size;
		var progression = this.getProgress();

		var transferVelocity = (progression * totalSize) / timeDiff;
		var remainTime = ((1-progression)*totalSize)/transferVelocity;
		remainTime = Math.floor(remainTime/1000);
		var expression;
		if(remainTime < 60) {
			expression = remainTime + "s";
		} else if (remainTime < 3600) {
			if(remainTime%60 > 0)
				expression = Math.floor(remainTime/60) + "m " + remainTime%60 + "s";
			else 
				expression = Math.floor(remainTime/60) + "m";
		} else if (remainTime < (3600*24)) {
			if(remainTime%3600 > 0)
				expression = Math.floor(remainTime/3600) + "h "+ Math.floor((remainTime%3600)/60) + "m";
			else
				expression = Math.floor(remainTime/3600) + "h";
		} else if (remainTime < (3600*24)*7) {
			expression = Math.floor(remainTime/(3600*24)) + "d";
		} else {
			expression = "∞";
		}
		//console.log("남은시간 " +remainTime + " 초");
		// connectionHandler 에서 알 수 있는 상대방 ID에 대해 남은 초를 표시할 엘리먼트를 얻고 이의 내용을 업데이트 해준다.
		var container = document.getElementById(this.connection.peer);
		container.querySelector(".avatar-pic>.message").innerHTML = expression;

	}.bind(this));
};

DataController.prototype._handleMessage = function(message) {
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
				var chunkSize = message.chunkSize;
				var blockSize = message.blockSize;
				this.fileSaver.setFile(fileInfo, chunkSize, blockSize);
				break;
			case "requestBlock":  // 수신자가 보낸 요청 블록 정보가 도착했다. 이를 통해 현재 블록전송 콘텍스트를 초기화 한다.
				console.log("[Connection : _handleMessage] incoming message requestBlock");
				console.log("blockIndex : " + message.blockIndex);	
				var blockIndex = message.blockIndex;
				
				this.fileSender.initBlockContext(blockIndex);
				// 보내는 쪽의 전송시작 이벤트 
				if(blockIndex == 0) {
					this.emit('transferStart');
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

DataController.prototype.askOpponent = function(file) {
	console.log("메타 정보 보내기");
	this.connection.send({
		  "kind": "fileInfo"
		, "fileInfo": {
			"lastModifiedDate": file.lastModifiedDate,
			"name": file.name,
			"size": file.size,
			"type": file.type
		}
		, "chunkSize": this.CHUNK_SIZE
		, "blockSize": this.BLOCK_SIZE
	});
};

// 수락 메시지 전송. "이제 블록을 보내라"
DataController.prototype.requestBlockTransfer = function() {
	if(this.connection && this.connection.open===true) {	
		this.fileSaver.blockTranferContext.blockIndex = this.fileSaver.getNextBlockIndexNeeded();
		this.connection.send({
			"kind": "requestBlock",
			"blockIndex": this.fileSaver.blockTranferContext.blockIndex
		});
		
		// 받는 쪽의 전송시작 이벤트 
		if(this.fileSaver.blockTranferContext.blockIndex == 0)
			this.emit('transferStart');
	}
};