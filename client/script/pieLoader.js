(function(window) {
	'use strict';
	var console = window.console;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    	
	//  의존성 선언
	var _ = window._;

	var loaderTemplateString = '<svg width="<%= r*2 %>" height="<%= r*2 %>" viewbox="0 0 <%= r*2 %> <%= r*2 %>" style="position: relative;top:<%= my %>px;left:<%= mx %>px"><path transform="translate(<%= r %>, <%= r %>)"/></svg>';
	
	function PieLoader(args) { // container, color
		this.container = args.container;	

		this.color = args.color;
		this.fill = args.fill; 
		this.sourceObject = args.sourceObject;
		this.progressAdapter = args.progressAdapter;
		
		this.containerWidth;
		this.containerHeight;	
		
		this.loader;
		this.theta = 0; 
		this.pi = Math.PI; 
		this.t = 30;
		this.radius;	
		
		this.loopFunctionCache;
		
		this.loaderTemplate = _.template(loaderTemplateString);
		
		this.initLoader();
	}
	
	PieLoader.prototype._getMaxRadius = function (container) {
		var width = container.offsetWidth;
		var height = container.offsetHeight;
		return Math.sqrt(width*width + height*height)/2;
	};
	
	PieLoader.prototype._getMinRadius = function (container) {
		var minRadius = container.offsetWidth;
		if(container.offsetWidth > container.offsetHeight) {
			minRadius = container.offsetHeight;
		}
		return minRadius/2;	
	};
	
	PieLoader.prototype.initLoader = function () {
		window.addEventListener("resize",function(){
			this.locateLoader();	
		}.bind(this));
	
		this.container.setAttribute('style', 'overflow: hidden');
		this.locateLoader();


	};
	
	PieLoader.prototype.locateLoader = function () {
		this.containerWidth = this.container.offsetWidth;
		this.containerHeight = this.container.offsetHeight;
		
		var diameter;
		var coefficient;
		if(this.fill === true) {
			diameter = this._getMaxRadius(this.container)*2;
			coefficient = 1;
		} else {
			diameter = this._getMinRadius(this.container)*2;
			coefficient = -1;
		}
		//debugger;
		this.radius = diameter/2;
	
		var margin_x = coefficient * (this.containerWidth/2 - this.radius);
		if(this.fill === false){
			margin_x = 0;
		}
		var margin_y = (this.containerHeight/2 - this.radius);
		
		var partialHTML = this.loaderTemplate({
			r: this.radius,
			my: margin_y,
			mx: margin_x 
		});
		this.container.innerHTML = partialHTML;
		this.loader = this.container.querySelector("path");	
	};
	
	PieLoader.prototype.startAnimation = function () {	
	    if (!this.animationCache) {
	       this.animationLoop();
	    }
	};
	PieLoader.prototype.stopAnimation = function () {	
	    if (this.animationCache) {
	       cancelAnimationFrame(this.animationCache);
	       this.animationCache = undefined;
	    }
	};
	
	PieLoader.prototype.toggleAnimation = function () {	
	    if (!this.animationCache) {
	       this.startAnimation();
	    } else {
	       this.stopAnimation();
	    }
	};
	
	PieLoader.prototype.animationLoop = function () {	
		this._update();
		this._draw();
		this.animationCache = requestAnimationFrame(this.animationLoop.bind(this));
	};
	
	PieLoader.prototype.destroyLoader = function () {	
		this.container.innerHTML = '';
	};
		
	
	PieLoader.prototype._draw = function () {	
		this.theta %= 360;
		var r = ( this.theta * this.pi / 180 )
		, x = Math.sin( r ) * this.radius
		, y = Math.cos( r ) * - this.radius
		, mid = ( this.theta > 180 ) ? 1 : 0
		, anim = 'M 0 0 v -'+this.radius+' A '+this.radius+' '+this.radius+' 1 ' 
		   + mid + ' 1 ' 
		   +  x  + ' ' 
		   +  y  + ' z';
		//debugger;
		this.loader.setAttribute( 'd', anim );
		this.loader.setAttribute( 'fill', this.color );
	};
	
	PieLoader.prototype._update = function () {	
		// this.sourceObject 를 통해 this.theta 를 업데이트하는 함수이다.
		var progress = this.progressAdapter(this.sourceObject);
		this.theta = progress * 360;
	};
	
	PieLoader = PieLoader;

	// 글로벌 객체에 모듈을 프로퍼티로 등록한다.
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = PieLoader;
	} else {
		window.PieLoader = PieLoader;
	}    	

}(this));
