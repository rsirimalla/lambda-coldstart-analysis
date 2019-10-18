
# Usage
# ./total_aws_data.sh <RAM>
# ex: ./total_aws_data.sh 512

# Run
echo "one cold"
./invoke_lambda.sh 1
mv out.csv $1_1_cold_out.csv

sleep 2
echo "one warm"
./invoke_lambda.sh 1
mv out.csv $1_1_warm_out.csv

sleep 2
echo "1000 cold"
./invoke_lambda.sh 1000
mv out.csv $1_1000_cold_out.csv

sleep 2
echo "1000 warm"
./invoke_lambda.sh 1000
mv out.csv $1_1000_warm_out.csv
