const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/*', function (req, res) {
  console.log(`${new Date().toLocaleDateString()} ${req.path}`)
  if(req.path === '/'){
    res.send('v2ex-api server is runing')
  }else{
    fs.readdirSync(path.join(__dirname, 'api'));
    const url = path.join(__dirname, `api${req.path}/index.js`)
    if(fs.existsSync(url)){
      res.set({
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Origin-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin-Headers': 'x-requested-with',
        'Access-Control-Max-Age': '1800',
      });
      const api = require(url);
      let params = {...req.query, ...req.body};
      api(params).then(resp=>{
          res.json(resp)
        })
    }else{
      res.status(404).send(`${req.path} not found`);
    }
  }
})

app.listen(port, () => {
  console.log(`v2ex-api server listening at http://localhost:${port}`)
})

