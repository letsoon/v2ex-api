const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (event) => {
  return new Promise((resolve, reject) => {
    
    try{
      let is = event.isFollow ? 'unfollow' : 'follow'
      axios({
        url: `https://www.v2ex.com/${is}/${event.uid}?once=${event.once}`,
        headers:{
          "Host": "v2ex.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
          "Referer": `https://www.v2ex.com/member/${event.member}`,
          "cookie": event.cookie
        }
      }).then(res=>{
        console.log(res)
        if(res.status === 200){
          let html = cheerio.load(res.data, {
            decodeEntities: false
          });
          if (html("title").text().match(/^V2EX[\s\S]+登录$|^V2EX$/)) {
            let result = {code:4, msg:"登录失效"}
            resolve(result)
          }
          let once = ''
          let token = ''
          let isFollow = false
          let isBlock = false
          if(event.cookie){
            once = html('.cell .fr input', '#Main .box').first().attr('onclick')
            isFollow = once.match(/unfollow/) ? true : false
            once = once && once.match(/once=(\d)+/)
            once = once && once[0].match(/\d+/)
            once = once && once[0]
            token = html('.cell .fr input', '#Main .box').last().attr('onclick')
            isBlock = token.match(/unblock/) ? true : false
            token = token && token.match(/t=(\d)+/)
            token = token && token[0].match(/\d+/)
            token = token && token[0]
          }
          if(event.isFollow === !isFollow){
            let result = {
              code: 200,
              once: once,
              token: token,
              isFollow: isFollow,
              isBlock: isBlock,
            }
            resolve(result)
          }else{
            let result = {
              code: 0,
              msg: '操作失败'
            }
            resolve(result)
          }

        }else{
          let result = {
            code: res.status,
            msg: res.statusText
          }
          resolve(result)
        }
      }).catch(err => {
        let result = {
          code: 0,
          msg: err.message
        }
        resolve(result)
      })
    }catch(error){
      let result = {
        code: 0,
        msg: error.message
      }
      resolve(result)
    }
  })
}