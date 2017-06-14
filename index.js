
import elasticsearch from 'elasticsearch';
import Stream from 'stream';
import { getRecordsByQuery} from '@grodno-city/alis-web-request';

let client = new elasticsearch.Client({
  host: 'localhost:9200',
});

function indexAllRecordsByYear(year) {
  const options={
    query: year,
    queryType: 'Год издания',
    recordsType: 'Все',
    alisEndpoint: 'http://11.11.11.11'
  }
  getRecordsByQuery(options, (err, memo)=>{
    if(!err) {
      memo.map((item)=>{
        indexItem(item, 'Все', year);
      })
    }
  });
}

// client.index({
//   index: 'records',
//   id:'H87733338',
//   type: 'Книги',
//   body:{
//         "title": "Чехов, М. П. Вокруг Чехова : встречи и впечатления / М. П. Чехов ; вступительная статья Е. З. Балабановича. - Москва : Московский рабочий, 1960. - 351 с. ББК 83.3(2=Рус)1",
//         "year": 1960
//       }
// })

function getDocument(id, type, callback){
  client.get({
    index: 'records',
    type: type,
    id: id
  }, callback);
}

function indexItem(item, type, year){
  client.index({
    index: 'records',
    id:item.id,
    type: type,
    body:{
      'title': item.title,
      'year': year,
    }
  }, (err, response) => {
    if (err) throw err;
  })
}
