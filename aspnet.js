/*
 * fis
 * http://fis.baidu.com/
 *
 * asp.net server for fis
 * https://github.com/ciznx/fis-command-aspnet.git
 */



var _ = require('./../fis-command-server/lib/util.js');
var child_process = require('child_process');
var spawn = child_process.spawn;
var isWin = fis.util.isWin();
	
function writeln(s){
	if(typeof s === 'undefined'){
		s = '';
	}
		
	process.stdout.write(s + '\r\n');
}
function options(opt) {
    var tmp = _.getRCFile();
    if (opt) {
        fis.util.write(tmp, JSON.stringify(opt));
    } else {
        if (fis.util.exists(tmp)) {
            opt = fis.util.readJSON(tmp);
        } else {
            opt = {};
        }
    }
    return opt;
}


exports.start = function(opt) {
    writeln('starting asp.net server (iis express on windows, OR xsp on linux).');
	var netVersion = opt.clr;

	// writeln( require('util').inspect(opt) );


	function devServer(vsVersion) {
	    var processArch = process.config.variables.host_arch;
	    var arch = (processArch === 'x64' || processArch === 'ia32') ? ' (x86)' : '';		// vs 本身只有 x86 版本
		
		return 'C:\\Program Files' + arch + '\\Common Files\\microsoft shared\\DevServer\\' + vsVersion + '.0\\WebDev.WebServer'+ netVersion +'0.EXE';
	}

	function next(){
		// 启动 devServer 时可能触发一些 spawn 异常，但似乎已经启动成功了（如果未成功，我们使用 server.pid 检测）
		// 所以，不希望在此处抛出异常
		process.on('uncaughtException', suppressException);
		options(opt);
		setTimeout(function(){
		    var defaultDoc = 'http://' + (isWin ? 'localhost' : '127.0.0.1') + (opt.port == 80 ? '' : ':' + opt.port) + '/' + opt.document;
			_.open(defaultDoc, function(){
				process.exit();
			});
		}, 200);
	}

	function suppressException( err ) {
		if(err.code !== 'ENOENT'){
			throw err;
		}
	}
  
	var server, args;	
	if( isWin ){
		args = [
			'/Path:' + opt.root.replace(/\//g, '\\'),
			'/Port:' + opt.port,
			'/clr:'  + 'v' + netVersion + '.0'
		];
		
		// http://www.iis.net/learn/extensions/using-iis-express/running-iis-express-from-the-command-line
		opt['process'] = 'iisexpress';
		server = spawn('C:\\Program Files\\IIS Express\\iisexpress.exe', args, { cwd : __dirname, detached: true });
		if(!server.pid){
			writeln();
			writeln('iisexpress.exe not found, try asp.net dev server...');
			
			// http://pendsevikram.blogspot.com/2008/08/hosting-aspnet-application-from.html
			args.splice(2,1); // delete /clr:
			opt['process'] = 'WebDev\\.WebServer' + netVersion + '0';  // 这会用作正则表达式，用于匹配 web server 的进程名称
			server = spawn( devServer(10) , args, { cwd : __dirname, detached: true });
			if(!server.pid){
				server = spawn( devServer(9) , args, { cwd : __dirname, detached: true });
			}
			
			if(!server.pid){
				writeln('failed to start any asp.net server.');
				setTimeout(function(){
					process.exit();
				}, 200);
			}else{
				next();
			}
		}
	} else {
		args = ['--nonstop', '--address', '127.0.0.1'];
		['root', 'port'].forEach(function(key){
			args.push('--' + key, String(opt[key]));
		});

		// https://github.com/mono/monodevelop/blob/7c51ae11c323d429c10acd22169373927217198f/main/src/addins/AspNet/Execution/AspNetExecutionHandler.cs
		opt['process'] = 'mono';
		server = spawn('xsp' + netVersion, args, { cwd : __dirname, detached:true});
	}
	
	var ready = false;
    var log = '';

    // server.stderr.on('data', function(chunk){
		// chunk = chunk.toString('utf8');
		// writeln('err: ' +chunk);
		// return;
	// });
    server.stdout.on('data', function(chunk){
	 // chunk = chunk.toString('utf8');
	 // writeln('msg: ' + chunk);
	 // return;
	
	if(ready) return;
        chunk = chunk.toString('utf8');
        log += chunk;
		
        process.stdout.write('.');
        if(chunk.indexOf('Successfully registered URL') >= 0 /* iis express */ || chunk.indexOf('Listening on port:' /* xsp */) >= 0){
            ready = true;
            process.stdout.write(' at port [' + opt.port + ']\r\n');
			next();
        }
        else if(chunk.indexOf('Unable to start iisexpress') >= 0 || chunk.indexOf('Registration completed') >= 0 || chunk.indexOf('Error:') >= 0  /* xsp */) {
            fis.log.error(log);
        }
    });
    server.on('error', function(err){
    	writeln('error in server process.');
        try { process.kill(server.pid, 'SIGKILL'); } catch(e){}
        fis.log.error(err);
    });
	
	
    server.unref();
    fis.util.write(_.getPidFile(), server.pid);
};

//server stop
exports.stop = function (callback) {
    var tmp = _.getPidFile();
    //read option
    var opt = options();
    if (fis.util.exists(tmp)) {
        var pid = fis.util.fs.readFileSync(tmp, 'utf8').trim();
        var list, msg = '';
        var isWin = fis.util.isWin();

        if (isWin) {
            list = spawn('tasklist');
        } else {
            list = spawn('ps', ['-A']);
        }

        list.stdout.on('data', function (chunk) {
            msg += chunk.toString('utf-8').toLowerCase();
        });

        list.on('exit', function () {
            msg.split(/[\r\n]+/).forEach(function (item) {

                // 修改原有实现，令其支持含有数字的可执行文件名
                var reg = new RegExp('\\b' + opt['process'] + '\\b', 'i');
                if (reg.test(item) && item.indexOf(pid) >= 0) {
                    try {
                        process.kill(pid, 'SIGINT');
                        process.kill(pid, 'SIGKILL');
                    } catch (e) { }
                    process.stdout.write('shutdown ' + opt['process'] + ' process [' + pid + ']\n');
                }
            });
            fis.util.fs.unlinkSync(tmp);
            if (callback) {
                callback(opt);
            }
        });

        list.on('error', function (e) {
            if (isWin) {
                fis.log.error('fail to execute `tasklist` command, please add your system path (eg: C:\\Windows\\system32, you should replace `C` with your system disk) in %PATH%');
            } else {
                fis.log.error('fail to execute `ps` command.');
            }
        });

    } else {
        if (callback) {
            callback(opt);
        }
    }
};

//server info
exports.info = function () {
    var conf = _.getRCFile();
    if (fis.util.isFile(conf)) {
        conf = fis.util.readJSON(conf);
        _.printObject(conf);
    } else {
        writeln('nothing...');
    }
};

//server open document directory
exports.open = function (root) {
    var conf = _.getRCFile();
    if (fis.util.isFile(conf)) {
        conf = fis.util.readJSON(conf);
        if (fis.util.isDir(conf.root)) {
            _.open(conf.root);
        }
    } else {
        _.open(root);
    }
};


