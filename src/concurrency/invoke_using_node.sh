#!/bin/bash
# usage: ./invoke_using_node.sh 10 => invokes lambda 10 times

LOG_FILE=output.log

# Remove previous run logs
rm -rf $PWD/*.log

node make_cuncurrent_calls $1

# Generate report
for i in `find . -name 'lambda*.log'`; do cat $i; echo; done | sed 's/"//g' | tr - '\n' | sort | uniq -c > output.log

echo ""
grep -v "container" $LOG_FILE | sort
echo ""
echo "Total # of containers => `grep -v "container" $LOG_FILE | wc -l`"
echo ""
grep "container" $LOG_FILE

# Clean up
find . -name '*.log' | xargs rm -rf