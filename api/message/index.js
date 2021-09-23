// 云函数入口文件
const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (event) => {
  return new Promise((resolve, reject) => {
    
    try{
      axios({
        url: `https://www.v2ex.com/notifications?p=${event.page}`,
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
          if (html("title").text().match(/^V2EX[\s\S]+登录$|^V2EX$/)) {
            let result = {code:4, msg:"登录失效"}
            resolve(result)
          }
          let data = []
          let pageCount = 1
          html('.cell','#notifications').each(function(i){
            let user = html(this).find('a').first().attr('href').split('/')
            user = user[user.length - 1]
            let pic = html(this).find('a').first().children().attr('src')
            let title = html(this).find('.fade').children().last().text()
            let tid = html(this).find('.fade').children().last().attr('href').match(/\d+/)[0]
            let time = html(this).find('span.snow').text()
            let content = html(this).find('.payload').html()
            html(this).find('.fade').children().remove()
            let type = html(this).find('.fade').text().match(/感谢|提到|收藏/) && html(this).find('.fade').text().match(/感谢|提到|收藏/)[0]
            let typeList = ['回复了你发布的主题','感谢了你发布的主题','提到了你','收藏了你发布的主题']
            if(content){
              typeList[1] = '感谢了你的评论' 
            }
            let typeNum = 0
            if(type && type === '感谢'){
              typeNum = 1
            }
            if(type && type === '提到'){
              typeNum = 2
            }
            if(type && type === '收藏'){
              typeNum = 3
            }
            data.push({
              user: user,
              pic: pic,
              title: title,
              time: time,
              content: content,
              tid: tid,
              type: typeList[typeNum],
              typeNum: typeNum
            })
            
          })
          pageCount = html('.header', '#Main .box').next().find('a').last().text() && html('.header', '#Main .box').next().find('a').last().text()
          if(data.length === 0){
            let result = {
              code: 0,
              data: '未查询到消息'
            }
            resolve(result)
          }else{
            let result = {
              code: 200,
              data: data,
              pageCount: pageCount
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