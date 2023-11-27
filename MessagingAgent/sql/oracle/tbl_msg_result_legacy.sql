create table {LOGTABLE}
(  
mseq number(11) not null, 
msg_type char(1) default '1' not null, 
send_type char(1) default '1' not null, 
dkey varchar2(50) default '0' not null, 
dcnt number(11) default 0 not null, 
dstaddr varchar2(20) default '0' not null, 
callback varchar2(20) null, 
stat char(1) default '0' not null, 
subject varchar2(120) null, 
text_type char(1) default '0' not null, 
text varchar2(4000) null, 
text2 varchar2(4000) null, 
expiretime number(8) default 86400 null, 
filecnt number(3) default 0 not null, 
fileloc1 varchar(512) null, 
filesize1 number(11) null, 
fileloc2 varchar(512) null, 
filesize2 number(11) null, 
fileloc3 varchar(512) null, 
filesize3 number(11) null, 
fileloc4 varchar(512) null, 
filesize4 number(11) null, 
fileloc5 varchar(512) null, 
filesize5 number(11) null, 
filecnt_checkup number(3) default 0 not null, 
insert_time date default sysdate not null, 
request_time date default sysdate not null, 
send_time date null, 
report_time date null, 
tcprecv_time date null, 
save_time date null, 
telecom varchar2(10) null, 
result char(4) null, 
repcnt number(6) default 0 not null, 
server_id number(11) null, 
opt_id varchar2(20) null, 
opt_cmp  varchar2(40) null, 
opt_post varchar2(40) null, 
opt_name varchar2(40) null, 
ext_col0 number(10) null, 
ext_col1 varchar2(64) null, 
ext_col2 varchar2(32) null, 
ext_col3 varchar2(32) null,
pseq varchar2(10) null,
sender_key varchar2(40) null,

k_template_code varchar2(30) null,
k_expiretime number(6) default 180 null,
k_img_link_url varchar2(256) null,
k_next_type number(1) default 0 null,

k_button_type  char(2) null,
k_button_name  varchar2(56) null,
k_button_url   varchar2(256) null,
k_button_url2  varchar2(256) null,
k_button2_type char(2) null,
k_button2_name varchar2(56) null,
k_button2_url  varchar2(256) null,
k_button2_url2 varchar2(256) null,
k_button3_type char(2) null,
k_button3_name varchar2(56) null,
k_button3_url  varchar2(256) null,
k_button3_url2 varchar2(256) null,
k_button4_type char(2) null,
k_button4_name varchar2(56) null,
k_button4_url  varchar2(256) null,
k_button4_url2 varchar2(256) null,
k_button5_type char(2) null,
k_button5_name varchar2(56) null,
k_button5_url  varchar2(256) null,
k_button5_url2 varchar2(256) null,

k_at_send_type char(1),
k_ad_flag char(1),

k_attach varchar2(4000) null,
k_attach2 varchar2(2000) null

);

