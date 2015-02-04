/*! 
 * PLAYRTC. PLAYRTC is WebRTC SDK.
 * Copyright 2013, 2014 Heo Youngnam
 * 
 * project: PLAYRTC
 * version: 1.0.5.01
 * contact: cryingnavi@gmail.com
 * homepage: http://www.playrtc.com
 * Date: 2014-12-23 09:17 
 */

(function(factory){
	var Module = factory();
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = Module;
	}
	else{
		window.PlayRTC = Module;
	}
})(function(){

var PeerConnection = (function(){
	var PeerConnection = window.PeerConnection || 
		window.webkitPeerConnection00 || 
		window.webkitRTCPeerConnection || 
		window.mozRTCPeerConnection || 
		window.RTCPeerConnection;

	return PeerConnection;
})();

var NativeRTCSessionDescription = (function(){
	var nativeRTCSessionDescription = window.mozRTCSessionDescription || 
		window.RTCSessionDescription;

	return nativeRTCSessionDescription;
})();

var NativeRTCIceCandidate = (function(){
	var nativeRTCIceCandidate = window.mozRTCIceCandidate || 
		window.RTCIceCandidate;

	return nativeRTCIceCandidate;
})();

var UserMedia = (function (){
	var getUserMedia = navigator.getUserMedia || 
		navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || 
		navigator.msGetUserMedia;
	
	return getUserMedia;
})();

var URL = (function(){
	var URL = window.URL || 
		window.webkitURL || 
		window.msURL || 
		window.oURL;

	return URL;
})();


/**
 * PlayRTC.utils
 * @namespace {Object} utils
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var utils = { };

/**
 * 사용자 브라우저의 종류와 버전을 {name: "chrome", version: "38.0.2125.111"} 와 같은 형식으로 반환한다.
 * @member browser
 * @memberof utils
 * @example
	PlayRTC.utils.browser
	//{name: "chrome", version: "38.0.2125.111"}
 */
utils.browser = (function(){
	function getFirstMatch(regex) {
		var match = ua.match(regex);
		return (match && match.length > 1 && match[1]) || '';
	}
	
	var ua = navigator.userAgent,
		versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
		result = null;

	if(/chrome|crios|crmo/i.test(ua)){
		result = {
			name: 'chrome',
			version: getFirstMatch(/(?:chrome|crios|crmo)\/([\.1234567890]+)/i)
		};
	}
	else if (/opera|opr/i.test(ua)) {
		result = {
			name: 'opera',
			version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/]([\.1234567890]+)/i)
		};
	}
	else if(/msie|trident/i.test(ua)){
		result = {
			name: 'ie',
			version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
		};
	}
	else if(/firefox|iceweasel/i.test(ua)){
		result = {
			name: 'firefox',
			version: getFirstMatch(/(?:firefox|iceweasel)[ \/]([\.1234567890]+)/i)
		};
	}
	else if(/safari/i.test(ua)){
		result = {
			name: 'safari',
			version: versionIdentifier
		};
	}
	
	return result;
})();

/**
 * 사용자 단말기의 OS 정보를 문자열로 반환한다. 반환되는 문자열은 다음과 같다. "windows", "ios", "android", "mac", "linux"
 * @member platform
 * @memberof utils
 * @example
	PlayRTC.utils.platform
	//"windows", "ios", "android", "mac", "linux"
 */
utils.platform = (function(){
	var userAgent = navigator.userAgent.toLowerCase();
	var platform = navigator.platform;

	var iPhone = /iPhone/i.test(platform),
		iPad = /iPad/i.test(platform),
		iPod = /iPod/i.test(platform);

	var win = /win/i.test(platform),
		mac = /mac/i.test(platform),
		linux = /linux/i.test(platform),
		iOs = iPhone || iPad || iPod;

	var android = /android/i.test(userAgent);
	
	
	if(win){
		return "windows";
	}
	else if(iOs){
		return "ios";
	}
	else if(android){
		return "android";
	}
	else if(mac){
		return "mac";
	}
	else if(linux){
		return "linux";
	}
})();

/**
 * 자바스크립트에서 클래스간의 상속 구조를 만들어주는 메소드이다. 자식 클래스 지정시 initialize 메소드를 반드시 포함해야한다. 이는 자식클래스의 생성자 함수로 객체를 초기화하는데 사용된다.
 * @method Extend
 * @memberof utils
 * @param {Function} parentClass 부모 클래스를 지정한다.
 * @param {Object} childbClass 자식 클래스를 JSON Object 형태로 지정한다.
 * @example
	var ChildClass = PlayRTC.utils.Extend(PlayRTC.utils.Event, {
		initialize: function(config){
			//부모 생성자 호출
			ChildClass.base.initialize.call(this);
			
			this.age = config.age;
			this.name = config.name;
		},
		getName: function(){
			
		},
		getAge: function(){
			
		}
	});
	
	var c = new ChildClass({
		age: 50,
		name: "john"
	});
	
	console.log(c.getName());
	
	var GrandsonClass = ChildClass.Extend({
		initialize: function(config){
			//부모 생성자 호출
			GrandsonClass.base.initialize.call(this, config);
			
			this.sex = config.sex;
		},
		getSex: function(){
			return this.sex;
		}
	});
	
	var g = new GrandsonClass({
		age: 20,
		name: "jenny",
		sex: "female"
	});
	
	console.log(g.getName());
	console.log(g.getSex());
 */
utils.Extend = function(sp, proto){
	var sb = function(){
		var args = Array.prototype.slice.call(arguments);
		this.initialize.apply(this, args);
	};

	var F = function(){ },
		spp = sp.prototype;

	F.prototype = spp;
	sb.prototype = new F();
	sb.prototype.constructor = sb;
	sb.base = spp;

	if (proto){
		for(var attr in proto){
			sb.prototype[attr] = proto[attr];
		}
	}

	sb.Extend = function(proto){
		var sp = this;
		return utils.Extend(sp, proto);
	};

	return sb;
};


var BaseKlass = function(){ };

/**
 * 객체에 사용자 정의 이벤트를 등록하고 이를 트리거 할 수 있도록 한다. PlayRTC SDK 에선 모든 클래스의 최상위 부모 클래스로서 존재한다. 
 * @method Event
 * @memberof utils
 * @example
	var ChildClass = PlayRTC.utils.Extend(PlayRTC.utils.Event, {
		initialize: function(config){
			//부모 생성자 호출
			ChildClass.base.initialize.call(this);
		},
		...
	});
	
	var obj = new ChildClass();
	
	//이벤트 등록
	obj.on("customEvent", function(){ }, window);
	
	//특정 이벤트 삭제
	obj.on.off("customEvent", function(){ }, window);
	
	//이벤트 발생
	obj.fire("customEvent", "someData", "someData", "someData", "someData", "someData" ....);
	
	//이벤트 전체 삭제
	obj.clear();
	
	//이벤트 유무 검사
	obj.hasEvent("customEvent"); //true 또는 false
 */
utils.Event = utils.Extend(BaseKlass, {
	initialize: function(){
		this.listeners = { };
	},
	on: function(name, callback, context){
		this.listeners || (this.listeners = { });
		var listeners = this.listeners[name] || (this.listeners[name] = [ ]);
		listeners.push({
			callback: callback,
			context: context
		});
		return this;
	},
	off: function(name, callback, context){
		var retain, ev, listeners, names = [], i, l, j, k;
		if (!name && !callback && !context) {
			this.listeners = void 0;
			return this;
		}

		if (listeners = this.listeners[name]) {
			this.listeners[name] = retain = [];
			if (callback || context) {
				for (j = 0, k = listeners.length; j < k; j++) {
					ev = listeners[j];
					if ((callback && callback !== ev.callback) ||
							(context && context !== ev.context)) {
						retain.push(ev);
					}
				}
			}
			if (!retain.length) {
				delete this.listeners[name];
			}
		}

		return this;
	},
	fire: function(name){
		if (!this.listeners){
			return this;
		}

		var args = Array.prototype.slice.call(arguments, 1),
			listeners = this.listeners[name],
			i = -1

		if (listeners){
			var len = listeners.length;
			switch (args.length) {
				case 0: 
					if(len === 1){
						return (ev = listeners[0]).callback.call(ev.context);
					}
					else{
						while (++i < len){ 
							(ev = listeners[i]).callback.call(ev.context);
						}
						return this;
					}
				default:
					if(len === 1){
						return (ev = listeners[0]).callback.apply(ev.context, args);
					}
					else{
						while (++i < len){
							(ev = listeners[i]).callback.apply(ev.context, args);
						}
						return this;
					}
			}
		}

		return this;
	},
	clear: function(){
		this.listeners = { };
	},
	hasEvent: function(name){
		if(this.listeners[name]){
			return true;
		}
		
		return false;
	}
});


/**
 * 객체 확장하기 위해 두번째 인자로 받은 객체를 첫번째 인자로 받은 객체에 더하고 이를 반환한다. 
 * @method apply
 * @memberof utils
 * @param {Object} target 새 속성을 받을 객체를 지정한다.
 * @param {Object} copy 추가 속성을 가진 객체를 지정한다.
 * @return {Object} target 확장된 객체를 반환한다.
 * @example
 	var target = {
 		age: 50,
 		name: "john"
 	};
 	
 	var copy = {
 		sex: "male",
 		tall: 180,
 		weight: 100
 	};
 	
 	var obj = PlayRTC.utils.apply(target, copy);
 	console.log(obj);
 	
 	var target = {
 		age: 50,
 		name: "john",
 		family: {
 			age: 20,
 			name: "jenny"
 		}
 	};
 	
 	var copy = {
 		sex: "male",
 		tall: 180,
 		weight: 100,
 		family: {
 			age: 20,
 			name: "jenny",
 			tall: 170,
 			weight: 60
 		}
 	};
 	
 	var obj = PlayRTC.utils.apply(target, copy);
 	console.log(obj); 	
 */
utils.apply = function(target, copy){
	if(!target || !copy){
		throw new Error("Failed to execute 'apply' on 'utils': 2 arguments required, but only " + arguments.length + " present.");
	}
	
	if(typeof copy === "object"){
		if(typeof target === "number" || typeof target === "boolean" || typeof target === "string"){
			target = copy;
			return target;
		}
	}

	var attr = null;
	for(attr in copy){
		if(typeof copy[attr] === "object" && copy[attr] && !copy[attr].hasOwnProperty("length")){
			target[attr] = utils.apply(target[attr] || { }, copy[attr]);
		}
		else{
			target[attr] = copy[attr];
		}
	}
	return target;
};

/**
 * 자바스크립트 함수 실행시 context 의 변경을 방어하기 위해 함수의 context 를 강제한다.
 * @method bind
 * @memberof utils
 * @param {Function} fn this 를 강제할 함수를 지정한다.
 * @param {Object} context 함수의 this 가 가르킬 객체를 지정한다.
 * @example
	PlayRTC.utils.bind(function(){
		console.log(this === window); //true 반환
	}, window);
 */
utils.bind = function(fn, context){
	if(!fn || !context){
		throw new Error("Failed to execute 'bind' on 'utils': 2 arguments required, but only " + arguments.length + " present.");
	}
	return function(){
		fn.apply(context, Array.prototype.slice.call(arguments));
	};
};

/**
 * 파일을 로컬에 다운로드 한다. DataChannel 을 통해 받은 파일을 로컬에 저장하고 싶을 때나, 레코딩한 오디오/비디오를 저장하고 싶을 때 사용할 수 있다.
 * @method fileDownload
 * @memberof utils
 * @param {Blob} blob 파일로 저장할 blob 객체를 지정한다.
 * @param {String} fileName 해당 파일의 파일 이름을 명시한다.
 * @example
	//레코딩한 결과를 저장할 경우
	//1. 레코딩 시작
	conn.getMedia().record("video");
	
	//2. 레코딩 중단
	conn.getMedia().recordStop(function(blob){ 
	 	//3. video 의 경우 레코딩 다운로드
	 	PlayRTC.utils.fileDownload(blob, "localVideo.webm");
	});
	
	//DataChannel 을 통해 파일을 받았을 경우
	var dc = peer.getDataChannel();
	dc.on("message", function(message){
		if(message.type === "file"){
			PlayRTC.utils.fileDownload(message.blob, message.fileName);
		}
	});
 */
utils.fileDownload = function(blob, fileName){
	var doc = document,
		link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
		event = doc.createEvent("MouseEvents");
	
	link.href = URL.createObjectURL(blob);
	link.download = fileName;

	event.initEvent("click", true, false);
	link.dispatchEvent(event); 
};

/**
 * 비디오 태그를 대신 생성하여 반환해준다. 두번째 인자로 video 태그에 대한 속성을 객체로 지정할 수 있다.
 * @method createVideo
 * @memberof utils
 * @param {MediaStream} stream 비디오 엘리먼트가 표현할 스트림
 * @param {Object} config 비디오 엘리먼트의 속성을 명시한다. { autoPlay: true, controls: true, width: "100%", height: "100%" } 가 기본값이며 이를 오버라이드 할 수 있다.
 * @return {VideoElement} video 비디오 엘리먼트를 생성하여 반환한다.
 * @example
	conn.on("addLocalStream", function(stream){
		var video = PlayRTC.utils.createVideo(stream, {
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(video);
	});
	
	conn.on("addRemoteStream", function(peerid, userid, stream){
		var video = PlayRTC.utils.createVideo(stream, {
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(video);
	});
 */
utils.createVideo = function(stream, config){
	var defaultConfig = {
		autoPlay: true,
		controls: true,
		width: "100%",
		height: "100%"
	},
	video = document.createElement("video");

	config = config || {};
	
	defaultConfig = utils.apply(defaultConfig, config);
	
	if(defaultConfig.controls){
		video.setAttribute("controls", true);
	}
	
	if(defaultConfig.autoPlay){
		video.setAttribute("autoPlay", true);
	}

	video.setAttribute("width", defaultConfig.width);
	video.setAttribute("height", defaultConfig.height);
	
	video.src = utils.createObjectURL(stream);

	return video;
};

/**
 * 오디오 태그를 대신 생성하여 반환해준다. 두번째 인자로 audio 태그에 대한 속성을 객체로 지정할 수 있다.
 * @method createAudio
 * @memberof utils
 * @param {MediaStream} stream 오디오 엘리먼트가 표현할 스트림
 * @param {Object} config 오디오 엘리먼트의 속성을 명시한다. { autoPlay: true, controls: true, width: "100%", height: "100%" } 가 기본값이며 이를 오버라이드 할 수 있다.
 * @return {AudioElement} audio 오디오 엘리먼트를 생성하여 반환한다.
 * @example
	conn.on("addLocalStream", function(stream){
		var audio = PlayRTC.utils.createAudio(stream{
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(audio);
	});
	
	conn.on("addRemoteStream", function(peerid, userid, stream){
		var audio = PlayRTC.utils.createAudio(stream{
			autoPlay: true,
			controls: false, //오버라이드 할 수 있다.
			width: "100%",
			height: "100%"
		});
		document.getElementById("container").appendChild(audio);
	});
 */
utils.createAudio = function(stream, config){
	var defaultConfig = {
		autoPlay: true,
		controls: true
	},
	audio = document.createElement("audio");
	
	config = config || {};
	
	defaultConfig = utils.apply(defaultConfig, config);
	
	if(defaultConfig.controls){
		audio.setAttribute("controls", true);
	}
	
	if(defaultConfig.autoPlay){
		audio.setAttribute("autoPlay", true);
	}
	
	audio.src = utils.createObjectURL(stream);

	return audio;
};

/**
 * URL.createObjectURL 메소드를 이용하여 파일 객체나 데이터의 참조를 가리키는 객체 URL 을 생성하여 반환한다.
 * @method createObjectURL
 * @memberof utils
 * @param {MediaStream} stream 오디오 엘리먼트가 표현할 스트림
 * @return {String} 파일 객체나 데이터의 참조를 가리키는 객체 URL 을 생성하여 반환한다.
 * @example
	conn.on("addLocalStream", function(stream){
		var url = PlayRTC.utils.createObjectURL(stream);
		console.log(url);

		return false;
	});
 */
utils.createObjectURL = function(stream){
	return URL.createObjectURL(stream);
};

utils.blobWorkerSupport = (function(){
	var javascript = function(e){ }.toString(),
		blob = new Blob([
			"this.onmessage = " + javascript
		], {
			type: "application/javascript"
		});

	try{	
		blob = URL.createObjectURL(blob);
		var w = new Worker(blob);
		URL.revokeObjectURL(blob);
		
		return true;
	}
	catch(e){
		return false;
	}
})();
 
utils.mediaRecorderSupport = function(stream){
	try{
		new MediaRecorder(stream);
		utils.mediaRecorderSupport = true;
	}
	catch(e){
		utils.mediaRecorderSupport = false;
	}
};

/**
 * 사용자의 브라우저가 dataChannel 을 지원하는지 여부를 반환한다.
 * @method dataChannelSupport
 * @memberof utils
 * @return {Boolean} data dataChannel 을 지원한다면 true, 아니면 false를 반환한다.
 * @example
	console.log(utils.dataChannelSupport());
 */
utils.dataChannelSupport = (function(config){
	try {
		var pc = new PeerConnection(config, {
			optional: [{RtpDataChannels: true}]
		}),
		data = true,
		ch = null;
	
		try {
			ch = pc.createDataChannel("_support");
			ch.close();
		}
		catch(e){
			data = false;
			Logger.info("cdm", {
				tag: "utils",
				message: "DataChannel is not supported."
			});
		}
	}
	catch(e){
		data = false;
		Logger.info("cdm", {
			tag: "utils",
			message: "DataChannel is not supported."
		});
	}

	return data;
})();

/**
 * 사용자 단말기에서 미디어 장치를 지원하는지 여부를 반환한다.
 * @method userMediaSupport
 * @memberof utils
 * @example
	PlayRTC.utils.userMediaSupport();
 */
utils.userMediaSupport = !!UserMedia || false;

/**
 * 로컬 DB 에 저장되어 있는 로그를 로컬에 텍스트 파일로 다운로드 한다. 해당 기능은 향우 좀더 유용한 형태로 보완될 예정이다.
 * @method exportLog
 * @memberof utils
 * @example
	PlayRTC.utils.exportLog();
 */
utils.exportLog = function(){
	Logger.db.exportLog();
};

/**
 * 페이지에 로그 뷰를 활성화시킨다. 해당 기능은 향우 좀더 유용한 형태로 보완될 예정이다.
 * @method monitorLogShow
 * @memberof utils
 * @deprecated since version 1.0.4
 * @example
	PlayRTC.utils.monitorLogShow();
 */
utils.monitorLogShow = function(){
	Logger.monitor.show();
};


/**
 * 페이지에 로그 뷰를 활성화시킨다. 해당 기능은 향우 좀더 유용한 형태로 보완될 예정이다.
 * @method debugViewShow
 * @memberof utils
 * @example
	PlayRTC.utils.debugViewShow();
 */
utils.debugViewShow = function(){
	Logger.monitor.show();
};

/**
 * 활성화 되어 있는 로그뷰를 감춘다.
 * @method monitorLogHide
 * @memberof utils
 * @deprecated since version 1.0.4
 * @example
	PlayRTC.utils.monitorLogHide();
 */
utils.monitorLogHide = function(){
	Logger.monitor.hide();
};

/**
 * 페이지에 로그 뷰를 활성화시킨다. 해당 기능은 향우 좀더 유용한 형태로 보완될 예정이다.
 * @method debugViewHide
 * @memberof utils
 * @example
	PlayRTC.utils.debugViewHide();
 */
utils.debugViewHide = function(){
	Logger.monitor.hide();
};

/**
 * 간단한문자열 포맷을 위한 메소드이다.
 * @method strFormat
 * @memberof utils
 * @example
	var str = PlayRTC.utils.strFormat("{0} {1}", "Hello", "World!");
	console.log(str);
 */
utils.strFormat = function(str){
	var args = arguments,
		len = args.length,
		reg = null,
		i = 0;
	
	for(; i<len; i++){
		reg = new RegExp('\\{' + i + '\\}', 'g');
		str = str.replace(reg, args[i + 1]);
	}
	return str;
};

var SDK_ERROR_CODE = {
	//Media
	"M4001": "Unsupported media",
	"M4002": "Don't accept media",
	
	//Helper
	"C4101": "Failed allocate channel",
	
	//Channel
	"C4201": "Failed to connect channel's server",
	"C4202": "Already disconnected channel's server",
	"C4203": "Invalid authentication of channel",
	"C4204": "Invalid channel id",
	"C4205": "Channel error",
	
	//Signal(PlayRTC)
	"S4301": "Failed to connect signal's server",
	"S4302": "Already disconnected signal's server",
	"S4303": "Invalid authentication of signal",
	"S4304": "Invalid channel id",
	"S4305": "Signal error",
	
	//Signal(NAG)
	"S4401": "Invalid authentication of signal",
	"S4402": "Failed to connect signal's server",
	"S4403": "Already disconnected signal's server",
	"S4404": "Failed to create sdp",
	"S4405": "Failed to register sdp",
	"S4406": "Failed to register candidate",
	"S4407": "Signal error",
	"S4408": "No answer",
	
	//P2P
	"P4501": "Failed P2P"
};

var SERVER_CODE = {
	20001: "SUCCESS",
	40001: "MESSAGE_SYNTAX_ERROR",
	40101: "PROJECTID_INVALID",
	40102: "TOKEN_INVALID",
	40103: "TOKEN_EXPIRED",
	40104: "CHANNELID_INVALID",
	40105: "PEERID_INVALID",
	40106: "UNKNOWN_CONNECTION",
	40107: "UNKNOWN_COMMAND"
};

var SERVER_STATE_CODE = {	
	50201: "SGL_BEGIN",
	50202: "SGL_LOCAL_MEDIA",
	50203: "SGL_LOCAL_PEER",
	50204: "SGL_CONNECT",
	50205: "SGL_SDP_SEND",
	50206: "SGL_SDP_RECEV",
	50207: "SGL_CANDIDATE_SEND",
	50208: "SGL_CANDIDATE_RECEV",
	50209: "SGL_END",
	50301: "P2P_CONNECT",
	50401: "DATACHL_CREATION",
	50402: "DATACHL_SEND",
	50403: "DATACHL_RECEV",
	50404: "DATACHL_ON_ERROR"
};

