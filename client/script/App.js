function App() {
	this.avatarTemplateMe = null;
	this.avatarTemplateNeighbor = null;
	this.userContainerEl = null;
	this.neighborContainerEl = null;
	this.airdrop = null;
	
	this.init();	
}

// UI면을 담당!
App.prototype.init = function() {
	this.airdrop = new AirDrop({url: 'http://www.heej.net/2014/airdropbox/nearbyuser.php'})
	this.airdrop.on('adduser', this.addAvatar.bind(this));
	this.airdrop.on('removeuser', this._removeuserHandler.bind(this));
	
	this.avatarTemplateMe = _.template(document.getElementById("avatar-template-me").innerHTML);
	this.avatarTemplateNeighbor = _.template(document.getElementById("avatar-template-neighbor").innerHTML);

	this.userContainerEl = document.querySelector(".user-container");
	this.neighborContainerEl = document.querySelector(".neighbor-container");

	// 첫 wave를 그리고 
	this.drawWave();
	// 화면사이즈가 바뀔 때 마다 다시 wave를 그려주는 이벤트핸들러를 등록한다.
	window.addEventListener("resize",this._resizeHandler.bind(this));
};

App.prototype._removeuserHandler = function(neighborObj) {
	this.removeAvatar(neighborObj[0]);
	this.setStreamLoaderContainer();
};

App.prototype.addAvatar = function(args) {
	var neighborObj = args[0];
	var that = this;
	var template = null;
	var containerEl = (neighborObj.me)? this.userContainerEl: this.neighborContainerEl;
	
	if(containerEl.className ==="user-container") {
		template = this.avatarTemplateMe(neighborObj);

	} else {
		template = this.avatarTemplateNeighbor(neighborObj);

	}
	
	containerEl.insertAdjacentHTML('afterbegin', template);

	if(containerEl.className ==="neighbor-container") {
		var $overArea = $("#"+neighborObj.id);
		var $dropMask = $("#"+neighborObj.id+" > .drop-mask");
		var overArea = document.getElementById(neighborObj.id);
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
				
			// 파일 전송 시작 처리를 하는 부분	
			// confirm 으로 파일의 정보를 보여주면서 전송할래? 물어보고 응이라고 응답하면 

			
			console.log("파일을 드롭하셨군요");
		
			var targetEl = e.target.parentNode;
			var file = e.dataTransfer.files[0];
			var id = this.airdrop._getIdByEl(targetEl);
			
			var yesCallback = function(){ // YES 를 눌렀을 경우 실행하는 함수.
				this.airdrop.fileEntry = file;
				this.airdrop.initializeTransfer(targetEl, file);				
			}.bind(this);
			
			this.airdrop.confirmPopup.open({
				templateSelector: "#confirm-popup-template-sender",
				opponentName: this.airdrop.nearByMe[id].name,
				fileName: file.name,
				fileSize: Math.floor(file.size/1024),
				fileType: file.type,
				yesCallback: yesCallback
			});
		}.bind(this),false);
			
	}
	neighborObj.el = document.getElementById(neighborObj.id); 
	neighborObj.setDefaultSpring();
	neighborObj.spring.setEndValue(2);

	this.setStreamLoaderContainer();
};

App.prototype.removeAvatar = function(args) {
	var neighborObj = args;
	neighborObj.el.parentNode.removeChild(neighborObj.el);
	// // 모델에서 삭제
	// 
	// for(var i in this.nearbyusers) {
	// 	if(this.nearbyusers[i] === neighborObj) {
	// 		this.nearbyusers.splice(i, 1);
	// 	}
	// }
};
App.prototype._resizeHandler = function() {
	this.drawWave();
	this.setStreamLoaderContainer();
}

App.prototype.drawWave = function() {
	var svgContainer = document.querySelector(".wave > svg");
	// 창의 가로세로 사이즈 구간에 따른 구의 간격변화를 구현
	var radiusDiff = null,
	radiusDiff_h = null ,
	radiusDiff_w = null;
	if(window.innerHeight < 500)
		radiusDiff_h = 120 - 120*(500-window.innerHeight)*.8/500;
	if(window.innerWidth < 970)
		radiusDiff_w = 120 - 120*(970-window.innerWidth)*.8/970;

	if(radiusDiff_h && radiusDiff_w) {
		radiusDiff = (radiusDiff_h>radiusDiff_w)?radiusDiff_w:radiusDiff_h;
	} else if(radiusDiff_h || radiusDiff_w){
		radiusDiff = radiusDiff_h||radiusDiff_w;
	}
	if(!radiusDiff) radiusDiff = 120;
		
	var startRadius = 120;
	var centerX= "50%";
	// 높이를 픽셀로 구한 후에 아래에서 70픽셀 떨어진 곳이 내 아바타의 중심 
	var centerY= (window.innerHeight-70) +"px";
	var waveTemplate = _.template(document.getElementById("wave-template").innerHTML);
	var wavePartialHTML = "";
	for(var i=0;i<40;i++) { // 넉넉하게 40개 그림 -_-;;
		wavePartialHTML += waveTemplate({
			cx: centerX,
			cy: centerY,
			r: startRadius+radiusDiff*i,
			color: "rgba(255,255,255,.7)",
			width: 1,
			opacity: 0.6
		});
	}
	svgContainer.innerHTML = wavePartialHTML;
};

App.prototype.setStreamLoaderContainer = function() {
	var userAvatar = document.querySelector(".user-container>.avatar");
	if(userAvatar) {
		var x1 = getPosition(userAvatar).x;
		var y1 = getPosition(userAvatar).y;
		
		var neighborAvatars = document.querySelectorAll(".neighbor-container>.avatar");
		[].forEach.call(
			neighborAvatars, 
			function(neighborAvatar){
				var x2 = getPosition(neighborAvatar).x;
				var y2 = getPosition(neighborAvatar).y;
		
				var theta = Math.atan((x2-x1)/Math.abs(y2-y1));
				var slide = Math.sqrt((Math.pow(x2-x1,2)+Math.pow(y2-y1,2)))*1.05;

				var streamLoaderContainer = neighborAvatar.querySelector(".stream-loader-container");
				streamLoaderContainer.setAttribute("style", "-webkit-transform: rotate("+(theta*160/Math.PI)+"deg);height:"+slide+"px;");
				
				if(this.airdrop.connectionHandler.streamLoader)
					this.airdrop.connectionHandler.streamLoader.updateSize();
					
			}.bind(this)
		);
	}
}