create table {BLOCKTABLE}
( 
dstaddr varchar(20) not null, 
msg_type char(1) not null, 
reg_time datetime null, 
memo varchar(30), 
primary key (dstaddr,msg_type) 
);
