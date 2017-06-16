import { indexRecordsByQuery } from './index';
import elasticsearch from 'elasticsearch';
import bunyan from 'bunyan';
import queryMap from '@grodno-city/alis-web-request/lib/queryMap';
import eachOfSeries from 'async/eachOfSeries';

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

let log = bunyan.createLogger({ name: 'consumer' });
let options={
  query: 2014,
  queryType: 'Год издания',
  recordType: 'Все',
  index: 'records',
  alisEndpoint: 'http://86.57.174.45',
}
let types = Object.keys(queryMap.recordType);
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
