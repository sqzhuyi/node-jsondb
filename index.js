const fs = require('fs');
const Timer = require('./lib/timer');
const ERR = require('./lib/errors');

/**
 * 本地文件数据库-json格式
 * @param {Object} options - 必需的一些配置
 * @param {String} options.filepath - 数据库文件路径
 * @param {Number} options.maxsize - 存储的最大个数
 * @param {Number} options.sleep - 持久化时间间隔
 * 
 * id:{}
 */
var DB = function (options) {
    if (!options.filepath) {
        throw ERR.noFilePath;
    }
    if (!options.maxsize) {
        options.maxsize = 0;
    }
    if (typeof options.maxsize !== 'number') {
        throw ERR.maxsizeNotNumber;
    }
    this.options = options;
    this.ids = [];
    this.rows = {};
    this.changes = 0;

    init(this);
};

function init(db) {
    let fn = db.options.filepath;
    if (!fs.existsSync(fn)) {
        fs.writeFileSync(fn, '', {
            encoding: 'utf8'
        });
    } else {
        let content = fs.readFileSync(fn, {
            encoding: 'utf8'
        });
        content.split(/[\r\n]+/).forEach(function (line) {
            let idx = line.indexOf(':');
            if (idx > 0) {
                let id = line.substr(0, idx) - 0;
                db.ids.push(id);
                db.rows[id] = line.substr(idx + 1);
            }
        });
    }
    new Timer(db);

}
DB.prototype.getById = function (id) {
    let value = this.rows[id];
    // 返回出去的都是json格式
    if (value && typeof value === 'string') {
        value = JSON.parse(value);
        this.rows[id] = value;
    }
    return value;
};
DB.prototype.getByFilter = function (filter) {
    if (typeof filter !== 'function') {
        throw ERR.filterNotFunction;
    }
    let results = [];
    for (let id in this.rows) {
        let value = this.getById(id);
        if (filter(value)) {
            results.push(value);
        }
    }
    return results;
};
DB.prototype.getAll = function () {
    return this.getByFilter(function (value) {
        return true;
    });
};
DB.prototype.count = function () {
    return this.ids.length;
};
DB.prototype.add = function (data) {
    if (typeof data !== 'object') {
        throw ERR.dataNotJson;
    }
    if (this.ids.length) {
        data.id = this.ids[this.ids.length - 1] + 1;
    } else {
        data.id = 1;
    }
    this.ids.push(data.id);
    this.rows[data.id] = data;
    this.changes += 1;
    return 1;
};
DB.prototype.update = function (id, data) {
    let value = this.getById(id);
    if (!value) {
        return 0;
    }
    data.id = id;
    Object.assign(value, data);

    this.rows[id] = value;
    this.changes += 1;
    return 1;
};
DB.prototype.updates = function(rows){
    let count = 0;
    rows.forEach(function(data){
        count += this.update(data.id, data);
    });
    return count;
};
DB.prototype.delete = function (id) {
    if (!this.rows[id]) {
        return 0;
    }
    delete this.rows[id];
    let idx = this.ids.indexOf(id);
    if (idx > -1) {
        this.ids.splice(idx, 1);
    }
    this.changes += 1;
    return 1;
};
DB.prototype.clear = function () {
    let count = this.count();
    this.ids = [];
    this.rows = {};
    this.changes += count;
    return count;
};

module.exports = DB;