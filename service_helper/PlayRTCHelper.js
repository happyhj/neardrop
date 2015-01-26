var PlayRTCHelperRequest = require("./PlayRTCHelperRequest").PlayRTCHelperRequest;
	PlayRTCUtils = require("./PlayRTCHelperUtils.js").PlayRTCUtils,
	util = require("util");
	

function response(res){
	res.send();
}

function afterResponse(type, req, res, data){
	if(this.fire(type, req, res, data) === false){
		response(res);
	}
	else{
		res.statusCode = 200;
		res.json(data);
		response(res);
	}
}

function Helper(config){
	PlayRTCUtils.Event.call(this);
	this.app = config.app;
	this.projectKey = config.projectKey;
	PlayRTCHelperRequest.setProjectKey(this.projectKey);
	
	this._initalize();
}

util.inherits(Helper, PlayRTCUtils.Event);

(function(_){
	function createChannel(req, res){
		if(this.fire("createChannel_before", req, res) === false){
			response(res, resInfo);
			return;
		}

		var payload = req.body;
		PlayRTCHelperRequest.request("createChannel", {
			payload: payload
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "createChannel_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "createChannel_after", req, res, data);
		}, this));
	}
	function connectChannel(req, res){
		if(this.fire("connectChannel_before", req, res) === false){
			response(res, resInfo);
			return;
		}

		var channelId = req.params.channelId,
			payload = req.body;

		PlayRTCHelperRequest.request("connectChannel", {
			params: [channelId], payload: payload
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "connectChannel_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "connectChannel_after", req, res, data);
		}, this));
	}
	function disconnectChannel(req, res){
		if(this.fire("disconnectChannel_before", req, res) === false){
			response(res, resInfo);
			return;
		}
		
		var channelId = req.params.channelId,
			peerId = req.params.peerId;
		
		PlayRTCHelperRequest.request("disconnectChannel", {
			params: [channelId, peerId]
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "disconnectChannel_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "disconnectChannel_after", req, res, data);
		}, this));
	}
	function deleteChannel(req, res){
		if(this.fire("deleteChannel_before", req, res) === false){
			response(res, resInfo);
			return;
		}
		
		var channelId = req.params.channelId;
		PlayRTCHelperRequest.request("deleteChannel", {
			params: channelId
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "deleteChannel_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "deleteChannel_after", req, res, data);
		}, this));
	}
	function setMonitorLog(req, res){
		if(this.fire("setMonitorLog_before", req, res) === false){
			response(res, resInfo);
			return;
		}

		var log = req.body;
		PlayRTCHelperRequest.request("setMonitorLog", {
			payload: log
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "setMonitorLog_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "setMonitorLog_after", req, res, data);
		}, this));
	}
	function createNagAuth(req, res){
		if(this.fire("createNagAuth_before", req, res) === false){
			response(res, resInfo);
			return;
		}

		var user = req.params.user,
			payload = req.body;
		PlayRTCHelperRequest.request("createNagAuth", {
			params: [user],
			payload: payload
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "createNagAuth_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "createNagAuth_after", req, res, data);
		}, this));
	}
	function deleteNagAuth(req, res){
		if(this.fire("deleteNagAuth_before", req, res) === false){
			response(res, resInfo);
			return;
		}
		
		var user = req.params.user;
		PlayRTCHelperRequest.request("deleteNagAuth", {
			params: [user]
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "deleteNagAuth_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "deleteNagAuth_after", req, res, data);
		}, this));
	}
	function updateNagAuth(req, res){
		if(this.fire("updateNagAuth_before", req, res) === false){
			response(res);
			return;
		}
		
		var user = req.params.user;
		PlayRTCHelperRequest.request("updateNagAuth", {
			params: [user]
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "updateNagAuth_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "updateNagAuth_after", req, res, data);
		}, this));
	}
	function getChannelList(req, res){
		if(this.fire("getChannelList_before", req, res) === false){
			response(res);
			return;
		}
		
		PlayRTCHelperRequest.request("getChannelList").then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getChannelList_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getChannelList_after", req, res, data);
		}, this));
	}
	function getChannel(req, res){
		if(this.fire("getChannel_before", req, res) === false){
			response(res);
			return;
		}
		
		var channelId = req.params.channelId;
		PlayRTCHelperRequest.request("getChannel", {
			params: [channelId]
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getChannel_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getChannel_after", req, res, data);
		}, this));
	}
	function getPeerList(req, res){
		if(this.fire("getPeerList_before", req, res) === false){
			response(res);
			return;
		}
		
		var channelId = req.params.channelId;
		
		PlayRTCHelperRequest.request("getPeerList", {
			params: [channelId]
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getPeerList_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getPeerList_after", req, res, data);
		}, this));
	}
	function getPeer(req, res){
		if(this.fire("getPeer_before", req, res) === false){
			response(res);
			return;
		}
		
		var channelId = req.params.channelId, 
			peerId = req.params.peerId;
		
		PlayRTCHelperRequest.request("getPeer", {
			params: [channelId, peerId]
		}).then(PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getPeer_after", req, res, data);
		}, this), PlayRTCUtils.bind(function(data){
			afterResponse.call(this, "getPeer_after", req, res, data);
		}, this));
	}

	

	_._initalize = function(){
		//new Helper API
		this.app.post('/v1/playrtc/channels/channel-extend/channelId', PlayRTCUtils.bind(createChannel, this));
		this.app.post('/v1/playrtc/channels/channel-extend/:channelId/tokens/token', PlayRTCUtils.bind(connectChannel, this));
		this.app.del('/v1/playrtc/channels/channel-extend/:channelId/peers/:peerId', PlayRTCUtils.bind(disconnectChannel, this));
		this.app.del('/v1/playrtc/channels/channel-extend/:channelId', PlayRTCUtils.bind(deleteChannel, this));

		//get channel, get peer
		this.app.get('/v1/playrtc/channels', PlayRTCUtils.bind(getChannelList, this));
		this.app.get('/v1/playrtc/channels/:channelId/info', PlayRTCUtils.bind(getChannel, this));
		this.app.get('/v1/playrtc/channels/:channelId/peers', PlayRTCUtils.bind(getPeerList, this));
		this.app.get('/v1/playrtc/channels/:channelId/peers/:peerId', PlayRTCUtils.bind(getPeer, this));

		//log, nag
		this.app.post('/v1/playrtc/mnitoring/log', PlayRTCUtils.bind(setMonitorLog, this));
		this.app.post('/v1/playrtc/nag/authentication/user/:user', PlayRTCUtils.bind(createNagAuth, this));
		this.app.del('/v1/playrtc/nag/authentication/user/:user', PlayRTCUtils.bind(deleteNagAuth, this));
		this.app.put('/v1/playrtc/nag/authentication/user/:user', PlayRTCUtils.bind(updateNagAuth, this));
		
		
		//v2 new Helper API
		this.app.post('/v2/playrtc/channels/channel', PlayRTCUtils.bind(createChannel, this));
		this.app.put('/v2/playrtc/channels/channel/:channelId', PlayRTCUtils.bind(connectChannel, this));
		this.app.del('/v2/playrtc/channels/channel/:channelId/peers/peer/:peerId', PlayRTCUtils.bind(disconnectChannel, this));
		this.app.del('/v2/playrtc/channels/channel/:channelId', PlayRTCUtils.bind(deleteChannel, this));

		//v2 get channel, get peer
		this.app.get('/v2/playrtc/channels', PlayRTCUtils.bind(getChannelList, this));
		this.app.get('/v2/playrtc/channels/channel/:channelId', PlayRTCUtils.bind(getChannel, this));
		this.app.get('/v2/playrtc/channels/channel/:channelId/peers', PlayRTCUtils.bind(getPeerList, this));
		this.app.get('/v2/playrtc/channels/channel/:channelId/peers/peer/:peerId', PlayRTCUtils.bind(getPeer, this));

		//v2 log, nag
		this.app.post('/v2/playrtc/monitoring-log', PlayRTCUtils.bind(setMonitorLog, this));
		this.app.post('/v2/playrtc/signal/user/:user', PlayRTCUtils.bind(createNagAuth, this));
		this.app.del('/v2/playrtc/signal/user/:user', PlayRTCUtils.bind(deleteNagAuth, this));
		this.app.put('/v2/playrtc/signal/user/:user', PlayRTCUtils.bind(updateNagAuth, this));
	};
	
	_.intercept = function(type, before, after){
		if(before){
			this.on(type + "_before", before);
		}
		
		if(after){
			this.on(type + "_after", after);
		}
	};
})(Helper.prototype);


exports.Helper = Helper;