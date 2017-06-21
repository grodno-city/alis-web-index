import elasticsearch from 'elasticsearch';
import bunyan from 'bunyan';

export const client = new elasticsearch.Client({
  host: 'localhost:9200',
});

export const log = bunyan.createLogger({ name: 'index' });

export const alisEndpoint = 'http://86.57.174.45';
export const index = 'books';
