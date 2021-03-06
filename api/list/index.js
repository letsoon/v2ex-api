const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (params) => {
  return new Promise((resolve, reject) => {
  const {tab="all",cookie=""} = params;
    const tabList = ['all','hot','qna','city','deals','jobs','apple','play','creative','tech','r2','tabs','members']
    if(!tabList.includes(tab)){
      let result = {
        code: 0,
        msg: `${tab}-分类不存在`
      }
      resolve(result)
    }
    try {
      axios({
        url: `https://www.v2ex.com/?tab=${tab}`,
        method: 'get',
        timeout: 5000,
        headers: {
          "Host": "v2ex.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
          "Referer": "https://v2ex.com",
          "cookie": cookie
        }
      }).then(re => {
        if (re.status === 200 && re.data) {
          let html = cheerio.load(re.data);
          let data = []
          let messageNum = ''
          let isRedeem = false
          html('.cell.item', '#Main .box').each(function (i, elem) {
            let isTop = html(this).attr('style').match('background')
            isTop = isTop ? 'true' : 'false'
            let title = html(this).find('span.item_title').children('a').text();
            let tid = html(this).find('span.item_title').children('a').attr('href');
            let user = html(this).find('a.node').next('strong').children('a').text();
            let pic = html(this).find('img', 'a').attr('src');
            let replyNum = html(this).find('a.count_livid').text();
            let node = html(this).find('a.node').text();
            let go = html(this).find('a.node').attr('href').split('/')
            go = go[go.length - 1]
            let time = html(this).find('span.topic_info').text();

            tid = tid.replace(/\#reply\d+/, "");
            tid = tid.replace(/\/t\//g, "");


            // •  26 分钟前  •  最后回复来自 
            time = time.match(/(([\d]{1,3}\s[\u4e00-\u9fa5]{2,3}\s[\d]{1,3}\s[\u4e00-\u9fa5]{2,3}))|(\u521a\u521a)|(\u51e0\u79d2\u524d)|(\u7f6e\u9876)|([\d]{1,3}\s[\u4e00-\u9fa5]{2,3})/)[0];

            replyNum = replyNum ? replyNum : 0;

            data.push({
              title: title,
              tid: tid,
              user: user,
              pic: pic,
              replyNum: replyNum,
              node: node,
              go: go,
              isTop: isTop,
              time: time
            })
          })

          if(cookie){
            messageNum = html('.inner strong','#Rightbar .box').children().text() && html('.inner strong','#Rightbar .box').children().text().match(/\d+/)[0]
            isRedeem = html('.inner li.fa','#Rightbar .box').next().text() ? true : false
          }
          let result = {}
          result = {
            code: 200,
            data: data,
            isRedeem: isRedeem,
            messageNum: messageNum
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
        msg: error.message
      }
      resolve(result)
    }
  })
}

