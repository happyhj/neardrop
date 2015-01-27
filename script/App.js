// Global Variables
var CHUNK_SIZE = 160000;
var BLOCK_SIZE = 8;

function App() {
	this.init();
	this.initListeners();	
}

App.prototype.init = function() {
	this.dataController = new DataController({
		'CHUNK_SIZE': CHUNK_SIZE,  // 16000 byte per binary chunk
		'BLOCK_SIZE': BLOCK_SIZE, // 64 binary chunks per one block
	});
	this.userController = new UserController({url: 'http://neardrop.heej.net/nearbyuser.php'});
		
	this.uiController = new UIController();
};

App.prototype.initListeners = function() {
	// 컨트롤러간에 정보가 오가는 경우 이 곳에서 처리한다
	this.userController.on('peerCreated', function(peer) {
		this.dataController.setPeer(peer);
	}.bind(this));
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
			this.dataController.connect(opponent, file);
		}.bind(this);

		var noCallback = function(){ // NO 를 눌렀을 경우 실행하는 함수.
			this.dataController.sendRefusal();
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

	this.dataController.on('fileSavePrepared', function(file) {
		// 내가 받는 측이므로 수신수락에 대한 질문을 한다.
		var opponentId = this.dataController.connection.peer;
		var opponent = this.userController.neighbors[opponentId]

		// 수락한다면 바로 달라고 요청을 보낸다. 
		var yesCallback = function(){ // YES 를 눌렀을 경우 실행하는 함수.
			this.dataController.transferStart = Date.now();
			this.dataController.requestBlockTransfer();
			this.uiController.setFileInfo(file);
		}.bind(this);
		
		var noCallback = function(){ // NO 를 눌렀을 경우 실행하는 함수.
			this.dataController.sendRefusal();
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
	
	this.dataController.on('fileSendPrepared', function(fileInfo) {
		this.uiController.setFileInfo(fileInfo);
	}.bind(this));

	this.dataController.on('showProgress', function(peer, dir) {
		this.uiController.setProgressSource(this.dataController);
		this.uiController.showProgress(peer, dir);
	}.bind(this));

	this.dataController.on('updateProgress', function(progress) {
		this.uiController.updateProgress(progress);
	}.bind(this));

	this.dataController.on('transferEnd', function() {
		this.uiController.transferEnd();
	}.bind(this));
}
