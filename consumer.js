import { indexRecordsByQuery } from './index';
import bunyan from 'bunyan';
import queryMap from '@grodno-city/alis-web-request/lib/queryMap';
import eachOfSeries from 'async/eachOfSeries';

let log = bunyan.createLogger({ name: 'consumer' });
let options={
  query: 2016,
  queryType: 'Год издания',
  recordType: 'Все',
  alisEndpoint: 'http://86.57.174.45',
}
let types = Object.keys(queryMap.recordType);
types.shift();
function indexByType(value,key,callback){
  options.recordType = value;
  indexRecordsByQuery(options, (err)=>{
    if (!err) return callback();
    if(err.message=='no match') {
      log.warn(value, err.message)
      callback();
    }
    else callback(err);
  });
}

eachOfSeries(types, indexByType, (err)=>{
  if(err) log.warn(err);
})