var SERVER_ERROR_CODE = {
	40201: "MEDIA_UNSUPPORTED",
	40202: "MEDIA_NOT_ACCPTED",
	40203: "SDP_CREATION_ERROR",
	40204: "SDP_REGIST_ERROR",
	40205: "CANDIDATE_REGIST_ERROR",
	40206: "P2P_FAILED",
	40207: "P2P_ERROR",				//사용하지 않음(Native 전용)		
	40208: "DATACHL_FAILED",
	40209: "DATACHL_PARSE_FAILED"
};

function severErrorDelegate(type, serverCode, payload){
	var code = null,
		desc = null;

	if(type === "CHANNEL"){
		switch(serverCode){
			case "40102":
			case "40103":
				code = "C4203"
				desc = SDK_ERROR_CODE["C4203"];
				break;
			case "40104":
				code = "C4204"
				desc = SDK_ERROR_CODE["C4204"];
				break;
			default:
				code = "C4205"
				desc = SDK_ERROR_CODE["C4205"];
				break;
		}
	}
	else if(type === "SIGNAL"){
		switch(serverCode){
			case 40102:
			case 40103:
				code = "S4303"
				desc = SDK_ERROR_CODE["S4303"];
				break;
			case 40104:
				code = "S4304"
				desc = SDK_ERROR_CODE["S4304"];
				break;
			default:
				code = "S4305"
				desc = SDK_ERROR_CODE["S4305"];
				break;
		}
	}
	
	this.fire("error", code, desc, payload);
};


function nagErrorDelegate(serverCode, payload){
	var code = null,
		desc = null;	

	messageId = messageId.toUpperCase();

	switch(messageId){
		case "SVC2003":
		case "SVC3003":
		case "SVC3004":
		case "SVC3101":
		case "SVC3102":
		case "SVC3103":
		case "SVC3110":
			code = "S4401"
			desc = SDK_ERROR_CODE["S4401"];
			break;
		default:
			code = "S4407"
			desc = SDK_ERROR_CODE["S4407"];
			break;
	}
	
	this.fire("error", code, desc, payload);
};

var Socket = utils.Extend(utils.Event, {
	initialize: function(url){
		Socket.base.initialize.call(this);
		this.socket = new WebSocket(url);
		this.setEvent();
	},
	setEvent: function(){
		this.socket.onopen = utils.bind(function(e){
			this.fire("open", e);
		}, this);
		this.socket.onclose = utils.bind(function(e){
			this.fire("close", e);
		}, this);
		this.socket.onerror = utils.bind(function(e){
			this.fire("error", e);
		}, this);
		this.socket.onmessage = utils.bind(function(e){
			this.fire("message", e);
		}, this);
	},
	send: function(data){
		try{
			this.socket.send(data);
		}
		catch(err){
			
		}
	},
	getReadyState: function(){
		return this.socket.readyState;
	},
	close: function(){
		if(this.socket){
			this.socket.close();
		}
	}
});
function configFormat(config){
	var serverConfig = config.serverConfig.project,
		result = {
			signalType: "NAG", 
			iceServers: [ ],
			channelServer: null,
			signalServer: null,
			dataChannelEnabled: true,
			logLevel: "TRACE", 
			userMedia: {
				audio: true,
				video: true
			}
		};

	if(serverConfig.servers){
		if(serverConfig.servers.channel.scopeYN === "yes"){
			if(serverConfig.servers.channel.supplyType === "static"){
				result.channelServer = serverConfig.servers.channel.url;
			}
			else{
				result.channelServer = serverConfig.servers.channel.domain;
			}
		}
		
		if(serverConfig.servers.signal.scopeYN === "yes"){
			if(serverConfig.servers.signal.supply === "NAG"){
				if(serverConfig.servers.signal.supplyType === "static"){
					result.signalServer = {
						rest: serverConfig.servers.signal.restfulUrl,
						webSocket: serverConfig.servers.signal.websocketUrl
					};
				}
				else{
					result.signalServer = {
						rest: serverConfig.servers.signal.restfulDomain,
						webSocket: serverConfig.servers.signal.websocketDomain
					};
				}
			}
			else{
				if(serverConfig.servers.signal.supplyType === "static"){
					result.signalServer = serverConfig.servers.signal.websocketUrl;
				}
				else{
					result.signalServer = serverConfig.servers.signal.websocketDomain;
				}
			}
		}
	}

	if(serverConfig.sdk){
		if(serverConfig.sdk.medias){
			if(serverConfig.sdk.medias.video === "yes"){
				result.userMedia.video = true;
			}
			else if(typeof serverConfig.sdk.medias.video === "object"){
				result.userMedia.video = serverConfig.sdk.medias.video;
			}
			else{
				result.userMedia.video = false;
			}
			
			if(serverConfig.sdk.medias.audio === "yes"){
				result.userMedia.audio = true;
			}
			else if(typeof serverConfig.sdk.medias.audio === "object"){
				result.userMedia.audio = serverConfig.sdk.medias.audio;
			}
			else{
				result.userMedia.audio = false;
			}

			if(serverConfig.sdk.medias.dataChannel === "yes"){
				result.dataChannelEnabled = true;
			}
			else{
				result.dataChannelEnabled = false;
			}
		}

		if(serverConfig.sdk.log){
			result.logLevel = serverConfig.sdk.log.type.toUpperCase();
		}
	}
	
	delete config.serverConfig;	
	return utils.apply(result, config);
};

function _call(channelId, token, uid){
	uid = uid || "";	
	if(!channelId || !token){
		Logger.error("cdm", {
			method: "_call",
			channelId: channelId,
			message: "Failed to execute '_call' on 'PlayRTC': 2 arguments required, but only " + arguments.length + " present"
		});
		return false;
	}
	
	if(!UserMedia){
		Logger.error("cndm", {
			method: "_call",
			channelId: channelId,
			service: "SGL",
			stateCode: 50202,
			errorCode: 40201,
			isSuccess: "N",
			message: "Token[" + token + "] UID[" + uid + "] Your device is not supported media"
		});
		
		this.error("M4001", SDK_ERROR_CODE["M4001"]);
		return false;
	}
	
	if(!uid){
		Logger.warn("cdm", {
			method: "_call",
			channelId: channelId,
			message: "Connected without uid"
		});
	}
	
	Logger.trace("cdm", {
		method: "_call",
		channelId: channelId,
		message: "Token[" + token + "] UID[" + uid + "] Called '_call' method"
	});
	
	this.stateChange("CHANNELING");
	
	this.calling = new Call(this, this.config.channelServer, this.config.signalServer, this.ChannelingAdapter, this.SignalingAdapter);
	this.calling
		.on("_disconnectChannel", this._disconnectChannel, this)
		.on("_otherDisconnectChannel", this._otherDisconnectChannel, this)
		.on("error", this.error, this)
		.on("stateChange", this.stateChange, this)
		.on("createUserMedia", this.createUserMedia, this)
		.on("addRemoteStream", this.addRemoteStream, this)
		.on("userCommand", this.userCommandCallback, this);

	this.calling.createChannel();
	this.calling.connect(channelId, token, uid);
}

function randomUuid(){
    var text = "",
    	possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * PlayRTC Class
 * @namespace {Object} PlayRTC
 * @class PlayRTC
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 * @property {Object} [config] 						- PlayRTC 의 기본값을 명시한다.
 * @property {String} config.url					- Service Helper 가 존재하는 URL 도메인 또는 IP 주소를 명시한다.
 * @property {Boolean} config.ring					- 서비스 플로우에서 접속시 상대방의 허가를 받을지 여부를 명시한다. ring 이 true 일 경우, 반드시 accept 또는 reject 메소드를 호출하여야한다.
 * @property {String} config.localVideoTarget		- 자신의 모습을 출력할 비디오태그 ID 명을 명시한다.
 * @property {String} config.remoteVideoTarget		- 상대의 모습을 출력할 비디오태그 ID 명을 명시한다.
 * @property {Object} config.userMedia				- 오디오, 비디오 사용 유무를 명시한다. 기본적으로 서버에서 해당 값을 내려받으며 직접 명시할 경우 서버에서 내려받음 값음 무시한다. 예) {video: true, audio: true}
 * @property {Boolean} config.dataChannelEnabled	- dataChannel 사용 유무를 명시한다. 기본적으로 서버에서 해당 값을 내려받으며 직접 명시할 경우 서버에서 내려받음 값음 무시한다.
 */
