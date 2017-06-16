import { indexRecordsByQuery } from './index';
import elasticsearch from 'elasticsearch';
import bunyan from 'bunyan';
import { recordTypes } from '@grodno-city/alis-web-request';
import eachOfSeries from 'async/eachOfSeries';

const client = new elasticsearch.Client({
  host: 'localhost:9200',
});

let log = bunyan.createLogger({ name: 'consumer' });
let options={
  query: 2009,
  queryType: 'Год издания',
  recordType: 'Все',
  index: 'records',
  alisEndpoint: 'http://86.57.174.45',
}
let types = Object.keys(recordTypes);
types.shift();
function indexByType(value,key,callback){
  options.recordType = value;
  indexRecordsByQuery(client, options, (err)=>{
    if (!err) return callback();
    if(err.message=='no match') {
      log.warn(value, err.message)
      callback();
    }
    else callback(err);
  });
}

eachOfSeries(types, indexByType, (err)=>{
  if(err) log.warn(err.message);
})
