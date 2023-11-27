create table {BLOCKTABLE}
( 
dstaddr varchar(20) not null, 
msg_type char(1), 
reg_time datetime year to second default current year to second not null, 
memo varchar(30), 
primary key (dstaddr,msg_type) 
);

