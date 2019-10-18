const AWS = require('aws-sdk');
const fs = require('fs')
var moment = require('moment')

const headers = 'request_sent_time,response_rev_time,aws_request_id,container_id,start_type,time_taken(ms)'

// Get diff in seconds
function time_diff(start_time, end_time = moment(new Date(), 'YYYY-MM-DD HH:mm:ss')) {
    return moment.duration(end_time.diff(start_time)).asSeconds();
}

// Init
let options = {
    region: 'us-east-1'
}

var lambda = new AWS.Lambda(options)
var params = {
    FunctionName: 'parsecloudwatchlogs',
    InvocationType: 'RequestResponse',
    LogType: 'None'
};

function lambda_invoke() {
    for (let i = 0; i < process.argv[2]; i++) {
        params['Payload'] = JSON.stringify({ request_time: moment(new Date()) })
        lambda.invoke(params).promise()
            .then((data) => {
                let payload = JSON.parse(data.Payload)
                let resp_recv_time = moment(new Date())
                let req_sent_time = moment(payload['request_time'])
                let time_taken = time_diff(req_sent_time, resp_recv_time)
                resp_recv_time = resp_recv_time.format('YYYY-MM-DD HH:mm:ss.SSS')
                req_sent_time = req_sent_time.format('YYYY-MM-DD HH:mm:ss.SSS')
                console.log(`${req_sent_time},${resp_recv_time},${payload.aws_request_id},${payload.container_id},${payload.start_type},${time_taken}`)
            })
    }
}

console.log(headers)
lambda_invoke()
