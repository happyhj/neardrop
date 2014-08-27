var CHUNK_SIZE;

var blobMap = [];
var motherBlob
	,totalChunk;

self.onmessage = function(e) {
    switch (e.data.cmd) {
      case 'initChunkSize':
      	self.CHUNK_SIZE = e.data.chunkSize;
        break;
      case 'sliceBlob':
      	motherBlob = e.data.blob;
      	totalChunk = e.data.totalChunk;
      	buildBlobMap(motherBlob);
        break;
    }
};

function buildBlobMap(file) {
	var size = file.size;
	// 1024 byte 단위로 잘라서 blob map을 만든다.
	for(var i =0 ; i < size/CHUNK_SIZE ; i++ ) {
		var chunkBlob = sliceBlob(file,i*CHUNK_SIZE,(i+1)*CHUNK_SIZE);
		blobMap.push(chunkBlob);
		postMessage({
			"status": "progress",
			"current": blobMap.length,
			"total": totalChunk
		}); 
		if(blobMap.length === totalChunk) {
			postMessage({
				"status": "finished", 
				"blobMap": blobMap
			});
		}
	}
}

function sliceBlob(blob, start, end, type) {
    type = type || blob.type;
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
}

function log(message) {
	postMessage({
		"status": "log", 
		"message": message
	}); 	
}