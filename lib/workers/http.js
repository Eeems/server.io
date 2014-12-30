var cluster = require('cluster'),
	http = require('http'),
	send = function(type,data,socket){
		process.send(JSON.stringify({
			type: type,
			data: data
		}),socket);
	},
	wsend = function(worker,type,data,socket){
		worker.send(JSON.stringify({
			type: type,
			data: data
		}),socket);
	},
	config;
process.on('exit',function(){
	for(var i in cluster.workers){
		wsend(cluster.workers[i],'shutdown');
	}
});
process.on('message',function(d,s){
	d = JSON.parse(d);
	switch(d.type){
		case 'shutdown':
			console.log('Stopping worker '+process.pid);
			process.exit();
		break;
		case 'config':
			config = d.data;
		break;
		case 'start':
			if(cluster.isMaster){
				var i = 0;
				while(i < require('os').cpus().length){
					i++;
					cluster.fork();
				}
				cluster.on('exit',function(worker,code,signal){
					console.log('Stopping http fork '+worker.process.pid);
					if(code !== 0){
						cluster.fork();
					}
				});
				cluster.on('online',function(worker){
					console.log('Starting http fork '+worker.process.pid);
					wsend(worker,'config',config);
					wsend(worker,'start');
				});
			}else{
				http.createServer(function(req,res){
					console.log(req.method+' '+req.url);
					res.setHeader('Content-Type','text/plain');
					res.write('test');
					res.end();
				}).listen(config.port,config.host);
			}
		break;
		default:
			console.log(d.type);
	}
});