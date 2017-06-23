import whilst from 'async/whilst';
import { getRecordByID } from '@grodno-city/alis-web-request';
import fs from 'fs';
import { log, alisEndpoint, index, client } from '../config';
import { collectRequestInfo } from '../index';

const snapshot = './bin/.fetch-books-snapshot';
let id = 0;
let count = 0;
try {
  const args = fs.readFileSync(snapshot, 'utf8').split(' ');
  id = Number(args[0]) + 1;
  count = Number(args[1]);
}
catch (err) {
  id = 0;
  count = 0;
}
let consistentlyEmptyIdCount = 0;

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

function fix(record) {
  for (let key in record) {
    if (typeof record[key] === 'object') {
      for( let k in record[key]) {
        if (k.endsWith(' .')) {
          const newKey = k.slice(0, k.length - 2);
          record[key][newKey] = record[key][k];
          delete record[key][k];
        }
      }
    }
  }
  if(Object.keys(record).includes('')){
    record.empty = record[''];
    delete record[''];
  }
  return record;
}

function FetchAndIndexRecord(options, callback) {
  getRecordByID(options.alisEndpoint, options.id, (err, record) => {
    if (err) {
      if (err.message === 'Record not found') {
        return callback(null, false);
      }
      return callback(err);
    }
    record = fix(record);
    indexRecord(record, callback);
  });
}
whilst(
  () => consistentlyEmptyIdCount < 1000,
  (callback) => {
    FetchAndIndexRecord({ id, alisEndpoint }, (err, found) => {
      if (err) return callback(err);
      if (!found) {
        fs.writeFileSync(snapshot, `${id} ${count}`);
        id += 1;
        consistentlyEmptyIdCount += 1;
        return callback();
      }
      consistentlyEmptyIdCount = 0;
      count += 1;
      fs.writeFileSync(snapshot, `${id} ${count}`);
      id += 1;
      return callback();
    });
  }, (err) => {
    if (err) log.warn({ id }, err.message);
});
