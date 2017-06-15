import { indexRecordsByQuery, getDocument } from './indedx';

const options={
  query: 2017,
  queryType: 'Год издания',
  recordsType: 'Все',
  alisEndpoint: 'http://86.57.174.45',
}
indexRecordsByQuery(options);
getDocument('H87734391', 'Все', (err, response)=>{
  if(!err){
    console.log(response);
  }
  else {
    console.log(err.message);
  }
});
