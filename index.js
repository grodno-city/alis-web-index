// var elasticsearch = require('elasticsearch');
// var express = require('express');
import elasticsearch from 'elasticsearch';
import Stream from 'stream';
import { sendInitialQuery, getNumberedPageUrls, run, processItems, parsePage, ReadableStreamItems } from '@grodno-city/alis-web-request';

const WritableStreamItems = new Stream.Writable({ objectMode: true });

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

ReadableStreamItems.pipe(WritableStreamItems);

const initParams = {
  year: 2017,
  alisEndpoint: 'http://86.57.174.45',
};

sendInitialQuery(initParams, (err, res) => {
  if (err) {
    return new Error(err);
  }

  const options = {
    alisEndpoint: initParams.alisEndpoint,
    jar: res.jar,
  };
  const $ = parsePage(res.page);
  const firstNumberedPageUrls = getNumberedPageUrls($);

  run(processItems, firstNumberedPageUrls, options);
});

const items = [];

WritableStreamItems._write = (item, encoding, done) => {
  items.push(item);
  client.index({
    index: 'book',
    type:'sometype',
    body:{
      'id':item.id,
      'title': item.title
    },
  }).then(function(body){console.log('body',body)})


  done();

};

//
//  client.search({
//   index: 'book',
//   type:'detective',
//   body: {
//     query: {
//       match: {
//         title: 'rabbit'
//       }
//     }
//   }
// }).then(function(body){console.log(body); console.log(body.hits.hits)})
