const AWS = require('aws-sdk');

// Init
let options = {
    // accessKeyId: '<AccessID>',
    // secretAccessKey: '<Secret>',
    region: 'us-east-1'
}

var lambda = new AWS.Lambda(options)
var params = {
    FunctionName: 'LambdaSpecs',
    InvocationType: 'RequestResponse',
    LogType: 'None'
};

lambda.invoke(params).promise()
    .then((data) => console.log(data.Payload))
    .catch((error) => console.log(error))

