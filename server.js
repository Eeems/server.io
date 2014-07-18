exports.main = require('./lib/main');
exports.workers = require('./lib/worker');
exports.server = (function(){
	var ret = {
		workers: [],
		start: function(port){
			
		}
	};

	return ret;
})();