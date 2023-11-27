create table {DONGBOTABLE}
( 
dkey varchar2(50) not null, 
dstaddr varchar2(20) not null, 
stat char(1) default '0' not null, 
insert_time date default sysdate not null,
scnt number(6) default 0 not null,
srepcnt number(6) default 0 not null,
primary key (dkey,dstaddr) 
);
