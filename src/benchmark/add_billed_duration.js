
const AWS = require('aws-sdk')
const in_file = 'out.csv'
const fs = require('fs')
const _ = require('lodash')
const function_name = 'benchmark'
// Global
let streams_total = []
let request_stats = {}

// Convert CSV to JSON
const in_file_content = fs.readFileSync(__dirname + '/' + in_file, 'utf8')
_.forEach(in_file_content.split('\n'), (value) => {
    let stats = value.split(',')
    if (stats.length < 2)
        return
    request_stats[stats[0]] = {
        container_id: stats[1],
        in_progress: stats[2],
        start_type: stats[3],
        request_time_sent: stats[4],
        response_time_received: stats[5],
        total_time_taken: Number(stats[6])
    }
    streams_total.push(request_stats[stats[0]].container_id)
})

async function get_events(_streams) {
    var events = []
    var response = {}

    let options = {
        region: 'us-east-1'
    }
    var cloudwatchlogs = new AWS.CloudWatchLogs(options);
    params = {
        logGroupName: `/aws/lambda/${function_name}`,
        logStreamNames: _streams,
        filterPattern: 'REPORT'
    };

    try {
        while (true) {
            var logs = await cloudwatchlogs.filterLogEvents(params).promise()
            logs.events.forEach((value) => {
                events.push(value.message.replace('REPORT', '').replace('\n', '').split('\t').reduce((agg, cur) => {
                    cur = cur.replace(/\s/g, '').split(':')
                    agg[cur[0]] = cur[1]
                    return agg
                }, {}))
            })
            if (logs.events.length == 0 || logs.nextToken == undefined) {
                events.forEach((value) => {
                    response[value['RequestId']] = {
                        billed_duration: Number(value['Duration'].replace('ms', '')),
                        max_memory_used: Number(value['MaxMemoryUsed'].replace('MB', ''))
                    }
                })
                return response;
            }

            params['nextToken'] = logs.nextToken;
        }

    } catch (error) {
        console.error(error)
    }
}

async function invoke() {
    let streams = _.uniq(streams_total)
    let iteration = 1


    console.error('Extracting logs from Cloudwatch might take multiple iterations')
    while (streams.length != 0 && iteration < 100) {
        let chunks = _.chunk(_.uniq(streams), 100)

        console.error(`\nIteration ${iteration}`)
        console.error(`Number of containers in current iteration => ${_.uniq(streams).length}`)
        for (i = 0; i < chunks.length; i++) {
            console.error(`Processing from ${i * 100} to ${(i + 1) * 100}`)
            let log_events = await get_events(chunks[i])
            _.merge(request_stats, log_events)
        }
        streams = []
        _.forEach(request_stats, (value, key) => {
            if (value.billed_duration == undefined)
                streams.push(value.container_id)
        })
        iteration++
    }

    // Add duration & max memory used
    _.forEach(request_stats, (value, key) => {
        console.log(key + ','
            + request_stats[key]['container_id'] + ','
            + request_stats[key]['in_progress'] + ','
            + request_stats[key]['start_type'] + ','
            + request_stats[key]['request_time_sent'] + ','
            + request_stats[key]['response_time_received'] + ','
            + request_stats[key]['total_time_taken'] + ','
            + request_stats[key]['billed_duration'] + ','
            + request_stats[key]['max_memory_used']
            // + request_stats[key]['billed_duration'] + ','
            // + request_stats[key]['max_memory_used']
        )
    })
}

invoke()