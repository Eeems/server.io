var fork = require('child_process').fork,
	io = {
		main: require('./lib/main.js'),
		db: require('./lib/db.js'),
		server: (function(){
			this.workers = [];
			this.worker = function(config){
				var self = this,
					child = {
						fork: fork('./lib/main.js'),
						config: (function(){
							var i,
								defaults = {
									type: 'http',
									port: 0
								};
							for(i in defaults){
								if(config[i] === undefined){
									config[i] = defaults[i];
								}
							}
							return config;
						})(),
						stop: function(){
							this.send('shutdown');
							self.workers.splice(self.workers.indexOf(this),1);
						},
						on: function(){
							this.fork.on.apply(this.fork,arguments);
						},
						send: function(type,data,socket){
							this.fork.send.apply(this.fork,[JSON.stringify({
								type: type,
								data: data
							}),socket]);
						}
					};
				child.on('message',function(d,s){
					d = JSON.parse(d);
					switch(d.type){
						default:
							console.log(d.type);
					}
				});
				child.send('config',config);
				child.send('start');
				this.workers.push(child);
				return child;
			};
			return this;
		})()
	};
io.server.worker({
	port: 9005
});
function quit_handler(){
	for(var i in io.server.workers){
		io.server.workers[i].stop();
	}
}
process.on('SIGINT',quit_handler);
process.on('SIGTERM',quit_handler);
process.on('exit',quit_handler);