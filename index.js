
import elasticsearch from 'elasticsearch';
import Stream from 'stream';
import { sendInitialQuery, getNumberedPageUrls, run, processItems, parsePage} from '@grodno-city/alis-web-request';

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


const initParams = {
  year: 1960,
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
  let remainingQueue = firstNumberedPageUrls;
  processItems({ url: `${options.alisEndpoint}/alis/EK/${remainingQueue[0]}`, jar: options.jar}, (err, nextPageUrl, books) => {
    if (err) {
      return err;
    }
    remainingQueue = remainingQueue.slice(1);
    if (remainingQueue.length === 1) {
      remainingQueue.push(`${nextPageUrl}`);
    }
    console.log('q : ', remainingQueue);
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

  });

});
