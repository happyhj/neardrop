// Connect to PeerJS, have server assign an ID instead of providing one
// Showing off some of the configs available with PeerJS :).
var peer = new Peer({
  // Set API key for cloud server (you don't need this if you're running your
  // own.
  key: 'lwjd5qra8257b9',

  // Set highest debug level (log everything!).
  // debug: 3,

  // Set a logging function:
  // logFunction: function() {
  //   var copy = Array.prototype.slice.call(arguments).join(' ');
  //   $('.log').append(copy + '<br>');
  // }
});

// 연결된 peer들.
var connectedPeers = {};


// Show this peer's ID.
// 현재 peer의 id를 보여준다.
peer.on('open', function(id) {
	var meEl = document.querySelector('.me > .node');
	meEl.innerText += ": " + id;
});

// Await connections from others
// 다른 peer의 connection을 기다린다. connect함수가 callback
peer.on('connection', connect);


// Handle a connection object.
// connection 객체를 처리하기 위한 함수
function connect(c) {

	if (c.label === 'file') {
		// c(connection)객체에 data 이벤트가 발생시 callback 호출
		// callback 함수는 file을 다운받는 내용을 담고 있음
		// var answer = confirm(c.peer + '에 파일을 보낼까요?');

		c.on('data', function(data) {
			// If we're getting a file, create a URL for it.
			if (data.constructor === ArrayBuffer) {
				var dataView = new Uint8Array(data);
				var dataBlob = new Blob([dataView]);
				var url = window.URL.createObjectURL(dataBlob);

				var down = document.querySelector('.me .file');
				// debugger;
				down.innerHTML = '<div><span class="file">' + c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>';
				// $('#' + c.peer).find('.messages').append('<div><span class="file">' + c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>');
			}
		});
  }
}

// dom이 생성되면 함수를 호출함, .ready는 jqeury 메소드
window.addEventListener('DOMContentLoaded', function(e) {
	// Prepare file drop box.
	// 파일을 받을 수 있는 박스를 준비함.
	// var box = $('#box');
	var others = document.querySelector('.others');

	// dragenter 및 dragover 이벤트에서는 무시
	others.addEventListener('dragenter', doNothing, false);
	others.addEventListener('dragover', doNothing, false);


	// drop 했을 경우만 작동되는 callback 등록
	// file과 관련된 이벤트 함수
	for (var i=0, len=others.children.length; i<len; i++) {
		var node = others.children[i];

		node.addEventListener('drop', function (e){
			// originalEvent는 native event를 가리킴
			e.preventDefault();
			// debugger;

			// ?? 기본 drop 이벤트에서 dataTransfer 속성이 무엇인지 찾아봐야함.
			var file = e.dataTransfer.files[0];


			// eachActiveConnection을 호출
			// eachActiveConnection에서 callback을 호출함.
			eachActiveConnection(function(c) {

				// 내부 connection이 file인 경우 file을 전달함.
				if (c.label === 'file') {
					c.send(file);
					console.log("전송중");
					// $c.find('.messages').append('<div><span class="file">You sent a file.</span></div>');
				}
			});

		});
	}


	// e.preventDefault() / 브라우저의 기본 이벤트 작동 무효화
	// e.stopPropagation() / 사용자 액션에 의한 이벤트 전파 무효화
	function doNothing(e){
		e.preventDefault();
		e.stopPropagation();
	}

	// Connect to a peer
	// #connect를 click 했을 때

	var nodeConnBtn = document.querySelectorAll('.others .conn');
	for (var i=0, len=nodeConnBtn.length; i<len; i++) {
		var node = nodeConnBtn[i];

		node.addEventListener('click', function(evt) {

				var el = evt.target.parentNode.firstElementChild;
				// 연결할 상대 peer의 id를 가져옴
				requestedPeer = el.value;

				// 연결되지 않았던 peer의 경우
				if (requestedPeer != "" && !connectedPeers[requestedPeer]) {
									
					// file 이름을 가진 connection 생성
					var f = peer.connect(requestedPeer, { label: 'file' });

					// open 이벤트 발생시 connect 함수 호출
					f.on('open', function() {
						connect(f);
					});

					// error 이벤트 발생시 err 경고
					f.on('error', function(err) { alert(err); });

					// chat과 file connection을 모두 생성했다면 connectedPeers에 id key값에 1을 넣음
					connectedPeers[requestedPeer] = 1;

				}

				
			}, false);
	}


		
	// });

	
	// Close a connection.
	// close ele 클릭시 callback 호출
	// callback 함수는 eachActiveConnection을 호출하고 connection을 담은 callback을 호출함
	var nodeCloseBtn = document.querySelectorAll('.others .close');
	for (var i=0, len=nodeCloseBtn.length; i<len; i++) {
		var node = nodeCloseBtn[i];

		node.addEventListener('click', function(evt) {

			eachActiveConnection(function(c) {
      			c.close();
    		}, false);

		});
	}
	

  
	// Goes through each active peer and calls FN on its connections.
	// 각각 활동중인 peer에게 fn이 호출되도록 함.
	// ++ file을 전달하기 위한 함수인 것 같음
	function eachActiveConnection(fn) {

		// 현재 가지고 있는 peer의 속성이 담긴 div를 가지고 온다.
		// 현재 활동 중인 peer는 active 클래스를 가진다
		// var actives = $('.active');

		// 이래 each 함수를 호출했는지 여부를 확인하기 위한 객체
		// var checkedIds = {};

		// actives를 순회하며 callback을 수행한다.
		// actives.each(function() {
		// 나와 연결된 각각의 peerId를 가지고 온다.
		// var peerId = $(this).attr('id');
		var keys = Object.keys(connectedPeers);
		for (var i=0, len=keys.length; i<len; i++) {
			var peerId = keys[i];
			var conn = peer.connections[peerId][0];
			fn(conn);
		}

	}


	


}, false);


// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};