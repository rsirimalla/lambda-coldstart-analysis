
const AWS = require('aws-sdk')
const moment = require('moment')
const _ = require('lodash')
const function_name = 'benchmark'


// Get trace IDs
async function getTraceIds(duration = 1) {
    let trace_ids = []
    let xray = new AWS.XRay({ region: 'us-east-1' })
    let params = {
        StartTime: moment().subtract(duration, 'minutes').toISOString(),
        EndTime: moment().toISOString(),
        Sampling: false,
        FilterExpression: `service("${function_name}")`
    }
    try {
        let next = true
        while (next) {
            let summaries = await xray.getTraceSummaries(params).promise()
            _.forEach(summaries.TraceSummaries, (summary) => {
                trace_ids.push(summary.Id)
            })
            if (summaries.NextToken == undefined || !summaries.NextToken)
                next = false
            params.NextToken = summaries.NextToken
        }
        return trace_ids
    } catch (error) {
        console.log(error)
    }
}

// Get traceID for a AWS RequestID
async function getTraceID(trace_ids, aws_request_id) {
    let xray = new AWS.XRay({ region: 'us-east-1' })
    try {
        _.chunk(trace_ids, 5).forEach(async (traceIds) => {
            let params = { TraceIds: traceIds }
            let next = true
            while (next) {
                let batch = await xray.batchGetTraces(params).promise()
                _.forEach(batch.Traces, (trace) => {
                    _.forEach(trace.Segments, (segment) => {
                        let doc = JSON.parse(segment.Document)
                        if (doc.aws['request_id']) {
                            let duration = (doc.end_time - doc.start_time).toFixed(3)
                            console.log(`${doc.aws['request_id']},${doc.trace_id},${duration}`)
                        }

                    })
                })
                if (batch.NextToken == undefined || !batch.NextToken)
                    next = false
                params['NextToken'] = batch.NextToken
            }
        })
        return "All done"
    } catch (error) {
        console.log(error)
    }
}

async function invoke() {
    let trace_ids = await getTraceIds(process.argv[2])
    await getTraceID(trace_ids)
}

invoke()