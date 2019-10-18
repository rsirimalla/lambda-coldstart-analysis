
const AWS = require('aws-sdk')
const _ = require('lodash')
const moment = require('moment')
const functionName = 'benchmark'
const logGroupName = `/aws/lambda/${functionName}`
var request = require('request')
const today = moment(new Date()).format('YYYY/MM/DD')


// Time diff in seconds
function getTimeDiff(start_date, end_date) {
    return Math.trunc(moment.duration(end_date.diff(start_date)).asSeconds() * 1000)
}

// Get log streams that were created today 
async function getLogStreams() {

    let response = []
    let params = {
        logStreamNamePrefix: today,
        logGroupName: logGroupName
    }

    let cloudWatchLogs = new AWS.CloudWatchLogs({ region: 'us-east-1' })
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

    // Apigee
    // var url = "https://natgeo-preprod-dev.apigee.net/benchmark"

    // API Gateway
    var url = 'https://5jli9fh048.execute-api.us-east-1.amazonaws.com/dev/benchmark'

    // ECS - Fargate
    // var url = 'http://ec2co-ecsel-17ccdhcfaxx08-1366470505.us-east-1.elb.amazonaws.com:8080/'

    // Google cloud
    // var url = 'https://us-central1-optical-figure-147118.cloudfunctions.net/hello-world'

    // Azure
    // var url = 'https://hellochip.azurewebsites.net/api/HttpTriggerJS1?code=aOEQx5Pw8EadOT3E8NDa8i0CzGBedkrtbSNOkbSAHtMNiu4Um4cSxQ==&name=gormin'

    var options = {
        method: 'post',
        json: true,
        url: url,
        time: true
    }

    // Call ntimes
    var start_time = ''
    var end_time = ''
    _.times(process.argv[2], (index) => {
        if (index == 0) { start_time = new Date() }

        if (index == process.argv[2] - 1) {
            end_time = new Date()
            console.error('Ramp-up time => ', getTimeDiff(moment(start_time), moment(end_time)))
        }

        options['body'] = {
            request_time: new Date(),
        }

        request(options, function (err, res, payload) {
            if (err) {
                console.error('error posting json: ', err, payload)
            } else
                try {                    
                    let start_type = _.includes(streams, payload.logStreamName) ? 'warm' : (streams.push(payload.logStreamName), 'cold')
                    console.log(
                        payload.awsRequestId + ',' +
                        payload.logStreamName + ',' +
                        start_type + ',' +
                        // moment(res.timingStart).format('MM-DD-YYYY HH:mm:ss.SSS') + ',' +
                        // moment(res.responseStartTime).format('MM-DD-YYYY HH:mm:ss.SSS') + ',' +
                        Math.trunc(res.timingPhases.wait) + ',' +
                        Math.trunc(res.timingPhases.dns) + ',' +
                        Math.trunc(res.timingPhases.tcp) + ',' +
                        Math.trunc(res.timingPhases.firstByte) + ',' +
                        Math.trunc(res.timingPhases.download) + ',' +
                        Math.trunc(res.timingPhases.total)
                        // Math.trunc(res.timingPhases.firstByte)
                    )
                } catch (error) {
                    console.error(error, payload)
                }
        })
    })
}

invoke()