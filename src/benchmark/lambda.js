const reuse_file = '/tmp/reuse.txt';
const fs = require('fs');
const crypto = require('crypto');

// Generate hash (used as container ID)
function genHash() {

    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
}

// Generate response
function generate_response(response) {
    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
}

// Lambda handler
exports.handler = async(event, context, callback) => {

    console.time('FS_Activity');
    var hash = 'unassigned'; // Used as Container ID
    var response = {};
    response['context'] = context;
    response['in_progress'] = false;


    // Check if file exists
    if (fs.existsSync(reuse_file)) {
        // if exists - get hash 
        hash = fs.readFileSync(reuse_file, 'utf8');
        response['start_type'] = 'warm';
        if (hash.includes('started')) {
            response['in_progress'] = true;
            return generate_response(response);
        }
    }
    else {
        // if doesnt exist, generate hash and create file
        hash = genHash();
        fs.writeFileSync(reuse_file, hash, 'utf8');
        response['start_type'] = 'cold';
    }

    // To simulate async(network etc) activity    
    function wait() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve("hello"), 1000);
        });
    }

    // Each iteration costs a second
    // Comment 10172
    fs.writeFileSync(reuse_file, hash + '-started', 'utf8');
    let seconds_to_wait = 0;
    for (let i = 1; i <= seconds_to_wait; i++) {
        console.log(await wait());
    }

    fs.writeFileSync(reuse_file, hash, 'utf8');
    console.timeEnd('FS_Activity');
    return generate_response(response);
    // 
};
