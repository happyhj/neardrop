function DataConnection(peerId) {
	if (!(this instanceof DataConnection)) return new DataConnection(arguments);
	EventEmitter.call(this);

	this.peer = peerId;
	this.dataChannel = null;
	this.playConn = null;

	this.init();
};
inherits(DataConnection, EventEmitter);

DataConnection.prototype.init = function() {

};

DataConnection.prototype.setDataChannel = function(dataChannel) {
	if (dataChannel === null) return;

	dataChannel.on("message", function(message) {
		if(message.type === "text") {
			var result = JSON.parse(message.data);
			this.emit('data', result);
		} else {
			var blob = message.blob;
			var reader = new FileReader();
			reader.onload = function(event){
				var arrayBuffer = event.target.result;
				this.emit('data', arrayBuffer);
			}.bind(this);
			
			reader.readAsArrayBuffer(blob);
		}
	}.bind(this));

	this.dataChannel = dataChannel;
};

DataConnection.prototype.setPlayConn = function(playConn) {
	if (playConn === null) return;
	// 내가 종료될 때
	playConn.on("disconnectChannel", function() {
		this.emit("close");
	}.bind(this));

	this.playConn = playConn;

	// dataChannel의 onMessage 설정과 playConn 설정이 완료된 상태를
	// open된 상태라고 한다.
	this.emit('open');
};

DataConnection.prototype.send = function(data) { // [peerjs] You can send any type of data, including objects, strings, and blobs.
	var payload;
	if (data instanceof ArrayBuffer) {
		var chunkFile = new File( [data] , {type: 'application/octet-binary'});
		payload = chunkFile;
	} else {
		var serialized = JSON.stringify(data);
		console.log(serialized);
		payload = serialized;
	}
	
	this.playConn.dataSend(payload);
};

DataConnection.prototype.close = function() {
	console.log("close");
	// 사설 채널 폐기
	this.playConn.deleteChannel();
	this.emit('close');
};

