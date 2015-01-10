function UIController(args) {
	if (!(this instanceof UIController)) return new UIController(args);
	EventEmitter.call(this);

	this.init();
}
inherits(UIController, EventEmitter);

UIController.prototype.init = function() {
	this.confirmPopup = new ConfirmPopup();
	
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
		// if(this.airdrop.connectionHandler.streamLoader)
		// 	this.airdrop.connectionHandler.streamLoader.updateSize();
			
	}.bind(this)

	[].forEach.call(neighborAvatars, rotateSLContainer);
}