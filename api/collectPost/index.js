// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const cheerio = require('cheerio')

cloud.init()



// 云函数入口函数
exports.main = async (event, context) => {

  return new Promise((resolve, reject) => {

    try {
      axios({
        url: `https://www.v2ex.com/my/topics?p=${event.page}`,
        method: 'get',
        timeout: 5000,
        headers: {
          "Host": "v2ex.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
          "Referer": "https://v2ex.com",
          "cookie": event.cookie
        }
      }).then(re => {
        console.log(re)
        if (re.status === 200 && re.data) {
          let html = cheerio.load(re.data);
          let data = []
          let pageCount = html('.header').next().find('a.page_normal').last().text()

          html('.cell.item', '#Main .box').each(function (i, elem) {
            let title = html(this).find('span.item_title').children('a').text();
            let tid = html(this).find('span.item_title').children('a').attr('href');
            let user = html(this).find('a.node').next('strong').children('a').text();
            let pic = html(this).find('img', 'a').attr('src');
            let replyNum = html(this).find('a.count_orange').text();
            if (!replyNum) {
              replyNum = html(this).find('a.count_livid').text();
            }

            let node = html(this).find('a.node').text();
            let go = html(this).find('a.node').attr('href').split('/')
            go = go[go.length - 1]
            tid = tid.replace(/\#reply\d+/, "");
            tid = tid.replace(/\/t\//g, "");

            html(this).find('.topic_info').children().remove()
            let time = html(this).find('.topic_info').text().match(/\s[\s\S]+前/) && html(this).find('.topic_info').text().match(/\s[\s\S]+前/)[0].replace(/\•/g, '').trim()
            if (!time) {
              time = html(this).find('.topic_info').text().match(/\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\s/) && html(this).find('.topic_info').text().match(/\d+\-\d+\-\d+\s+\d+\:\d+\:\d+\s/)[0].replace(/•/g, '').trim()
            }
            replyNum = replyNum ? replyNum : 0
            data.push({
              title: title,
              tid: tid,
              user: user,
              pic: pic,
              replyNum: replyNum,
              node: node,
              go: go,
              time: time
            })

          })

          let result = {
            code: 200,
            data: data,
            pageCount: pageCount
          }
          resolve(result)
        } else {
          let result = {
            code: re.status,
            msg: re.statusText
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
    } catch (error) {
      let result = {
        code: 0,
        msg: error
      }
      resolve(result)
    }
  })
}