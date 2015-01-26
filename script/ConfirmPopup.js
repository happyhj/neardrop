function ConfirmPopup() {
	this.template = null;
	this.containerEl = null;
	this.yesCallback = null;
	this.spring = null;
}

ConfirmPopup.prototype.open = function(param) {
	var container = document.querySelector(".acception-container");
	if(container) {
		document.body.removeChild(container);
	}
	
	this.template = param.template;
	var partialHTML = this.template(param);
	document.body.insertAdjacentHTML("beforeend",partialHTML);
	
	this.yesCallback = param.yesCallback;
	this.noCallback = param.noCallback;
	
	this.containerEl = document.querySelector(".acception-container");
	this.containerEl.querySelector(".btn.no").addEventListener("click",function(){
		this.noCallback();
		this.close();
	}.bind(this),false);
	this.containerEl.querySelector(".btn.yes").addEventListener("click",function(){
		this.yesCallback();
		this.close();
	}.bind(this),false);
	
	this.setDefaultSpring();
	this.spring.setEndValue(2);	

	var style = window.getComputedStyle(this.containerEl, null);	
	document.getElementById("confirmCentralize").innerHTML = ".acception-container{margin-top:"+"-"+parseInt(style.height)/2+"px;"+"}";
};
// 뿅 나타나게 스타일을 컨트롤 해주는 스프링 핸들러
ConfirmPopup.prototype.springHandler = function(el, val){
	el.setAttribute("style", "transform: translate3d(0,"+((150*val))+"px,0)");
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
		this.containerEl.addEventListener( 'webkitTransitionEnd', function( event ) { 
			document.body.removeChild(this.containerEl); 
			document.getElementById("confirmCentralize").innerHTML = "";
			
			// TODO: 초기 상태로 되돌리기
			/* 
			app.airdrop.connectionHandler.disconnect();
			app.airdrop.fileEntry = undefined;
			app.airdrop.status = AIRDROP.STATUS.IDEAL;
			*/
		}.bind(this), false );	
	}

};