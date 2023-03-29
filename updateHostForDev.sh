
sudo sh -c 'echo "127.0.0.1 sls-customer.netless.group" >> /etc/hosts'
dscacheutil -flushcache
cat /etc/hosts