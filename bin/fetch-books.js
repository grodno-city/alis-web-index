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
let nextId = 1;
let count = 0;
let consistentlyEmptyIdCount = 0;
if (fs.existsSync(snapshot)) {
  let lastFetchedId = 0;
  [lastFetchedId, count] = fs.readFileSync(snapshot, 'utf8').split(' ').map((el) => {
    return Number(el);
  });
  nextId = lastFetchedId + 1;
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
    log.info({ record });
    indexRecord(record, callback);
  });
}
whilst(
  () => consistentlyEmptyIdCount < 1000,
  (callback) => {
    fetchAndIndexRecord({ id: nextId, alisEndpoint }, (err, found) => {
      if (err) return callback(err);
      if (found) {
        consistentlyEmptyIdCount = 0;
        count += 1;
      } else {
        consistentlyEmptyIdCount += 1;
      }
      fs.writeFileSync(snapshot, `${nextId} ${count}`);
      nextId += 1;
      return callback();
    });
  }, (err) => {
    if (err) log.warn({ err, nextId }, err.message);
});
