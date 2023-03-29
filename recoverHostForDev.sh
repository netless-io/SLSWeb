sudo sed -i "" "/127.0.0.1 sls-customer.netless.group/d" /etc/hosts
# sudo sed -i.bak '/^ *$/d' /etc/hosts
dscacheutil -flushcache
cat /etc/hosts