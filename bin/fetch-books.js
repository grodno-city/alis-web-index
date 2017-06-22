import whilst from 'async/whilst';
import { getRecordByID } from '@grodno-city/alis-web-request';
import fs from 'fs';
import { log, alisEndpoint, index, client } from '../config';
import { collectRequestInfo } from '../index';

const snapshot = './bin/.fetch-books-snapshot';
let id=0, count=0;
try {
  let args = fs.readFileSync(snapshot, 'utf8').split(' ');
  id = Number(args[0]);
  count = Number(args[1]);
}
catch (err) {
  id = 0;
  count = 0;
}

let emptyId = 0;

function indexRecord(next) {
  getRecordByID(alisEndpoint, id, (err, record) => {
    if (err) {
      if (err.message === 'Record not found') {
        id += 1;
        emptyId += 1;
        fs.writeFileSync(snapshot, `${id} ${count}`);
        collectRequestInfo(id, alisEndpoint, err.message);
        return next();
      }
      collectRequestInfo(id, alisEndpoint, err.message);
      return next(err);
    }
    client.index({
      index,
      type: 'info',
      body: {
        record
      },
    }, (indexErr) => {
      if (indexErr) log.warn(indexErr.message);
    });
    id += 1;
    emptyId = 0;
    count += 1;
    fs.writeFileSync(snapshot, `${id} ${count}`);
    collectRequestInfo(id, alisEndpoint, 'OK');
    return next();
  });
}
whilst(() => {
  return emptyId < 1000;
}, indexRecord, (err) => {
  if (err) log.warn(err.message);
});