var PlayRTC = utils.Extend(utils.Event, {
	initialize: function(config){
		this.config = {
			url: "http://www.playrtc.com:5100",
			serverConfig: null,
			ring: false,
			localVideoTarget: null,
			remoteVideoTarget: null
		};

		PlayRTC.base.initialize.call(this);
		utils.apply(this.config, config);
		
		this.media = null;
		
		this.broker = new Broker(this.config.url);
		this.sdkBroker = new SDKBroker(this.config.url);
		
		Logger.network.setConfig({
			playRtc: this,
			projectKey: new Date().getTime()
		});
		Logger.network.sendStorageLog();
		
		if(this.config.logLevel){
			Logger.setLogLevel(this.config.logLevel);
		}
		
		PlayRTC.Helper.setUrl(this.config.url);
		
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "initialize",
			message: "Created instance of 'PlayRTC'"
		});
	},
	_updateConfig: function(config){
		this.config = utils.apply(configFormat(config), this.config);

		this.config.logLevel = this.config.logLevel.toUpperCase();
		Logger.setLogLevel(this.config.logLevel);
		
		if(!this.config.userMedia.audio && !this.config.userMedia.video && !this.config.dataChannelEnabled){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "_updateConfig",
				message: "Might be true one of video or audio or dataChannel"
			});
			return;
		}

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "_updateConfig",
			message: "Set config = " + JSON.stringify(this.config)
		});
		
		this.ChannelingAdapter = ChannelingAdapter;
		
		this.config.signalType = this.config.signalType.toUpperCase();
		if(this.config.signalType === "NAG"){
			this.SignalingAdapter = NAGSignalingAdapter;
		}
		else{
			this.SignalingAdapter = SignalingAdapter;
		}
	},
	setSignaling: function(adapter){
		this.SignalingAdapter = adapter;
	},
	setChanneling: function(adapter){
		this.ChannelingAdapter = adapter;
	},
	/**
	 * 채널을 생성하거나 참여한다.
	 * @method call
	 * @memberof PlayRTC.prototype
	 * @deprecated since version 1.0.1
	 */
	call: function(roomId, uid, options){
		if(this.calling){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "call",
				message: "Already connected channel"
			});
			return;
		}
		
		Logger.warn("cm", {
			klass: "PlayRTC",
			method: "call",
			message: "call method is going to deplete"
		});
		
		
		uid = uid || randomUuid();

		options = options || {};
		
		this.broker.setRoom(roomId);
		this.sdkBroker.setRoom(roomId);
		this.broker.setUser(uid);
		this.sdkBroker.setUser(uid);
		
		this.sdkBroker.enterRoom(options, utils.bind(function(data, status){
			if(status === "success"){
				this._updateConfig({ serverConfig: data.config });
				_call.call(this, data.channel, data.token, this.sdkBroker.getUser());
			}
			else{
				this.error("CHANNELING", "CREATED");
			}
		}, this));
	},
	/**
	 * 채널을 생성하고 해당 채널에 입장한다.
	 * @method createChannel
	 * @memberof PlayRTC.prototype
	 * @param {Object} [options] 채널 및 Peer 에 대한 부가 정보를 지정한다.
	 * @example
	 conn.create({
	 	channel: {
	 		channelName: "Test Channel"
	 	},
	 	Peer: {
	 		uid: "UserID",
	 		userName: "Test User"
	 	}
	 });
	 */
	createChannel: function(options){
		if(this.calling){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "createChannel",
				message: "Already connected channel"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "createChannel",
			message: "Called createChannel. data = " + JSON.stringify(options)
		});
		
		options = options || { };
		function success(channelId, token, serverConfig){
			Logger.trace("cdm", {
				klass: "PlayRTC",
				method: "createChannel",
				channelId: channelId,
				message: "Token[" + token + "] Received createChannel. serverConfig = " + JSON.stringify(serverConfig)
			});
			
			/**
			 * 채널에 접속하였을 때 발생한다.
			 * @event connectChannel
			 * @memberof PlayRTC.prototype
			 * @param {String} channelId 접속한 채널아이디.
			 * @example
			 	conn.on("connectChannel", function(channelId){
			 		
			 	});
			 */
			this.fire("connectChannel", channelId, "create");
			this.fire("createChannel", channelId);

			this._updateConfig({ serverConfig: serverConfig });
			var uid = options.peer ? options.peer.uid || "" : "";
			_call.call(this, channelId, token, uid);
		}
		
		function error(xhr, data){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "createChannel",
				message: "Status[" + xhr.status + "] Failed createChannel. data = " + JSON.stringify(data)
			});

			this.error("C4101", SDK_ERROR_CODE["C4101"], data);
		}

		PlayRTC.Helper.createChannel(options, utils.bind(success, this), utils.bind(error, this));
	},
	/**
	 * 생성된 채널에 입장한다.
	 * @method connectChannel
	 * @memberof PlayRTC.prototype
	 * @param {Object} [options] Peer 에 대한 부가 정보를 지정한다.
	 * @example
	 conn.connectChannel({
	 	Peer: {
	 		uid: "UserID",
	 		userName: "Test User"
	 	}
	 });
	 */
	connectChannel: function(channelId, options){
		if(this.calling){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "connectChannel",
				message: "Already connected channel"
			});
			return;
		}
		
		if(!channelId){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "connectChannel",
				message: "Failed to execute 'connectChannel' on 'PlayRTC': 1 arguments required, but only " + arguments.length + " present"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "connectChannel",
			channelId: channelId,
			message: "Called connectChannel. data = " + JSON.stringify(options)
		});

		options = options || { };
		function success(channelId, token, serverConfig){
			Logger.trace("cdm", {
				klass: "PlayRTC",
				method: "connectChannel",
				channelId: channelId,
				message: "Token[" + token + "] Received connectChannel. serverConfig = " + JSON.stringify(serverConfig)
			});
			
			this.fire("connectChannel", channelId, "connect");
			this._updateConfig({ serverConfig: serverConfig });

			var uid = options.peer ? options.peer.uid || "" : "";
			_call.call(this, channelId, token, uid);
		}
		
		function error(xhr, data){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "connectChannel",
				message: "Status[" + xhr.status + "] Failed connectChannel. data = " + JSON.stringify(data)
			});
			
			this.error("C4101", SDK_ERROR_CODE["C4101"], data);
		}
		PlayRTC.Helper.connectChannel(channelId, options, utils.bind(success, this), utils.bind(error, this));
	},
	/**
	 * 현재 접속 중인 채널에서 퇴장한다. 만약 인자로 Peer Id 를 지정하면 해당 Peer 가 퇴장하며 인자를 전달하지 않을 경우 자신이 퇴장한다.
	 * @method disconnectChannel
	 * @memberof PlayRTC.prototype
	 * @param {String} [peerid] 지정한 Peer 를 채널에서 퇴장시킨다. 만약 인자로 PeerId 를 지정하지 않으면 자기 자신이 퇴장한다.
	 * @example
	 conn.disconnectChannel();
	 */
	disconnectChannel: function(pid){
		if(this.calling) {
			function success(){
				Logger.trace("cdm", {
					klass: "PlayRTC",
					method: "disconnectChannel",
					channelId: this.getChannelId(),
					message: "Received to be success"
				});
			}
			
			function error(xhr, data){
				Logger.warn("cdm", {
					klass: "PlayRTC",
					method: "disconnectChannel",
					message: "Status[" + xhr.status + "] Failed disconnectChannel. data = " + JSON.stringify(data)
				});
				
				this.destroy();
				this.fire("disconnectChannel");
			}
			
			var channelId= this.getChannelId();
			
			if(!pid){
				pid = this.getPeerId();
			}

			if(channelId && pid){
				PlayRTC.Helper.disconnectChannel(channelId, pid, utils.bind(success, this), utils.bind(error, this));
			}
			
			window.setTimeout(utils.bind(function(){
				if(this.calling){
					Logger.trace("cdm", {
						klass: "PlayRTC",
						method: "deleteChannel",
						channelId: this.getChannelId(),
						message: "Failed disconnectChannel. so destroyed compulsory"
					});
					this.destroy();
					this.fire("disconnectChannel");
				}
			}, this), 3000);
		}
	},
	/**
	 * 참여하고 있는 모든 Peer 를 퇴장시키고 채널을 완전히 종료한다. 
	 * @method deleteChannel
	 * @memberof PlayRTC.prototype
	 * @example
	 conn.deleteChannel();
	 */
	deleteChannel: function(){
		if(this.calling) {
			function success(res){
				if(res.status !== "nothing"){
					Logger.trace("cdm", {
						klass: "PlayRTC",
						method: "deleteChannel",
						channelId: this.getChannelId(),
						message: "Failed deleteChannel. data = " + JSON.stringify(res)
					});
					
					this.destroy();
					this.fire("disconnectChannel");
				}
				else{
					Logger.trace("cdm", {
						klass: "PlayRTC",
						method: "deleteChannel",
						channelId: this.getChannelId(),
						message: "Received to be success"
					});
				}
			}
			
			function error(xhr, data){
				Logger.warn("cdm", {
					klass: "PlayRTC",
					method: "disconnectChannel",
					message: "Status[" + xhr.status + "] Failed deleteChannel. data = " + JSON.stringify(data)
				});
				
				this.destroy();
				this.fire("disconnectChannel");
			}
			
			var channelId= this.getChannelId();
			if(channelId){
				PlayRTC.Helper.deleteChannel(channelId, utils.bind(success, this), utils.bind(error, this));
			}
			
			window.setTimeout(utils.bind(function(){
				if(this.calling){
					Logger.trace("cdm", {
						klass: "PlayRTC",
						method: "deleteChannel",
						channelId: this.getChannelId(),
						message: "Failed deleteChannel. so destroyed compulsory"
					});
					this.destroy();
					this.fire("disconnectChannel");
				}
			}, this), 3000);
		}
	},
	/**
	 * 현재 생성되어 있는 모든 채널을 가져온다. 
	 * @method getChannelList
	 * @memberof PlayRTC.prototype
	 * @param {Function} success 정상적으로 채널 목록을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getChannelList(function(data){
		var channels = data.channels,
			channel = null,
			channelList = "";
		
		for(var i=0; i<channels.length; i++){
			channel = channels[i];
			channelList = channelList + (channel.channelName || channel.channelId);
		}
		
		console.log(channelList);
	}, function(xhr, res){
		//error
	});
	 */
	getChannelList: function(success, error){
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getChannelList",
			channelId: this.getChannelId(),
			message: "Called getChannelList"
		});
		PlayRTC.Helper.getChannelList(success, error);
	},
	/**
	 * 지정한 채널 하나에 대한 정보를 반환한다. 
	 * @method getChannel
	 * @memberof PlayRTC.prototype
	 * @param {String} channelId 채널 정보를 가져올 채널의 Id 를 지정한다.
	 * @param {Function} success 정상적으로 채널을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getChannel("ChannelId", function(data){
	 	console.log(data.channelId);
	 	console.log(data.peers);
	 	console.log(data.status);
	}, function(xhr, res){
		//error
	});
	 */
	getChannel: function(channelId, success, error){
		if(!channelId){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getChannel",
				channelId: channelId,
				message: "Failed to execute 'getChannel' on 'PlayRTC': 1 arguments required, but only " + arguments.length + " present"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getChannel",
			channelId: this.getChannelId(),
			message: "Called getChannel"
		});
		PlayRTC.Helper.getChannel(channelId, success, error);
	},
	/**
	 * 지정한 채널 속해있는 모든 Peer 목록을 반환한다.
	 * @method getPeerList
	 * @memberof PlayRTC.prototype
	 * @param {String} channelId Peer 목록을 가져올 channel Id 를 지정한다.
	 * @param {Function} success 정상적으로 채널을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getPeerList("ChannelId", function(data){
	 	console.log(data.peers);
	}, function(xhr, res){
		//error
	});
	 */
	getPeerList: function(channelId, success, error){
		if(!channelId){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getPeerList",
				channelId: channelId,
				message: "Failed to execute 'getPeerList' on 'PlayRTC': 1 arguments required, but only " + arguments.length + " present"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getPeerList",
			channelId: this.getChannelId(),
			message: "Called getPeerList"
		});
		PlayRTC.Helper.getPeerList(channelId, success, error);
	},
	/**
	 * 지정한 채널에 속해 있는 특정 Peer 에 대한 정보를 가져온다.
	 * @method getPeer
	 * @memberof PlayRTC.prototype
	 * @param {String} channelId Peer 를 가져올 channel Id 를 지정한다.
	 * @param {String} peerId 정보를 가져올 Peer Id 를 지정한다..
	 * @param {Function} success 정상적으로 채널을 가져왔다면 호출된다.
	 * @param {Function} [error] 에러가 발생했다면 호출된다. 에러 핸들러에는 ajax xhr 객체와 서버에서의 반환값이 인자로 전달된다.
	 * @example
	 conn.getPeer("ChannelId", "PeerId", function(data){
	 	console.log(data.id);
	 	console.log(data.uid);
	 	console.log(data.userName);
	 	console.log(data.env);
	}, function(xhr, res){
		//error
	});
	 */
	getPeer: function(channelId, peerId, success, error){
		if(!channelId || !peerId){
			Logger.error("cdm", {
				klass: "PlayRTC",
				method: "getPeer",
				channelId: channelId,
				message: "Failed to execute 'getPeer' on 'PlayRTC': 2 arguments required, but only " + arguments.length + " present"
			});
			return;
		}
		
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "getPeer",
			channelId: this.getChannelId(),
			message: "Called getPeer"
		});
		PlayRTC.Helper.getPeer(channelId, peerId, success, error);
	},
	createUserMedia: function(constraints, cb){
		constraints = JSON.parse(constraints);
		var config = {
			video: { },
			audio: { }
		};
		if(!constraints){
			config = this.config.userMedia;
		}
		else{
			if(constraints.video){
				if(this.config.userMedia.video){
					config.video.optional = constraints.video;
				}
				else{
					config.video = false;
				}
			}
			else{
				config.video = this.config.userMedia.video;
			}

			if(constraints.audio){
				if(this.config.userMedia.audio){
					config.audio.optional = constraints.audio;
				}
				else{
					config.audio = false;
				}
			}
			else{
				config.audio = this.config.userMedia.audio;
			}
		}
		
		if(config.video || config.audio){
			if(!this.getMedia()){
				UserMedia.call(navigator, config, utils.bind(function(stream){
					Logger.trace("cdm", {
						klass: "PlayRTC",
						method: "createUserMedia",
						message: "Got local stream"
					});

					/**
					 * PlayRTC 인스턴스가 생성되고 UserMedia 를 통해 사용자의 카메라/오디오에 대한 준비가 끝마치면 호출된다. 만약 localVideoTarget Configuration 이 지정되어 있지 않다면, 여기서 자신의 비디오 태그등의 UI 를 생성할 수 있다.
					 * @event addLocalStream
					 * @memberof PlayRTC.prototype
					 * @param {MediaStream} localStream 사용자의 카메라/오디오로부터 얻어진 스트림 객체
					 * @example
					 	conn.on("addLocalStream", function(stream){
					 		
					 	});
					 */
					if(!this.hasEvent("addLocalStream")){
						if(this.config.localVideoTarget){
							var target = document.getElementById(this.config.localVideoTarget);
							if(target){
								if(!target.hasAttribute("autoPlay")){
									target.setAttribute("autoPlay", true);
								}
								target.src = utils.createObjectURL(stream);
							}
						}
					}
					else{
						if(this.fire("addLocalStream", stream) === false){
							if(this.config.localVideoTarget){
								var target = document.getElementById(this.config.localVideoTarget);
								if(target){
									if(!target.hasAttribute("autoPlay")){
										target.setAttribute("autoPlay", true);
									}
									target.src = utils.createObjectURL(stream);
								}
							}
						}
					}

					this.createMedia(stream);
					
					cb.call(this.calling);

					if(typeof utils.mediaRecorderSupport === "function"){
						utils.mediaRecorderSupport(stream);
					}
				}, this), utils.bind(function(e){
					Logger.error("cndm", {
						klass: "PlayRTC",
						method: "createUserMedia",
						service: "SGL",
						stateCode: 50202,
						errorCode: 40202,
						isSuccess: "N",
						message: "Failed to get local stream"
					});

					this.destroy();
					this.error("M4002", SDK_ERROR_CODE["M4002"]);
				}, this));
			}
		}
		else{
			//dataChannel only
			cb.call(this.calling);
		}
		
	},
	addRemoteStream: function(pid, uid, stream){
		/**
		 * 상대방 Peer 와 내가 연결되고 상대방의 미디어 스트림을 얻었다면 호출된다. 만약 remoteVideoTarget Configuration 이 지정되어 있지 않다면, 여기서 상대의 비디오 태그등의 UI 를 생성할 수 있다.
		 * @event addRemoteStream
		 * @memberof PlayRTC.prototype
		 * @param {String} peerid 접속에 성공한 상대방의 peer 고유 id
		 * @param {String} userId 접속에 성공한 상대방의 peer의 user id
		 * @param {MediaStream} remoteStream 접속에 성공한 상대방의 mediaStream
		 * @example
		 	conn.on("addRemoteStream", function(peerid, userid, stream){
		 		
		 	});
		 */
		if(!this.hasEvent("addRemoteStream")){
			if(this.config.remoteVideoTarget){
				var target = document.getElementById(this.config.remoteVideoTarget);
				if(target){
					if(!target.hasAttribute("autoPlay")){
						target.setAttribute("autoPlay", true);
					}
					target.src = utils.createObjectURL(stream);
				}
			}
		}
		else{
			if(this.fire("addRemoteStream", pid, uid, stream) === false){
				if(this.config.remoteVideoTarget){
					var target = document.getElementById(this.config.remoteVideoTarget);	
					if(target){
						if(!target.hasAttribute("autoPlay")){
							target.setAttribute("autoPlay", true);
						}
						target.src = utils.createObjectURL(stream);
					}
				}
			}
		}
		
	},
	createMedia: function(stream){
		this.media = new Media(stream);
		return this.media;
	},
	/**
	 * Local Stream 을 담고 있는 Meida 객체를 반환한다.
	 * @method getMedia
	 * @memberof PlayRTC.prototype
	 * @return {Media} media Local Stream 을 담고 있는 Media 객체를 반환한다.
	 * @example
	 conn.getMedia();
	 */
	getMedia: function(){
		return this.media;
	},
	/**
	 * 현재 SDK 의 **Configuration** 설정값을 반환한다.
	 * @method getConfig
	 * @memberof PlayRTC.prototype
	 * @return {Object} SDK 의 **Configuration** 설정값
	 * @example
	 conn.getConfig();
	 */
	getConfig: function(){
		return this.config;
	},
	/**
	 * Peer Id 를 기반으로 해당 Peer 를 대표하는 객체를 가져온다. 
	 * @method getPeerByPeerId
	 * @memberof PlayRTC.prototype
	 * @param {String} peerId 가져올 Peer 객체의 id 를 지정한다.
	 * @return {Peer} peer PeerConnect 객체의 Wrapper 객체
	 * @example
	 conn.getPeerByPeerId("peer id");
	 */
	getPeerByPeerId: function(id){
		if(!this.calling){
			return null;
		}

		var o = this.calling.peers[id];
		if(o){
			return o.peer;
		}
		
		return null;
	},
	/**
	 * User Id 를 기반으로 해당 Peer 를 대표하는 객체를 가져온다. 
	 * @method getPeerByUserId
	 * @memberof PlayRTC.prototype
	 * @param {String} userId 가져올 Peer 객체의 user id 를 지정한다. 
	 * @return {Peer} peer PeerConnect 객체의 Wrapper 객체
	 * @example
	 conn.getPeerByUserId("user id");
	 */
	getPeerByUserId: function(id){
		if(!this.calling){
			return null;
		}

		var attr = null,
			peers = this.calling.peers;
		for(attr in peers){
			if(peers[attr].uid === id){
				return peers[attr].peer;
			}
		}
		
		return null;
	},
	/**
	 * 현재 연결 중인 모든 Peer 를 배열로 반환한다. 
	 * @method getAllPeer
	 * @memberof PlayRTC.prototype
	 * @return {Array} peers 
	 * @example
	 conn.getAllPeer();
	 */
	getAllPeer: function(){
		if(!this.calling){
			return null;
		}

		var o = this.calling.peers,
			result = [],
			attr = null;
		
		for(attr in o){
			result.push(o[attr].peer);
		}
		
		return result;
	},
	getBroker: function(){
		return this.broker;
	},
	/**
	 * 현재 자신의 Peer Id 를 반환한다.
	 * @method getPeerId
	 * @memberof PlayRTC.prototype
	 * @return {String} peerId 
	 * @example
	 conn.getPeerId();
	 */
	getPeerId: function(){
		if(this.calling){
			return this.calling.getPid();
		}
	},
	/**
	 * 현재 자신 접속해 있는 Channel 의 Id 를 반환한다.
	 * @method getChannelId
	 * @memberof PlayRTC.prototype
	 * @return {String} channelId 
	 * @example
	 conn.getChannelId();
	 */
	getChannelId: function(){
		if(this.calling){
			return this.calling.getChannelId();
		}
	},
	/**
	 * DataChannel 을 통해 상대 Peer 에게 Data를 전송할 수 있다. 기본적으로 연결된 모든 Peer 에게 Data를 전송하고 두번째 인자로 PeerId 또는 UserId 를 지정하면 해당 Peer 에게만 Data 를 전송한다.
	 * @method dataSend
	 * @memberof PlayRTC.prototype
	 * @param {Object} data 상대 Peer 에게 전송하고자 하는 Data. 문자열 또는 파일을 지정한다.
	 * @param {String} [id] Data 를 전송받을 Peer 의 PeerId 또는 UserId
	 * @example
	 //텍스트 전송
	 conn.dataSend("전송하고자 하는 텍스트");
	 
	 //파일 전송
	 var input = document.getElementById("sendFileInput"),
		files = input.files,
		file = files[0];

		conn.dataSend(file);
	 */
	dataSend: function(data, id){
		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "dataSend",
			channelId: this.getChannelId(),
			message: "Sent data. data = " + data
		});
		
		var peer = null,
			peers = null,
			i = 0,
			len = 0,
			dc = null;

		if(id){
			peer = this.getPeerByPeerId(id) || this.getPeerByUserId(id);
			if(peer){
				dc = peer.getDataChannel();
				if(dc){
					dc.send(data);
				}
				return;
			}
		}
		else{
			peers = this.getAllPeer();
			len = peers.length;
			
			for(; i<len; i++){
				dc = peers[i].getDataChannel();
				if(dc){
					dc.send(data);
				}
			}
		}
	},
	/**
	 * PlayRTC 서비스 플랫폼과 연결된 채널 소켓을 통해 상대 Peer 에게 Data를 전송할 수 있다. dataSend 와 다르게 텍스트만 전송이 가능하다.
	 * @method userCommand
	 * @memberof PlayRTC.prototype
	 * @param {Object} data 상대 Peer 에게 전송하고자 하는 Data. 텍스트만 전송이 가능하다.
	 * @param {String} [id] Data 를 전송받을 Peer 의 PeerId 또는 UserId
	 * @example
	 //텍스트 전송
	 conn.userCommand("전송하고자 하는 텍스트");
	 */
	userCommand: function(data, id){
		if(!this.calling){
			return;
		}

		Logger.trace("cdm", {
			klass: "PlayRTC",
			method: "userCommand",
			channelId: this.getChannelId(),
			message: "Sent data. data = " + data
		});
		
		var peer = null;
	
		if(id){
			peer = this.getPeerByPeerId(id) || this.getPeerByUserId(id);
			if(peer){
				this.calling.channeling.userCommand(data, [{id: peer.id}]);
			}
		}
		else{
			this.calling.channeling.userCommand(data, []);
		}
	},
	userCommandCallback: function(peerId, data){
		var peer = this.getPeerByPeerId(peerId);
		if(peer){
			this.fire("userCommand", peerId, peer.uid, data);
		}
	},
	/**
	 * 채널과의 연결을 종료한다.
	 * @method hangUp
	 * @memberof PlayRTC.prototype
	 * @deprecated since version 1.0.1
	 */
	hangUp: function(){
		Logger.warn("cm", {
			klass: "PlayRTC",
			method: "hangUp",
			message: "HangUp method is going to deplete"
		});
		if(this.calling && this.calling.pid) {
			this.sdkBroker.leaveRoom(this.calling.pid, function(data, status){
				if(status !== "success"){
					this.destroy();
					this.fire("hangUp");
				}
			});
		}
	},
	_disconnectChannel: function(channelId, peerId){
		this.destroy();
		
		/**
		 * 나의 P2P 통신이 끊겼을 때 발생한다.
		 * @event disconnectChannel
		 * @memberof PlayRTC.prototype
		 * @example
		 	conn.on("disconnectChannel", function(channelId, peerId){
		 		
		 	});
		 */
		this.fire("disconnectChannel");
		this.fire("hangUp", channelId, peerId);
	},
	_otherDisconnectChannel: function(peerid, uid){
		/**
		 * 나와 통신 중인 상대방의 연결이 끊겼을 때 발생한다
		 * @event otherDisconnectChannel
		 * @memberof PlayRTC.prototype
		 * @example
		 	conn.on("otherDisconnectChannel", function(peerid, uid){
		 		
		 	});
		 */
		this.fire("otherDisconnectChannel", peerid, uid);
		this.fire("otherHangUp", peerid, uid);
	},
	error: function(code, desc, payload){
		/**
		 * 각 연결 과정에서 에러가 발생했다면 호출되는 이벤트이다.
		 * @event error
		 * @memberof PlayRTC.prototype
		 * @param {String} type 주 단계의 문자열을 전달한다. 다음 4가지 경우가 존재한다. MEDIA, CHANNELING, SIGNALING, P2P
		 * @param {String} state 주 단계에 따른 하위 단계를 문자열로 전달한다. MEDIA :  SUCCESS, FAIL CHANNELING : NONE, CONNECT, CLOSE SIGNALING : NONE, CONNECT, SIGNALING, CLOSE, P2P : CHECKING, CONNECTED, DISCONNECTED, COMPLETED, FAILED
		 * @example
		 	conn.on("error", function(type, state){
		 		
		 	});
		 */
		this.fire("error", code, desc, payload);
		
		this.disconnectChannel();
	},
	/**
	 * 모든 과정에서 상태가 변경되었을 때마다 호출된다.
	 * @event stateChange
	 * @memberof PlayRTC.prototype
	 * @param {String} type 주 단계의 문자열을 전달한다. 다음 4가지 경우가 존재한다. MEDIA, CHANNELING, SIGNALING, P2P
	 * @param {String} state 주 단계에 따른 하위 단계를 문자열로 전달한다. MEDIA :  SUCCESS, FAIL CHANNELING : NONE, CONNECT, CLOSE SIGNALING : NONE, CONNECT, SIGNALING, CLOSE, P2P : CHECKING, CONNECTED, DISCONNECTED, COMPLETED, FAILED
	 * @example
	 	conn.on("stateChange", function(type, state){
	 		
	 	});
	 */
	stateChange: function(state, pid, uid){
		this.fire("stateChange", state, pid, uid);
	},
	destroy: function(){
		if(this.calling){
			Logger.warn("cm", {
				klass: "PlayRTC",
				method: "hangUp",
				message: "Destroyed instance of 'PlayRTC'"
			});
	
			this.calling.destroy();
			this.calling = null;
			
			if(this.media){
				this.media.stop();
				this.media = null;
			}
	
			var remote = document.getElementById(this.config.remoteVideoTarget);
			if(remote){
				remote.src = "";
			}
			
			var local = document.getElementById(this.config.localVideoTarget);	
			if(local){
				local.src = "";
			}
		}
	},
	destroyCall: function(){
		this.destroy();
	},
	/**
	 * PlayRTC 객체 생성시 전달한 **Configuration** 에서 ring 이 true 로 지정되어 있을 경우, 수락/거절 프로세스가 추가된다.
	 * 먼저 접속한 Peer 는 나중에 접속한 Peer 를 수락/거절 할 수 있으며 accept 는 상대방을 허가할 때 사용하는 메소드 이다.
	 * @method accept
	 * @memberof PlayRTC.prototype
	 * @param {String} [peerId] 연결을 허가할 상대받의 PeerId
	 * @example
	 *
	 //Ring
	 conn.on("ring", function(call, peerid, userid){
	     if(window.confirm("수락하시겠습니까?")){
	         conn.accept(peerid); //참여자 수락
	     }
	     else{
	         conn.reject(peerid); //참여자 거절
	     }
	 });
	 */
	accept: function(peerid){
		if(this.calling){
			this.calling.accept(peerid);
		}
	},
	/**
	 * PlayRTC 객체 생성시 전달한 **Configuration** 에서 ring 이 true 로 지정되어 있을 경우, 수락/거절 프로세스가 추가된다.
	 * 먼저 접속한 Peer 는 나중에 접속한 Peer 를 수락/거절 할 수 있으며 reject 는 상대방을 거절할 때 사용하는 메소드 이다.
	 * @method reject
	 * @memberof PlayRTC.prototype
	 * @param {String} [peerId] 연결을 허가할 상대받의 PeerId
	 * @example
	 *
	 //Ring
	 conn.on("ring", function(call, peerid, userid){
	     if(window.confirm("수락하시겠습니까?")){
	         conn.accept(peerid); //참여자 수락
	     }
	     else{
	         conn.reject(peerid); //참여자 거절
	     }
	 });
	 */
	reject: function(peerid){
		if(this.calling){
			this.calling.reject(peerid);
		}
	}
});
var Logger = (function(){
	try{
		indexedDB.deleteDatabase("PlayRTC");
	}
	catch(e){ }

	var LogKlass = utils.Extend(BaseKlass, {
		initialize: function(){ },
		trace: function(){ },
		warn: function(){ },
		error: function(){ },
		dateFormat: function(date){
			var yyyy = date.getFullYear().toString(),
				MM = (date.getMonth() + 1).toString(),
				dd = date.getDate().toString(),
				hh = date.getHours().toString(),
				mm = date.getMinutes().toString(),
				ss = date.getSeconds().toString(),
				ms = date.getMilliseconds();

			return utils.strFormat("{0}/{1}/{2} {3}:{4}:{5}.{6}", yyyy, function(){
				return (MM[1] ? MM: "0" + MM[0]);
			}, function(){
				return (dd[1] ? dd : "0" + dd[0]);
			}, function(){
				return (hh[1] ? hh : "0" + hh[0]);
			}, function(){
				return (mm[1] ? mm : "0" + mm[0]);
			}, function(){
				return (ss[1] ? ss : "0" + ss[0]);
			}, function(){
				if(ms < 10){
					ms = "00" + ms;
				}
				else if(ms < 100){
					ms = "0" + ms;
				}
				return ms;
			});
		}
	});
	
	var loggerFactory = function(category, appender){
		var logger = null, Klass;
		if(!PlayRTC.loggers[category]){
			Klass = utils.Extend(LogKlass, appender);
			logger = PlayRTC.loggers[category] = new Klass();
		}
		else{
			logger = PlayRTC.loggers[category];
		}

		return logger;
	};

	PlayRTC.loggers = { };

	var Request = function(logger){
		this.req = new XMLHttpRequest();
		this.req.onreadystatechange = utils.bind(function(e) {
			var xhr = e.target;
			if (xhr.readyState === 4 && xhr.status !== 200) {
				this.error();
			}
		}, this);

		this.logger = logger;
		this.log = null;
		this.projectKey = logger.config.projectKey;
	};
	
	(function(_){
		_.send = function(log){
			this.log = log;
			this.prepareSend();
			this.req.send(JSON.stringify(this.log));
		};

		_.prepareSend = function(){
			this.req.open("post", this.logger.playRtc.config.url + "/v2/playrtc/monitoring-log", true);
			if(utils.browser.name === "firefox"){
				this.req.setRequestHeader("Accept", "application/json");
			}
			this.req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		};
		_.error = function(){
			this.logger.setStorage(this.log);
		};
	})(Request.prototype);

	return {
		level: 0,
		LOGLEVEL: {
			"TRACE": 0,
			"WARN": 1,
			"ERROR": 2,
			"NONE": 3
		},
		typeEach: function(str, fn){
			var s = null,
				len = str.length,
				o = null;

			while(len--){
				s = str[len].toUpperCase();
				switch(s){
					case "C":
						o = Logger.console;
						break;
					case "N":
						o = Logger.network;
						break;
					case "D":
						o = Logger.db;
						break;
					case "M":
						o = Logger.monitor;
						break;
				}
				if(o){
					fn.call(o);
				}

				o = null;
			}
		},
		trace: function(type, log){
			if(this.LOGLEVEL["TRACE"] < this.level){
				return;
			}
			log.type = "TRACE";
			this.typeEach(type, function(){
				this.trace(log);
			});
		},
		warn: function(type, log){
			if(this.LOGLEVEL["WARN"] < this.level){
				return;
			}
			log.type = "WARN";
			this.typeEach(type, function(){
				this.warn(log);
			});
		},
		error: function(type, log){
			if(this.LOGLEVEL["ERROR"] < this.level){
				return;
			}
			log.type = "ERROR";
			this.typeEach(type, function(){
				this.error(log);
			});
		},
		setLogLevel: function(level){
			this.level = this.LOGLEVEL[level];
			if(!this.level){
				this.level = 0;
			}
		},
		console: loggerFactory("console", {
			initialize: function(){
				this.console = window.console;
			},
			trace: function(log){
				this.console.debug(this.format(log));
			},
			warn: function(log){
				this.console.warn(this.format(log));
			},
			error: function(log){
				this.console.error(this.format(log));
			},
			format: function(log){
				var now = this.dateFormat(new Date()),
					type = "[" + log.type + "]",
					channelId = log.channelId ? "[" + log.channelId + "]" : "",
					klass = log.klass ? "[" + log.klass + "]" : "",
					method = log.method ? "[" + log.method + "]" : "",
					message = log.message || "";
				
				return utils.strFormat("{0} {1} {2} {3} {4} {5}", now, type, channelId, klass, method, message).replace(/(?:\s\s)+/g, " ");
			}
		}),
		monitor: loggerFactory("monitor", {
			initialize: function(){
				function dumy(){
					
				}
				
				this.view = {
					setLog: dumy,
					show: dumy,
					hide: dumy,
					exportLog: dumy,
					trace: dumy,
					error: dumy,
					warn: dumy
				};
			},
			show: function(){
				this.view.show();
			},
			hide: function(){
				this.view.hide();
			},
			trace: function(log){
				this.view.trace(this.format(log));
			},
			warn: function(log){
				this.view.warn(this.format(log));
			},
			error: function(log){
				this.view.error(this.format(log));
			},
			format: function(log){
				var now = this.dateFormat(new Date()),
					type = "[" + log.type + "]",
					channelId = log.channelId ? "[" + log.channelId + "]" : "",
					klass = log.klass ? "[" + log.klass + "]" : "",
					method = log.method ? "[" + log.method + "]" : "",
					message = log.message || "";
				
				return utils.strFormat("{0} {1} {2} {3} {4} {5}", now, type, channelId, klass, method, message).replace(/(?:\s\s)+/g, " ");
			}
		}),
		db: loggerFactory("db", {
			initialize: function(){
				this.db = null;
				this.logsData = [];
				try{
					if(window.openDatabase){
						this.db = openDatabase("PlayRTC", "1.0", "PlayRTC Log Database", 1021*1024*20);//20MB
						this.db.transaction(function(tx){
							tx.executeSql("select * from logs", [] , function(){
								var sql = "delete from logs where logdate < datetime('now', '-10 day')";
								
								tx.executeSql(sql);
							}, function(tx, err){
								var sql = "create table if not exists logs ("
									+ "id integer primary key autoincrement,"
									+ "logdate datetime default current_time, "
									+ "log text)";
								
								tx.executeSql(sql);
							});
						});
					}
				}
				catch(e){ }
			},
			trace: function(log){
				this.save(this.format(log));
			},
			warn: function(log){
				this.save(this.format(log));
			},
			error: function(log){
				this.save(this.format(log));
			},
			save: function(log){
				try{
					this.db.transaction(function (tx) {
						var sql = "insert into logs(log) values (?)";
						tx.executeSql(sql, [log]);
					});
				}
				catch(e){ }
			},
			exportLog: function(){
				try{
					this.db.transaction(utils.bind(function(tx){
						var sql = "select * from logs;";
						tx.executeSql(sql, [], utils.bind(function(tx, rs){
							var row = null;
							for(var i=0; i<rs.rows.length; i++) {
								row = rs.rows.item(i);
								this.logsData.push(row["log"] + "\r\n");
							}
							
							if(rs.rows.length){
								this.processEnd();
							}
						}, this));
					}, this));
				}
				catch(e){ }
			},
			processEnd: function(){
				var blob = new Blob(this.logsData, {
					type : "text/plain"
				});
				this.logsData = [];
				utils.fileDownload(blob, this.dateFormat(new Date()) + "_log.txt");
			},
			format: function(log){
				var now = this.dateFormat(new Date()),
					type = "[" + log.type + "]",
					channelId = log.channelId ? "[" + log.channelId + "]" : "",
					klass = log.klass ? "[" + log.klass + "]" : "",
					method = log.method ? "[" + log.method + "]" : "",
					message = log.message || "";
				
				return utils.strFormat("{0} {1} {2} {3} {4} {5}", now, type, channelId, klass, method, message);
			}
		}),
		network: loggerFactory("network", {
			initialize: function(){
				this.config = {
					projectKey: null,
					interval: 60000
				};

				this.storage = window.localStorage;
				this.q = [];
			},
			trace: function(log){
				var r = new Request(this);
				r.send(this.format(log))
			},
			warn: function(log){
				var r = new Request(this);
				r.send(this.format(log))
			},
			error: function(log){
				var r = new Request(this);
				r.send(this.format(log));
			},
			format: function(log){
				var now = this.dateFormat(new Date()),
				data = {
				    "date": now,
				    "sender": "SDKC",
				    "service": "",
				    "processLevel": "",
				    "isSuccess": "",
				    "errorCode": "",
				    "token": "",
				    "channelId": "",
				    "myPeerId": "",
				    "myUserId": "",
				    "yourPeerId": "",
				    "yourUserId": "",
	            	"platformType": utils.platform,
	            	"browserName": utils.browser.name,
	            	"browserVersion": utils.browser.version,
	            	"networkType": "wired",
	            	"sdkType": "web",
	            	"sdkVersion": PlayRTC.version
				};
				
				log = utils.apply(data, log);
				log.processLevel = SERVER_STATE_CODE[log.stateCode] ? log.stateCode : "";
				log.errorCode = SERVER_ERROR_CODE[log.errorCode] ? log.errorCode : "";
				
				delete log.message;
				delete log.type;
				delete log.stateCode;
				delete log.klass;
				delete log.method;
				delete log.channelId;

				return log;
			},
			setStorage: function(log){
				this.q.push(log);
				
				this.storage.removeItem(this.storageKey);
				this.storage.setItem(this.storageKey, JSON.stringify(this.q));
			},
			sendStorageLog: function(){
				if(this.timer){
					window.clearTimeout(this.timer);
					this.timer = null;
				}

				var item = this.storage.getItem(this.storageKey),
					logs = null,
					log = null;
				
				if(!item){
					this.timer = window.setTimeout(utils.bind(this.sendStorageLog, this), this.config.interval);
					return;
				}
				
				this.q = [];

				logs = JSON.parse(item);
				log = logs.shift();

				if(log){
					var r = new Request(this);
					r.send(log);

					this.storage.setItem(this.storageKey, JSON.stringify(logs));
					this.timer = window.setTimeout(utils.bind(this.sendStorageLog, this), 100);
				}
				else{
					this.storage.removeItem(this.storageKey);
					this.timer = window.setTimeout(utils.bind(this.sendStorageLog, this), this.config.interval);
				}
			},
			setConfig: function(config){
				utils.apply(this.config, config);
				this.playRtc = config.playRtc;
				this.storageKey = "storage_" + config.projectKey;
				
				if(this.timer){
					window.clearTimeout(this.timer);
					this.timer = null;
				}
				this.timer = window.setTimeout(utils.bind(this.sendStorageLog, this), this.config.interval);
			}
		})
	};
})();

