const fetch = require('node-fetch')

module.exports = (event) =>  {
  return new Promise((resolve, reject) => {
    const { id, once, tid, cookie} = event;
    if(!id || !once || !tid || !cookie) {
      resolve({code: 0, msg: '缺少参数'});
    }
  try{
  // https://www.v2ex.com/thank/reply/9248428?once=54867
  fetch(`https://www.v2ex.com/thank/reply/${id}?once=${once}`, {
        method: "POST",
        credentials: 'include',
        timeout: 10000,
        redirect: 'manual',
        headers: {
          'origin': 'https://www.v2ex.com',
          'referer': `https://v2ex.com/t/${tid}`,
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
          'cookie': unescape(cookie)
        }
      }).then(res => {
        if (res.status === 200) {
          let result = {
            code: 200,
            msg: "感谢成功"
          };
          resolve(result);
        }else{
          let result = {
            code: 0,
            msg: res.status +' '+res.statusText
          };
          resolve(result);
        }
       

      }).catch(function (err) {
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