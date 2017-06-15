import { indexAllRecordsByYear } from './indedx';

const options={
  query: 2017,
  queryType: 'Год издания',
  recordsType: 'Все',
  alisEndpoint: 'http://86.57.174.45',
}
indexAllRecordsByYear(options);
