import elasticsearch from 'elasticsearch';
import bunyan from 'bunyan';
import whilst from 'async/whilst';
import { getRecordByID } from '@grodno-city/alis-web-request';
import fs from 'fs';
import { alisEndpoint, index, elasticHost, elasticPort, latestKnownId, allowedConsistentlyEmptyRange } from '../config';

const client = new elasticsearch.Client({
  host: `${elasticHost}:${elasticPort}`,
});

// TODO add logging
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/logging.html

const log = bunyan.createLogger({ name: 'index' });

const snapshot = './bin/.fetch-books-snapshot';
let nextId = 1;
let consistentlyEmptyIdCount = 0;
if (fs.existsSync(snapshot)) {
  log.info(`Found ${snapshot} snapshot file, using it to resume indexing.`);
  const lastFetchedId = Number(fs.readFileSync(snapshot, 'utf8'));
  nextId = lastFetchedId + 1;
} else {
  log.info(`Snapshot file ${snapshot} not found.`);
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
  log.info({ options }, 'fetchAndIndexRecord called');

  getRecordByID(options.alisEndpoint, options.id, (err, record) => {
    if (err) {
      if (err.message === 'Record not found') {
        return callback(null, false);
      }
      return callback(err);
    }
    // log.info({ record });
    indexRecord(record, callback);
  });
}
function start() {
  whilst(
    () => {
      log.info({
        consistentlyEmptyIdCount,
        allowedConsistentlyEmptyRange,
        nextId,
        latestKnownId,
      }, 'checking runner condition');
      return (consistentlyEmptyIdCount < allowedConsistentlyEmptyRange || nextId < latestKnownId);
    },
    (callback) => {
      fetchAndIndexRecord({ id: nextId, alisEndpoint }, (err, found) => {
        if (err) return callback(err);
        if (found) {
          consistentlyEmptyIdCount = 0;
        } else {
          consistentlyEmptyIdCount += 1;
        }
        fs.writeFileSync(snapshot, `${nextId}`);
        nextId += 1;
        return callback();
      });
    }, (err) => {
      log.info({ err }, 'whilst callback called');
      if (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
          log.warn({ err, nextId }, err.message);
          return setTimeout(start, 3000);
        }
        log.warn({ err, nextId }, err.message);
      }
  });
}
start();
