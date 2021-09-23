const fetch = require('node-fetch');
const querystring = require('querystring');

module.exports = (event) => {
  
  return new Promise((resolve, reject) => {

    try {
      let userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36'
      if(event.model.match(/Android/i)){
        userAgent = 'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Mobile Safari/537.36'
      }
      if(event.model.match(/iOS/i)){
        userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
      }
      fetch(`https://v2ex.com/t/${event.tid}`, {
        method: "POST",
        body: querystring.stringify({
          content: event.content,
          once: event.once
        }),
        credentials: 'include',
        timeout: 10000,
        redirect: 'manual',
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'content-type': 'application/x-www-form-urlencoded',
          'origin': 'https://www.v2ex.com',
          'referer': `https://v2ex.com/t/${event.tid}`,
          'user-agent': userAgent,
          'cookie': event.cookie
        }
      }).then(res => {
        console.log(res.status, res.headers.raw()['location'])
        console.log(res)
        if (res.status === 403) {
          let result = {
            code: 4,
            msg: "登录失效",
          };
          resolve(result);
        }

        if (res.status === 200) {
          let result = {
            code: 0,
            msg: "评论失败"
          };
          resolve(result);
        }
        if (res.status === 302) {
          if (res.headers.raw()['location'] && res.headers.raw()['location'].join().match(`https://v2ex.com/t/${event.tid}`)) {
            let result = {
              code: 200,
              msg: "评论成功"
            };
            resolve(result);
          } else {
            let result = {
              code: 0,
              msg: "未知错误",
            };
            resolve(result);
          }
        }

      }).catch(function (err) {
        let result = {
          code: 0,
          msg: err.message
        }
        resolve(result)
      })

    } catch (error) {
      let result = {
        code: 0,
        msg: error
      }
      resolve(result)
    }


  })
}