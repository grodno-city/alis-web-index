import whilst from 'async/whilst';
import { recordTypes } from '@grodno-city/alis-web-request';
import fs from 'fs';
import { log, alisEndpoint, index } from '../config';
import { indexRecordsByQuery, collectRequestInfo } from '../index';

const snapshot = './bin/.fetch-books-snapshot';
let year;
try {
  year = fs.readFileSync(snapshot, 'utf8').substr(0, 4);
}
catch (err) {
  year = (new Date()).getFullYear();
}

let emptyYear = 0;

function indexYear(next) {
  const options = {
    query: year,
    queryType: 'Год издания',
    recordType: Object.keys(recordTypes)[1],
    index,
    alisEndpoint,
  };
  indexRecordsByQuery(options, (err, all) => {
    log.info(year, all);
    if (err) {
      if (err.message === 'no match') {
        year -= 1;
        emptyYear += 1;
        fs.writeFileSync(snapshot, year);
        collectRequestInfo(options, 'OK');
        return next();
      }
      collectRequestInfo(options, err.message);
      return next(err);
    }
    year -= 1;
    emptyYear = 0;
    fs.writeFileSync(snapshot, year);
    collectRequestInfo(options, 'OK');
    return next();
  });
}
whilst(() => {
  return emptyYear < 10;
}, indexYear, (err) => {
  if (err) log.warn(err.message);
});
