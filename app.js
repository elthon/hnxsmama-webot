var express = require('express');
var webot = require('weixin-robot');
var security = require('./security.js');

var debug = require('debug');
var log = debug('webot-example:log');
var verbose = debug('webot-example:verbose');
var error = debug('webot-example:error');

var request = require('request');

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


/**
 * 搜索百度
 *
 * @param  {String}   keyword 关键词
 * @param  {Function} cb            回调函数
 * @param  {Error}    cb.err        错误信息
 * @param  {String}   cb.result     查询结果
 */
var search = function(keyword, cb){
  log('searching: %s', keyword);
  var options = {
    url: 'http://www.baidu.com/s',
    qs: {
      wd: keyword
    }
  };
  request.get(options, function(err, res, body){
    if (err || !body){
      return cb(null, '现在暂时无法搜索，待会儿再来好吗？');
    }
    var regex = /<h3 class="t">\s*(<a.*?>.*?<\/a>).*?<\/h3>/gi;
    var links = [];
    var i = 1;

    while (true) {
      var m = regex.exec(body);
      if (!m || i > 5) break;
      links.push(i + '. ' + m[1]);
      i++;
    }

    var result;
    if (links.length) {
      result = '在百度搜索:' + keyword +',得到以下结果：\n' + links.join('\n');
      result = result.replace(/\s*data-click=".*?"/gi,  '');
      result = result.replace(/\s*onclick=".*?"/gi,  '');
      result = result.replace(/\s*target=".*?"/gi,  '');
      result = result.replace(/<em>(.*?)<\/em>/gi,  '$1');
      result = result.replace(/<font.*?>(.*?)<\/font>/gi,  '$1');
      result = result.replace(/<span.*?>(.*?)<\/span>/gi,  '$1');
    } else {
      result = '搜不到任何结果呢';
    }

    // result 会直接作为
    // robot.reply() 的返回值
    //
    // 如果返回的是一个数组：
    // result = [{
    //   pic: 'http://img.xxx....',
    //   url: 'http://....',
    //   title: '这个搜索结果是这样的',
    //   description: '哈哈哈哈哈....'
    // }];
    //
    // 则会生成图文列表
    return cb(null, result);
  });
};

  function do_search(info, next){
    // pattern的解析结果将放在param里
    var q = info.param[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return search(q , next);
  }

  // 可以通过回调返回结果
  webot.set('search', {
    description: '发送: s 关键词 ',
    pattern: /^(?:搜索?|search|百度|s\b)\s*(.+)/i,
    //handler也可以是异步的
    handler: do_search
  });

// 接管消息请求
webot.watch(app, { token: security.token , path: security.path });


// 如果你不想让 node 应用直接监听 80 端口
// 可以尝试用 nginx 或 apache 自己做一层 proxy
app.listen(security.port);
app.enable('trust proxy');