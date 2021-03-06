const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (event) => {
  return new Promise((resolve, reject) => {
    const { node, page=1, cookie="" } = event;
    if(!node){
      let result = {
        code: 0,
        msg: `node不能为空`
      }
      resolve(result);
    }
    try{
      axios({
        url: `https://www.v2ex.com/go/${node}?p=${page}`,
        headers:{
          "Host": "v2ex.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
          "Referer": "https://v2ex.com",
          "Cookie": event.cookie
        }
      }).then(res=>{
        if(res.status === 200){
          let html = cheerio.load(res.data, {
            decodeEntities: false
          });
          if (html("title").text().match(/^V2EX[\s\S]+登录$|^V2EX$/)) {
            let result = `{"code":4,"msg":"当前节点需登录后查看！"}`;
            result = JSON.parse(result);
            resolve(result);
          }
         
          let data = []
          let count = html('.node-header .topic-count strong').text()
          let nodeAvatar = html('.node_avatar img').attr('src')
          let nodeInfo = html('.node-header .intro').text()
          nodeInfo = nodeInfo.trim() ? nodeInfo.trim() : '暂无介绍'
          let pageCount = html('table').find('a.page_normal').last().text()

          html('#TopicsNode .cell').each(function(i){
            let pic = html(this).find('.avatar').attr('src')
            let title = html(this).find('.item_title').children().text()
            let tid = html(this).find('.item_title').children().attr('href').match(/\d+/)[0]
            let user = html(this).find('.topic_info').children().first().children().text()
            html(this).find('.topic_info').children().first().remove()
            html(this).find('.topic_info').children().last().remove()
            let time = html(this).find('.topic_info').text().match(/•[\s\S]+•/) && html(this).find('.topic_info').text().match(/•[\s\S]+•/)[0].replace(/•/g,'').trim()
            if(!time){
                time = html(this).find('.topic_info').text().match(/•[\s\S]+/) && html(this).find('.topic_info').text().match(/•[\s\S]+/)[0].replace(/•/g,'').trim()
            }
            let replyNum = html(this).find('a.count_orange').text();
            if(!replyNum){
              replyNum = html(this).find('a.count_livid').text();
            }
            replyNum = replyNum ? replyNum : 0
            data.push({
              tid: tid,
              title: title,
              user: user,
              pic: pic,
              time: time,
              replyNum: replyNum
            })
          })
          let result = {
            code: 200,
            count: count,
            nodeAvatar: nodeAvatar,
            nodeInfo: nodeInfo,
            pageCount:pageCount,
            data: data
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