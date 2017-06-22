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
let emptyId = 0;

function save(record, next) {
  client.index({
    index,
    type: 'info',
    id: record.id,
    body: {
      record,
    },
  }, (indexErr) => {
    if (indexErr) return next(indexErr);
    id += 1;
    emptyId = 0;
    count += 1;
    fs.writeFileSync(snapshot, `${record.id} ${count}`);
    collectRequestInfo(id, alisEndpoint, 'OK');
    return next();
  });
}

function indexRecord(next) {
  getRecordByID(alisEndpoint, id, (err, record) => {
    if (err) {
      if (err.message === 'Record not found') {
        fs.writeFileSync(snapshot, `${id} ${count}`);
        id += 1;
        emptyId += 1;
        collectRequestInfo(id, alisEndpoint, err.message);
        return next();
      }
      collectRequestInfo(id, alisEndpoint, err.message);
      return next(err);
    }
    if(Object.keys(record).includes('')){
      record.empty = record[''];
      delete record[''];
    }
    save(record, next);
  });
}
whilst(() => {
  return emptyId < 1000;
}, indexRecord, (err) => {
  if (err) log.warn({ id }, err.message);
});
