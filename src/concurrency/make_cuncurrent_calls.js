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
    FunctionName: 'ConcurrentTest',
    InvocationType: 'RequestResponse',
    LogType: 'None'
};

for (let i = 0; i < process.argv[2]; i++) {
    if (i == 0)
        console.log('First request sent => ', new Date())
    if (i == process.argv[2] - 1)
        console.log('Last  request sent => ', new Date())
    lambda.invoke(params).promise()
        .then((data) => {
            fs.writeFile(__dirname + "/lambda_output_" + i + ".log", data.Payload, function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        })
        .catch((error) => console.log(error))
}
