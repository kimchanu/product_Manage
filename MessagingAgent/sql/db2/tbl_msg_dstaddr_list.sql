create table {DONGBOTABLE}
( 
dkey varchar(50) not null, 
dstaddr varchar(20) not null, 
stat char(1) not null default '0', 
insert_time timestamp null, 
scnt decimal(6) not null default 0,
srepcnt decimal(6) not null default 0, 
primary key (dkey,dstaddr) 
) in tsp_sms;

