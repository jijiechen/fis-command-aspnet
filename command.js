/*
 * fis
 * http://fis.baidu.com/
 *
 * asp.net server for fis
 * https://github.com/ciznx/fis-command-aspnet.git
 */

'use strict';

var server = require('./aspnet.js');

exports.name = 'aspnet';
exports.usage = '<command> [options]';
exports.desc = 'launch an asp.net server for previewing fis project';
exports.register = function (commander) {
    function getRoot(root) {
        if (fis.util.exists(root)) {
            if (!fis.util.isDir(root)) {
                fis.log.error('invalid document root');
            }
        } else {
            fis.util.mkdir(root);
        }
        return fis.util.realpath(root);
    }

    //support glob: a**,b**,/usr**,/*/*
    function glob(str, prefix) {
        var globArr = str.split(',');
        var group = [];
        var s_reg;
        globArr.forEach(function (g) {
            if (g.length > 0) {
                s_reg = fis.util.glob(g).toString();
                //replace
                // '/^' => ''
                // '$/i' => ''
                s_reg = s_reg.substr(2, s_reg.length - 5);
                group.push(s_reg);
            }
        });
        prefix = prefix || '';
        if (prefix) {
            s_reg = fis.util.glob(prefix).toString();
            // '/^' => '', '%/i' => ''
            prefix = s_reg.substr(2, s_reg.length - 5);
        }
        return new RegExp('^' + prefix + '(' + group.join('|') + ')$', 'i');
    }

    var serverRoot = (function () {
        var key = 'FIS_SERVER_DOCUMENT_ROOT';
        if (process.env && process.env[key]) {
            var path = process.env[key];
            if (fis.util.exists(path) && !fis.util.isDir(path)) {
                fis.log.error('invalid environment variable [' + key + '] of document root [' + path + ']');
            }
            return path;
        } else {
            return fis.project.getTempPath('www');
        }
    })();

    commander
        .option('-p, --port <int>', 'port for the server to listen', parseInt, process.env.FIS_SERVER_PORT || 8080)
        .option('--root <path>', 'root path of the preview project', getRoot, serverRoot)
        .option('--clr <version>', 'specify .net clr version, 2 or 4', parseInt, 4)
        .option('--document <default_document>', 'default document to navigate', String, '')
        .option('--include <glob>', 'clean include filter', String)
        .option('--exclude <glob>', 'clean exclude filter', String)        
        .action(function () {
            var args = Array.prototype.slice.call(arguments);
            var options = args.pop();
            var cmd = args.shift();
            var root = options.root;

            if (root) {
                if (fis.util.exists(root) && !fis.util.isDir(root)) {
                    fis.log.error('missing root path [' + root + ']');
                } else {
                    fis.util.mkdir(root);
                }
            } else {
                fis.log.error('missing root path of project');
            }

            switch (cmd) {
                case 'start':
                    var opt = {};
                    fis.util.map(options, function (key, value) {
                        if (typeof value !== 'object' && key[0] !== '_') {
                            opt[key] = value;
                        }
                    });
                    server.stop(function () {
                        server.start(opt);
                    });
                    break;
                case 'stop':
                    server.stop(function () {

                    });
                    break;
                case 'restart':
                    server.stop(server.start);
                    break;
                case 'info':
                    server.info();
                    break;
                case 'open':
                    server.open(root);
                    break;
                case 'clean':
                    process.stdout.write(' δ '.bold.yellow);
                    var now = Date.now();
                    var user_include = fis.config.get('server.clean.include');
                    var user_exclude = fis.config.get('server.clean.exclude');
                    //flow: command => user => default
                    var include = options.include ? glob(options.include, root) : (user_include ? glob(user_include, root) : null);
                    var exclude = options.exclude ? glob(options.exclude, root) : (user_exclude ? glob(user_exclude, root) : /\/WEB-INF\/cgi\//);
                    fis.util.del(root, include, exclude);
                    process.stdout.write((Date.now() - now + 'ms').green.bold);
                    process.stdout.write('\n');
                    break;
                //case 'init':
                    // may be get the nuget packages ready...
                    //break;
                default:
                    commander.help();
            }
        });

    commander
        .command('start')
        .description('start server');

    commander
        .command('stop')
        .description('shutdown server');

    commander
        .command('restart')
        .description('restart server');

    commander
        .command('info')
        .description('output server info');

    commander
        .command('open')
        .description('open document root directory');

    commander
        .command('clean')
        .description('clean files in document root');
};
