const cheerio = require('cheerio');
const axios = require('axios');

module.exports = (event) => {

  return new Promise((resolve, reject) => {
    const { tid, page=1, cookie } = event;
    if(!tid){
      let result = {
        code: 0,
        msg: `tid不能为空`
      }
      resolve(result);
    }
    try {
      axios({
        method: "get",
        url: `https://www.v2ex.com/t/${tid}?p=${page}`,
        headers: {
          "Host": "v2ex.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
          "Referer": "https://v2ex.com",
          "Cookie": unescape(cookie)
        }
      }).then(function (res) {
        if (res.status == 200) {
          let html = cheerio.load(res.data, {
            decodeEntities: false
          });
          if (html("title").text().match(/^V2EX[\s\S]+登录$|^V2EX$/)) {
            let result = `{"code":4,"msg":"当前帖子需登录后查看！"}`;
            result = JSON.parse(result);
            resolve(result);
          }
          //标题
          let title = html('.header h1').text()

          //头像
          let pic = html('.fr img', '.header').attr('src')

          //用户
          let user = html('.fr a', '.header').attr('href').split('/')
          user = user[user.length - 1]

          //节点
          let node = html('.header h1').prev().prev().text()

          //节点name
          let go = html('.header h1').prev().prev().attr('href').split('/')
          go = go[go.length - 1]

          // 发帖时间
          let time = html('.header small.gray').text();
          time = time.match(/\s+\d+[\s\S]+前\s+/) && time.match(/\s+\d+[\s\S]+前\s+/)[0].trim();

          // 帖子内容
          let content = html('div.topic_content').html();
          if (content != null) {
            content = escape(content);
          } else {
            content = "";
          }

          // 附言
          let subtle = [];
          html(".subtle").each(function (i) {
            let subcontent = html(this).html();
            if (subcontent) {
              subtle.push(escape(subcontent));
            }
          })

          //once
          let once = html("input[name=once]").attr("value");

          // 评论数量
          let replyNum = html('.fr','.box .cell').next().text();
          replyNum = replyNum.match(/\d{1,4}/) ? replyNum.match(/\d{1,4}/)[0] : 0;

          // 评论
          let replys = [];
          html("table", "#Main .cell").each(function (i) {
            if (html(this).parent().attr("id")) {
              let id = html(this).parent().attr("id").replace("r_", "")
              let user = html(this).find("a.dark").text();
              let pic = html(this).find("img.avatar").attr("src");
              let time = html(this).find("span.ago").text();
              let like = html(this).find(".small.fade").text();
              let reply_content = html(this).find(".reply_content").html();
              replys.push({
                id: id,
                user: user,
                pic: pic,
                time: time,
                like: like.trim(),
                content: escape(reply_content)
              })
            }
          })
          let result = {
            code: res.status,
            data: {
              user: user,
              pic: pic,
              node: node,
              go: go,
              time: time,
              title: title,
              content: content,
              subtle: subtle,
              replyNum: replyNum,
              once: once,
              reply: replys
            }
          }
          resolve(result);

        } else {
          let result = `{"code":${res.status},"msg":"${res.statusText}"}`;
          result = JSON.parse(result);
          resolve(result);
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