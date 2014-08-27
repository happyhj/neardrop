

// Create a peer 
var peer = new Peer({key: '4uur7cd24jzwipb9'}); 
var connection;
// You can pick your own id or omit the id if you want to get a random one from the server.
var receivedBlobMap = [];
var receivedFileInfo = {};
var blobMap = [];

/*
// 나의 Peer ID를 확보하면 open 이벤트 발생
peer.on('open', function(id){
	postMessage({
		"status": "initConnection",
		"id": id,
	});
});

// 상대방의 Peer ID로의 접속을 만들어내면 connection 이벤트 발생 
peer.on('connection', function(conn) {
	connection = conn;
	initConnectionHandler(connection);
});


function initConnectionHandler(conn) {
	conn.on('open', function(){
		postMessage({
			"status": "openConnection",
			"peerId": conn.peer,
		});
	});	
	conn.on('close', function(){
		postMessage({
			"status": "closeConnection",
		});
	});		
	conn.on('data', function(data){
		if(data.index) { // 파일의 데이터를 받은거임 
			receivedBlobMap[data.index] = data.arrayBuffer;
			// 다 받았는지 확인.
			if(receivedBlobMap.length == receivedFileInfo.totalChunk) {
				log("쳥크 다바다따!");
				postMessage({
					"status": "receiveFinished",
					"blobMap": receivedBlobMap
				});					
			}
		}
		else { // 파일의 메타정보를 받은거임 
			postMessage({
				"status": "metaInfoReceived",
				"fileInfo": data.fileInfo
			});			
		}
	});
}

onmessage = function(e) {
    switch (e.data.cmd) {
      case 'makeConnection':
      	var peerId = e.data.peerId;
      	connect(peerId);
        break;
      case 'sendChunk':
      	blobMap = e.data.blobMap;
      	sendFileData();
        break;
      case 'sendMetaInfo':
      	var meta = e.data.metaInfo;
      	sendFileInfo(meta);
        break;
    }
};

function sendFileInfo(meta){
	if(connection && connection.open===true) {
		connection.send({
			"fileInfo": meta
		});
	}
}


// 상대방과 연결을 맺기 
function connect(peer_id){
	// Connection을 요청한다.
	connection = peer.connect(peer_id);
	// 커넥션이 맺어졌을때의 콜백 
	initConnectionHandler(connection);
}

function sendFileData() {
	for(var i in blobMap) {
		var reader = new FileReader();
		reader.onload = (function(arrayBufferIndex, event) {
			log("파일데이터 보내기 : "+arrayBufferIndex);
		    var arrayBuffer = event.target.result; // data는 ArrayBuffer 이다
			// ArrayBuffer 를 통째로 파일데이터 chunk 전송에 사용한다.
			sendChunk(arrayBuffer,arrayBufferIndex);
			postMessage({
				"status": "progress",
				"current": arrayBufferIndex,
				"total": blobMap.length
			});
			if(arrayBufferIndex + 1 === blobMap.length) {
				postMessage({
					"status": "finished"
				});				
			}
		}).bind(this,i);
		
		var chunkBlob = blobMap[i];
		reader.readAsArrayBuffer(chunkBlob);
	}
}

function sendChunk(arrayBuffer,index){
	if(connection && connection.open===true) {
		connection.send({
			"arrayBuffer": arrayBuffer,
			"index": index
		});
	}
}

*/
function log(message) {
	postMessage({
		"status": "log", 
		"message": message
	}); 	
}
