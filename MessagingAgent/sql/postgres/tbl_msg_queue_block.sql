create table {SCHM}.{BLOCKTABLE}
( 
dstaddr varchar(20) not null, 
msg_type char(1) null, 
reg_time date null, 
memo varchar(30), 
constraint pk_{BLOCKTABLE} primary key (dstaddr,msg_type)
);


