#!/bin/bash

rm -rf out.csv

LAMBDA_OUT_FILE="sdk_out.csv"
XRAY_OUT_FILE="traces_out.csv"

echo "Invoking lambda .."
node sdk_invoke.js $1 > $LAMBDA_OUT_FILE
echo "Waiting for 5 seconds .."
sleep 5

echo "Getting traces from X-Ray .."
./get_traceid.sh > $XRAY_OUT_FILE
echo "Waiting for 5 seconds .."
sleep 5

echo "Aggregating info .."
for row in `cat $LAMBDA_OUT_FILE`
do    
    req_id=`echo $row | awk -F, '{print $1}'`
    log_stream=`echo $row | awk -F, '{print $2}'`
    start_type=`echo $row | awk -F, '{print $3}'`
    # client_resp_time=`echo $row | awk -F, '{print $4}'`
    trace_id=`grep $req_id $XRAY_OUT_FILE | awk -F, '{print $2}'`
    xray_duration=`grep $req_id $XRAY_OUT_FILE | awk -F, '{print $3}'`
    # if [ -n "$trace_id" ]
    # then
    # echo "$req_id,$log_stream,$trace_id,$start_type,$client_resp_time,$xray_duration" >> all_out.csv
    echo "$req_id,$log_stream,$trace_id,$start_type,$xray_duration" >> out.csv
    # fi
done