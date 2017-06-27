
import elasticsearch from 'elasticsearch';
import bunyan from 'bunyan';
import indexSettings from '../indexSettings.json';
import { index, elasticHost, elasticPort } from '../config.json';

const client = new elasticsearch.Client({
  host: `${elasticHost}:${elasticPort}`,
});

const log = bunyan.createLogger({ name: 'index' });

function createIndex(indexName, callback) {
  client.indices.create({
    index: indexName,
    body: {
      settings: indexSettings,
    },
  }, callback);
}
createIndex(index, (err, result) => {
  if (err) log.warn({ err });
  else log.info({ result });
});
