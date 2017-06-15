import { indexRecordsByQuery, getDocument } from './index';
import bunyan from 'bunyan';

let log = bunyan.createLogger({ name: 'consumer' });

const options={
  query: 2017,
  queryType: 'Год издания',
  recordType: 'Все',
  alisEndpoint: 'http://86.57.174.45',
}
indexRecordsByQuery(options);
getDocument('H87734391', 'Все', (err, response)=>{
  if(!err){
    log.info(response);
  }
  else {
    log.warn(err.message);
  }
});
