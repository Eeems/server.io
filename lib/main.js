var config = {},
	socket,
	fork = require('child_process').fork,
	child,
	send = function(type,data,socket){
		child.send(JSON.stringify({
			type: type,
			data: data
		}),socket);
	};
process.on('message',function(d,s){
	d = JSON.parse(d);
	switch(d.type){
		case 'shutdown':
			console.log('Stopping thread '+process.pid);
			process.exit();
		break;
		case 'config':
			config = d.data;
		break;
		case 'start':
			console.log('Starting thread '+process.pid);
			switch(config.type){
				case 'http':
					child = fork('./lib/workers/http.js');
					child.on('message',function(d,s){
						d = JSON.parse(d);
						switch(d.type){
							case 'end':
								send('shutdown');
							break;
						}
					});
					send('config',config);
					send('start');
				break;
			}
		break;
		default:
			console.log(d.type);
	}
});