var Call = utils.Extend(utils.Event, {
	initialize: function(playRtc, channelServer, signalServer, ChannelingAdapter, SignalingAdapter){
		Call.base.initialize.call(this);

		var channelSocket = null,
			signalSocket = null;

		this.pid = null;
		this.token = null;
		this.uid = null;
		this.peers = { };
		this.playRtc = playRtc;
		this.channelServer = channelServer;
		this.signalServer = signalServer;
		this.channelId = null;
		this.SignalingAdapter = SignalingAdapter;
		this.channelingTimer = null;
		this.signalingTimer = null;
		this.nagTimer = null;
		this.createOfferTimer = null;		
		
		if(this.playRtc.config.signalType === "NAG"){
			this.nagMgr = new NAGSignalManager(signalServer, this);
			this.nagMgr.on("nagTurnList", function(turns){
				this.playRtc.config.iceServers = turns;
			}, this)
			.on("receiveNagOfferSdp", this.receiveNagOfferSdp, this)
			.on("receiveNagAnwserSdp", this.receiveNagAnwserSdp, this);
		}
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "initialize",
			message: "Created instance of 'Call'"
		});
	},
	createChannel: function(){
		this.channeling = new ChannelingAdapter(this, this.channelServer);
		this.channeling
			.on("connect", this.afterConnect, this)
			.on("notiRegistration", this.notiRegistration, this)
			.on("afterRing", this.afterRing, this)
			.on("afterAccept", this.afterAccept, this)
			.on("afterReject", this.afterReject, this)
			.on("afterClose", this.afterClose, this)
			.on("afterOtherClose", this.afterOtherClose, this)
			.on("error", this.error, this)
			.on("userCommand", this.userCommandCallback, this);
		
		this.channeling.createChannel();
	},
	connect: function(channelId, token, uid){
		if(!channelId || !token){
			Logger.error("cdm", {
				klass: "Call",
				method: "connect",
				channelId: channelId,
				message: "Failed to execute 'connect' on 'Call': 2 arguments required, but only " + arguments.length + " present"
			});

			return false;
		}
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "connect",
			channelId: channelId,
			message: "Token[" + token + "] UID[" + uid + "] Connected of channel"
		});

		this.setToken(token);
		this.setUid(uid);
		this.setChannelId(channelId);

		function timer(channelId){
			this.channelingTimer = window.setInterval(utils.bind(function(){
				if(this.channeling.socket.getReadyState() === 1){
					window.clearInterval(this.channelingTimer);
					this.channelingTimer = null;

					this.channeling.connect(channelId);
				}
			}, this), 10);
		}

		timer.call(this, channelId);
	},
	setChannelId: function(channelId){
		this.channelId = channelId;
	},
	getChannelId: function(channel){
		return this.channelId;
	},
	accept: function(peerid){
		if(!peerid){
			Logger.error("cdm", {
				klass: "Call",
				method: "accept",
				channelId: this.getChannelId(),
				message: "Failed to execute 'accept' on 'Call': 1 arguments required, but only " + arguments.length + " present"
			});
			return false;
		}
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "accept",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peerid + "] Accepted other peer"
		});

		this.createSignaling(peerid, utils.bind(function(peerid){
			this.channeling.accept(peerid);
		}, this));
		
		for(attr in this.peers){
			this.peers[attr].type = "answer";
		}
	},
	reject: function(peerid){
		if(!peerid){
			Logger.error("cdm", {
				klass: "Call",
				method: "reject",
				channelId: this.getChannelId(),
				message: "Failed to execute 'reject' on 'Call': 1 arguments required, but only " + arguments.length + " present"
			});
			return false;
		}
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "reject",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peerid + "] Rejected other peer"
		});
		
		delete this.peers[peerid];
		this.channeling.reject(peerid);
	},
	createPeer: function(peerid, uid, iceServers){
		var c = this.playRtc.getConfig(),
			media = this.playRtc.getMedia(),
			localStream = media ? media.getStream() : null,
			pcConfig = null;

		if(!this.peers[peerid]){
			this.peers[peerid] = { };
		}

		if(this.peers[peerid].peer){
			return;
		}
		
		if(!this.peers[peerid].uid){
			this.peers[peerid].uid = uid || "";
		}
		
		if(this.nagMgr){
			pcConfig = {
				iceServers: iceServers,
				dataChannelEnabled: c.dataChannelEnabled
			};
		}
		else{
			pcConfig = {
				iceServers: c.iceServers,
				dataChannelEnabled: c.dataChannelEnabled
			};
		}

		this.peers[peerid].peer = new Peer(this, peerid, this.peers[peerid].uid, localStream, pcConfig);
		this.peers[peerid].peer
			.on("sendOfferSdp", this.sendOfferSdp, this)
			.on("sendAnswerSdp", this.sendAnswerSdp, this)
			.on("sendCandidate", this.sendCandidate, this)
			.on("addRemoteStream", this.addRemoteStream, this)
			.on("signalEnd", this.signalEnd, this)
			.on("error", this.error, this)
			.on("stateChange", this.stateChange, this);

		return this.peers[peerid];
	},
	createSignaling: function(peerid, uid){
		var connCb = null,
			url = null;

		if(!this.peers[peerid]){
			this.peers[peerid] = { };
		}
		
		if(this.peers[peerid].signaling){
			return;
		}
		
		if(!this.peers[peerid].uid && typeof uid !== "function"){
			this.peers[peerid].uid = uid || "";
		}
		
		if(typeof uid === "function"){
			connCb = uid;
		}

		if(this.playRtc.config.signalType === "NAG"){
			url = this.signalServer.webSocket;
		}
		else{
			url = this.signalServer;
		}

		this.fire("stateChange", "SIGNALING", peerid, uid);
		
		this.peers[peerid].signaling = new this.SignalingAdapter(this, url);

		this.peers[peerid].signaling
			.on("receiveSdp", this.receiveSdp, this)
			.on("receiveOfferSdp", this.receiveOfferSdp, this)
			.on("receiveAnwserSdp", this.receiveAnwserSdp, this)
			.on("receiveCandidate", this.receiveCandidate, this)
			.on("notiConnect", this.notiConnect, this)
			.on("connect", this.signalAfterConnect, this)
			.on("error", this.error, this);
		
		this.peers[peerid].signaling.createSignal();

		var me = this;
		function timer(peerid){
			this.signalingTimer = window.setInterval(utils.bind(function(){
				if(this.signaling.socket.getReadyState() === 1){
					window.clearInterval(this.signalingTimer);
					this.signalingTimer = null;

					this.signaling.connect(peerid);
					if(connCb){
						connCb(peerid);
					}
				}
			}, this), 10);
		}

		timer.call(this.peers[peerid], peerid);
	},
	signalStart: function(peerid){
		var o = this.peers[peerid],
			me = this;
		
		function timer(_call){
			function setLog(){
				if(me.getPid() && me.getToken()){
					Logger.trace("cndm", {
						klass: "Call",
						method: "signalStart",
						service: "SGL",
						stateCode: 50201,
						errorCode: 20001,
						isSuccess: "Y",
						token: me.getToken(),
						channelId: me.getChannelId(),
						myPeerId: me.getPid(),
						myUserId: me.getUid(),
						yourPeerId: this.peer.id,
						yourUserId: this.peer.uid,
						message: "OtherPID[" + this.peer.id + "] OtherUID[" + this.peer.uid + "] Started signaling with other peer" 
					});
				}
				else{
					var errorCode = !this.peer.id ? 40105 : !me.getToken() ? 40102 : "";
					Logger.error("cndm", {
						klass: "Call",
						method: "signalStart",
						service: "SGL",
						stateCode: 50201,
						errorCode: errorCode,
						isSuccess: "N",
						token: me.getToken(),
						channelId: me.getChannelId(),
						myPeerId: me.getPid(),
						myUserId: me.getUid(),
						yourPeerId: this.peer.id,
						yourUserId: this.peer.uid,
						message: "OtherPID[" + this.peer.id + "] OtherUID[" + this.peer.uid + "] Failed to start signaling with other peer"
					});
				}
			}
			_call.createOfferTimer = window.setInterval(utils.bind(function(){
				if(this.signaling.socket.getReadyState() === 1){
					if(me.playRtc.config.signalType === "NAG"){
						window.clearInterval(_call.createOfferTimer);
						_call.createOfferTimer = null;

						setLog.call(this);

						this.peer.createOffer();
					}
					else{
						window.clearInterval(intervalCreateOffer);
						setLog.call(this);

						this.peer.createOffer();
					}
				}
			}, this), 10);
		}

		timer.call(o, this);
	},
	afterConnect: function(peerid, peers, constraints){
		this.setPid(peerid);
		Logger.trace("cdm", {
			klass: "Call",
			method: "afterConnect",
			channelId: this.getChannelId(),
			message: "Channel's connecting is success"
		});
		
		this.fire("createUserMedia", constraints, function(){
			var peer,
				i = 0,
				len = peers.length;
		
			if(this.playRtc.config.ring){
				for (; i<len; i++) {
					this.ring(peers[i].id);
				};
			}
			else{
				if(this.nagMgr){
					this.nagTimer = window.setInterval(utils.bind(function(){
						if(!this.nagMgr.socket){
							return;
						}
						if(this.nagMgr.socket.getReadyState() === 1){
							window.clearInterval(this.nagTimer);
							this.nagTimer = null;
							
							if(len > 0){
								this.nagMgr.requestTurnServer(utils.bind(function(iceServers){
									for (; i<len; i++) {
										this.createSignaling(peers[i].id, peers[i].uid);
										this.createPeer(peers[i].id, peers[i].uid, iceServers);
										this.peers[peers[i].id].type = "offer";
									};
								}, this));
							}
						}
					}, this), 10);
				}
				else{
					for (; i<len; i++) {
						this.createSignaling(peers[i].id, peers[i].uid);
						this.createPeer(peers[i].id, peers[i].uid);
						this.peers[peers[i].id].type = "offer";
					};
				}
			}
		});
	},
	notiRegistration: function(peerid, uid){
		var attr = null;
		if(this.playRtc.config.ring){
			return;
		}
		this.createSignaling(peerid, uid);

		for(attr in this.peers){
			this.peers[attr].type = "answer";
		}
	},
	ring: function(peerid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "ring",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peerid + "] Sent to ring to other peer"
		});
		this.channeling.ring(peerid);
	},
	afterRing: function(peerid, uid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "afterRing",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peerid + "] OtherUID[" + uid + "] Received to ring from other peer"
		});

		this.peers[peerid] = {
			uid: uid
		};

		if(!this.playRtc.hasEvent("ring")){
			alert("You must create ring's event.");
			return false;
		}

		/**
		 * Peer 간의 연결시, 먼저 붙어 있던 Peer 가 나중에 들어온 Peer 를 허가 해야 연결이 되는 서비스 플로우라면, 이때 먼저 들어온 Peer 에게 ring 이라는 이벤트가 호출된다. 이 이벤트 내에서 상대방의 연결 요청을 수락/거절 할 수 있다.해당 이벤트의 첫번째 파라미터 요소인 call 객체의 accept 또는 reject 메소드를 호출하여 수락/거절을 수행할 수 있다.
		 * @event ring
		 * @memberof PlayRTC.prototype
		 * @param {String} peerId 새로 접속한 peer 의 고유 id
		 * @param {String} userId 새로 접속한 peer 의 서비스 id
		 * @example
		 	conn.on("ring", function(call, peerid, userid){
		 		
		 	});
		 */
		this.playRtc.fire("ring", peerid, uid);
	},
	afterAccept: function(peerid, uid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "afterAccept",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peerid + "] OtherUID[" + uid + "] Received to accept from other peer"
		});
		
		if(this.nagMgr){
			this.nagMgr.requestTurnServer(utils.bind(function(iceServers){
				this.createPeer(peerid, uid);
				this.createSignaling(peerid, uid, iceServers);
				this.peers[peerid].type = "offer";
			}, this));
		}
		else{
			this.createPeer(peerid, uid);
			this.createSignaling(peerid, uid);
			this.peers[peerid].type = "offer";
		}

		/**
		 * 상대방 Peer 가 나를 ring 에 대해 수락을 하였다면 호출된다.
		 * @event accept
		 * @memberof PlayRTC.prototype
		 * @param {String} peerId 나를 수락한 peer 의 고유 id
		 * @param {String} userId 나를 수락한 peer 의 서비스 id
		 * @example
		 	conn.on("accept", function(peerid, userid){
		 		
		 	});
		 */
		this.playRtc.fire("accept", peerid, uid);
	},
	afterReject: function(peerid, uid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "afterReject",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peerid + "] OtherUID[" + uid + "] Received to reject from other peer"
		});


		/**
		 * 상대방 Peer 가 나를 ring 에 대해 거절을 하였다면 호출된다.
		 * @event reject
		 * @memberof PlayRTC.prototype
		 * @param {String} peerId 나를 거절한 peer 의 고유 id
		 * @param {String} userId 나를 거절한 peer 의 서비스 id
		 * @example
		 	conn.on("reject", function(peerid, userid){
		 		
		 	});
		 */
		this.playRtc.fire("reject", peerid, uid);
	},
	setToken: function(token){
		this.token = token;
	},
	getToken: function(){
		return this.token;
	},
	setPid: function(pid){
		Logger.trace("cdm", {
			klass: "Call",
			method: "setPid",
			channelId: this.getChannelId(),
			message: "PID[" + pid + "] Set self peerid"
		});
		this.pid = pid;
		
		if(this.nagMgr){
			this.nagMgr.userRegistration();
		}
	},
	getPid: function(pid){
		return this.pid;
	},
	setUid: function(uid){
		this.uid = uid;
	},
	getUid: function(uid){
		return this.uid;
	},
	sendOfferSdp: function(id, sdp){
		this.peers[id].signaling.sendOfferSdp(id, sdp);
	},
	sendAnswerSdp: function(id, sdp){
		this.peers[id].signaling.sendAnswerSdp(id, sdp);
	},
	sendCandidate: function(id, candidate){
		this.peers[id].signaling.sendCandidate(id, candidate);
	},
	receiveOfferSdp: function(id, sdp){
		var peer = this.peers[id].peer;
		if(!peer){
			if(this.nagMgr){
				this.nagMgr.requestTurnServer(utils.bind(function(iceServers){
					var peer = this.createPeer(id, null, iceServers);
					
					Logger.trace("cdm", {
						klass: "Call",
						method: "receiveOfferSdp",
						channelId: this.getChannelId(),
						message: "OtherPID[" + id + "] Received from other Peer's offer sdp"
					});
					
					peer.createAnswer(sdp);
				}, this));
				
				return;
			}
			else{
				peer = this.createPeer(id).peer;
			}
		}

		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveOfferSdp",
			channelId: this.getChannelId(),
			message: "OtherPID[" + id + "] Received from other Peer's offer sdp"
		});

		peer.createAnswer(sdp);
	},
	receiveNagOfferSdp: function(id, sdp, sessionId){
		var peer = this.peers[id].peer;
		if(!peer){
			if(this.nagMgr){
				this.nagMgr.requestTurnServer(utils.bind(function(iceServers){
					var peer = this.createPeer(id, null, iceServers).peer;
					
					Logger.trace("cdm", {
						klass: "Call",
						method: "receiveNagOfferSdp",
						channelId: this.getChannelId(),
						message: "OtherPID[" + id + "] Received from other Peer's offer sdp"
					});
					
					peer.createAnswer(sdp);
					this.peers[id].signaling.setSessionId(sessionId);
				}, this));
				
				return;
			}
			else{
				peer = this.createPeer(id).peer;
			}
		}

		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveNagOfferSdp",
			channelId: this.getChannelId(),
			message: "OtherPID[" + id + "] Received from other Peer's offer sdp"
		});

		peer.createAnswer(sdp);
		this.peers[id].signaling.setSessionId(sessionId);
	},
	receiveAnwserSdp: function(id, sdp){
		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveAnwserSdp",
			channelId: this.getChannelId(),
			message: "OtherPID[" + id + "] Received from other Peer's anwser sdp"
		});

		var peer = this.peers[id].peer;
		peer.receiveAnwserSdp(sdp);
	},
	receiveNagAnwserSdp: function(sessionId, sdp){
		var attr = null,
			peer = null;
		
		for(attr in this.peers){
			if(this.peers[attr].signaling){
				if(this.peers[attr].signaling.sessionId === sessionId){
					peer = this.peers[attr].peer;
					break;
				}
			}
		}
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveNagAnwserSdp",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peer.id + "] Received from other Peer's anwser sdp"
		});

		peer.receiveAnwserSdp(sdp);
	},
	receiveCandidate: function(id, candidate){
		var peer = this.peers[id].peer;
		if(!peer){
			if(this.nagMgr){
				this.nagMgr.requestTurnServer(utils.bind(function(iceServers){
					var peer = this.createPeer(id, null, iceServers);
					
					Logger.trace("cdm", {
						klass: "Call",
						method: "receiveCandidate",
						channelId: this.getChannelId(),
						message: "OtherPID[" + id + "] Received from other Peer's candidate"
					});
					
					peer.receiveCandidate(candidate);
				}, this));
				
				return;
			}
			else{
				peer = this.createPeer(id).peer;
			}
		}
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "receiveCandidate",
			channelId: this.getChannelId(),
			message: "OtherPID[" + id + "] Received from other Peer's candidate"
		});

		peer.receiveCandidate(candidate);
	},
	addRemoteStream: function(pid, uid, stream){
		this.fire("addRemoteStream", pid, uid, stream);
	},
	signalEnd: function(peerid){
		if(this.peers[peerid].signaling){
			Logger.trace("cndm", {
				klass: "Call",
				method: "signalEnd",
				channelId: this.getChannelId(),
				service: "SGL",
				stateCode: 50209,
				errorCode: 20001,
				isSuccess: "Y",
				token: this.getToken(),
				channelId: this.getChannelId(),
				myPeerId: this.getPid(),
				myUserId: this.getUid(),
				yourPeerId: peerid,
				yourUserId: this.peers[peerid].uid,
				message: "OtherPID[" + peerid + "] Done signaling with other peer"
			});

			this.peers[peerid].signaling.signalEnd(peerid);
			delete this.peers[peerid].signaling;
		}
	},
	signalAfterConnect: function(pid){
		if(!pid){
			return;
		}
		var peer = this.peers[pid],
			uid = peer.uid;

		if(peer.type === "offer"){
			this.signalStart(pid);
		}
	},
	notiConnect: function(peerid){
		var peer = this.peers[peerid];
		if(peer.type !== "offer"){
			return;
		}
		this.signalStart(peerid);
	},
	afterClose: function(channelId, peerId){
		Logger.trace("cdm", {
			klass: "Call",
			method: "afterClose",
			channelId: this.getChannelId(),
			message: "Disconnected channel"
		});
		this.fire("_disconnectChannel", channelId, peerId);
	},
	afterOtherClose: function(peerid){
		var peer = this.peers[peerid],
			uid = null;
	
		if(!peer){
			return;
		}
		
		uid = peer.uid;
		
		Logger.trace("cdm", {
			klass: "Call",
			method: "afterOtherClose",
			channelId: this.getChannelId(),
			message: "OtherPID[" + peerid + "] OtherUID[" + uid + "] Disconnected with other peer"
		});

		delete this.peers[peerid];
		 
		this.fire("_otherDisconnectChannel", peerid, uid);
	},
	error: function(code, desc, payload){
		this.fire("error", code, desc, payload);
	},
	stateChange: function(state, pid, uid){
		this.fire("stateChange", state, pid, uid);
	},
	getNAGMgr: function(){
		return this.nagMgr;
	},
	destroy: function(){
		Logger.warn("cdm", {
			klass: "Call",
			method: "destroy",
			channelId: this.getChannelId(),
			message: "Destroyed instance of 'Call'"
		});
		
		var attr = null,
			peers = this.peers;

		if(this.channeling){
			this.channeling.socket.close();
		}
		
		
		!this.channelingTimer || window.clearInterval(this.channelingTimer);
		!this.signalingTimer || window.clearInterval(this.signalingTimer);
		!this.nagTimer || window.clearInterval(this.nagTimer);
		!this.createOfferTimer || window.clearInterval(this.createOfferTimer);
		
		if(this.playRtc.config.signalType === "NAG"){
			if(this.nagMgr){
				this.nagMgr.destory();
			}
		}
		
		for(attr in peers){
			if(peers[attr].signaling){
				peers[attr].signaling.socket.close();
			}
			
			if(peers[attr].peer){
				peers[attr].peer.close();
			}
		}
	},
	userCommandCallback: function(peerId, data){
		this.fire("userCommand", peerId, data);
	}
});
PlayRTC.Channeling = utils.Extend(utils.Event, {
	initialize: function(call, url){
		PlayRTC.Channeling.base.initialize.call(this);

		this.url = url;
		this.call = call;
		
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "Created instance of 'Channeling'"
		});
	},
	createChannel: function(){
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "createChannel",
			channelId: this.call.getChannelId(),
			message: "WebSocket[" + this.url + "] Created instance of 'Channeling Web Socket'"
		});

		try{
			this.socket = new Socket(this.url);
		}
		catch(e){
			Logger.error("cdm", {
				klass: "Channeling",
				method: "createChannel",
				channelId: this.call.getChannelId(),
				message: "Failed to create instance of 'Channeling Web Socket'"
			});
			this.fire("error", "C4201", SDK_ERROR_CODE["C4201"]);
			return;
		}
		
		this.socket.on("close", utils.bind(function(e){
			Logger.trace("cdm", {
				klass: "Channeling",
				method: "createChannel",
				channelId: this.call.getChannelId(),
				message: "Closed 'Channeling Web Socket'"
			});
		}, this)).on("error", utils.bind(function(e){
			Logger.error("cdm", {
				klass: "Channeling",
				method: "createChannel",
				channelId: this.call.getChannelId(),
				message: "Caused error 'Channeling Web Socket'"
			});
		}, this));
	},
	send: function(data){
		if(this.socket.getReadyState() === 1){
			this.socket.send(data);
		}
		else{
			Logger.error("cdm", {
				klass: "Channeling",
				method: "send",
				channelId: this.call.getChannelId(),
				message: "Already disconnected channel's server"
			});
			this.fire("error", "C4202", SDK_ERROR_CODE["C4202"]);
		}
	},
	connect: function(data){
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "connect",
			channelId: this.call.getChannelId(),
			message: "Sent to connect channel. data = " + data
		});
		this.send(data);
	},
	userCommand: function(data){
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "userCommand",
			channelId: this.call.getChannelId(),
			message: "Sent userdefined. data = " + data
		});
		this.send(data);
	},
	accept: function(data){
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "accept",
			channelId: this.call.getChannelId(),
			message: "Sent to accept. data = " + data
		});
		this.send(data);
	},
	reject: function(data){
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "reject",
			channelId: this.call.getChannelId(),
			message: "Sent to reject. data = " + data
		});
		this.send(data);
	},
	notiTypeSend: function(data){
		this.send(data);	
	},
	ring: function(data){
		Logger.trace("cdm", {
			klass: "Channeling",
			method: "ring",
			channelId: this.call.getChannelId(),
			message: "Sent to ring. data = " + data
		});
		this.send(data);	
	},
	message: function(message){
		
	}
});

