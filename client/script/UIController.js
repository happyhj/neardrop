function UIController(args) {
	if (!(this instanceof UIController)) return new UIController(args);
	EventEmitter.call(this);

	this.init();
}
inherits(UIController, EventEmitter);

UIController.prototype.init = function() {
	this.confirmPopup = new ConfirmPopup();
	this.pie = null;
	this.stream = null;
	this.opponentDiv = null;

	// 템플릿을 외부 파일로부터 로딩
	this.loadTemplates();

	// 첫 wave를 그리고 
	this.drawWave();
	// 화면사이즈가 바뀔 때 마다 다시 wave를 그려주는 이벤트핸들러를 등록한다.
	window.addEventListener("resize",this._resizeHandler.bind(this));
};

UIController.prototype.loadTemplates = function() {
	$.get('./templates/avatar-me.html', function (data) {
		this.avatarTemplateMe = _.template(data);
	}.bind(this), 'html');
	$.get('./templates/avatar-neighbor.html', function (data) {
		this.avatarTemplateNeighbor = _.template(data);
	}.bind(this), 'html');
	$.get('./templates/confirm-popup-sender.html', function (data) {
		this.confirmTemplateSender = _.template(data);
	}.bind(this), 'html');
	$.get('./templates/confirm-popup-receiver.html', function (data) {
		this.confirmTemplateReciever = _.template(data);
	}.bind(this), 'html');

	// TEST용
	// this.avatarTemplateMe = _.template(document.getElementById("avatar-me-template").innerHTML);
	// this.avatarTemplateNeighbor = _.template(document.getElementById("avatar-neighbor-template").innerHTML);
	// this.confirmTemplateSender = _.template(document.getElementById("confirm-popup-sender").innerHTML);
	// this.confirmTemplateReciever = _.template(document.getElementById("confirm-popup-reciever").innerHTML);
};

UIController.prototype.drawWave = function() {
	var svgContainer = document.querySelector(".wave > svg");
	// 기존에 그려진 원들을 지우고 다시 그림
	while (svgContainer.firstChild) {
		svgContainer.removeChild(svgContainer.firstChild);
	}

	// 창의 가로세로 사이즈 구간에 따른 구의 간격변화를 구현
	var radiusDiff = 120,
		radiusDiff_h = 120,
		radiusDiff_w = 120,
		startRadius = 120;
	if (window.innerHeight < 500)
		radiusDiff_h = 120 - 120*(500-window.innerHeight)*.8/500;
	if (window.innerWidth < 970)
		radiusDiff_w = 120 - 120*(970-window.innerWidth)*.8/970;
	radiusDiff = Math.min(radiusDiff_w, radiusDiff_h);	

	// 높이를 픽셀로 구한 후에 아래에서 70픽셀 떨어진 곳이 내 아바타의 중심 
	var centerX= "50%";
	var centerY= (window.innerHeight-70) +"px";

	var drawWaveCircle = function(args) {
		var svgNS = "http://www.w3.org/2000/svg";
		var circle = document.createElementNS(svgNS, "circle");
		for (var key in args) {
			circle.setAttribute(key, args[key]);
		}
		return circle;
	}
	for(var i=0;i<20;i++) { // 넉넉하게 20개 그림 -_-;;
		var r = startRadius+radiusDiff*i;
		var waveAttr = {
			cx: centerX,
			cy: centerY,
			r: r,
			stroke: "rgba(255,255,255,.7)",
			"stroke-width": 1,
			fill: "none",
			opacity: 0.6
		};
		var waveCircle = drawWaveCircle(waveAttr);
		svgContainer.appendChild(waveCircle)
	}
};

UIController.prototype._resizeHandler = function() {
	this.drawWave();
	this.setStreamLoaderContainer();
}

UIController.prototype.addAvatar = function(avatar, isMe) {
	var userContainerEl = document.querySelector(".user-container");
	var neighborContainerEl = document.querySelector(".neighbor-container");
	var containerEl = isMe ? userContainerEl : neighborContainerEl;
	var template = (isMe ? this.avatarTemplateMe : this.avatarTemplateNeighbor)(avatar);
	
	console.log(avatar.id);
	containerEl.insertAdjacentHTML('afterbegin', template);

	if(!isMe) {
		var $overArea = $("#"+avatar.id);
		var $dropMask = $("#"+avatar.id+" > .drop-mask");
		var overArea = document.getElementById(avatar.id);
		var dropMask = overArea.querySelector(".drop-mask");
		
		overArea.addEventListener('dragover', function(e) {
	        e.stopPropagation();
	        e.preventDefault();	
	        if(e.target.className !== "stream-loader-container")	{
				$overArea.addClass('dragover');
				$dropMask.show();
			}
		}, false);
		dropMask.addEventListener('dragleave', function(e) {
		    e.stopPropagation();
			e.preventDefault();
			$overArea.removeClass('dragover');		
			$dropMask.hide();
		}, false);
		dropMask.addEventListener('drop', function(e) {
		    e.stopPropagation();
			e.preventDefault();
			$overArea.removeClass('dragover');		
			$dropMask.hide();
			
			// App으로 통제권을 넘긴다
			this.emit('fileDropped', e);
		}.bind(this),false);
			
	}
	avatar.el = document.getElementById(avatar.id); 
	avatar.setDefaultSpring();
	avatar.spring.setEndValue(2);

	this.setStreamLoaderContainer();
};

