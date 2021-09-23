// 云函数入口文件
const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (event) => {
  return new Promise((resolve, reject) => {
    
    try{
      axios({
        url: `https://www.v2ex.com/member/${event.member}`,
        headers:{
          "Host": "v2ex.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
          "Referer": "https://v2ex.com",
          "cookie": event.cookie
        }
      }).then(res=>{
        console.log(res)
        if(res.status === 200){
          let html = cheerio.load(res.data, {
            decodeEntities: false
          });
         
          let posts = []
          let user = event.member
          let pic = html('.cell img.avatar', '#Main .box').attr('src')
          let detail = html('.cell span.gray', '#Main .box').text()
          let uid = detail.match(/\s+\d+\s+/)[0].trim()
          let time = detail.match(/\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\s/)[0]
          let once = ''
          let token = ''
          let isFollow = false
          let isBlock = false
          if(event.cookie){
            once = html('.cell .fr input', '#Main .box').first().attr('onclick')
            isFollow = once && (once.match(/unfollow/) ? true : false)
            once = once && once.match(/once=(\d)+/)
            once = once && once[0].match(/\d+/)
            once = once && once[0]
            token = html('.cell .fr input', '#Main .box').last().attr('onclick')
            isBlock = token && (token.match(/unblock/) ? true : false)
            token = token && token.match(/t=(\d)+/)
            token = token && token[0].match(/\d+/)
            token = token && token[0]
          }

          // console.log(user,pic,uid,time)

          html('.cell.item','#Main .box').each(function(i){
            let title = html(this).find('span.item_title').children().text()
            let tid = html(this).find('span.item_title').children().attr('href').match(/\d+/)[0]
            let node = html(this).find('.topic_info a.node').text()
            let go = html(this).find('.topic_info a.node').attr('href').split('/')
            go = go[go.length - 1]
            html(this).find('.topic_info').children().remove()
            let time = html(this).find('.topic_info').text().match(/\s[\s\S]+前/) && html(this).find('.topic_info').text().match(/\s[\s\S]+前/)[0].replace(/\•/g,'').trim()
            if(!time){
                time = html(this).find('.topic_info').text().match(/\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\s/) && html(this).find('.topic_info').text().match(/\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\s/)[0].replace(/•/g,'').trim()
            }
            let replyNum = html(this).find('.count_livid').text()
            replyNum = replyNum ? replyNum : 0
            // console.log(title,tid,node,go,time)

            posts.push({
              title: title,
              tid: tid,
              node: node,
              go: go,
              time: time,
              replyNum: replyNum
            })
          })
          let isHidden = false
          if(html('.inner span.gray').text().match('隐藏')){
            isHidden = true
          }
          let result = {
            code: 200,
            user: user,
            pic: pic,
            uid: uid,
            time: time,
            once: once,
            token: token,
            isHidden: isHidden,
            isFollow: isFollow,
            isBlock: isBlock,
            posts: posts
          }
          resolve(result)
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