var ChannelingAdapter = PlayRTC.Channeling.Extend({
	initialize: function(call, url){
		ChannelingAdapter.base.initialize.call(this, call, url);		
	},
	createChannel: function(){
		ChannelingAdapter.base.createChannel.call(this);

		this.socket
			.on("message", this.message, this);
	},
	serialize: function(data){
		var default_json = {
			header: {
				command: "",
				commandType: "req",
				token: "",
				expireTime: "none",
				broadcast: "none",
				sender: {
					type: "peer",
					id: "none"
				},
				receiver: {
					type: "server",
					id: "none"
				}
			},
			body: { }
		};
		return JSON.stringify(utils.apply(default_json, data));
	},
	connect: function(channel){
		var networkType = "wired";
		if(utils.browser.name === "android" || utils.browser.name === "ios"){
			networkType = "3g";
		}
		var data = this.serialize({
			header: {
				command: "connect",
				token: this.call.getToken(),
				sender: {
					env: {
						platformType: utils.platform,
						browser: {
							name: utils.browser.name,
							version: utils.browser.version
						},
						sdk: {
							type: "web",
							version: PlayRTC.version
						},
						networkType: networkType
					}
				}
			},
			body: {
				data: {
					uid: this.call.getUid() || "none",
					channelId: channel
				}
			}
		});

		ChannelingAdapter.base.connect.call(this, data);
	},
	userCommand: function(data, id){
		var data = this.serialize({
			header: {
				command: "userdefined",
				token: this.call.getToken(),
				broadcast: id.length < 1 ? "yes" : "no",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					targets: id
				}
			},
			body: {
				data: {
					channelId: this.call.getChannelId(),
					userData: data
				}
			}
		});

		ChannelingAdapter.base.userCommand.call(this, data);
	},
	ring: function(peerid){
		var data = this.serialize({
			header: {
				command: "ready",
				token: this.call.getToken(),
				sender: {
					id: this.call.getPid()
				}
			},
			body: {
				data: {
					channelId: this.call.getChannelId(),
					targetId: peerid
				}
			}
		});
		ChannelingAdapter.base.ring.call(this, data);
	},
	accept: function(peerid){
		var data = this.serialize({
			header: {
				command: "on_ready",
				commandType: "res",
				token: this.call.getToken(),
				sender: {
					type: "peer",
					id: this.call.getPid()
				}
			},
			body: {
				header: {
					code: "20001",
					desc: "SUCCESS"
				},
				data: {
					status: "yes",
					channelId: this.call.getChannelId(),
					targetId: peerid
				}
			}
		});
		ChannelingAdapter.base.accept.call(this, data);
	},
	reject: function(peerid){
		var data = this.serialize({
			header: {
				command: "on_ready",
				commandType: "res",
				token: this.call.getToken(),
				sender: {
					type: "peer",
					id: this.call.getPid()
				}
			},
			body: {
				header: {
					code: "20001",
					desc: "SUCCESS"
				},
				data: {
					status: "no",
					channelId: this.call.getChannelId(),
					targetId: peerid
				}
			}
		});
		ChannelingAdapter.base.reject.call(this, data);
	},
	notiTypeConnSend: function(){
		var data = this.serialize({
			header: {
				command: "on_connect",
				commandType: "res",
				token: this.call.getToken(),
				sender: {
					id: this.call.getPid()
				}
			},
			body: {
				header: {
					code: "20002",
					desc: "SUCCESS"
				}
			}
		});
		ChannelingAdapter.base.notiTypeSend.call(this, data);
	},
	notiTypeCloseSend: function(channelId){
		var data = this.serialize({
			header: {
				command: "close",
				commandType: "res",
				token: this.call.getToken(),
				sender: {
					id: this.call.getPid()
				}
			},
			body: {
				header: {
					code: "20002",
					desc: "SUCCESS"
				},
				data: {
					channelId: channelId
				}
			}
		});
		ChannelingAdapter.base.notiTypeSend.call(this, data);
	},
	message: function(message){
		var data = JSON.parse(message.data),
			header = data.header,
			body = data.body,
			command = header.command.toUpperCase(),
			others = [],
			len = 0,
			i = 0;

		if(header.commandType === "res"){
			if(SERVER_CODE[body.header.code] !== "SUCCESS"){
				Logger.error("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received message. data = " + message.data
				});

				severErrorDelegate.call(this, "CHANNEL", body.header.code, data);
				return;
			}
		}

		switch(command){
			case "CONNECT":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received channel 'connect'. data = " + message.data
				});
				for(len = body.data.others.length; i<len; i++){
					others.push({
						id: body.data.others[i].id,
						uid: body.data.others[i].uid !== "none" ? body.data.others[i].uid : ""
					});
				}

				this.fire("connect", header.receiver.id, others, body.data.envConstraints);
				break;
			case "ON_CONNECT":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received channel 'on_connect'. data = " + message.data
				});
				if(body.data.others.length > 0){
					this.fire("notiRegistration", body.data.others[0].id, body.data.others[0].uid !== "none" ? body.data.others[0].uid : "");
				}
				this.notiTypeConnSend();
				break;
			case "READY":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'ring'. data = " + message.data
				});
				if(body.data.status){
					if(body.data.status === "yes"){
						this.fire("afterAccept", body.data.targetId, body.data.uid !== "none" ? body.data.uid : "");
					}
					else{
						this.fire("afterReject", body.data.targetId, body.data.uid !== "none" ? body.data.uid : "");
					}
				}

				break;
			case "ON_READY":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Rreceived 'on_ring'. data = " + message.data
				});
				this.fire("afterRing", body.data.targetId, body.data.uid !== "none" ? body.data.uid : "");
				break;
			case "CLOSE":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'close'. data = " + message.data
				});
				this.notiTypeCloseSend(body.data.channelId);
				this.fire("afterClose", body.data.channelId, header.receiver.id);
				break;
			case "ON_CLOSE":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'on_close'. data = " + message.data
				});
				this.fire("afterOtherClose", body.data.targetId);
				break;
			case "ON_USERDEFINED":
				Logger.trace("cdm", {
					klass: "Channeling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received 'on_userdefined'. data = " + message.data
				});
				this.fire("userCommand", body.data.targetId, body.data.userData);
				break;
		}
	}
});
PlayRTC.Signaling = utils.Extend(utils.Event, {
	initialize: function(call, url){
		PlayRTC.Signaling.base.initialize.call(this);

		this.url = url;
		this.call = call;

		Logger.trace("cdm", {
			klass: "Signaling",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "Created instance of 'Signaling'"
		});
	},
	createSignal: function(){
		Logger.trace("cdm", {
			klass: "Signaling",
			method: "createSignal",
			channelId: this.call.getChannelId(),
			message: "WebSocket[" + this.url + "] Created instance of 'Signaling Web Socket'"
		});
		try{
			this.socket = new Socket(this.url);
		}
		catch(e){
			Logger.error("cdm", {
				klass: "Signaling",
				method: "createSignal",
				channelId: this.call.getChannelId(),
				message: "Failed to create instance of 'Signaling Web Socket'"
			});
			this.fire("error", "S4301", SDK_ERROR_CODE["S4301"]);
			return;
		}

		this.socket.on("close", utils.bind(function(e){
			Logger.trace("cdm", {
				klass: "Signaling",
				method: "createSignal",
				channelId: this.call.getChannelId(),
				message: "Closed signaling socket"
			});
		}, this)).on("error", utils.bind(function(e){
			Logger.error("cdm", {
				klass: "Signaling",
				method: "createSignal",
				channelId: this.call.getChannelId(),
				message: "Caused signaling socket error"
			});
		}, this));
	},
	send: function(data){
		if(this.socket.getReadyState() === 1){
			this.socket.send(data);
		}
		else{
			Logger.error("cdm", {
				klass: "Signaling",
				method: "send",
				channelId: this.call.getChannelId(),
				message: "Already disconnected signal's server"
			});
			this.fire("error", "S4302", SDK_ERROR_CODE["S4302"]);
		}
	},
	serialize: function(data){
		return data;
	},
	connect: function(data){
		Logger.trace("cdm", {
			klass: "Signaling",
			method: "connect",
			channelId: this.call.getChannelId(),
			message: "Connected signal. data = " + data
		});
		this.send(data);
	},
	sendOfferSdp: function(data){
		Logger.trace("cdm", {
			klass: "Signaling",
			method: "sendOfferSdp",
			channelId: this.call.getChannelId(),
			message: "Sent offer's sdp. data = " + data
		});
		this.send(data);
	},
	sendAnswerSdp: function(data){
		Logger.trace("cdm", {
			klass: "Signaling",
			method: "sendAnswerSdp",
			channelId: this.call.getChannelId(),
			message: "Sent answer's sdp. data = " + data
		});
		this.send(data);
	},
	sendCandidate: function(data){
		Logger.trace("cdm", {
			klass: "Signaling",
			method: "sendCandidate",
			channelId: this.call.getChannelId(),
			message: "Sent candidate. data = " + data
		});
		this.send(data);
	},
	message: function(message){

	},
	signalEnd: function(data){
		Logger.trace("cdm", {
			klass: "Signaling",
			method: "signalEnd",
			channelId: this.call.getChannelId(),
			message: "Sent signaling end message. data = " + data
		});
		this.send(data);
	}
});

var SignalingAdapter = PlayRTC.Signaling.Extend({
	STATUSCODE: {
		20001: "SUCCESS"
	},
	initialize: function(call, url){
		SignalingAdapter.base.initialize.call(this, call, url);
		Logger.trace("cdm", {
			klass: "SignalingAdapter",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "Created instance of 'SignalingAdapter'"
		});
	},
	createSignal: function(){
		SignalingAdapter.base.createSignal.call(this);

		this.socket
			.on("message", this.message, this);
	},
	serialize: function(data){
		var default_json = {
			header: {
				command: "",
				commandType: "req",
				token: this.call.getToken(),
				sender: {
					type: "peer",
					id: "none"
				},
				receiver: {
					type: "peer",
					id: "none"
				}
			},
			body: { }
		};
		return JSON.stringify(utils.apply(default_json, data));
	},
	connect: function(peerid){
		var data = this.serialize({
			header: {
				command: "connect",
				token: this.call.getToken(),
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					type: "server"
				}
			},
			body: {
				data: {
					targetId: peerid
				}
			}
		});

		SignalingAdapter.base.connect.call(this, data);
	},
	sendCandidate: function(id, candidate){
		var data = this.serialize({
			header: {
				command: "candidate",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					id: id
				}
			},
			body: {
				data: {
					candidate: JSON.stringify(candidate)
				}
			}
		});
		SignalingAdapter.base.sendCandidate.call(this, data);
	},
	sendOfferSdp: function(id, sdp){
		var data = this.serialize({
			header: {
				command: "sdp",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					id: id
				}
			},
			body: {
				data: {
					type: "offer",
					sdp: JSON.stringify(sdp)
				}
			}
		});
		SignalingAdapter.base.sendOfferSdp.call(this, data);
	},
	sendAnswerSdp: function(id, sdp){
		var data = this.serialize({
			header: {
				command: "sdp",
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					id: id
				}
			},
			body: {
				data: {
					type: "answer",
					sdp: JSON.stringify(sdp)
				}
			}
		});
		SignalingAdapter.base.sendAnswerSdp.call(this, data);
	},
	signalEnd: function(peerid){
		var data = this.serialize({
			header: {
				command: "end",
				token: this.call.getToken(),
				sender: {
					id: this.call.getPid()
				},
				receiver: {
					type: "server"
				}
			},
			body: {
				data: {
					target: peerid
				}
			}
		});
		SignalingAdapter.base.signalEnd.call(this, data);
	},
	message: function(message){
		var data = JSON.parse(message.data),
			header = data.header,
			body = data.body,
			command = header.command.toUpperCase(),
			type = null;

		if(header.commandType === "res"){
			if(SERVER_CODE[body.header.code] !== "SUCCESS"){
				Logger.error("cdm", {
					klass: "Signaling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received message. data = " + message.data
				});
				
				severErrorDelegate.call(this, "SIGNAL", body.header.code, data);
				return;
			}
		}

		switch(command){
			case "CONNECT":
				Logger.trace("cdm", {
					klass: "Signaling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received signal 'connect'. data = " + message.data
				});

				this.fire("connect", body.data ? body.data.targetId || undefined : undefined);
				break;
			case "ON_CONNECT":
				Logger.trace("cdm", {
					klass: "Signaling",
					method: "message",
					channelId: this.call.getChannelId(),
					message: "Received signal 'on_connect'. data = " + message.data
				});
				
				this.fire("notiConnect", body.data.targetId);
				break;
			case "SDP":
				if(header.commandType === "res"){
					return;
				}
				type = body.data.type.toUpperCase();
				if(type === "OFFER"){
					this.fire("receiveOfferSdp", header.sender.id, JSON.parse(body.data.sdp));
				}
				else if(type === "ANSWER"){
					this.fire("receiveAnwserSdp", header.sender.id, JSON.parse(body.data.sdp));
				}

				break;
			case "CANDIDATE":
				if(header.commandType === "res"){
					return;
				}
				this.fire("receiveCandidate", header.sender.id, JSON.parse(body.data.candidate));
				break;
		}
	}
});
var NAGSignalManager = utils.Extend(utils.Event, {
	initialize: function(server, call){
		NAGSignalManager.base.initialize.call(this);
		this.token = null;
		this.restServer = server.rest;
		this.socketServer = server.webSocket;
		this.call = call;
		this.apiVersion = "v1";
		this.socket = null;
		this.isTurnSuccess = false;
		this.inteval = null;
		
		Logger.trace("cdm", {
			klass: "NAGSignalManager",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "Created instance of 'NAGSignalManager'"
		});
	},
	requestAjax: function(type, url, header, body, succ, error){
		var req = new XMLHttpRequest();
		req.onreadystatechange = utils.bind(function(e) {
			var xhr = e.target,
				res = xhr.responseText;
	
			try{
				if (xhr.readyState === 4 && xhr.status === 200 && res) {
					res = JSON.parse(res);
					succ.call(this, res);
				}
				else if (xhr.readyState === 4 && xhr.status !== 200) {
					res = JSON.parse(res);
					error.call(this, xhr, res);
				}
			}
			catch(e){
				error.call(this, xhr, res);
			}
		}, this);
		
		req.open(type, url, true);
		if(utils.browser.name === "firefox"){
			req.setRequestHeader("Accept", "application/json");
		}
		req.setRequestHeader("Content-Type", header);
		req.send(body);
	},
	userRegistration: function(){
		Logger.trace("cdm", {
			klass: "NAGSignalManager",
			method: "userRegistration",
			channelId: this.call.getChannelId(),
			message: "Requested to register Nag user"
		});
		
		function success(res){
			if(!res.data.status || res.data.status === "FAIL"){
				Logger.error("cdm", {
					klass: "NAGSignalManager",
					method: "userRegistration",
					channelId: this.call.getChannelId(),
					message: "Failed to register Nag user. data = " + JSON.stringify(res)
				});
				
				this.fire("error", "S4401", SDK_ERROR_CODE["S4401"], res);
				return;
			}
			
			Logger.trace("cdm", {
				klass: "NAGSignalManager",
				method: "userRegistration",
				channelId: this.call.getChannelId(),
				message: "Registered to be success. data = " + JSON.stringify(res)
			});
			
			this.setToken(res.data.authToken);
			
			Logger.trace("cdm", {
				klass: "NAGSignalManager",
				method: "userRegistration",
				channelId: this.call.getChannelId(),
				message: "WebSocket[" + this.socketServer + "] Created instance of 'Nag Notification's Socket'"
			});
			
			try{
				this.socket = new Socket(this.socketServer);
				this.socket
					.on("open", this.open, this)
					.on("message", this.message, this)
					.on("error", this.error, this);

				this.inteval = window.setInterval(utils.bind(this.open, this), 250000);
			}
			catch(e){
				Logger.error("cdm", {
					klass: "NAGSignalManager",
					method: "userRegistration",
					channelId: this.call.getChannelId(),
					message: "Failed to create instance of 'Notification Web Socket'"
				});
				this.fire("error", "S4402", ["S4402"]);
				return;
			}
		}
		
		function error(xhr, res){
			Logger.error("cdm", {
				klass: "NAGSignalManager",
				method: "userRegistration",
				channelId: this.call.getChannelId(),
				message: "Status[" + xhr.status + "] Failed to register Nag user. data = " + JSON.stringify(res)
			});
			this.fire("error", "S4401", SDK_ERROR_CODE["S4401"], res);
		}
		var body = {
			"data" : {
				"userExpires" : "84600"
			}
		},
		url = this.call.playRtc.config.url + "/v2/playrtc/signal/user/" + this.call.getPid().substr(2);

		this.requestAjax(
			"post",	url,
			"application/json; charset=UTF-8",
			JSON.stringify(body),
			success, error
		);
	},
	userDeletion: function(){
		Logger.trace("cdm", {
			klass: "NAGSignalManager",
			method: "userDeletion",
			channelId: this.call.getChannelId(),
			message: "Requested to delete Nag user"
		});
		
		
		function success(res){
			Logger.trace("cdm", {
				klass: "NAGSignalManager",
				method: "userDeletion",
				channelId: this.call.getChannelId(),
				message: "Deleted to be success"
			});
		}
		
		function error(xhr, res){
			Logger.error("cdm", {
				klass: "NAGSignalManager",
				method: "userDeletion",
				channelId: this.call.getChannelId(),
				message: "Status[" + xhr.status + "] Failed to delete Nag user"
			});
		}
		
		var url = this.call.playRtc.config.url + "/v2/playrtc/signal/user/" + this.call.getPid().substr(2);
		this.requestAjax(
			"delete", url,
			"application/json; charset=UTF-8",
			"{}", success, error
		);
	},
	requestTurnServer: function(fn){
		Logger.trace("cdm", {
			klass: "NAGSignalManager",
			method: "requestTurnServer",
			channelId: this.call.getChannelId(),
			message: "Requested nag turn server"
		});
		
		function success(res){
			Logger.trace("cdm", {
				klass: "NAGSignalManager",
				method: "userDeletion",
				channelId: this.call.getChannelId(),
				message: "Got nag turn servers. data = " + JSON.stringify(res)
			});

			var turn = [{
				url: "turn:"+ res.data.turnserver.turnIp + ":" + res.data.turnserver.turnPort,
				credential: res.data.turnserver.turnPw,
				username: res.data.turnserver.turnId
			}];
			this.fire("nagTurnList", [turn]);
			
			fn(turn);
		}
		
		function error(xhr, res){
			Logger.error("cdm", {
				klass: "NAGSignalManager",
				method: "requestTurnServer",
				channelId: this.call.getChannelId(),
				message: "Status[" + xhr.status + "] Failed to request NAG TURN Server"
			});
		}
		
		var url = this.call.playRtc.config.signalServer.rest
			+ "/webrtcsignaling/" + this.getApiVersion() + "/" + this.call.getPid().substr(2) + "/turnserver?authToken=" + this.getToken()

		this.requestAjax(
			"get", url,
			"application/x-www-form-urlencoded",
			"{}", success, error
		);
	},
	setToken: function(token){
		this.token = token;
	},
	getToken: function(){
		return this.token;
	},
	getApiVersion: function(){
		return this.apiVersion;
	},
	open: function(){
		this.send(JSON.stringify({
			"apiMethod" : "POST", 
			"apiUrl" : "/notificationchannel/" + this.getApiVersion() + "/" + this.call.getPid().substr(2) + "/channels",
			"data" : {
				"authToken" : this.getToken()
			}
		}));
	},
	send: function(data){
		this.socket.send(data);
	},
	message: function(message){
		var body = JSON.parse(message.data),
			service = null;
		
		if(body.requestError){
			Logger.error("cdm", {
				klass: "NAGSignalManager",
				method: "message",
				channelId: this.call.getChannelId(),
				message: "Received data = " + message.data
			});
			
			nagErrorDelegate.call(this, body.requestError.serviceException.messageId, body);
			return;
		}
		
		service = body.service.toUpperCase();
		switch(service){
			case "WEBRTCSIGNALING":
				if(body.data.offer){
					this.fire("receiveNagOfferSdp", "PR" + body.data.originatorAddress, {sdp: body.data.offer.sdp, type: "offer"}, body.data.sessionId);
				}
				else if(body.data.answer){
					this.fire("receiveNagAnwserSdp", body.data.sessionId, {sdp: body.data.answer.sdp, type: "answer"});
				}
				else if(body.data.status === "ended" && body.data.reason === "no answer"){
					Logger.error("cdm", {
						klass: "NAGSignalManager",
						method: "message",
						channelId: this.call.getChannelId(),
						message: "No answer"
					});
					this.fire("error", "S4408", SDK_ERROR_CODE["S4408"]);
				}
				break;
		}
	},
	destory: function(){
		if(this.socket){
			this.socket.close();
		}
		
		if(this.inteval){
			window.clearInterval(this.inteval);
		}
		
		this.userDeletion();
	}
});

