# node-jsondb
最轻量的数据库：直接将json数据存储到本地文件

    const path = require('path');
    const DB = require('../index');

    var db = new DB({
        filepath: path.resolve(__dirname, 'db1.jsondb'),
        maxlength: 5,
        sleep: 5000
    });

API

    getById(id: int)
    getByFilter(filter: function(data){})
    getAll()
    count()
    add(data: json)
    update(id: int, data: json)
    updates(rows: [data])
    delete(id: int)
    clear()

