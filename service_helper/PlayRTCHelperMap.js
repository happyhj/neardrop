var map = {
	createChannel: {
		url: "/v2/playrtc/channels/channel",
		method: "POST"
	},
	connectChannel: {
		url: "/v2/playrtc/channels/channel/{0}",
		method: "PUT"
	},
	disconnectChannel: {
		url: "/v2/playrtc/channels/channel/{0}/peers/peer/{1}",
		method: "DELETE"
	},
	deleteChannel: {
		url: "/v2/playrtc/channels/channel/{0}",
		method: "DELETE"
	},
	setMonitorLog: {
		url: "/v2/playrtc/monitoring-log",
		method: "POST"
	},
	createNagAuth: {
		url: "/v2/playrtc/signal/user/{0}",
		method: "POST"
	},
	deleteNagAuth: {
		url: "/v2/playrtc/signal/user/{0}",
		method: "DELETE"
	},
	updateNagAuth: {
		url: "/v2/playrtc/signal/user/{0}",
		method: "PUT"
	},
	getChannelList: {
		url: "/v2/playrtc/channels",
		method: "GET"
	},
	getChannel: {
		url: "/v2/playrtc/channels/channel/{0}",
		method: "GET"
	},
	getPeerList: {
		url: "/v2/playrtc/channels/channel/{0}/peers",
		method: "GET"
	},
	getPeer: {
		url: "/v2/playrtc/channels/channel/{0}/peers/peer/{1}",
		method: "GET"
	}
};
exports.map = map;