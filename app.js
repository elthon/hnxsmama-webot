var express = require('express');
var webot = require('weixin-robot');
var security = require('./security.js');


var app = express();

// 指定回复消息
webot.set('hi', '你好');

webot.set('subscribe', {
  pattern: function(info) {
    return info.is('event') && info.param.event === 'subscribe';
  },
  handler: function(info) {
    return '欢迎订阅微信机器人';
  }
});

// 接管消息请求
webot.watch(app, { token: security.token , path: security.path });


// 启动 Web 服务
// 微信后台只允许 80 端口
app.listen(3000);

// 如果你不想让 node 应用直接监听 80 端口
// 可以尝试用 nginx 或 apache 自己做一层 proxy
app.listen(process.env.PORT);
app.enable('trust proxy');