
import elasticsearch from 'elasticsearch';
import Stream from 'stream';
import { getRecordsByQuery} from '@grodno-city/alis-web-request';

let client = new elasticsearch.Client({
  host: 'localhost:9200',
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
