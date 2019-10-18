# lambda-coldstart-analysis
Lambda cold start analysis (or) its more about how the lambda works under the hood

## Questions ##
Sample repo to understand lambda (Not in VPC vs With in VPC). Things like
- How long a container is warm (for different memory configurations)
- How to determine if a container is being reused
- Whats a cold start?
  - It involves creating and container with specified runtime and download the code from S3.
- Does a warm container mean its running?
  - No. AWS freeze/pause containers as soon as the request is processed. So, there is lead time involved even for warm containers which is unfreeze/resume. Sometimes its more expensive then cold starts under load ( > 100 conc reqs ).
- How many requests are processed by each container
- Are the requests evenly distrubuted across all the containers all the time?
- Does choosing more memory means more money all the time?
- Is there any chance where two requests gets executed by same container at same time? (i mean the second request is being redirected to a container while it has first request execution in progress)
- When does lambda create a container
  - Does it create new container even when it has warm containers lying around? 
- How singleton pattern is achevied using lambda?
  - For example, one lambda creates a DB session and other lambdas use the same connection (aka connection pooling)
- What are lambda specs for various memory sizes?
  - Anything intresting that is not documented?
  - Hard disk size?
  - What OS?
  - Network config (with and without VPC)
- How to find out "how many containers are warm right now"
- Cold start duration same for all memory specs?
- How concurrency maps to rate of request?
  - If a request takes 10ms seconds to execute, how may containers we need for serving 10,000 if the rate is request is 1000/sec?
- What factors affect execution duration?
  - memory?
  - package size? 
- Are there any network mounts?
- '/tmp' always 512MB?
  - What if the app try to use more then 500MB?
  - Instance or network mount?
- How can we make use of '/tmp'?
   - Caching ? (since we know containers are gonna be reused)
- Can we launch a background process in Lambda? I mean completely outside of lambda runtime like a shell script. 
  - Back ground process can be launched. But Lambda service freezes the container once the request is completed i.e those jobs are paused. They are resumed when the same container is used for processing another request.

 
## Steps to run (benchmark) ##
This section is more about finding the following metrics for a vanilla lambda
* How many cold/warm containers used for a load like 1000 requests (fired under 300ms)
* What's the average processing time for cold/warm containers
* Analyze the data using pandas
```
git clone git@github.com:natgeo/lambda-coldstart-analysis.git
cd lambda-coldstart-analysis
npm install
cd src/benchmark
./invoke_lambda.sh 1000 //invokes 1000 requests and creates out.csv
./add_billed_duration.sh // Extracts billed duration for all the requests in "out.csv" from cloudwatch logs  and creates new file "duration_out.csv" (same as out.csv + extra column for billed duration)

jupyter notebook (open analyze.ipynb)

node get_trace_ids.js > traceids.out . # This command is needed ONLY if you want search events from Xray console. This will print trace id for a request ID. Because you cannot search events by aws request ID in Xray console. 
```
You can modify the following code segment in `lambda.js (lambda code)` to simulate processing. Default is 0, which means execution duration will be under 20ms. If you set `seconds_to_wait = 1`, the execution duration will be around 1020ms.    
```
let seconds_to_wait = 0; //Number of seconds to simulate processing
    for (let i = 1; i <= seconds_to_wait; i++) {
        console.log(await wait());
}
```

Note: Start with one request and gradually move up to 1000+ and observe the following
* Cold/Warm pattern
* Cold/Warm pattern with different `seconds_to_wait`
* Try the following scenario `seconds_to_wait=1` and run with 1000 & 2000
  - The # of containers are always 50 for both 1000 and 2000. Why? 
  - Does lambda has built in queue? If so, how many can it handle? Becaue - 1000 requests are sent under 300ms and the execution of all the requests take around 10 seconds.So, when the first batch is under execution where are pending requests are being maintained?
  - Sometimes the processing from warm containers is greater than cold containers. Why? (Because of Pause/Resume?)


## Steps to run (Reverse Shell) ##
Whats inside a container? lets findout by creating a "reverse" shell
* Create an EC2 instance with Public IP
* SSH to EC2
* Run the command `nc -l 1234`
* Create lambda (`lambda_node.js` from "ReverseShell" folder)
* Increase the lambda timeout to 5min
* Create a test event from lambda console with payload below
```
{
  "ip": <EC2 IP>,
  "port":1234 
}
```
* Click "Test" 
* You should see something like below on the EC2 SSH console
```
sh: no job control in this shell
sh-4.2$ pwd
pwd
/var/task
sh-4.2$
```
* Thats it !!

## Steps to run (Inpect lambda) ##
Run commands in a container
```
git clone git@github.com:natgeo/lambda-coldstart-analysis.git
cd lambda-coldstart-analysis
npm install
cd src/inspect
./invoke.sh
```
This is basically to take a closer at lambda resources since memory is the only thing that is known to user.
* You can add more commands `specs.json` to enhance 
* The above `invoke.sh` command displays everything and assumes that you have `jq` installed (if not you can run `node invoke.js`)
* Inspect memory - `node invoke.js | jq ".Memory"`
* Inspect CPU Model - `node invoke.js | jq ".CPUModel"`
* Disk Usage - `node invoke.js | jq ".DiskUsage"`
* Ports - `node invoke.js | jq ".Ports"`
* Run the above command with different memory configs like `128MB, 512MB, 1024MB` etc


## Note ##
Lambdas are set up in "NatGeo Dev(NE&O)". If you dont specify credentials in your code, the `aws-sdk` looks for creds in your default profile (~/.aws/credentials). 

```
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
```

Last but not least - Feel free to contribute (Questions/Scripts) if you think you have something that helps to understand Lambda :)





