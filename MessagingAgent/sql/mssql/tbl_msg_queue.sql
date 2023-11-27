create table {SENDTABLE}
( 
mseq int identity(1,1) not null, 
msg_type char(1) not null default '1', 
send_type char(1) not null default '1', 
dkey varchar(50) not null default '0', 
dcnt int not null default 0, 
dstaddr varchar(20) not null default '0', 
callback varchar(20) null, 
stat char(1) not null default '0', 
subject varchar(120) null,  
text_type char(1) not null default '0', 
text varchar(4000) not null default ' ', 
text2 varchar(4000) null,
expiretime int null default 86400, 
filecnt    int not null default 0, 
fileloc1   varchar(512) null, 
filesize1  int null, 
fileloc2   varchar(512) null, 
filesize2  int null, 
fileloc3   varchar(512) null, 
filesize3  int null, 
fileloc4   varchar(512) null, 
filesize4  int null, 
fileloc5   varchar(512) null, 
filesize5  int null, 
filecnt_checkup int not null default 0, 
insert_time datetime null default getdate(), 
request_time datetime not null default getdate(), 
send_time datetime null, 
report_time datetime null, 
tcprecv_time datetime null, 
save_time datetime null, 
telecom varchar(10) null, 
result char(4) null, 
repcnt int not null default 0, 
server_id int null, 
opt_id varchar(20) null, 
opt_cmp  varchar(40) null, 
opt_post  varchar(40) null, 
opt_name varchar(40) null, 
ext_col0 int null, 
ext_col1 varchar(64) null, 
ext_col2 varchar(32) null, 
ext_col3 varchar(32) null,
pseq varchar(10) null,
sender_key varchar(40) null,
k_template_code varchar(30) null,
k_expiretime int null default 180,
k_next_type int null default 0,

k_at_send_type char(1) default '0',
k_ad_flag char(1) default 'N',

k_attach varchar(4000) null,
k_attach2 varchar(2000) null,
primary key(mseq) 
);

