IP=$1
NAME="build.tar.gz"
pnpm run build
tar -zvcf $NAME ./build
DOWNLOAD_PATH="/home/sls_web"

scp ./$NAME root@$IP:$DOWNLOAD_PATH
ssh root@$IP "cd $DOWNLOAD_PATH && tar -zvxf $NAME && rm $NAME && nginx -s reload && exit"
rm $NAME