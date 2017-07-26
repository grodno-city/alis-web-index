import bunyan from 'bunyan';
import whilst from 'async/whilst';
import { getRecordByID } from '@grodno-city/alis-web-request';
import fs from 'fs';
import { alisEndpoint, latestKnownId, allowedConsistentlyEmptyRange } from '../config.json';

const log = bunyan.createLogger({ name: 'index' });

function fetchAndIndexRecord(options, callback) {
  getRecordByID(options.alisEndpoint, options.id, (err, record) => {
    if (err) {
      if (err.message === 'Record not found') {
        log.warn('Record not found');
        return callback(null, false);
      }
      return callback(err);
    }
    log.info({ record }, 'OK');
    return callback();
  });
}

export default function start({ nextId, snapshot }) {
  let consistentlyEmptyIdCount = 0;

  whilst(
    () => (consistentlyEmptyIdCount < allowedConsistentlyEmptyRange || nextId < latestKnownId),
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
