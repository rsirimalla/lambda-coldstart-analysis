const exec = require("child_process").exec;
var spawn = require('child_process').spawn;

const fs = require('fs');
const script = '/tmp/demo.sh';

let code = "#!/bin/bash \nfor ((n=0;n<10;n++)); do curl -I http://54.210.177.153:8080; sleep 1; done";

exports.handler = async (event, context) => {

    fs.writeFileSync(script, code, 'utf8');
    exec('chmod 755 ' + script);

    spawn('bash', [script], {
        stdio: 'ignore',
        detached: true
    }).unref();

    function wait() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve("hello"), 1000);
        });
    }
    await wait();
    await wait();
    // await wait();
    console.log(context);
    return {
        body: JSON.stringify('All good'),
        statusCode: 200
    };
};