var NAGSignalingAdapter = PlayRTC.Signaling.Extend({
	initialize: function(call, url){
		NAGSignalingAdapter.base.initialize.call(this, call, url);

		this.mgr = this.call.getNAGMgr();
		this.sdpMLineIndex = {};
		this.timer = null;
		this.sessionId = null;
		
		Logger.trace("cdm", {
			klass: "NAGSignalingAdapter",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "Created instance of 'NAGSignalingAdapter'"
		});
	},
	createSignal: function(){
		NAGSignalingAdapter.base.createSignal.call(this);

		this.socket
			.on("message", this.message, this);
	},
	send: function(data){
		if(this.socket.getReadyState() === 1){
			this.socket.send(data);
		}
		else{
			this.fire("error", "S4403", ["S4403"]);
		}
	},
	connect: function(peerid){
		this.fire("connect", peerid);
	},
	splitSdp: function(sdp){
		sdp = sdp.split("m=");
		return sdp;
	},
	parseSdp: function(sdp){
		var result = sdp.shift(),
			i = 0,
			sdpMLineIndex,
			j;
		
		for(; i<sdp.length; i++){
			result = result + "m=";
			result = result + sdp[i];

			sdpMLineIndex = this.sdpMLineIndex[i];
			if(sdpMLineIndex){
				for(j = 0; j<sdpMLineIndex.length; j++){
					if(/^a=/.test(sdpMLineIndex[j].candidate)){
						result = result + sdpMLineIndex[j].candidate;
					}
					else{
						result = result + "a=" + sdpMLineIndex[j].candidate + "\r\n";
					}
				}
			}
		}

		return result;
	},
	sendCandidate: function(id, candidate){
		if(this.sdpMLineIndex.hasOwnProperty(candidate.sdpMLineIndex)){
			this.sdpMLineIndex[candidate.sdpMLineIndex].push(candidate);
		}
		else{
			this.sdpMLineIndex[candidate.sdpMLineIndex] = [candidate];
		}
	},
	sendOfferSdp: function(id, sdp){
		var splitSdp = null,
		data = {
			"apiMethod" : "POST", 
			"apiUrl" : "/webrtcsignaling/" + this.mgr.getApiVersion() + "/" + this.call.getPid().substr(2) + "/sessions",
			"data" : {
				"authToken" : this.mgr.getToken(),
				"originatorAddress" : this.call.getPid().substr(2),
				"participantAddress" : id.substr(2), 
				"subject" : "offer's sdp send.", 
				"callType" : "web",
				"offer" : {
					"sdp" : ""
				}
			
			}
		};

		splitSdp = this.splitSdp(sdp.sdp);
		this.timer = window.setTimeout(utils.bind(function(){
			var sdp = this.parseSdp(splitSdp);
			data.data.offer.sdp = sdp;

			NAGSignalingAdapter.base.sendOfferSdp.call(this, JSON.stringify(data));
		}, this), 2000);
	},
	sendAnswerSdp: function(id, sdp, sessionId){
		var splitSdp = null,
		data = {
			"apiMethod" : "PUT", 
			"apiUrl" : "/webrtcsignaling/" + this.mgr.getApiVersion() + "/" + this.call.getPid().substr(2) + "/sessions/" + this.sessionId + "/answer",
			"data" : {
				"authToken" : this.mgr.getToken(),
				"answer" : {
					"sdp" : ""
				}
			}
		};

		splitSdp = this.splitSdp(sdp.sdp);
		this.timer = window.setTimeout(utils.bind(function(){
			var sdp = this.parseSdp(splitSdp);
			data.data.answer.sdp = sdp;

			NAGSignalingAdapter.base.sendAnswerSdp.call(this, JSON.stringify(data));
		}, this), 2000);
	},
	signalEnd: function(){
		
	},
	setSessionId: function(sessionId){
		this.sessionId = sessionId;
	},
	message: function(message){
		var body = JSON.parse(message.data),
			service = null;
		
		if(body.requestError){
			Logger.error("cdm", {
				klass: "NAGSignalingAdapter",
				method: "message",
				channelId: this.call.getChannelId(),
				message: "Received data = " + message.data
			});
	
			nagErrorDelegate.call(this, body.requestError.serviceException.messageId, data);
			return;
		}

		service = body.service.toUpperCase();
		switch(service){
			case "WEBRTCSIGNALING":
				if(body.data.status === "trying"){
					this.setSessionId(body.data.sessionId);
					this.socket.close();
				}
				else if(body.data.status === "accepted"){
					this.socket.close();
				}
				break;
		}
	}
});
/**
 * Peer Class
 * @class Peer
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var Peer = utils.Extend(utils.Event, {
	initialize: function(call, id, uid, localStream, config){
		Peer.base.initialize.call(this);

		this.config = utils.apply({
			iceServers: null,
			dataChannelEnabled: false
		}, config);

		this.call = call;
		this.id = id;
		this.uid = uid;
		this.localStream = localStream;
		this.media = null;
		
		Logger.trace("cdm", {
			klass: "Peer",
			method: "initialize",
			channelId: this.call.getChannelId(),
			message: "Created instance of 'Peer'"
		});
	},
	setEvent: function(){
		var pc = this.pc;
		pc.onicecandidate = utils.bind(function(e){
			Logger.trace("cdm", {
				klass: "Peer",
				method: "setEvent",
				channelId: this.call.getChannelId(),
				message: "Created candidate. candidate = " + JSON.stringify(e.candidate)
			});
			if(e.candidate){
				this.fire("sendCandidate", this.id, e.candidate);
			}
		}, this);

		pc.onaddstream = utils.bind(function(e){
			this.fire("addRemoteStream", this.id, this.uid, e.stream);
			this.media = new Media(e.stream);
		}, this);

		pc.onsignalingstatechange = utils.bind(function(e){
			this.fire("signalingstatechange", e);
		}, this);

		pc.oniceconnectionstatechange = utils.bind(function(e){
			this.fire("iceconnectionstatechange", e);

			var connectionState = e.target.iceConnectionState.toUpperCase(),
				gatheringState = e.target.iceGatheringState.toUpperCase();

			Logger.trace("cdm", {
				klass: "Peer",
				method: "setEvent",
				channelId: this.call.getChannelId(),
				message: "ConnectionState[" + connectionState + "] GatheringState[" + gatheringState + "] Changed P2P's state"
			});
			
			if(connectionState === "FAILED"){
				Logger.error("cndm", {
					klass: "Peer",
					method: "setEvent",
					service: "P2P",
					stateCode: 50301,
					errorCode: 40206,
					isSuccess: "N",
					token: this.call.getToken(),
					channelId: this.call.getChannelId(),
					myPeerId: this.call.getPid(),
					myUserId: this.call.getUid(),
					yourPeerId: this.id,
					yourUserId: this.uid,
					message: "PID[" + this.call.getPid() + "] UID[" + this.call.getUid() + "] OtherPID[" + this.id + "] OtherUID[" + this.uid + "] Failed P2P connection"
				});
				
				this.fire("error", "P4501", SDK_ERROR_CODE["P4501"]);
			}
			else if(connectionState === "CHECKING"){
				this.fire("stateChange", "CHECKING", this.id, this.uid);
			}
			else if(connectionState === "COMPLETED" || connectionState === "CONNECTED"){
				if(!this.connected){
					Logger.trace("cndm", {
						klass: "Peer",
						method: "setEvent",
						service: "P2P",
						stateCode: 50301,
						errorCode: 20001,
						isSuccess: "Y",
						token: this.call.getToken(),
						channelId: this.call.getChannelId(),
						myPeerId: this.call.getPid(),
						myUserId: this.call.getUid(),
						yourPeerId: this.id,
						yourUserId: this.uid,
						message: "PID[" + this.call.getPid() + "] UID[" + this.call.getUid() + "] OtherPID[" + this.id + "] OtherUID[" + this.uid + "] Connected P2P"
					});
				}				
				this.connected = true;
				
				this.fire("stateChange", "CONNECTED", this.id, this.uid);
			}
			else if(connectionState === "DISCONNECTED"){
				this.fire("stateChange", "DISCONNECTED", this.id, this.uid);
			}

			if(connectionState === "COMPLETED" || connectionState === "CONNECTED" || connectionState === "FAILED"){
				this.fire("signalEnd", this.id);
			}
			
		}, this);

		pc.onremovestream = utils.bind(function(e){
			this.fire("removestream", e);
		}, this);

		pc.onclose = utils.bind(function(e){
			this.fire("close", e);
		}, this);
	},
	createPeerConnection: function(){
		Logger.trace("cdm", {
			klass: "Peer",
			method: "createPeerConnection",
			channelId: this.call.getChannelId(),
			message: "PID[" + this.id + "] Created instance of 'Native PeerConnection'"
		});

		this.pc = new PeerConnection({
			iceServers: this.config.iceServers
		}, {
			optional: [
				{ DtlsSrtpKeyAgreement: true },
				{ RtpDataChannels: false }
			]
		});

		this.setEvent();
		if(this.localStream){
			this.pc.addStream(this.localStream);
		}

		if(utils.dataChannelSupport && this.config.dataChannelEnabled){
			this.data = new Data(this);
			this.data.on("open", utils.bind(function(){
				/**
				 * 상대방과의 DataChannel 이 연결되면 호출되는 이벤트이다.
				 * @event addDataStream
				 * @memberof PlayRTC.prototype
				 * @param {String} peerid 나와 연결된 상대방의 peerId.
				 * @param {String} userid 나와 연결된 상대방의 userId. 
				 * @param {Data} dataChannel dataChannel 객체의 wrapper 객체로 이벤트를 정의 할 수 있다.
				 * @example
				 	conn.on("addDataStream", function(peerid, userid, dataChannel){
				 		dataChannel.on("message", function(message){
				 			
				 		});
				 		
				 		dataChannel.on("progress", function(message){
				 			
				 		});
				 		
				 		dataChannel.on("error", function(message){
				 			
				 		});
				 	});
				 */
				this.call.playRtc.fire("addDataStream", this.id, this.uid, this.data);
			}, this));
		}
		else{
			this.config.dataChannelEnabled && Logger.warn("cndm", {
				klass: "Peer",
				method: "createPeerConnection",
				service: "P2P",
				stateCode: 50401,
				errorCode: 40207,
				isSuccess: "N",
				token: this.call.getToken(),
				channelId: this.call.getChannelId(),
				myPeerId: this.call.getPid(),
				myUserId: this.call.getUid(),
				yourPeerId: this.id,
				yourUserId: this.uid,
				message: "PID[" + this.id + "] Didn't create data channel"
			});
		}
	},
	createOffer: function(){
		this.createPeerConnection();
		this.pc.createOffer(utils.bind(function(sessionDesc){
			Logger.trace("cdm", {
				klass: "Peer",
				method: "createOffer",
				channelId: this.call.getChannelId(),
				message: "Create offer sdp. offerSdp = " + JSON.stringify(sessionDesc)
			});

			this.pc.setLocalDescription(sessionDesc);
			this.fire("sendOfferSdp", this.id, sessionDesc);
		}, this), utils.bind(function(){
			Logger.error("cndm", {
				klass: "Peer",
				method: "createOffer",
				service: "P2P",
				stateCode: 50205,
				errorCode: 40203,
				isSuccess: "N",
				token: this.call.getToken(),
				channelId: this.call.getChannelId(),
				myPeerId: this.call.getPid(),
				myUserId: this.call.getUid(),
				yourPeerId: this.id,
				yourUserId: this.uid,
				message: "Failed to create offer sdp"
			});
			
			this.fire("error", "S4404", SDK_ERROR_CODE["S4404"]);
		}, this));
	},
	createAnswer: function(sdp){
		if(!this.pc){
			this.createPeerConnection();
		}
		var me = this,
			pc = this.pc;

		try{
			pc.setRemoteDescription(new NativeRTCSessionDescription(sdp));
			
			Logger.trace("cdm", {
				klass: "Peer",
				method: "createAnswer",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Set offer sdp. offerSdp = " + JSON.stringify(sdp)
			});
		}
		catch(e){
			Logger.error("cndm", {
				klass: "Peer",
				method: "createAnswer",
				service: "SGL",
				stateCode: 50206,
				errorCode: 40204,
				isSuccess: "N",
				token: this.call.getToken(),
				channelId: this.call.getChannelId(),
				myPeerId: this.call.getPid(),
				myUserId: this.call.getUid(),
				yourPeerId: this.id,
				yourUserId: this.uid,
				message: "OtherPID[" + this.id + "] Failed to set offer sdp"
			});
			
			this.fire("error", "S4405", SDK_ERROR_CODE["S4405"]);
			return;
		}
		
		pc.createAnswer(utils.bind(function(sessionDesc){
			Logger.trace("cdm", {
				klass: "Peer",
				method: "createAnswer",
				channelId: this.call.getChannelId(),
				message: "Created answer sdp. answerSdp = " + JSON.stringify(sessionDesc)
			});

			this.pc.setLocalDescription(sessionDesc);
			this.fire("sendAnswerSdp", this.id, sessionDesc);
		}, this), utils.bind(function(){
			Logger.error("cndm", {
				klass: "Peer",
				method: "createAnswer",
				service: "SGL",
				stateCode: 50205,
				errorCode: 40203,
				isSuccess: "N",
				token: this.call.getToken(),
				channelId: this.call.getChannelId(),
				myPeerId: this.call.getPid(),
				myUserId: this.call.getUid(),
				yourPeerId: this.id,
				yourUserId: this.uid,
				message: "Failed to create answer sdp"
			});
			
			this.fire("error", "S4404", SDK_ERROR_CODE["S4404"]);
		}, this));
	},
	receiveAnwserSdp: function(sdp){
		var pc = this.pc;
		try{
			pc.setRemoteDescription(new NativeRTCSessionDescription(sdp));
			
			Logger.trace("cdm", {
				klass: "Peer",
				method: "receiveAnwserSdp",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Set anwser sdp. anwserSdp = " + JSON.stringify(sdp)
			});
		}
		catch(e){
			Logger.error("cndm", {
				klass: "Peer",
				method: "receiveAnwserSdp",
				service: "SGL",
				stateCode: 50206,
				errorCode: 40204,
				isSuccess: "N",
				token: this.call.getToken(),
				channelId: this.call.getChannelId(),
				myPeerId: this.call.getPid(),
				myUserId: this.call.getUid(),
				yourPeerId: this.id,
				yourUserId: this.uid,
				message: "OtherPID[" + this.id + "] Failed to set offer sdp"
			});
			
			this.fire("error", "S4405", SDK_ERROR_CODE["S4405"]);
		}
	},
	receiveCandidate: function(candidate){
		if(!this.pc){
			this.createPeerConnection();
		}
		
		var pc = this.pc;
		try{
			candidate = new NativeRTCIceCandidate(candidate);
			pc.addIceCandidate(candidate);
			
			Logger.trace("cdm", {
				klass: "Peer",
				method: "receiveAnwserSdp",
				channelId: this.call.getChannelId(),
				message: "OtherPID[" + this.id + "] Set candidate. candidate = " + candidate
			});
		}
		catch(e){
			Logger.error("cndm", {
				klass: "Peer",
				method: "receiveAnwserSdp",
				service: "SGL",
				stateCode: 50208,
				errorCode: 40205,
				isSuccess: "N",
				token: this.call.getToken(),
				channelId: this.call.getChannelId(),
				myPeerId: this.call.getPid(),
				myUserId: this.call.getUid(),
				yourPeerId: this.id,
				yourUserId: this.uid,
				message: "OtherPID[" + this.id + "] Failed to set candidate"
			});
			
			this.fire("error", "S4406", SDK_ERROR_CODE["S4406"]);
		}
	},
	close: function(){
		if(this.pc){
			this.pc.close();
		}
	},
	/**
	 * Peer 가 생성한 DataChannel 객체를 반환한다. 이렇게 반환받은 DataChannel 을 이용하여 해당 Peer 에게 Text 또는 File 을 전송할 수 있다.
	 * @method getDataChannel
	 * @memberof Peer.prototype
	 * @example
	 //Remote
	 var peer = conn.getPeerById("peerId");
	 var dc = peer.getDataChannel();
	 
	 dc.send("전송할 데이터");
	 */
	getDataChannel: function(){
		return this.data;
	},
	/**
	 * Remote Stream 을 담고 있는 Meida 객체를 반환한다.
	 * @method getMedia
	 * @memberof Peer.prototype
	 * @return {Media} media Remote Stream 을 담고 있는 Media 객체를 반환한다.
	 * @example
	 var peer = conn.getPeerById("peerId");
	 peer.getMedia();
	 */
	getMedia: function(){
		if(this.media){
			return this.media;
		}
		return null;
	},
	/**
	 * 해당 Peer 의 webrtc Native PeerConnection 객체를 반환한다.
	 * @method getPeerConnection
	 * @memberof Peer.prototype
	 * @return {PeerConnection} peerConnection WebRTC PeerConnection 객체를 반환한다.
	 * @example
	 var peer = conn.getPeerById("peerId");
	 peer.getPeerConnection();
	 */
	getPeerConnection: function(){
		return this.pc;
	},
	/**
	 * 해당 Peer 의 P2P 성능 측정을 위한 정보를 배열로 반환한다. 이때 해당 반환값을 받아 처리 하기 위한 함수를 인자로 전달해야 한다.
	 * @method getStats
	 * @memberof Peer.prototype
	 * @param {Function} fn 성능 측정을 위한 정보를 인자로 넘겨받는 함수를 지정한다.
	 * @example
	 var peer = conn.getPeerById("peerId");
	 peer.getStats(function(state){
	 	console.log(state);
	 	console.log(state.length);
	 });
	 */
	getStats: function(fn){
		this.pc.getStats(utils.bind(function(res){
			var items = [ ];
			res.result().forEach(function (result) {
				var item = { };
				result.names().forEach(function (name) {
					item[name] = result.stat(name);
				});
				item.id = result.id;
				item.type = result.type;
				item.timestamp = result.timestamp;
				items.push(item);
			});

			fn.call(this, items);
		}, this));
	}
});
/**
 * @class Media
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var Media = (function(){
	if(!utils.blobWorkerSupport){
		return false;
	}
	
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var AudioRecorderWorker = (function(){
		function mergeBuffers(channelBuffer, recordingLength){
			var result = new Float32Array(recordingLength),
				offset = 0,
				lng = channelBuffer.length,
				i = 0,
				buffer = null;
			
			for(; i < lng; i++){
				buffer = channelBuffer[i];
				result.set(buffer, offset);
				offset += buffer.length;
			}
			return result;
		};
		
		function interleave(inputL, inputR){
			var length = inputL.length + inputR.length,
				result = new Float32Array(length),
				index = 0,
				inputIndex = 0;
	
			while (index < length){
				result[index++] = inputL[inputIndex];
				result[index++] = inputR[inputIndex];
				inputIndex++;
			}
			return result;
		};	
		
		function encodeWAV(samples, mono){
			var buffer = new ArrayBuffer(44 + samples.length * 2),
				view = new DataView(buffer);

			/* RIFF identifier */
			writeUTFBytes(view, 0, 'RIFF');
			/* file length */
			view.setUint32(4, 32 + samples.length * 2, true);
			/* RIFF type */
			writeUTFBytes(view, 8, 'WAVE');
			/* format chunk identifier */
			writeUTFBytes(view, 12, 'fmt ');
			/* format chunk length */
			view.setUint32(16, 16, true);
			/* sample format (raw) */
			view.setUint16(20, 1, true);
			/* channel count */
			view.setUint16(22, mono?1:2, true);
			/* sample rate */
			view.setUint32(24, sampleRate, true);
			/* byte rate (sample rate * block align) */
			view.setUint32(28, sampleRate * 4, true);
			/* block align (channel count * bytes per sample) */
			view.setUint16(32, 4, true);
			/* bits per sample */
			view.setUint16(34, 16, true);
			/* data chunk identifier */
			writeUTFBytes(view, 36, 'data');
			/* data chunk length */
			view.setUint32(40, samples.length * 2, true);

			floatTo16BitPCM(view, 44, samples);

			return view;
		};

		function floatTo16BitPCM(output, offset, input){
			for (var i = 0; i < input.length; i++, offset+=2){
				var s = Math.max(-1, Math.min(1, input[i]));
				output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
			}
		};

		function writeUTFBytes(view, offset, string){
			for (var i = 0; i < string.length; i++){
				view.setUint8(offset + i, string.charCodeAt(i));
			}
		};
		
		function clear(){
			recLength = 0;
			recBuffersL = [];
			recBuffersR = [];
			sampleRate = null;
		};
		
		function record(length, leftBuf, rightBuf){
			recBuffersL.push(new Float32Array(leftBuf));
			recBuffersR.push(new Float32Array(rightBuf));
			recLength += length;
		};
		
		function exportWAV(){
			var lBuf = mergeBuffers(recBuffersL, recLength);
			var rBuf = mergeBuffers(recBuffersR, recLength);
			
			var interleaved = interleave(lBuf, rBuf);					
			var dataview = encodeWAV(interleaved);
			var audioBlob = new Blob([dataview], { type: "audio/wav" });

			postMessage(audioBlob);
		};

		var javascript = function(e){
			var data = e.data,
				type = data.type;

			if(type === "init"){
				sampleRate = data.sampleRate;
			}
			else if(type === "record"){
				record(data.length, data.leftBuf, data.rightBuf);
			}
			else if(type === "export"){
				exportWAV();
				clear();
			}
		}.toString();

		var blob = new Blob([
			"var recLength = 0, recBuffersL = [], recBuffersR = [], sampleRate = null;",
			mergeBuffers.toString(),
			interleave.toString(),
			encodeWAV.toString(),
			floatTo16BitPCM.toString(),
			writeUTFBytes.toString(),
			clear.toString(),
			record.toString(),
			exportWAV.toString(),
			"this.onmessage = " + javascript
		], {
			type: "application/javascript"
		});

		blob = URL.createObjectURL(blob);
		var w = new Worker(blob);
		URL.revokeObjectURL(blob);

		return w;
	})();

	var AudioRecorder = function(stream){
		this.stream = stream;
	};

	AudioRecorder.prototype.start = function(){
		var context = new AudioContext(),
			analyser = context.createAnalyser(),
			audioSource = context.createMediaStreamSource(this.stream),
			audioScript = context.createScriptProcessor(2048);

		audioSource.connect(audioScript);
		audioSource.connect(context.destination);
		audioScript.connect(context.destination);
	
		audioScript.onaudioprocess = function(e){
			AudioRecorderWorker.postMessage({
				type: "record",
				length: e.inputBuffer.length,
				leftBuf: e.inputBuffer.getChannelData(0),
				rightBuf: e.inputBuffer.getChannelData(1)
			});
		};
		
		AudioRecorderWorker.postMessage({
			type: "init",
			sampleRate: context.sampleRate
		});
	};

	AudioRecorder.prototype.stop = function(fn){
		AudioRecorderWorker.onmessage = function(e){
			var blob = e.data;
			fn(blob);
		};
		AudioRecorderWorker.postMessage({
			type: "export"
		});
	};
	
	var VideoRecorder = function(stream){
		this.stream = stream;
		this.mr = new MediaRecorder(this.stream);
		this.array = [];
		this.mr.ondataavailable = utils.bind(function(e){
			this.array.push(e.data);
		}, this);
	};
	
	VideoRecorder.prototype.start = function(){
		this.mr.start(1000);
	}; 
	
	VideoRecorder.prototype.stop = function(fn){
		this.mr.stop();
		var encodeData = new Blob(this.array, {type: "video/webm"});
		fn(encodeData);
	};

	return utils.Extend(utils.Event, {
		initialize: function(stream){
			Media.base.initialize.call(this);
			this.stream = stream;
			this.recorder = null;
		},
		createRecorder: function(type){
			var recorder = null,
				stream = this.getStream();

			switch(type){
				case "AUDIO":
					recorder = new AudioRecorder(stream);
					break;
				case "VIDEO":
					if(utils.mediaRecorderSupport){
						recorder = new VideoRecorder(stream);
					}
					else{
						Logger.warn("cdm", {
							klass: "Media",
							method: "createRecorder",
							message: "Media Recorder is not suporrted"
						});
					}
					break;
				default:
					Logger.warn("cdm", {
						klass: "Media",
						method: "createRecorder",
						message: "Must select recorder"
					});
					break;
			}

			return recorder;
		},
		/**
		 * 스트림의 오디오/비디오를 캡처한다. 오디오의 경우 크롬에서는 Local 스트림만 캡처할 수 있으며 파이어폭스에서는 Local, Remote 모두 캡처 할 수 있다. 비디오는 크롬은 녹화가 불가능하며 파이어폭스만 녹화가 가능하다.
		 * 레코드가 가능한 경우는 정리하면 다음과 같다.
		 <table width="500" class="description-table">
		 	<thead>
			 	<tr>
			 		<th>레코딩 구분</th>
			 		<th>브라우저</th>
			 		<th>Local</th>
			 		<th>Remote</th>
			 	</tr>
			 </thead>
			 <tbody>
			 	<tr>
			 		<td rowspan="2">오디오 레코딩</td>
			 		<td>파이어폭스</td>
			 		<td>가능</td>
			 		<td>가능</td>
			 	</tr>
			 	<tr>
			 		<td>크롬</td>
			 		<td>가능</td>
			 		<td>불가능</td>
			 	</tr>
			 	<tr>
			 		<td rowspan="2">비디오 레코딩</td>
			 		<td>파이어폭스</td>
			 		<td>가능</td>
			 		<td>가능</td>
			 	</tr>
			 	<tr>
			 		<td>크롬</td>
			 		<td>불가능</td>
			 		<td>불가능</td>
			 	</tr>
			 </tbody>
		 </table>
		 * @method record
		 * @memberof Media.prototype
		 * @param {String} type 레코딩을 시작할 Type 를 지정한다. audio 또는 video 를 지정할 수 있다.
		 * @example
		 //Local
		 conn.getMedia().record("audio")
		 conn.getMedia().record("video");
		
		 //Remote
		 var peer = conn.getPeerById("id");
		 peer.getMedia().record("audio");
		 peer.getMedia().record("video");
		 */
		record: function(type){
			if(this.recorder){
				return;
			}
			Logger.trace("cdm", {
				klass: "Media",
				method: "record",
				message: "Type[" + type + "] Started record"
			});
			
			type = type.toUpperCase();
			
			this.recorder = this.createRecorder(type);
			if(this.recorder){
				this.recorder.start();
			}
		},
		/**
		 * 현재 녹음 중인 오디오 또는 비디오의 를 중단한다. 이 때 인자로 함수를 넘겨주어야 한다. 이 메소드가 불려지기 바로 직전까지 캡처한 결과인 blob 을 해당 함수의 인자로 전달된다. 만약 해당 blob 을 로컬에 다운로드 하고 싶다면 오디오의 경우 wav 형식의 파일로 저장해야한다. 비디오의 경우 webm 형식으로 저장해야 한다.
		 * @method recordStop
		 * @memberof Media.prototype
		 * @param {Funtion} fn 녹음이 완료되면 통지받을 함수를 지정한다. 해당 함수에는 녹음의 결과인 blob 객체가 전달된다. 해당 객체를 utils 밑에 있는 fileDownload 에 전달하면 다운로드 할 수 있다.
		 * @example
		 conn.getMedia().recordStop(function(blob){ 
		 	//audio 의 경우
		 	PlayRTC.utils.fileDownload(blob, "localAudio.wav");

		 	//video 의 경우
		 	PlayRTC.utils.fileDownload(blob, "localVideo.webm");
		 });
		 */
		recordStop: function(fn){
			if(!this.recorder){
				return;
			}
			
			if(!fn){
				Logger.error("cdm", {
					klass: "Media",
					method: "recordStop",
					message: "Failed to execute 'recordStop' on 'Media': 1 arguments required, but only " + arguments.length + " present"
				});
				return;
			}
			
			Logger.trace("cdm", {
				klass: "Media",
				method: "recordStop",
				message: "Stopped record"
			});

			this.recorder.stop(fn);
			this.recorder = null;
		},
		/**
		 * 스트림을 반환한다.
		 * @method getStream
		 * @memberof Media.prototype
		 * @return {MediaStream} stream 스트림을 반환한다.
		 * @example
		 //Local
		 conn.getMedia().getStream();
		
		 //Remote
		 var peer = conn.getPeerById("peerId");
		 peer.getMedia().getStream();
		 */
		getStream: function(){
			return this.stream;
		},
		/**
		 * 비디오 트랙을 반환한다.
		 * @method getVideoTrack
		 * @memberof Media.prototype
		 * @return {MediaVideoTrack} track 비디오 트랙을 반환한다.
		 * @example
		 //Local
		 conn.getMedia().getVideoTrack();
		
		 //Remote
		 var peer = conn.getPeerById("peerId");
		 peer.getMedia().getVideoTrack();
		 */
		getVideoTrack: function(){
			var s = this.getStream(),
				v = s.getVideoTracks();

			return v.length > 0 ? v[0] : null;
		},
		/**
		 * 오디오 트랙을 반환한다.
		 * @method getAudioTrack
		 * @memberof Media.prototype
		 * @return {MediaVideoTrack} track 비디오 트랙을 반환한다.
		 * @example
		 //Local
		 conn.getMedia().getAudioTrack();
		
		 //Remote
		 var peer = conn.getPeerById("peerId");
		 peer.getMedia().getAudioTrack();
		 */
		getAudioTrack: function(){
			var s = this.getStream(),
				a = s.getAudioTracks();

			return a.length > 0 ? a[0] : null;
		},
		/**
		 * audio 를 비활성화 또는 활성화시킨다. False 를 지정할 경우 비활성화 되며, True 를 지정할 경우 활성화 한다.
		 * @method audioMute
		 * @memberof Media.prototype
		 * @param {Boolean} enabled true, false 를 전달한다.
		 * @return {Boolean} isSuccess audio의 활성화/비활성화 를 정상적으로 수행했다면 true 를 반환. 만약 audio 가 존재하지 않아 실패했다면 false 를 반환한다.
		 * @example
		 //Local
		 conn.getMedia().audioMute(true);

		 //Remote
		 var peer = conn.getPeerById("peerId");
		 peer.getMedia().audioMute(true);
		 */
		audioMute: function(enabled){
			var a = this.getAudioTrack();
			if(a){
				a.enabled = enabled;
				return true;
			}
			return false;
		},
		/**
		 * video 를 비활성화 또는 활성화시킨다. False 를 지정할 경우 비활성화 되며, True 를 지정할 경우 활성화 한다.
		 * @method videoMute
		 * @memberof Media.prototype
		 * @param {Boolean} enabled true, false 를 전달한다.
		 * @return {Boolean} isSuccess video의 활성화/비활성화 를 정상적으로 수행했다면 true 를 반환. 만약 video 가 존재하지 않아 실패했다면 false 를 반환한다.
		 * @example
		 //Local
		 conn.getMedia().videoMute(true);

		 //Remote
		 var peer = conn.getPeerById("peerId");
		 peer.getMedia().videoMute(true);
		 */
		videoMute: function(enabled){
			var v  = this.getVideoTrack();
			if(v){
				v.enabled = enabled;
				return true;
			}
			return false;
		},
		/**
		 * video 와 audio 를 한번에 비활성화 또는 활성화시킨다. False 를 지정할 경우 비활성화 되며, True 를 지정할 경우 활성화 한다.
		 * @method mute
		 * @memberof Media.prototype
		 * @param {Boolean} enabled true, false 를 전달한다.
		 * @example
		 //Local
		 conn.getMedia().mute(true);

		 //Remote
		 var peer = conn.getPeerById("peerId");
		 peer.getMedia().mute(true);
		 */
		mute: function(enabled){
			this.audioMute(enabled);
			this.videoMute(enabled);
		},
		stop: function(){
			this.stream.stop();
		}
	});
})();
/**
 * Data Class
 * @class Data
 * @extends PlayRTC.utils.Event
 * @author <a href="mailto:cryingnavi@gmail.com">Heo Youngnam</a>
 */
