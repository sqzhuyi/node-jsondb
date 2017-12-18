const path = require('path');
const DB = require('../index');

var db = new DB({
    filepath: path.resolve(__dirname, 'db1.jsondb'),
    maxlength: 5,
    sleep: 5000
});
db.add({name:'aaa'});
db.add({name:'bbb'});
db.add({name:'ccc'});
db.add({name:'ddd'});
db.add({name:'eee'});
db.add({name:'fff'});
console.log(db.getAll());