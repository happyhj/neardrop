(function(window) {
	'use strict';
	var document = window.document;
	var console = window.console;
	var IndexedChunkUtil = window.IndexedChunkUtil || {};
	var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;


	function IndexedChunkUtil {
		
	}
	
	IndexedChunkUtil.prototype.insertIndexBuffer = function(dataBuffer, chunkIndex) {
		var indexBuffer = new ArrayBuffer(4);
		var indexBufferDataView = new DataView(indexBuffer);
		indexBufferDataView.setUint32(0,chunkIndex);	
		return appendBuffer(indexBuffer,dataBuffer);
	};
	
	IndexedChunkUtil.prototype.extractChunkIndex = function(buffer) {
		var indexBufferDataView = new DataView(buffer);
		return indexBufferDataView.getUint32(0);
	};
	IndexedChunkUtil.prototype.extractPayloadBuffer = function(buffer) {
		return buffer.slice(4);
	};
	
	IndexedChunkUtil.prototype._appendBuffer = function(buffer1, buffer2) {
	  var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
	  tmp.set( new Uint8Array( buffer1 ), 0 );
	  tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
	  return tmp.buffer;
	}

	var instance = new IndexedChunkUtil();
	
	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = instance;
		// browser export
	} else {
		window.IndexedChunkUtil = instance;
	}    	

}(this));