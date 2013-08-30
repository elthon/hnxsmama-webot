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

webot.set({
  '/hi/i': 'Hello',
  '/who (are|r) (you|u)/i': 'I\'m a robot.'
});

webot.set('Blur match', {
  pattern: '是机器人',
  handler: '是的，我就是一名光荣的机器人'
});

// 当字符串 pattern 以 "=" 开头时，需要完全匹配
webot.set('Exact match', {
  pattern: '=a',
  handler: '只有回复「a」时才会看到本消息'
});


// 接管消息请求
webot.watch(app, { token: security.token , path: security.path });


// 如果你不想让 node 应用直接监听 80 端口
// 可以尝试用 nginx 或 apache 自己做一层 proxy
app.listen(security.port);
app.enable('trust proxy');