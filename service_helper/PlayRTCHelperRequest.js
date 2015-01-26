var request = require("request"),
	Promise = require("promise"),
	map = require("./PlayRTCHelperMap.js").map,
	PlayRTCUtils = require("./PlayRTCHelperUtils.js").PlayRTCUtils,
	baseUrl = "https://apis.sktelecom.com",
	g_projectKey = null;
	
function requestApi( type, url, method, payload ){
	url = baseUrl + url;

	PlayRTCUtils.setLog( type, "method = " + method + " url = " + url );
	return new Promise(function(resolve, reject){
		if(!g_projectKey){
			PlayRTCUtils.setLog("ERROR", "Not ProjectKey");
			reject({
				service: "playrtchelper",
				code: 90000,
				message: "Project Key가 정의되지 않았습니다."
			});
			return;
		}
		
		var req = {
			url: url,
			headers: {
				TDCProjectKey: g_projectKey,
				"Content-Type": "application/json; charset=UTF-8"
			}
		}; 
		
		var fn = function( error, res, data ){
			if(error){
				PlayRTCUtils.setLog( type + "Error", error);
				reject({
					service: "playrtchelper",
					code: 90001,
					message: "PlayRTC Service Platform 에 요청하지 못 했습니다."
				});
				return;
			}
			
			PlayRTCUtils.setLog( type, "STCODE [" + res.statusCode + "] RES = " + data);
			try{
				if(data){
					data = JSON.parse(data);
				}
			}
			catch(e){
				reject({
					service: "playrtchelper",
					code: 90002,
					message: "Data 를 파싱하지 못 햇습니다."
				});
			}
			

			if( res.statusCode === 200 ){
				resolve(data);
			}
			else if( res.statusCode === 404 ){
				reject({
					service: "playrtchelper",
					code: 90003,
					message: "PlayRTC Service Platform 에 요청하지 못 했습니다."
				});
			}
			else{
				reject(data);
			}
		};
	
		if( method === "GET" ){
			request.get( req, fn );
		}
		else if( method === "DELETE" ){
			request.del( req, fn );
		}
		else if( method === "PUT" ){
			req.body = JSON.stringify(payload);
			request.put( req, fn );
		}
		else if( method === "POST" ){
			req.body = JSON.stringify(payload);
			request.post( req, fn );
		}
	});
}

function proxy(type, data){
	if(!data){
		data = {
			params: [],
			payload: null
		};
	}
	if(!data.params){
		data.params = [];
	}
	if(!data.payload){
		data.payload = null;
	}
	return new Promise(function(resolve, reject){
		if(!map[type]){
			reject({
				service: "playrtchelper",
				code: 90005,
				message: type + "는 PlayRTC Helper Map 에 정의 되지 않았습니다."
			});
			return;
		}
		
		var api = map[type];
		requestApi(type, PlayRTCUtils.strFormat(api.url, data.params), api.method, data.payload).then(function(data){
			resolve(data);
		}, function(data){
			reject(data);
		});
	});
}

exports.PlayRTCHelperRequest = {
	setProjectKey: function(projectKey){
		g_projectKey = projectKey;
	},
	request: proxy
};

