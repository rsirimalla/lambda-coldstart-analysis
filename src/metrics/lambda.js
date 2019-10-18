const reuse_file = '/tmp/reuse.txt';
let response = {};
const moment = require('./moment.js')

// Generate hash (used as container ID)
function genHash() {
    const crypto = require('crypto');
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
}

// Lambda handler
exports.handler = async (event, context, callback) => {
    const fs = require('fs');
    var hash = 'unassigned'; // Used as Container ID
    response['aws_request_id'] = context.awsRequestId;
    response['request_time'] = event['request_time'];
    response['log_stream'] = context.logStreamName;

    // Check if file exists
    if (fs.existsSync(reuse_file)) {
        // if exists - get hash 
        hash = fs.readFileSync(reuse_file, 'utf8');
        response['start_type'] = "warm";
        if (hash.includes('started')) {
            response['container_id'] = hash;
            response['start_type'] = "in-progress";
            return context;
        }
    }
    else {
        // if doesnt exist, generate hash and create file
        response['start_type'] = "cold";
        hash = genHash();
        fs.writeFileSync(reuse_file, hash, 'utf8');
    }

    response['container_id'] = hash;
    // To simulate async(network etc) activity    
    function wait() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve("hello"), 1000);
        });
    }


    // Each iteration costs a second
    fs.writeFileSync(reuse_file, hash + '-started', 'utf8');
    let seconds_to_wait = 0;
    for (let i = 1; i <= seconds_to_wait; i++) {
        console.log(await wait());
    }
    fs.writeFileSync(reuse_file, hash, 'utf8');

    // Send response based on file_exist flag
    return response;
};
