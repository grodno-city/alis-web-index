//need to change processItems and run functions in alis-web-request module(from alis-web-request -dev )
//function processItems(options, callback) {
//   if (!options) {
//     return process.nextTick(callback, new Error('options is not provided'));
//   }
//
//   getPage({ url: options.url, jar: options.jar }, (err, body) => {
//     const $ = parsePage(body);
//     const items = getItems($);
//     const nextPageUrl = getNextPageUrl($);
//
//     callback(null, nextPageUrl, items);
//   });
// }
//
// function run(fn, q, options, callback) {
//   if (!q) {
//     return new Error('q is not provided');
//   }
//
//   if (q[0] === 'undefined') {
//     return;
//   }
//
//   fn({ url: `${options.alisEndpoint}/alis/EK/${q[0]}`, jar: options.jar }, (err, nextPageUrl, items) => {
//     if (err) {
//       return err;
//     }
//
//     const remainingQueue = q.slice(1);
//     if (q.length === 1) {
//       remainingQueue.push(`${nextPageUrl}`);
//     }
//
//     callback(null, items);
//     run(fn, remainingQueue, options, callback);
//   });
// }


//add this to alis-web-request module
// function returnPagesItems(options, pageNumber, total, callback){
//   if (!options) {
//     return process.nextTick(callback, new Error('provided is not provided'));
//   }
//   if (!pageNumber) {
//     return process.nextTick(callback, new Error('pageNumber is not provided'));
//   }
//   if (pageNumber>total/20) {
//     return process.nextTick(callback, new Error('page doesnt exist'));
//   }
//   processItems({ url: `${options.alisEndpoint}/alis/EK/do_other.php?frow=1&fcheck=1&ccheck=1&action=${pageNumber}&crow=1`, jar: options.jar}, (err, nextPageUrl, books) => {
//     if (err) {
//       return callback(err);
//     }
//     return callback(null,books, nextPageUrl);
//   });
// }


import elasticsearch from 'elasticsearch';
import Stream from 'stream';
import { sendInitialQuery, getNumberedPageUrls, run, processItems, parsePage, getTotal, returnPagesItems} from '@grodno-city/alis-web-request';

// var client = new elasticsearch.Client({
//   host: 'localhost:9200',
//   log: 'trace'
// });
// client.ping({
//   // ping usually has a 3000ms timeout
//   requestTimeout: 1000
// }, function (error) {
//   if (error) {
//     console.trace('elasticsearch cluster is down!');
//   } else {
//     console.log('All is well');
//   }
// });


const initParams = {
  year: 1960,
  alisEndpoint: 'http://86.57.174.45',
};

sendInitialQuery(initParams, (err, res) => {
  if (err) {
    return new Error(err);
  }
  console.log('in in send');
  const options = {
    alisEndpoint: initParams.alisEndpoint,
    jar: res.jar
  };
  const $ = parsePage(res.page);
  const firstNumberedPageUrls = getNumberedPageUrls($);
  let remainingQueue = firstNumberedPageUrls;
  let total = getTotal($);
  console.log('total', total);
  // run(processItems, remainingQueue, options, (err, items)=>{
  //   if (err) {
  //     return err;
  //   }
  //
  // });
  let pageNumber = 2;
  returnPagesItems(options, pageNumber, total, (err, items, nextPageUrl)=>{
    if(!err){
      remainingQueue.splice(pageNumber-1, 1);
      if (remainingQueue.length === 1) {
        remainingQueue.push(`${nextPageUrl}`);
      }
      indexItems(items);
      console.log('q : ', remainingQueue);

    }
    return err;
//do_other.php?frow=1&fcheck=1&ccheck=1&action=3&crow=1

});

});

function indexItems(books){
  console.log('books: ', books);
  //create index here
  // books.map((item)=>{
  //   client.index({
  //     index: 'book',
  //     type: 'temp',
  //     body:{
  //       'id':item.id,
  //       'title': item.title
  //     },
  //   }).then(function(body){console.log('body',body)})
  // })
}