var Data = (function(){
	if(!utils.blobWorkerSupport){
		return false;
	}

	var TYPE = {
		0: "text",
		1: "file"
	};
	
	var HEADERTYPE = {
		0: "master",
		1: "frag"
	};

	function getUniqId(){
		return new Date().getTime();
	}

	function concatBuffer(buf1, buf2){
		var tmp = new Uint8Array(buf1.byteLength + buf2.byteLength);
		tmp.set(new Uint8Array(buf1), 0);
		tmp.set(new Uint8Array(buf2), buf1.byteLength);
		return tmp.buffer;
	}

	var fileBlob = function(){
		var javascript = function(e){
			var data = e.data,
				reader = null;
			
			if(!FileReaderSync) {
				reader = new FileReader();
				reader.onload = function(e){
					postMessage(e.target.result);
				}
				reader.readAsArrayBuffer(data);
			}
			else{
				reader = new FileReaderSync();
				postMessage(reader.readAsArrayBuffer(data));
			}
		};

		var blob = new Blob([
			"this.onmessage = " + javascript.toString()
		], {
			type: "application/javascript"
		});

		blob = URL.createObjectURL(blob);

		return blob;
	};

	var blobToBufferWorker = (function(){
		var javascript = function(e){
			var data = e.data,
				reader = null;
			
			if(!FileReaderSync) {
				reader = new FileReader();
				reader.onload = function(e){
					postMessage(e.target.result);
				};
				reader.readAsArrayBuffer(data);
			}
			else{
				reader = new FileReaderSync();
				postMessage(reader.readAsArrayBuffer(data));
			}
		};

		var blob = new Blob([
			"this.onmessage = " + javascript.toString()
		], {
			type: "application/javascript"
		});

		blob = URL.createObjectURL(blob);
		var w = new Worker(blob);
		URL.revokeObjectURL(blob);

		return w;
	})();

	var TextReceiveDatas = { }, 
		FileReceiveDatas = { };

	return utils.Extend(utils.Event, {
		initialize: function(peer){
			Data.base.initialize.call(this);

			this.peer = peer;
			this.sending = false;
			this.queue = [];
			this.dataChannel = this.peer.getPeerConnection().createDataChannel("channel", {
				id: 1
			});

			this.setEvent();
			
			Logger.trace("cndm", {
				klass: "Data",
				method: "initialize",
				service: "P2P",
				stateCode: 50401,
				errorCode: 20001,
				isSuccess: "Y",
				token: this.peer.call.getToken(),
				channelId: this.peer.call.getChannelId(),
				myPeerId: this.peer.call.getPid(),
				myUserId: this.peer.call.getUid(),
				yourPeerId: this.peer.id,
				yourUserId: this.peer.uid,
				message: "OtherPID[" + peer.id + "] Created instance of 'Data'"
			});
		},
		setEvent: function(){
			var dc = this.dataChannel;
			dc.onopen = utils.bind(function(e){
				Logger.trace("cdm", {
					klass: "Data",
					method: "setEvent",
					channelId: this.peer.call.getChannelId(),
					message: "OtherPID[" + this.peer.id + "] Opened dataChannel"
				});

				this.fire("open", e);
			}, this);

			dc.onclose = utils.bind(function(e){
				Logger.trace("cdm", {
					klass: "Data",
					method: "setEvent",
					channelId: this.peer.call.getChannelId(),
					message: "OtherPID[" + this.peer.id + "] Closed dataChannel"
				});
	
				this.fire("close", e);
			}, this);

			dc.onerror = utils.bind(function(e){
				Logger.error("cndm", {
					klass: "Data",
					method: "setEvent",
					service: "P2P",
					stateCode: 50404,
					errorCode: 40207,
					isSuccess: "N",
					token: this.peer.call.getToken(),
					channelId: this.peer.call.getChannelId(),
					myPeerId: this.peer.call.getPid(),
					myUserId: this.peer.call.getUid(),
					yourPeerId: this.peer.id,
					yourUserId: this.peer.uid,
					message: "OtherPID[" + this.peer.id + "] Caused error"
				});

				/**
				 * 데이터를 주고 받을 때 에러가 발생되면 이벤트가 호출된다.
				 * @event error
				 * @memberof Data.prototype
				 * @param {Object} err 에러 객체 또는 문자열을 전달 받는다. DataChannel 의 에러 이벤트가 호출되면 에러 객체가 전달되고 전송 또는 데이터를 받았을 때 파싱과정에서 에러가 나면 SEND_ERROR, RECEIVE_ERROR 문자열을 전달 받는다.
				 * @example
				 	dc.on("error", function(err){
				 		
				 	});
				 */
				this.fire("error", e);
			}, this);

			function onmessage(data){
				var dv = new DataView(data),
					id = dv.getFloat64(0),
					type = dv.getInt32(20);
				
				try{
					if(TextReceiveDatas[id]){
						this.textReceive(id, dv, data);
					}
					else if(FileReceiveDatas[id]){
						this.fileReceive(id, dv, data);
					}
					else{
						if(TYPE[type] === "text"){
							this.textReceive(id, dv, data);
						}
						else{
							this.fileReceive(id, dv, data);
						}
					}
				}
				catch(e){
					Logger.error("cndm", {
						klass: "Data",
						method: "setEvent",
						service: "P2P",
						stateCode: 50403,
						errorCode: 40208,
						isSuccess: "N",
						token: this.peer.call.getToken(),
						channelId: this.peer.call.getChannelId(),
						myPeerId: this.peer.call.getPid(),
						myUserId: this.peer.call.getUid(),
						yourPeerId: this.peer.id,
						yourUserId: this.peer.uid,
						message: "OtherPID[" + this.peer.id + "] Failed to receive message"
					});
					
					this.fire("error", e);
				}
			};
			
			blobToBufferWorker.onmessage = utils.bind(function(e){
				onmessage.call(this, e.data);
			}, this);

			dc.onmessage = utils.bind(function(e){
				Logger.trace("cdm", {
					klass: "Data",
					method: "setEvent",
					channelId: this.peer.call.getChannelId(),
					message: "OtherPID[" + this.peer.id + "] Received message"
				});
				
				if(utils.browser.name === "chrome"){
					onmessage.call(this, e.data);
				}
				else{
					blobToBufferWorker.postMessage(e.data);
				}
			}, this);
		},
		/**
		 * 텍스트 또는 파일을 파라미터로 전달하여 상대 Peer 에게 전송한다. dataSend 메소드는 실제 이 메소드를 이용하여 전송하는 것이다.
		 * @method send
		 * @memberof Data.prototype
		 * @param {Object} data 텍스트 또는 파일을 파라미터로 전달하여 상대 Peer 에게 전송한다.
		 * @example
			var pc = conn.getPeerByPeerId("peerid");
			var dc = pc.getDataChannel();
			dc.send("전송할 데이터");
		 */
		send: function(message, success, error){
			if(message.size){
				// if(message.size && message.type && message.name){
				if(!this.sending){
					this.sendFile(message, success, error);
				}
				else{
					this.queue.push({
						message: message,
						success: success,
						error: error
					});
				}
				
				this.sending = true;
			}
			else{
				this.sendText(message, success, error);
			}
		},
		bufferedSend: function(message){
			var dc = this.dataChannel;
			try{
				dc.send(message);
				Logger.trace("cdm", {
					klass: "Data",
					method: "bufferedSend",
					channelId: this.peer.call.getChannelId(),
					message: "Sent message"
				});
			}
			catch(e){
				this.fire("error", e);

				Logger.error("cndm", {
					klass: "Data",
					method: "bufferedSend",
					service: "P2P",
					stateCode: 50402,
					errorCode: 40207,
					isSuccess: "N",
					token: this.peer.call.getToken(),
					channelId: this.peer.call.getChannelId(),
					myPeerId: this.peer.call.getPid(),
					myUserId: this.peer.call.getUid(),
					yourPeerId: this.peer.id,
					yourUserId: this.peer.uid,
					message: "Failed to send dataChannel message error"
				});

				return false;
			}

			return true;
		},
		sendText: function(text, success, error){
			var dc = this.dataChannel,
				id = getUniqId(),
				fragHbuf = new ArrayBuffer(20),
				fragDv = new DataView(fragHbuf);

				fragDv.setFloat64(0, id);
				fragDv.setInt32(8, 1);

			var send = utils.bind(function(hbuf, arr, index){
				var bbuf = arr[index];
				
				if(!this.bufferedSend(concatBuffer(hbuf, bbuf))){
					//error
					if(error){
						error(text);
					}
					return;
				}

				if((index + 1) < arr.length){
					window.setTimeout(function(){
						var i = index + 1;
						fragDv.setInt32(12, i);
						fragDv.setInt32(16, arr[i].byteLength);

						send(fragDv.buffer, arr, i);
					}, 10);
				}
				else{
					//success
					if(success){
						success(text);
					}
				}
			}, this);
			
			var buf = new ArrayBuffer(text.length * 2),
				view = new Uint8Array(buf),
				i = 0,
				char = null,
				len = text.length,
				j = 0;
	
			for(;i < len; i++) {
				char = text.charCodeAt(i);
				view[j] = char >>> 8;
				view[j + 1] = char & 0xFF;
				j = j + 2;
			}
			
			var arr = this.packetSplit(buf, 66488),
				hbuf = new ArrayBuffer(36),
				dv = new DataView(hbuf);
	
			dv.setFloat64(0, id);
			dv.setInt32(8, 0);
			dv.setFloat64(12, buf.byteLength);
			dv.setInt32(20, 0);
			dv.setInt32(24, arr.length);
			dv.setInt32(28, 0);
			dv.setInt32(32, arr[0].byteLength);
	
			send(dv.buffer, arr, 0);
		},
		sendFile: function(file, success, error){
			var dc = this.dataChannel,
				id = getUniqId(),
				fileName = file.name,
				mimeType = file.type,
				fragHbuf = new ArrayBuffer(20),
				fragDv = new DataView(fragHbuf);

				fragDv.setFloat64(0, id);
				fragDv.setInt32(8, 1);

			var send = utils.bind(function (hbuf, arr, index){
				var bbuf = arr[index];
				
				if(!this.bufferedSend(concatBuffer(hbuf, bbuf))){
					//error
					if(error){
						error(file);
					}
					return;
				}

				if((index + 1) < arr.length){
					window.setTimeout(function(){
						var i = index + 1;
						fragDv.setInt32(12, i);
						fragDv.setInt32(16, arr[i].byteLength);

						send(fragDv.buffer, arr, i);
					}, 100);
				}
				else{
					this.sending = false;
					
					//success
					if(success){
						success(file);
					}
					
					nextData = this.queue.pop();
					if(nextData){
						this.send(nextData.message, nextData.success, nextData.error);
					}
				}
			}, this);
			
			var blob = fileBlob();
			var fileWorker = new Worker(blob);
			URL.revokeObjectURL(blob);

			fileWorker.onmessage = utils.bind(function(e){
				var arr = this.packetSplit(e.data, 65978),
					hbuf = new ArrayBuffer(548),
					dv = new DataView(hbuf), tmp = null;

				dv.setFloat64(0, id);
				dv.setInt32(8, 0);
				dv.setFloat64(12, e.data.byteLength);
				dv.setInt32(20, 1);
				
				var i = 24, j = 0;
				for (; i<280; i=i+2) {
					tmp = fileName.charCodeAt(j);
					if(tmp){
						dv.setUint8(i, tmp >>> 8);
						dv.setUint8(i+1, tmp & 0xFF);
					}
					j++;
				}

				var i = 280, j = 0;
				for (; i<536; i=i+2) {
					tmp = mimeType.charCodeAt(j);
					if(tmp){
						dv.setUint8(i, tmp >>> 8);
						dv.setUint8(i+1, tmp & 0xFF);
					}
					j++;
				}

				dv.setInt32(536, arr.length);
				dv.setInt32(540, 0);
				dv.setInt32(544, arr[0].byteLength);

				send(dv.buffer, arr, 0);
			}, this);

			fileWorker.postMessage(file);
		},
		textReceive: function(id, dv, data){
			var progress = { },
				body = null,
				headerType = dv.getInt32(8);

			progress.peerId = this.peer.id;
			if(HEADERTYPE[headerType] === "master"){
				progress.id = id;
				progress.totalSize = dv.getFloat64(12);
				progress.fragCount = dv.getInt32(24);
				progress.fragIndex = dv.getInt32(28);
				progress.fragSize = dv.getInt32(32);

				body = data.slice(36);

				TextReceiveDatas[id] = { };
				TextReceiveDatas[id].totalSize = progress.totalSize;
				TextReceiveDatas[id].fragCount = progress.fragCount;
				TextReceiveDatas[id][progress.fragIndex] = body;
			}
			else{
				progress.id = id;
				progress.totalSize = TextReceiveDatas[id].totalSize;
				progress.fragCount = TextReceiveDatas[id].fragCount;
				progress.fragIndex = dv.getInt32(12);
				progress.fragSize = dv.getInt32(16);

				body = data.slice(20);

				TextReceiveDatas[id][progress.fragIndex] = body;
			}

			/**
			 * DataChannel 을 통해 서로 데이터를 주고 받을 때, 상대방이 보낸 데이터의 양이 클 경우 이를 분할하여 전송 받는다. 이 경우 전체 메시지의 크기와 현재 받은 크기를 헤더 정보에 포함하게 된다. Progress 이벤트는 이 헤더 정보를 바탕으로 사용자에게 progress 할 수 있게 해준다.
			 * @event progress
			 * @memberof Data.prototype
			 * @param {Object} data 
			 * @example
			 	dc.on("progress", function(data){
			 		
			 	});
			 */
			this.fire("progress", progress);

			if((progress.fragCount - 1) === progress.fragIndex){
				
				var totLength = progress.fragCount,
					textData = TextReceiveDatas[id],
					buf = new ArrayBuffer(0),
					view = null,
					chars = [],
					i = 0,
					len = 0;
	
				for(; i<totLength; i++) {
					buf = concatBuffer(buf, textData[i]);
				}
	
				i = 0;
				view = new Uint8Array(buf);
				len = buf.byteLength;
				for(; i < len;) {
					chars.push(((view[i++] & 0xff) << 8) | (view[i++] & 0xff));
				}
				
				if(!this.hasEvent("message")){
					alert("You must create message's event.");
					return false;
				}
				
				/**
				 * DataChannel 을 통해 서로 데이터를 주고 받을 때, 상대방이 보낸 데이터를 수신하는 이벤트이다.
				 * @event message
				 * @memberof Data.prototype
				 * @param {Object} data 
				 * @example
				 	dc.on("message", function(data){
					 		
				 	});
				 */
				this.fire("message", {
					type: "text",
					id: id,
					peerId: this.peer.id,
					totalSize: textData.totalSize,
					data: String.fromCharCode.apply(null, chars)
				});
			}
		},
		fileReceive: function(id, dv, data){
			var progress = { },
				body = null,
				headerType = dv.getInt32(8),
				blob = null,
				tmp = null,
				totLength = null,
				buffer = null,
				blob = null;

			progress.peerId = this.peer.id;
			if(HEADERTYPE[headerType] === "master"){
				progress.totalSize = dv.getFloat64(12);

				progress.fileName = "";
				i = 24;
				for(; i<280; i = i+2){
					tmp = String.fromCharCode(dv.getInt16(i));
					if(tmp.charCodeAt(0) !== 0){
						progress.fileName = progress.fileName + tmp;
					}
				}

				progress.mimeType = "";
				i = 280;
				for(; i<536; i = i+2){
					tmp = String.fromCharCode(dv.getInt16(i));
					if(tmp.charCodeAt(0) !== 0){
						progress.mimeType = progress.mimeType + tmp;
					}
				}
				
				progress.id = id;
				progress.fragCount = dv.getInt32(536);
				progress.fragIndex = dv.getInt32(540);
				progress.fragSize = dv.getInt32(544);

				body = data.slice(548);

				FileReceiveDatas[id] = { };
				FileReceiveDatas[id].totalSize = progress.totalSize;
				FileReceiveDatas[id].fileName = progress.fileName;
				FileReceiveDatas[id].mimeType = progress.mimeType;
				FileReceiveDatas[id].fragCount = progress.fragCount;
				FileReceiveDatas[id][progress.fragIndex] = body;
			}
			else{
				progress.id = id;
				progress.fileName = FileReceiveDatas[id].fileName;
				progress.mimeType = FileReceiveDatas[id].mimeType;
				progress.totalSize = FileReceiveDatas[id].totalSize;
				progress.fragCount = FileReceiveDatas[id].fragCount;
				progress.fragIndex = dv.getInt32(12);
				progress.fragSize = dv.getInt32(16);

				body = data.slice(20);

				FileReceiveDatas[id][progress.fragIndex] = body;
			}

			this.fire("progress", progress);

			if((progress.fragCount - 1) === progress.fragIndex){
				totLength = progress.fragCount;
				buffer = new ArrayBuffer(0);
				i = 0;
				for (; i<totLength; i++) {
					buffer = concatBuffer(buffer, FileReceiveDatas[id][i]);
				}
				
				blob = new Blob([buffer], {
					type: FileReceiveDatas[id].mimeType
				});
				
				if(!this.hasEvent("message")){
					FileReceiveDatas[id] = null;
					alert("You must create message's event.");
					return false;
				}
				
				this.fire("message", {
					type: "file",
					id: id,
					peerId: this.peer.id,
					fileName: FileReceiveDatas[id].fileName,
					mimeType: FileReceiveDatas[id].mimeType,
					totalSize: FileReceiveDatas[id].totalSize,
					blob: blob
				});
				
				FileReceiveDatas[id] = null;
			}
		},
		packetSplit: function(buf, size){
			var arr = [],
				packetSize = size,
				totalSize = buf.byteLength,
				max = Math.ceil(totalSize / packetSize),
				i = 0;

			for (; i <max; i++) {
				arr.push(buf.slice(i * packetSize, (i + 1) * packetSize));
			};

			return arr;
		},
		/**
		 * 생성한 DataChannel 을 Close 한다.
		 * @method close
		 * @memberof Data.prototype
		 * @example
			var pc = conn.getPeerByPeerId("peerid");
			var dc = pc.getDataChannel();
			dc.close();
		 */
		close: function(){
			this.dataChannel.close();
			this.peer.data = null;
		}
	});

})();
var Broker = null;
(function(){
	var requestAjax = function(url, method, succ, error){
		var req = new XMLHttpRequest();
		req.onreadystatechange = utils.bind(function(e) {
			var xhr = e.target,
				res = xhr.responseText;

			if (xhr.readyState === 4 && xhr.status === 200 && res) {
				res = JSON.parse(res);
				succ.call(this, xhr, res);
			}
			else if (xhr.readyState === 4 && xhr.status !== 200) {
				error.call(this, xhr);
			}
		}, this);

		req.open(method, url, true);
		req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		req.send("{}");
	};

	Broker = utils.Extend(utils.Event, {
		initialize: function(url){
			Broker.base.initialize.call(this);

			this.url = url;
		},
		setRoom: function(room){
			this.room = room;
		},
		getUser: function(){
			return this.user;
		},
		setUser: function(user){
			this.user = user;
		},
		getRoomList: function(fn){
			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {code:res.errcode, desc:res.desc};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};

			var url = this.url + "/channel/rooms/";
			requestAjax(
				url, "get", success, error
			);
		},
		getRoomInfo: function(fn){
			if(!this.room){
				return false;
			}
			function success(xhr, res){
				if(res.status && res.status === "SUCCESS"){
					var result = res.result;
					fn(result, "success", xhr);
				}
				else{
					var result = {code:res.errcode, desc:res.desc};
					fn(result, "error", xhr);
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};

			var url = this.url + "/channel/rooms/" + this.room;
			requestAjax(
				url, "get", success, error
			);
		},
		getUserList: function(fn){
			if(!this.room){
				return false;
			}
			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {code:res.errcode, desc:res.desc};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};

			var url = this.url + "/channel/rooms/"+this.room+"/users/";
			requestAjax(
				url, "get", success, error
			);
		},
		getUserInfo: function(userId, fn){
			if(!this.room || !userId){
				return false;
			}
			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {code:res.errcode, desc:res.desc};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};

			var url = this.url + "/channel/rooms/"+this.room+"/users/" + userId ;
			requestAjax(
				url, "get", success, error
			);
		},
		searchUser: function(userId, fn){
			
			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {code:res.errcode, desc:res.desc};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};
			if(!userId){
				return false;
			}
			var url = this.url + "/channel/users/" + userId;
			requestAjax(
				url, "get", success, error
			);
		}
	});
})();

