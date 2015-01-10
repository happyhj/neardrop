function ConfirmPopup() {
	this.template;
	this.containerEl;
	this.yesCallback;
	this.spring;
}

ConfirmPopup.prototype.open = function(param) {
	var container = document.querySelector(".acception-container");
	if(container)
		document.body.removeChild(container);
	
	this.template = param.template;
	var partialHTML = this.template(param);
	document.body.insertAdjacentHTML("beforeend",partialHTML);
	
	this.yesCallback = param.yesCallback;
	
	this.containerEl = document.querySelector(".acception-container");
	this.containerEl.querySelector(".btn.no").addEventListener("click",function(){
		this.close();
	}.bind(this),false);
	this.containerEl.querySelector(".btn.yes").addEventListener("click",function(){
		this.yesCallback();
		this.close();
	}.bind(this),false);
	
	this.setDefaultSpring();
	this.spring.setEndValue(2);	
/*
				this.confirmPopup.open({
				opponentName: this.airdrop.nearByMe[id].name,
				fileName: file.name,
				fileSize: Math.floor(file.size/1024),
				fileType: file.type.
				yesCallback: yesCallback
			});
*/
};
// 뿅 나타나게 스타일을 컨트롤 해주는 스프링 핸들러
ConfirmPopup.prototype.springHandler = function(el, val){
	/*
	el.style.mozTransform =
	el.style.msTransform =
	el.style.webkitTransform =
	el.style.transform = 'translateZ(' + (1-val) + ')';
	//el.style.transform = 'scale3d(' + (1-val) + ', ' + (1-val) + ', 1)';
	*/
	el.setAttribute("style", "margin-top:"+((100*val-100)+25)+"px");
};

ConfirmPopup.prototype.setDefaultSpring = function(){
	var that = this;
	var springSystem = new rebound.SpringSystem();
	var spring = springSystem.createSpring(30, 10);
	spring.addListener({
		onSpringUpdate: function(spring) {
			var val = spring.getCurrentValue();
			val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 0.5);
			that.springHandler(that.containerEl, val);
		}
	});	
	this.spring = spring;
}

ConfirmPopup.prototype.setSpring = function(springHandler){
	var that = this;
	var springSystem = new rebound.SpringSystem();
	var spring = springSystem.createSpring(70, 3);
	spring.addListener({
		onSpringUpdate: function(spring) {
			var val = spring.getCurrentValue();
			val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 0.5);
			springHandler(that.containerEl, val);
		}
	});	
	this.spring = spring;
}

ConfirmPopup.prototype.close = function() {
	if(this.containerEl) {
		this.containerEl.setAttribute("class", "acception-container closing");
		this.containerEl.addEventListener( 'webkitTransitionEnd', function( event ) { document.body.removeChild(this.containerEl); }.bind(this), false );	
	}
};