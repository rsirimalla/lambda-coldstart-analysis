const reuse_file = '/tmp/reuse.txt';

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
    var file_exists = false; //Flag to check if container is new or not
    var hash = 'unassigned'; // Used as Container ID

    // Check if file exists
    if (fs.existsSync(reuse_file)) {
        // if exists - get hash 
        hash = fs.readFileSync(reuse_file, 'utf8');
        file_exists = true;
        if (hash.includes('started'))
            return "Request in-progress container-" + hash;
    }
    else {
        // if doesnt exist, generate hash and create file
        hash = genHash();
        fs.writeFileSync(reuse_file, hash, 'utf8');
    }

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
    if (file_exists)
        return 'Reused(Warm)  container(s)-' + hash;
    else
        return 'Created(Cold) container(s)-' + hash;
};
