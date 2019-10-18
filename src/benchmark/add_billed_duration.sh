

node add_billed_duration.js | grep -v undefined > duration_out.csv
# insert header
# MM-dd-yyyy HH:mm:ss.SSS (Quick sight date format)
echo -e "aws_request_id,log_stream,in_progress,start_type,request_sent_time,request_recv_time,total_time_taken,duration,max_memory_used\n$(cat duration_out.csv)" > duration_out.csv