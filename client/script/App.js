function App() {
	this.init();	
}

App.prototype.init = function() {

	// 가장 아랫단부터 생성
	this.dataController = new DataController({
		'CHUNK_SIZE': CHUNK_SIZE,  // 16000 byte per binary chunk
		'BLOCK_SIZE': BLOCK_SIZE, // 64 binary chunks per one block
	});
	this.userController = new UserController({url: 'http://www.heej.net/2014/airdropbox/nearbyuser.php'});
	this.uiController = new UIController();

	// 컨트롤러간에 정보가 오가는 경우 이 곳에서 처리한다
	this.userController.on('peerCreated', function(peer) {
		this.dataController.setPeer(peer);
	});
	this.userController.on('adduser', this.uiController.addAvatar);
	this.userController.on('removeuser', this.uiController.removeAvatar);
	this.uiController.on('fileDropped', function(e) {
		// 파일 전송 시작 처리를 하는 부분	
		// confirm 으로 파일의 정보를 보여주면서 전송할래? 물어보고 응이라고 응답하면 
		console.log("파일을 드롭하셨군요");

		var targetEl = e.target.parentNode;
		var file = e.dataTransfer.files[0];
		var opponent = this.userController.getNeighborByEl(targetEl);
		
		var yesCallback = function(){ // YES 를 눌렀을 경우 실행하는 함수.
			this.dataController.connect(opponent, file);
		}.bind(this);
		
		// ???
		this.uiController.confirmPopup.open({
			templateSelector: "#confirm-popup-template-sender",
			opponentName: opponent.name,
			fileName: file.name,
			fileSize: Math.floor(file.size/1024),
			fileType: file.type,
			yesCallback: yesCallback
		});
	}.bind(this));
	
	this.dataController.on('fileSavePrepared', function(fileInfo) {
		// 내가 받는 측이므로 수신수락에 대한 질문을 한다.
		var opponentId = this.dataController.connection.peer;
		var opponent = this.userController.neighbors[opponentId]

		// 수락한다면 바로 달라고 요청을 보낸다. 
		var yesCallback = function(){ // YES 를 눌렀을 경우 실행하는 함수.
			this.dataController.transferStart = Date.now();
			this.dataController.requestBlockTransfer();				
		}.bind(this);
		//debugger;
		this.uiController.confirmPopup.open({
			templateSelector: "#confirm-popup-template-receiver",
			opponentName: opponent.name,
			fileName: fileInfo.name,
			fileSize: Math.floor(fileInfo.size/1024),
			fileType: fileInfo.type,
			yesCallback: yesCallback
		});
			
	});

};

// Utils
var getSizeExpression = function(size) { // byte
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
	// 이후엔 단위가 없으므로 10,000 TB 라고라도 적어주어야 함
	result = Math.floor(result / 1024.0 * 10)/10;
	return result + "TB";
};
