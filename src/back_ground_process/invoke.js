const AWS = require('aws-sdk');
const fs = require('fs')
// Init
let options = {
    // accessKeyId: '<AccessID>',
    // secretAccessKey: '<Secret>',
    region: 'us-east-1'
}

var lambda = new AWS.Lambda(options)
var params = {
    FunctionName: 'backgroundprocess',
    InvocationType: 'RequestResponse',
    LogType: 'None'
};

for (let i = 0; i < process.argv[2]; i++) {
    lambda.invoke(params).promise()
        .then(data => console.log(data))
        .catch((error) => console.log(error))
}
