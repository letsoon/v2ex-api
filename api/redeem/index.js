// 云函数入口文件
const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')
const axios = require('axios')
const cheerio = require('cheerio')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return new Promise((resolve, reject) => {

    try {
      axios({
        method: 'GET',
        url: 'https://v2ex.com/mission/daily',
        headers: {
          'referer': 'https://v2ex.com',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
          'cookie': event.cookie
        }
      }).then(r => {r
        if (r.status === 200) {
          let html = cheerio.load(r.data, {
            decodeEntities: false
          });
 
          let once = html('input[type="button"]', '#Main .cell').attr('onclick').match(/\d+/) && html('input[type="button"]', '#Main .cell').attr('onclick').match(/\d+/)[0]
          if (once) {
            fetch(`https://v2ex.com/mission/daily/redeem?once=${once}`, {
              method: "GET",
              credentials: 'include',
              timeout: 10000,
              redirect: 'manual',
              headers: {
                'referer': 'https://v2ex.com/mission/daily',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
                'cookie': event.cookie
              }
            }).then(res => {
              console.log(res.status, res.headers.raw()['location'])
              console.log(res)
              if (res.status === 302) {
                if (res.headers.raw()['location'] && res.headers.raw()['location'].join() === 'https://v2ex.com/mission/daily') {
                  let result = {
                    code: 200,
                    msg: "领取成功"
                  };
                  resolve(result);
                } else {
                  let result = {
                    code: 4,
                    msg: "凭证失效，请重新登录",
                  };
                  resolve(result);
                }
              }else{
                let result = {
                  code: 0,
                  msg: '未知错误'
                };
                resolve(result)
              }

            }).catch(function (err) {
              let result = {
                code: 0,
                msg: err.message
              }
              resolve(result)
            })
          }else{
            let result = {
              code: 1,
              msg: "您已经领取过今日奖励了"
            };
            resolve(result)
          }
        }
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