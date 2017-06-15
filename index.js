
import elasticsearch from 'elasticsearch';
import { getRecordsByQuery } from '@grodno-city/alis-web-request';
import

const client = new elasticsearch.Client({
  host: 'localhost:9200',
});
client.ping({ requestTimeout: 1000 }, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});
function indexRecordsByQuery(options) {
  getRecordsByQuery(options, (err, memo)=>{
    if(!err) {
      memo.map((item)=>{
        indexItem(item, 'Все', year);
      })
    }
  });
}

function getDocument(id, type, callback){
  client.get({
    index: 'records',
    type: type,
    id: id
  }, callback);
}

function indexItem(item, type, year){
  client.index({
    index: 'records',
    id:item.id,
    type: type,
    body:{
      'title': item.title,
      'year': year,
    }
  }, (err, response) => {
    if (err) throw err;
  })
}
