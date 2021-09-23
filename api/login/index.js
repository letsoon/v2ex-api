const axios = require('axios');
const cheerio = require('cheerio');

module.exports = () => {
  return new Promise((resolve, reject) => {
    try{
    axios({
      "url": "https://v2ex.com/signin",
      "method": "Get",
      "timeout": 5000,
      "headers": {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
        "Referer": "https://v2ex.com/signin",
        "Host": "v2ex.com",
      }
    }).then(function (res) {
      if (res.status === 200) {
        let html = cheerio.load(res.data);
        let cookie = escape(res.headers["set-cookie"].join(";"));
        // let cookie = res.headers["set-cookie"];

        //存储inputname
        let input = [];

        html(".sl", "form").each(function (i) {
          let inputName = html(this).attr("name");
          input.push(inputName);
        })

        let once = html("input[name=once]").attr("value");

        let result = `{"code":${res.status},"data":{
          "cookie":"${cookie}",
          "userInput":"${input[0]}",
          "passInput":"${input[1]}",
          "capInput":"${input[2]}",
          "once":"${once}"
        }}`;
        resolve(JSON.parse(result));
      }else{
        let result = `{"code":${res.status},"msg":"${res.statusText}"}`;
          result = JSON.parse(result);
          resolve(result);
      }
    }).catch(function (err) {
      let result = {
        code: 0,
        msg: err.message
      }
      resolve(result)
    })
  }catch(error){
    let result = {
      code: 0,
      msg: error
    }
    resolve(result)
  }



  })

}