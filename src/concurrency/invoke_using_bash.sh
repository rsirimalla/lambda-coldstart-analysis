#!/bin/bash

# Remove previous run logs
# usage: ./invoke_using_bash.sh 10 => invokes lambda 10 times
rm -rf *.log

START=1
END=$1

# run processes and store pids in array
for i in $(eval echo "{$START..$END}")
do
    aws lambda invoke --function-name ConcurrentTest output$i.log 2> /dev/null 1> /dev/null &
    pids[${i}]=$!
done

# wait for all pids
for pid in ${pids[*]}; do
    wait $pid
done

# Generate report
for i in `ls *.log`; do cat $i; echo; done | sed 's/"//g' | tr - '\n' | sort | uniq -c

# Clean up
rm -rf *.log