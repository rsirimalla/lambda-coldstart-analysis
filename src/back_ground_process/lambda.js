const exec = require("child_process").exec
var spawn = require('child_process').spawn;

const fs = require('fs')
const script = '/Users/rameshs/tmp/demo.sh'


let code = "#!/bin/bash \nfor ((n=0;n<10;n++)); do curl -I http://54.210.177.153:8080; sleep 1; done"
fs.writeFileSync(script, code, 'utf8');
exec('chmod 755 ' + script)

spawn('sh', [script], {
    stdio: 'ignore',
    detached: true
}).unref();