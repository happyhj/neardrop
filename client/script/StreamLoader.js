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

	// globals
	var numParticles = 300,
		angleSpeed = 0.015,
		particleSize = 1.4,
		widthFactor = 20,
		singlecolor = true,
		defaultColor = 'rgba(250, 237, 29,.5)';
		// '#faed1d';
	
		
	function StreamLoader(initParam) {
		if (!(this instanceof StreamLoader)) return new StreamLoader(args);
		EventEmitter.call(this);
		
		this.isUp = (initParam.direction === 'up')?true:false;
		this.containerEl = initParam.containerEl;
		this.verticalSpeed = 2.7;

		// 컨테이너
		this.canvas = null;
		this.ctx = null;
		
		numParticles = (this.containerEl.offsetHeight / 600) * 250;


		this.particleSystem = null;
		
		this.init();
	}
	inherits(StreamLoader, EventEmitter);

	
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
	
		this.requestAnimFrameLoop = null;
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
		
		if(this.streamLoader.isFinishing === true) {
			this.fadeOut();
		}

		for (var i = 0; i < this.particles.length; i++) {
			var particle = this.particles[i];
			particle.update();
			particle.draw();
		}

		if(this.streamLoader.isFinishing === true && this.particles.length === 0) {
			console.log("cancelAnimationFrame : of streamLoader");
			cancelAnimationFrame(this.streamLoader.requestAnimFrameLoop);
			this.streamLoader.emit('loadEnd');
		}
	};
	
	ParticleSystem.prototype.fadeOut = function() {
		for (var i = 0; i < this.particles.length; i++) {
			var particle = this.particles[i];
			if (particle.h < 0 || particle.h > this.canvas.height ) {
				// 해당 파티클을 삭제
				this.particles.splice(i, 1);
				continue;
			}
			if (Math.random() > .98) {
				this.particles.splice(i, 1);
			}
		}
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = StreamLoader;
	} else {
		window.StreamLoader = StreamLoader;
	}    	

}(this));	

