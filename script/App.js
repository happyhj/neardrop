// Global Variables
var CHUNK_SIZE = 160000;
var BLOCK_SIZE = 8;

function App() {
	if(this.isWebRTCSupported()){
		this.init();
		this.initListeners();	
	} else {
		this.showUnsupportedContent();
	}
}
App.prototype.isWebRTCSupported = function() {
	return !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection;
};
App.prototype.showUnsupportedContent = function() {
	document.querySelector(".unsupportedContent").style.display = "block";	
}

App.prototype.init = function() {
	this.peerController = new PeerController({
		'CHUNK_SIZE': CHUNK_SIZE,  // 16000 byte per binary chunk
		'BLOCK_SIZE': BLOCK_SIZE, // 64 binary chunks per one block
	});
	this.userController = new UserController({url: 'http://neardrop.heej.net/nearbyuser.php'});
	// Phase 1 start
	this.uiController = new UIController();
};

App.prototype.initListeners = function() {
	// 컨트롤러간에 정보가 오가는 경우 이 곳에서 처리한다
	// if Phase 1 end, Phase 2 start
	this.uiController.on('templatesLoaded', function() {
		this.userController.connectPeerServer();
	}.bind(this));
	// if Phase 2 end, Phase 3 start
	this.userController.on('peerCreated', function(peer) {
		this.peerController.setPeer(peer);
		this.uiController.showUI();
		this.uiController.toast("Peer Created");
	}.bind(this));
	// 아래의 이벤트들은 반복적으로 실행될 이벤트들.
	this.userController.on('adduser', this.uiController.addAvatar.bind(this.uiController));
	this.userController.on('removeuser', this.uiController.removeAvatar.bind(this.uiController));
	this.uiController.on('fileDropped', function(e) {
		// 파일 전송 시작 처리를 하는 부분	
		// confirm 으로 파일의 정보를 보여주면서 전송할래? 물어보고 응이라고 응답하면 
		console.log("파일을 드롭하셨군요");

		var targetEl = e.target.parentNode;
		var file = e.dataTransfer.files[0];
		var opponent = this.userController.getNeighborByEl(targetEl);
		
		var yesCallback = function(){ // YES 를 눌렀을 경우 실행하는 함수.
			this.peerController.connect(opponent, file);
			this.uiController.toast("Waiting Opponent's response", 7000);
		}.bind(this);

		var noCallback = function(){ // NO 를 눌렀을 경우 실행하는 함수.
			console.log("파일 전송을 취소하였습니다.");
		}.bind(this);

		var fileNameTokens = file.name.split(".");
		var fileExtension = fileNameTokens.pop();
		var fileName = fileNameTokens.join(".");
				
		this.uiController.confirmPopup.open({
			template: this.uiController.confirmTemplateSender,
			opponentName: opponent.name,
			opponentPicture: opponent.image,
			fileName: fileName,
			fileExtension: fileExtension,
			fileType: file.type,
			fileSize: getSizeExpression(file.size),
			yesCallback: yesCallback,
			noCallback: noCallback
		});
			
	}.bind(this));

	this.peerController.on('fileSavePrepared', function(file) {
		// 내가 받는 측이므로 수신수락에 대한 질문을 한다.
		var opponentId = this.peerController.connection.peer;
		var opponent = this.userController.neighbors[opponentId]

		// 수락한다면 바로 달라고 요청을 보낸다. 
		var yesCallback = function(){ // YES 를 눌렀을 경우 실행하는 함수.
			// TODO: App이 DataController까지 접근하는건 좋지 않음
			this.peerController.dataController.requestBlockTransfer();
			this.uiController.setFileInfo(file);
		}.bind(this);
		
		var noCallback = function(){ // NO 를 눌렀을 경우 실행하는 함수.
			this.peerController.sendRefusal();
		}.bind(this);
		
		var fileNameTokens = file.name.split(".");
		var fileExtension = fileNameTokens.pop();
		var fileName = fileNameTokens.join(".");

		this.uiController.confirmPopup.open({
			template: this.uiController.confirmTemplateReceiver,
			opponentName: opponent.name,
			opponentPicture: opponent.image,
			fileName: fileName,
			fileExtension: fileExtension,
			fileType: file.type,
			fileSize: getSizeExpression(file.size),
			yesCallback: yesCallback,
			noCallback: noCallback
		});
			
	}.bind(this));
	
	this.peerController.on('fileSendPrepared', function(fileInfo) {
		this.uiController.setFileInfo(fileInfo);
	}.bind(this));

	this.peerController.on('opponentRefused', function() {
		this.uiController.toast("Opponent Refused");
	}.bind(this))

	this.peerController.on('showProgress', function(peer, dir) {
		this.uiController.setProgressSource(this.peerController.dataController);
		this.uiController.showProgress(peer, dir);
	}.bind(this));

	this.peerController.on('updateProgress', function(progress) {
		this.uiController.updateProgress(progress);
	}.bind(this));

	this.peerController.on('error', function(err) {
		this.uiController.toast("ERROR: "+err.type+" occured");
	}.bind(this));
	
	// 아예 Connection이 끊길 때 UI 변화를 주는 건 어떨까?
	this.peerController.on('close', function() {
		this.uiController.transferEnd();
	}.bind(this));
}
