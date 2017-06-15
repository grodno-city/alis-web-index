
import elasticsearch from 'elasticsearch';
import { getRecordsByQuery } from '@grodno-city/alis-web-request';
import bunyan from 'bunyan';

let log = bunyan.createLogger({ name: 'ids' });

const client = new elasticsearch.Client({
  host: 'localhost:9200',
});
client.ping({ requestTimeout: 1000 }, function (error) {
  if (error) {
    log.warn('elasticsearch cluster is down!');
  } else {
    log.info('elasticsearch cluster is up');
  }
});

export function indexRecordsByQuery(options) {
  getRecordsByQuery(options, (err, memo)=>{
    if(!err) {
      let all = memo.length;
      log.info({ all });
      let body = [];
      memo.map((item)=>{
        body.push({ index: { '_index':'records', '_type': options.recordType, '_id': item.id}});
        body.push({ 'title': item.title, 'year': options.query });
      });
      client.bulk({body: body}, (err, result)=>{
        if(err) log.warn(err);
      });
    }
  });
}

export function getDocument(id, type, callback){
  client.get({
    index: 'records',
    type: type,
    id: id
  }, callback);
}

export function indexItem(item, type, year){
  client.index({
    index: 'records',
    id:item.id,
    type: type,
    body:{
      'title': item.title,
      'year': year,
    }
  }, (err, response) => {
    if (!err) {
      log.info({ id: item.id, status: 'done' });
      return;
    }
    log.warn({ id: item.id, status: 'none' , err: err.message});
  })
}
