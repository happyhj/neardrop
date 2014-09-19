(function(window) {
	'use strict';
	var console = window.console;
	var document = window.document;

	window.requestAnimFrame = (function(){
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function( callback ) {
			window.setTimeout(callback, 1000 / 60);
		};
	})();
	
	// EventEmitter
	function _EventEmitter() {
		this.events = [];
	}
	
	_EventEmitter.prototype.on = function(fn) {
		this.events.push(fn);
	};
	
	_EventEmitter.prototype.off = function(fn) {
		var newEvents = [];
		// 입력받은 함수와 같은것만 빼고 유지. 
		for (var i=0, len=this.events.length; i<len; ++i) {
			if (this.events[i] !== fn) {
				newEvents.push(this.events[i]);
			}
		}
		this.events = newEvents;
	};
	
	_EventEmitter.prototype.trigger = function() {
		for (var i=0, len=this.events.length; i<len; ++i) {
			this.events[i](arguments);
		}
	};
	
	
	// helper functions
	function randomMax(max) {
		return Math.floor(Math.random() * max);
	}
	
	function getParticleColor() {
		var r = (100 + randomMax(155));
		var g = (100 + randomMax(155));
		var b = (100 + randomMax(155));
	
		return 'rgba(' + r + ',' + g + ',' + b +  ','+Math.random()*.8+')';
	}
	function refreshColor() {
		for (var i = 0; i < particleSystem.particles.length; i++) {
			particleSystem.particles[i].color = singlecolor ? defaultColor : getParticleColor();
		}
	}
	// globals
	var numParticles = 300,
		angleSpeed = 0.015,
		particleSize = 1.4,
		widthFactor = 20,
		singlecolor = true,
		defaultColor = 'rgba(250, 237, 29,.5)';
		// '#faed1d';
	
		
	function StreamLoader(initParam) {
		this.isUp = (initParam.direction === 'up')?true:false;
		this.containerEl = initParam.containerEl;
		this.verticalSpeed = 2.7;

		// 컨테이너
		this.canvas;
		this.ctx;			
		
		numParticles = (this.containerEl.offsetHeight / 600) * 250;


		this.particleSystem;
	
		this._eventEmitter = {
			'loadEnd': new _EventEmitter()
		};			
		
		this.init();
	}
	StreamLoader.prototype.on = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].on(fn);	
		}
	};
	
	StreamLoader.prototype.off = function(evtName, fn) {
		// eventEmitter key에 존재시 사용
		if (this._eventEmitter[evtName]) {
			this._eventEmitter[evtName].off(fn);	
		}
	};
	
	StreamLoader.prototype.updateSize = function () {
		this.canvas.width = this.containerEl.offsetWidth;
		this.canvas.height = this.containerEl.offsetHeight;
	};
	
	StreamLoader.prototype.init = function () {
		this.canvas = document.createElement('canvas');
		this.containerEl.innerHTML = "";
		this.containerEl.appendChild(this.canvas);
		this.canvas.width = this.containerEl.offsetWidth;
		this.canvas.height = this.containerEl.offsetHeight;
		
		this.ctx = this.canvas.getContext('2d');
		
		this.isFinishing = false;
		
		this.particleSystem = new ParticleSystem({
			loader: this,
			canvas: this.canvas,
			verticalSpeed: this.verticalSpeed
		});
	
		this.requestAnimFrameLoop;
		this.animloop = function() {
			this.requestAnimFrameLoop = requestAnimFrame(this.animloop);
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.particleSystem.draw();
		}.bind(this);
		this.animloop();
	}
	
	StreamLoader.prototype.finishStream = function () {
		this.isFinishing = true;
	};
	

	function getDefaultColor() {
		return 'rgba(250, 250, 250,'+Math.random()*.7+')'
	}
	
	var Particle = function (initParam) {
		this.particleSystem = initParam.particleSystem;
		this.canvas =  this.particleSystem.canvas;	
		this.ctx = this.canvas.getContext('2d');
	
		this.h = Math.floor((this.canvas.height) * Math.random());
		
		//this.h = 0;
		this.angle = Math.random() * Math.PI * 2;
		this.color = singlecolor ? getDefaultColor() : getParticleColor();
		this.size = Math.random()*5;
		
	};
	
	Particle.prototype.update = function () {
		this.angle += angleSpeed;
		this.h -= this.particleSystem.verticalSpeed * ((this.canvas.height-this.h) /this.canvas.height);
	};	
	
	Particle.prototype.draw = function (id) {
		//this.angle += angleSpeed;
		//this.h -= this.particleSystem.verticalSpeed;
		
		if (this.h < 0 || this.h > this.canvas.height ) {
			this.h = Math.floor(this.canvas.height * Math.random());	

		}
		
		var h_buffer = this.h;
		if(this.particleSystem.streamLoader.isUp !== true)
			h_buffer = this.canvas.height - this.h;
		
		this.ctx.beginPath();
		this.ctx.fillStyle = this.color;
		var sizeFactor = 0.5 * this.size + (Math.sin(this.angle) + 1) / 2;
		
		this.ctx.arc(this.canvas.width / 2 + Math.cos(this.angle) * (this.canvas.height - h_buffer) / widthFactor, h_buffer, particleSize * sizeFactor, 0, Math.PI * 2);
		this.ctx.fill();
	};
	
	var ParticleSystem = function (initParam) {
		this.streamLoader = initParam.loader;
		this.particles = [];
		this.canvas = initParam.canvas;
		this.verticalSpeed = initParam.verticalSpeed;

	};
	ParticleSystem.prototype.draw = function () {
		if(this.particles.length < numParticles) {
			if(Math.random() > .85 && this.streamLoader.isFinishing === false)
				this.particles.push(new Particle({
					particleSystem: this
				}));	
		}
		
		for (var i = 0; i < this.particles.length; i++) {			
			this.particles[i].update();			
		}

		for (var i = 0; i < this.particles.length; i++) {			
			if(this.streamLoader.isFinishing === true) {
				if (this.particles[i].h < 0 || this.particles[i].h > this.particles[i].canvas.height ) {
					// 해당 파티클을 삭제
					var index = this.particles.indexOf(this.particles[i]);
					if(index != -1) {
						this.particles.splice(index, 1);
					}
				}
				
				if(Math.random() > .98 && this.streamLoader.isFinishing === true) {
					var index = this.particles.indexOf(this.particles[i]);
					if(index != -1) {
						this.particles.splice(index, 1);
					};
				}
			}
		}

		if(this.streamLoader.isFinishing === true && this.particles.length === 0) {
			console.log("cancelAnimationFrame : of streamLoader");
			cancelAnimationFrame(this.streamLoader.requestAnimFrameLoop);
			this.streamLoader._eventEmitter.loadEnd.trigger();
		}		

		for (var i = 0; i < this.particles.length; i++) {			
			this.particles[i].draw();			
		}

	};
	
	StreamLoader = StreamLoader;

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = StreamLoader;
	} else {
		window.StreamLoader = StreamLoader;
	}    	

}(this));	
