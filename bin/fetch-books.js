import elasticsearch from 'elasticsearch';
import bunyan from 'bunyan';
import whilst from 'async/whilst';
import { getRecordByID } from '@grodno-city/alis-web-request';
import fs from 'fs';
import { alisEndpoint, index, elasticHost, elasticPort } from '../config.json';

const client = new elasticsearch.Client({
  host: `${elasticHost}:${elasticPort}`,
});

const log = bunyan.createLogger({ name: 'index' });

const snapshot = './bin/.fetch-books-snapshot';
let id = 0;
let count = 0;
let consistentlyEmptyIdCount = 0;
if (fs.existsSync(snapshot)) {
  const args = fs.readFileSync(snapshot, 'utf8').split(' ');
  id = Number(args[0]) + 1;
  count = Number(args[1]);
}

function indexRecord(record, callback) {
  client.index({
    index,
    type: 'info',
    id: record.id,
    body: {
      record,
    },
  }, callback);
}

function fetchAndIndexRecord(options, callback) {
  getRecordByID(options.alisEndpoint, options.id, (err, record) => {
    if (err) {
      if (err.message === 'Record not found') {
        return callback(null, false);
      }
      return callback(err);
    }
    indexRecord(record, callback);
  });
}
whilst(
  () => consistentlyEmptyIdCount < 1000,
  (callback) => {
    fetchAndIndexRecord({ id, alisEndpoint }, (err, found) => {
      if (err) return callback(err);
      if (found) {
        consistentlyEmptyIdCount = 0;
        count += 1;
      } else {
        consistentlyEmptyIdCount += 1;
      }
      fs.writeFileSync(snapshot, `${id} ${count}`);
      id += 1;
      return callback();
    });
  }, (err) => {
    if (err) log.warn({ err, id }, err.message);
});
