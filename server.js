var express = require('express');
var app = express();
var path = require('path');
const btoa = require('btoa')
const fetch = require('node-fetch')
const request = require('request');
const { response } = require('express');

app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.json({limit: '1mb'}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next()
});

app.get('/netio', (req, res) => {
  return fetch('http://192.168.40.120/netio.json', {
    credentials: 'include',
    method: 'GET',
    headers: { 'Authorization': 'Basic ' + btoa(`${'netio'}:${'netio'}`)}
  }).then(response => response.json()).then(data => res.json(data))
})



app.listen(3005, ()=>{console.log('Open port 3005')});