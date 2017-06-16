import { getRecordsByQuery } from '@grodno-city/alis-web-request';
import bunyan from 'bunyan';

let log = bunyan.createLogger({ name: 'ids' });


export function indexRecordsByQuery(client, options, callback) {
  getRecordsByQuery(options, (err, memo)=>{
    if(!err) {
      if(memo == undefined){
        return callback(new Error('alis-web err'));
      }
      log.warn(memo.length, options.query, options.recordType);
      let body = [];
      memo.map((item)=>{
        body.push({ index: { '_index': options.index, '_type': options.recordType, '_id': item.id}});
        body.push({ 'title': item.title, 'year': options.query });
      });
      client.bulk({body: body}, (err, result)=>{
        if(err) callback(err);
        else callback();
      });
    }
    else callback(err);
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
