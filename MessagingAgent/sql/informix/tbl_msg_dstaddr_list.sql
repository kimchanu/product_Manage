create table {DONGBOTABLE}
( 
dkey varchar(50) not null, 
dstaddr varchar(20) not null, 
stat char(1) default '0' not null, 
insert_time datetime year to second default current year to second not null,
scnt int default 0 not null,
srepcnt int default 0 not null,
primary key (dkey,dstaddr) 
);
