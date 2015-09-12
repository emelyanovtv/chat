set -e

export PATH="/brew/bin:$PATH"
export MANPATH="/brew/share/man:$MANPATH"
export INFOPATH="/brew/share/info:$INFOPATH"
cd /vjs/chat/server &&
npm install &&
cd /vjs/chat/web &&
npm install &&
cd /vjs/chat/web &&
rm -rf build &&
gulp build &&
ps -ax | grep 'node app.js\|node server.js' | grep -v grep | awk '{print $1}' | xargs kill -9 &&
cd /vjs/chat/server && node app.js