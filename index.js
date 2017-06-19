import { getRecordsByQuery, recordTypes } from '@grodno-city/alis-web-request';
import eachOfSeries from 'async/eachOfSeries';
import { log, client, alisEndpoint, index } from './config';
import indexSettings from './indexSettings.json';


export function indexRecordsByQuery(options, callback) {
  getRecordsByQuery(options, (err, memo) => {
    if (!err) {
      if (memo === undefined) {
        return callback(new Error('alis-web err'));
      }
      log.warn(memo.length, options.query, options.recordType);
      const body = [];
      memo.map((item) => {
        body.push({ index: { '_index': options.index, '_type': options.recordType, '_id': item.id}});
        body.push({ 'title': item.title, 'year': options.query });
      });
      client.bulk({ body }, (esErr) => {
        if(esErr) callback(esErr);
        else callback();
      });
    }
    else callback(err);
  });
}

export function indexByType(year, type, key, next) {
  const options = {
    query: year,
    queryType: 'Год издания',
    recordType: type,
    index,
    alisEndpoint,
  };

  indexRecordsByQuery(options, (err) => {
    if (err) {
      if (err.message === 'no match') {
        log.warn(type, err.message);
        return next();
      }
      return next(err);
    }
    return next();
  });
}

export function indexByYear(year) {
  const types = Object.keys(recordTypes);
  types.shift();

  eachOfSeries(types, indexByType.bind(null, year), (err) => {
    if (err) log.warn(err.message);
  });
}

export function createIndex(indexName, callback) {
  client.indices.create({
    index: indexName,
    settings: indexSettings,
  }, callback);
}

export function getDocument(id, type, callback) {
  client.get({
    index: 'records',
    type,
    id,
  }, callback);
}

export function indexItem(item, type, year) {
  client.index({
    index: 'records',
    id: item.id,
    type,
    body: {
      'title': item.title,
      'year': year,
    },
  }, (err) => {
    if (!err) {
      log.info({ id: item.id, status: 'done' });
      return;
    }
    log.warn({ id: item.id, status: 'none', err: err.message });
  });
}
