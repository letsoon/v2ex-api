const fetch = require('node-fetch');
const axios = require('axios');
const querystring = require('querystring');

module.exports = (event) => {
  return new Promise((resolve, reject) => {

    console.log(event);
    let userInput = event.userInput;
    let passInput = event.passInput;
    let capInput = event.capInput;
    try {
      fetch("https://v2ex.com/signin", {
        method: "POST",
        body: querystring.stringify({
          [userInput]: event.user,
          [passInput]: event.pass,
          [capInput]: event.cap,
          once: event.once,
          next: "/"
        }),
        credentials: 'include',
        timeout: 10000,
        redirect: 'manual',
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'referer': 'https://v2ex.com/signin',
          'content-type': 'application/x-www-form-urlencoded',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
          'cookie': event.cookie
        }
      }).then(res => {
        
        if (res.status === 302) {
          if (res.headers.raw()['location'] && res.headers.raw()['location'].join() === 'https://v2ex.com/') {
            let setCookie = res.headers.raw()['set-cookie']
            setCookie = setCookie.map((entry) => {
              const parts = entry.split(';');
              const cookiePart = parts[0];
              return cookiePart;
            }).join(';');
            axios({
              method: 'GET',
              url: 'https://v2ex.com',
              headers: {
                'referer': 'https://v2ex.com',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
                'cookie': setCookie
              }
            }).then(r => {
              if (r.status === 200) {
               
                // let setCookie = r.headers['set-cookie'].join(';')
                let setCookie2 = r.headers['set-cookie']
                setCookie2 = setCookie2.map((entry) => {
                  const parts = entry.split(';');
                  const cookiePart = parts[0];
                  return cookiePart;
                }).join(';');
                let result = {
                  code: 200,
                  data: escape(setCookie2 + ';' + setCookie)
                };
                resolve(result);
              }
            })

          } else {
            let result = {
              code: 1,
              msg: "???????????? IP ???????????????????????????????????????????????????????????????????????????",
            };
            resolve(result);
          }
        }
        if (res.status === 200) {
          res.text().then(t => {
            if (t.indexOf("??????????????????") > 0) {
              let result = {
                code: 2,
                msg: "??????????????????",
              };
              resolve(result);
            } else if (t.indexOf("??????????????????????????????") > 0) {
              let result = {
                code: 3,
                msg: "??????????????????????????????",
              };
              resolve(result);
            } else {
              let result = {
                code: 0,
                msg: '????????????',
              };
              console.log(t)
              resolve(result);
            }
          })
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