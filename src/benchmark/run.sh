
# Usage
# ./run.sh <Num of requests> <outfile prefix>

# Run
./invoke_lambda.sh $1

# Wait for log (CW) update
echo "Waiting 30 sec for CW logs to sync"
sleep 30

# Get duration & memory
./add_billed_duration.sh

# Create file
cp duration_out.csv $2_run_out.csv