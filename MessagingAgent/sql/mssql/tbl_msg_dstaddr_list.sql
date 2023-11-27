create table {DONGBOTABLE}
( 
dkey varchar(50) not null, 
dstaddr varchar(20) not null, 
stat char(1) not null default '0', 
insert_time datetime null default getdate(), 
scnt int not null default 0,
srepcnt int not null default 0,
primary key (dkey,dstaddr) 
);
