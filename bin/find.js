import elasticsearch from 'elasticsearch';
import bunyan from 'bunyan';
import whilst from 'async/whilst';
import { getRecordByID } from '@grodno-city/alis-web-request';
import fs from 'fs';
import request from 'request';
import { alisEndpoint, index, elasticHost, elasticPort, lastExpectedId, mustConsistentlyEmpty } from '../config.json';

const client = new elasticsearch.Client({
  host: `${elasticHost}:${elasticPort}`,
});

const log = bunyan.createLogger({ name: 'index' });

const snapshot = './bin/.fetch-books-snapshot';
let nextId = 1;
let consistentlyEmptyIdCount = 0;
if (fs.existsSync(snapshot)) {
  const lastFetchedId = Number(fs.readFileSync(snapshot, 'utf8'));
  nextId = lastFetchedId + 1;
}

function fetchAndIndexRecord(options, callback) {
  const firstPageUrl = `/alis/EK/do_view.php?id=${options.id}`;
  const INITIAL_URL = `${alisEndpoint}${firstPageUrl}`;
  request({ url: INITIAL_URL }, (err, response, body) => {
    if (err) {
      return callback(err);
    }
    if (body.match('Undefined variable')) return callback(null, false);
    if (body.match('Входит') || body.match('Включено') || body.match('Относится')) {
      const id = options.id;
      log.info({ id });
    }
    callback(null, true);
  });
}
function start() {
  whilst(
    () => (consistentlyEmptyIdCount < mustConsistentlyEmpty && nextId < lastExpectedId),
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
