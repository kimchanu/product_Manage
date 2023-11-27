## Log table index script 

create index {LOGTABLE}_idx1 on {LOGTABLE}(mseq);
create index {LOGTABLE}_idx2 on {LOGTABLE}(request_time);
