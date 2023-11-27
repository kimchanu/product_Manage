create table {BLOCKTABLE}
( 
dstaddr varchar2(20) not null, 
msg_type char(1) null, 
reg_time date null, 
memo varchar2(30), 
primary key (dstaddr,msg_type) 
);

