// 云函数入口文件
const axios = require('axios')
const cheerio = require('cheerio')



// 云函数入口函数
module.exports = (event) => {

      return new Promise((resolve, reject) => {

          try {
            axios({
              url: `https://www.v2ex.com/my/nodes`,
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

                  html('#my-nodes a', '#Main').each(function (i, elem) {
                        let name = html(this).attr('href').split('/')
                        name = name[name.length - 1]
                        let pic = html(this).find('img').attr('src')
                        html(this).find('.fade.f12').children().remove()
                        let count = html(this).find('.fade.f12').text().trim()
                        html(this).children().children().remove()
                        let title = html(this).children().text().trim()
                        data.push({
                          name: name,
                          title: title,
                          pic: pic,
                          count: count
                        })

                      })

                    let result = {
                      code: 200,
                      data: data,
                    }
                    resolve(result)
                  }
                  else {
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
            }
            catch (error) {
              let result = {
                code: 0,
                msg: error
              }
              resolve(result)
            }
          })
      }