var SDKBroker = null;
(function(){
	var requestAjax = function(url, method, data, succ, error){
		var req = new XMLHttpRequest();
		req.onreadystatechange = utils.bind(function(e) {
			var xhr = e.target,
				res = xhr.responseText;

			if (xhr.readyState === 4 && xhr.status === 200 && res) {
				res = JSON.parse(res);
				succ.call(this, xhr, res);
			}
			else if (xhr.readyState === 4 && xhr.status !== 200) {
				error.call(this, xhr);
			}
		}, this);

		req.open(method, url, true);
		req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		data = data || "{}";
		req.send(data);
	};

	SDKBroker = utils.Extend(utils.Event, {
		initialize: function(url){
			Broker.base.initialize.call(this);

			this.url = url;
		},
		setRoom: function(room){
			this.room = room;
		},
		getUser: function(){
			return this.user;
		},
		setUser: function(user){
			this.user = user;
		},
		enterRoom: function(opt, fn){
			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {error:{code:res.errcode, desc:res.desc}};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				this.room = null;
				if(fn){
					fn(null, "error", xhr);
				}
			};
			opt = JSON.stringify(opt) || "{}";
			var url = this.url + "/channel/rooms/" + this.room +"/users/" + this.user;
			requestAjax(
				url, "post", opt, utils.bind(success, this), utils.bind(error, this)
			);
		},
		leaveRoom: function(peerId, fn){
			if(!this.room){
				return false;
			}
			peerId = peerId || "";
			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {error:{code:res.errcode, desc:res.desc}};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};
			
			var url = this.url + "/channel/rooms/" + this.room +"/users/" + this.user +"/"+ peerId;
			requestAjax(
				url, "delete", "", success, error
			);
			
			this.room = null;
		},
		registAuth: function(userName, userExpires, fn){
			if(!this.room){
				return false;
			}

			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {error:{code:res.errcode, desc:res.desc}};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};
			
			var url = this.url + "/signal/auth/nag/" + userName;
			requestAjax(
				url, "post", "{}", utils.bind(success, this), utils.bind(error, this)
			);
		},
		log: function(logData, fn){
			if(!this.room){
				return false;
			}
			function success(xhr, res){
				if(fn){
					if(res.status && res.status === "SUCCESS"){
						var result = res.result;
						fn(result, "success", xhr);
					}
					else{
						var result = {error:{code:res.errcode, desc:res.desc}};
						fn(result, "error", xhr);
					}
				}
			};

			function error(xhr){
				if(fn){
					fn(null, "error", xhr);
				}
			};

			var url = this.url + "/system/log/";
			requestAjax(
				url, "post", logData, utils.bind(success, this), utils.bind(error, this)
			);
		}

	});
})();

(function(){
	var requestAjax = function(url, method, callback, body){
		var req = new XMLHttpRequest();
		req.onreadystatechange = utils.bind(function(e) {
			var xhr = e.target,
				res = xhr.responseText;

			try{
				if (xhr.readyState === 4 && xhr.status === 200 && res) {
					res = JSON.parse(res);
					if(res.error){
						callback.error(xhr, res);
					}
					else{
						callback.success(res);
					}
				}
				else if (xhr.readyState === 4 && xhr.status !== 200) {
					res = JSON.parse(res);
					callback.error(xhr, res);
				}
			}
			catch(e){
				callback.error(xhr, res);
			}
		}, this);

		req.open(method, url, true);
		req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		
		if(body){
			req.send(JSON.stringify(body));
		}
		else{
			req.send("{}");
		}
	};

	PlayRTC.Helper = {
		setUrl: function(url){
			this.url = url;
		},
		initialize: function(url){
			Helper.base.initialize.call(this);
		},
		createChannel: function(options, success, error){
			var callback = {
				success: function(res){
					success(res.channelId, res.token.tokenId, res.configuration);
				},
				error: function(xhr, res){
					error(xhr, res);
				}
			};

			var url = this.url + "/v2/playrtc/channels/channel";
			requestAjax(
				url,
				"post",
				callback,
				options
			);
		},
		connectChannel: function(channelId, options, success, error){
			var callback = {
				success: function(res){
					success(res.channelId, res.token.tokenId, res.configuration);
				},
				error: function(xhr, res){
					error(xhr, res);
				}
			};

			var url = this.url + utils.strFormat("/v2/playrtc/channels/channel/{0}", channelId);
			requestAjax(
				url,
				"put",
				callback,
				options
			);
		},
		disconnectChannel: function(channelId, peerId, success, error){
			var callback = {
				success: function(res){
					success();
				},
				error: function(xhr, res){
					error(xhr, res);
				}
			};

			var url = this.url + utils.strFormat("/v2/playrtc/channels/channel/{0}/peers/peer/{1}", channelId, peerId);
			requestAjax(
				url,
				"delete",
				callback
			);
		},
		deleteChannel: function(channelId, success, error){
			var callback = {
				success: function(res){
					success(res);
				},
				error: function(xhr, res){
					error(xhr, res);
				}
			};

			var url = this.url + utils.strFormat("/v2/playrtc/channels/channel/{0}", channelId);
			requestAjax(
				url,
				"delete",
				callback
			);
		},
		getChannelList: function(success, error){
			var callback = {
				success: function(res){
					Logger.trace("cdm", {
						klass: "Helper",
						method: "getChannelList",
						message: "Received to get channel list. data = " + JSON.stringify(res)
					});
					if(success){
						success(res);
					}
				},
				error: function(xhr, res){
					Logger.error("cdm", {
						klass: "Helper",
						method: "getChannelList",
						message: "Status[" + xhr.status + "] Failed to get channel list. data = " + JSON.stringify(res)
					});
					if(error){
						error(xhr, res);
					}
				}
			};

			var url = this.url + "/v2/playrtc/channels";
			requestAjax(
				url,
				"get",
				callback
			);
		},
		getChannel: function(channelId, success, error){
			var callback = {
				success: function(res){
					Logger.trace("cdm", {
						klass: "Helper",
						method: "getChannel",
						message: "Received to get channel. data = " + JSON.stringify(res)
					});
					if(success){
						success(res);
					}
				},
				error: function(xhr, res){
					Logger.error("cdm", {
						klass: "Helper",
						method: "getChannelList",
						message: "Status[" + xhr.status + "] Failed to get channel. data = " + JSON.stringify(res)
					});
					if(error){
						error(xhr, res);
					}
				}
			};

			var url = this.url + utils.strFormat("/v2/playrtc/channels/channel/{0}", channelId);
			requestAjax(
				url,
				"get",
				callback
			);
		},
		getPeerList: function(channelId, success, error){
			var callback = {
				success: function(res){
					Logger.trace("cdm", {
						klass: "Helper",
						method: "getPeerList",
						message: "Received to get peer list. data = " + JSON.stringify(res)
					});
					if(success){
						success(res);
					}
				},
				error: function(xhr, res){
					Logger.error("cdm", {
						klass: "Helper",
						method: "getPeerList",
						message: "Status[" + xhr.status + "] Failed to get peer list. data = " + JSON.stringify(res)
					});
					if(error){
						error(xhr, res);
					}
				}
			};

			var url = this.url + utils.strFormat("/v2/playrtc/channels/channel/{0}/peers", channelId);
			requestAjax(
				url,
				"get",
				callback
			);
		},
		getPeer: function(channelId, peerId, success, error){
			var callback = {
				success: function(res){
					Logger.trace("cdm", {
						klass: "Helper",
						method: "getPeer",
						message: "Received to get peer. data = " + JSON.stringify(res)
					});
					if(success){
						success(res);
					}
				},
				error: function(xhr, res){
					Logger.error("cdm", {
						klass: "Helper",
						method: "getPeer",
						message: "Status[" + xhr.status + "] Failed to get peer. data = " + JSON.stringify(res)
					});
					if(error){
						error(xhr, res);
					}
				}
			};

			var url = this.url + utils.strFormat("/v2/playrtc/channels/channel/{0}/peers/peer/{1}", channelId, peerId);
			requestAjax(
				url,
				"get",
				callback
			);
		}
	};
})();



(function(_) {
	Object.defineProperties(_, {
		/**
		 * PlayRTC version
		 * @static
		 * @memberof PlayRTC
		 * @example
		 console.log(PlayRTC.version);
		 */
		version: {
			get: function(){
				return "1.0.5.01";
			}
		},
		utils: {
			get: function(){
				return utils;
			}
		}
	});
}(PlayRTC));

if(!PeerConnection || !NativeRTCSessionDescription || !NativeRTCIceCandidate){
	Logger.info("cdm", {
		message: "Your browser is not supported about WebRTC."
	});
	
	/**
	 * 사용자 단말기에서 WebRTC 를 지원하는지 여부를 반환한다.
	 * @method webRtcSupport
	 * @memberof utils
	 * @example
		PlayRTC.utils.webRtcSupport();
	 */
	utils.webRtcSupport = false;
}
else{
	utils.webRtcSupport = true;
}

return PlayRTC;

});