UIController.prototype.removeAvatar = function(avatar) {
	avatar.el.parentNode.removeChild(avatar.el);
	this.setStreamLoaderContainer();
};

UIController.prototype.setStreamLoaderContainer = function() {
	var userAvatar = document.querySelector(".user-container>.avatar");
	if(!userAvatar) {
		return;
	}
	var x1 = getPosition(userAvatar).x;
	var y1 = getPosition(userAvatar).y;
	
	var neighborAvatars = document.querySelectorAll(".neighbor-container>.avatar");
	var rotateSLContainer = function(neighborAvatar){
		var x2 = getPosition(neighborAvatar).x;
		var y2 = getPosition(neighborAvatar).y;

		var theta = Math.atan((x2-x1)/Math.abs(y2-y1));
		var slide = Math.sqrt((Math.pow(x2-x1,2)+Math.pow(y2-y1,2)))*1.05;

		var streamLoaderContainer = neighborAvatar.querySelector(".stream-loader-container");
		streamLoaderContainer.setAttribute("style", "-webkit-transform: rotate("+(theta*160/Math.PI)+"deg);height:"+slide+"px;");
		
		// Container의 크기 변화에 맞춰 내부 Canvas 크기 변경하기
		if(this.streamLoader)
			this.streamLoader.updateSize();
			
	}.bind(this);

	[].forEach.call(neighborAvatars, rotateSLContainer);
};

// 나중에 파일 정보를 보여주기 위해서 들고 있게 한다.
UIController.prototype.setFileInfo = function(fileInfo) {
	this.fileInfo = fileInfo;
};

UIController.prototype.setProgressSource = function(progressSource) {
	this.progressSource = progressSource;
};

UIController.prototype.showProgress =  function(peerId, dir) {
	// 프로그래스 바를 만들기 
	this.opponentDiv = document.getElementById(peerId);
	var progressContainer = this.opponentDiv.querySelector(".progress-container");
	var streamLoaderContainer = this.opponentDiv.querySelector(".stream-loader-container");
	
	//  fileSaver 나 fileSender 의 blockcontext객체 레퍼런스를 가져온다.
	this.loader = new PieLoader({
		container: progressContainer
		, color: 'rgba(255,255,255,.97)'
		, fill: false
		, sourceObject: this.progressSource
		, progressAdapter: function(source) { // 소스에서 progress 값을 리턴하는 함수를 만든다. progress 는 0 ~ 1 이다.
			return source.getProgress();
		}
	});
	
	this.loader.startAnimation();
	
	var streamLoaderInitParam = {
		containerEl: streamLoaderContainer,
		direction: dir
	};
		
	this.streamLoader = new StreamLoader(streamLoaderInitParam);
	
	this.streamLoader.on("loadEnd", function() {
		this.streamLoader = undefined;
	}.bind(this));
	
	var container = this.opponentDiv;
	container.setAttribute("class", "avatar in-process");
}

UIController.prototype.updateProgress = function() {
	// 블록이 저장될 때 마다 현재 평균속도에 따른 남은 시간을 업데이트해준다.
	var transferStart = this.progressSource.transferStart;
	var now = Date.now();

	var timeDiff = now - transferStart;
	// var processor = this.fileSaver || this.fileSender;
	// var totalSize = processor.fileInfo.size;
	var progression = this.progressSource.getProgress();

	// var transferVelocity = (progression * totalSize) / timeDiff;
	// var remainTime = ((1-progression)*totalSize)/transferVelocity;
	
	// progression만 가지고 남은 시간 구하기
	var remainTime = (1-progression)/progression * timeDiff;
	var remainSeconds = Math.floor(remainTime/1000);
	var expression = secondsToString(remainSeconds);

	//console.log("남은시간 " +remainTime + " 초");
	// connectionHandler 에서 알 수 있는 상대방 ID에 대해 남은 초를 표시할 엘리먼트를 얻고 이의 내용을 업데이트 해준다.
	var container = this.opponentDiv;
	container.querySelector(".avatar-pic>.message").innerHTML = expression;
};

UIController.prototype.transferEnd = function() {
	this.streamLoader.finishStream();
	
	var transferStart = this.progressSource.transferStart;
	var transferEnd = Date.now();
	// 걸린 시간과 속도 화면에 표시
	var duration = (transferEnd - transferStart)/1000;
	var sizeExpression = getSizeExpression(this.fileInfo.size);
	var speed = parseInt((parseFloat(sizeExpression)/ duration)*10)/10;
	var unit = sizeExpression.replace(/[^a-zA-Z]/g,'');
	
	console.log("총 "+duration+"초 걸렸고 속도는 "+ speed+unit+"/s");

	var container = this.opponentDiv;
	container.querySelector(".avatar-pic>.message").innerHTML = "";
	container.setAttribute("class", "avatar");					
	this.loader.stopAnimation();
	this.loader.destroyLoader();
};
