var map = {
	createChannel: {
		//url: "/v1/channels/channel-extend/channelId",
		url: "/v1/playrtc/channels/channel-extend/channelId",
		method: "POST"
	},
	connectChannel: {
		//url: "/v1/channels/channel-extend/{0}/tokens/token",
		url: "/v1/playrtc/channels/channel-extend/{0}/tokens/token",
		method: "POST"
	},
	disconnectChannel: {
		//url: "/v1/channels/channel-extend/{0}/peers/{1}",
		url: "/v1/playrtc/channels/channel-extend/{0}/peers/{1}",
		method: "DELETE"
	},
	deleteChannel: {
		//url: "/v1/channels/channel-extend/{0}",
		url: "/v1/playrtc/channels/channel-extend/{0}",
		method: "DELETE"
	},
	setMonitorLog: {
		//url: "/v1/mnitoring-log",
		url: "/v1/playrtc/mnitoring/log",
		method: "POST"
	},
	createNagAuth: {
		//url: "/v1/nag/authentication/user/{0}",
		url: "/v1/playrtc/nag/authentication/user/{0}",
		method: "POST"
	},
	deleteNagAuth: {
		//url: "/v1/nag/authentication/user/{0}",
		url: "/v1/playrtc/nag/authentication/user/{0}",
		method: "DELETE"
	},
	updateNagAuth: {
		//url: "/v1/nag/authentication/user/{0}",
		url: "/v1/playrtc/nag/authentication/user/{0}",
		method: "PUT"
	},
	getChannelList: {
		//url: "/v1/channels",
		url: "/v1/playrtc/channels",
		method: "GET"
	},
	getChannel: {
		//url: "/v1/channels/{0}",
		url: "/v1/playrtc/channels/{0}/info",
		method: "GET"
	},
	getPeerList: {
		//url: "/v1/channels/{0}/peers",
		url: "/v1/playrtc/channels/{0}/peers",
		method: "GET"
	},
	getPeer: {
		//url: "/v1/channels/{0}/peers/{1}",
		url: "/v1/playrtc/channels/{0}/peers/{1}",
		method: "GET"
	}
};
exports.map = map