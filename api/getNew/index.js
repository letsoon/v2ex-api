const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (event) => {
  return new Promise((resolve, reject) => {
    try {
      axios({
        url: 'https://www.v2ex.com/new',
        headers:{
          'referer': 'https://v2ex.com',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
          'cookie': event.cookie
        }
      }).then(res=>{
        if(res.status === 200){
          let html = cheerio.load(res.data, {
            decodeEntities: false
          });
          if (html("title").text().match(/^V2EX[\s\S]+登录$|^V2EX$/)) {
            let result = `{"code":4,"msg":"登录失效"}`;
            result = JSON.parse(result);
            resolve(result);
          }
          let hot = []
          let all = []
          html('input[name=content]').prev().find('a').each(function(){
            let title = html(this).text()
            let name = html(this).attr('href').match(/\'[\s\S]+\'/)[0].replace(/\'/g,'')
            hot.push({name:name,title:title})
          })
         let once = html('input[name=once]').attr('value')
         axios({
           url: 'https://www.v2ex.com/api/nodes/all.json',
           headers:{
            'referer': 'https://v2ex.com/new',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
            'cookie': event.cookie
          }
         }).then(r=>{
           console.log(r)
           if(r.status === 200){
            r.data.forEach(item=>{
              all.push({name:item.name,title:item.title})
            })
            let result = {
              code: 200,
              hot: hot,
              all: all,
              once: once
            }
            resolve(result)
           }else{
            let result = {
              code: r.status,
              msg: r.statusText
            }
           }
         }).catch(e=>{
          let result = {
            code: 0,
            msg: err.message
          }
          resolve(result)
         })
        }
      }).catch(err=>{
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