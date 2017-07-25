import elasticsearch from 'elasticsearch';
import { index, elasticHost, elasticPort } from './config.json';

const client = new elasticsearch.Client({
  host: `${elasticHost}:${elasticPort}`,
});

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

process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    if (chunk[0] !== 10) {
      const data = JSON.parse(chunk);
      if (data.msg === 'OK') {
        // console.log(data.record);
        indexRecord(data.record, () => {});
      }
    } else  console.log(chunk[0]);
  }
});

process.stdin.on('end', () => {
  process.stdout.write('end');
});
