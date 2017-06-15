import { indexRecordsByQuery, getDocument } from './index';
import bunyan from 'bunyan';

let log = bunyan.createLogger({ name: 'consumer' });

const options={
  query: 2016,
  queryType: 'Год издания',
  recordType: 'Все',
  alisEndpoint: 'http://86.57.174.45',
}
indexRecordsByQuery(options);
