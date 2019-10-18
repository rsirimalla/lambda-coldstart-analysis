
const AWS = require('aws-sdk')
const functionName = 'benchmark'
const logGroupName = `/aws/lambda/${functionName}`
const _ = require('lodash')
const moment = require('moment')
const today = moment(new Date()).format('YYYY/MM/DD')

// AWS options
const options = {
    region: 'us-east-1'
}

// Time diff in seconds
function getTimeDiff(start_date, end_date) {
    return moment.duration(end_date.diff(start_date)).asSeconds()
}

// Get log streams that were created today 
async function getLogStreams() {

    let response = []
    let params = {
        logStreamNamePrefix: today,
        logGroupName: logGroupName
    }

    let cloudWatchLogs = new AWS.CloudWatchLogs(options)
    while (true) {
        let logStreams = await cloudWatchLogs.describeLogStreams(params).promise()
        _.forEach(logStreams.logStreams, (stream) => {
            response.push(stream.logStreamName)
        })
        if (logStreams.nextToken == undefined)
            return response
        params['nextToken'] = logStreams.nextToken
    }
}

// Invoke
async function invoke() {
    var streams = await getLogStreams()

    // Lambda
    let lambda = new AWS.Lambda({
        region: 'us-east-1',
        maxRetries: 0
    })
    let params = {
        FunctionName: functionName,
        InvocationType: 'RequestResponse',
        LogType: 'None'
    }
    // Call ntimes
    _.times(process.argv[2], (index) => {
        params['Payload'] = JSON.stringify({ request_time: new Date() })        
        lambda.invoke(params).promise()
            .then((data) => {
                let payload = JSON.parse(data.Payload)
                // let resp_recv_time = moment(new Date())
                // let req_sent_time = moment(payload.request_time)
                let start_type = _.includes(streams, payload.logStreamName)
                    ? 'warm' : (streams.push(payload.logStreamName), 'cold')
                console.log(
                    payload.awsRequestId + ',' +
                    payload.logStreamName + ',' +
                    start_type
                    // getTimeDiff(req_sent_time, resp_recv_time)
                )
            }).catch(error => console.log(error))
    })
}

invoke()