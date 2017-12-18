let {
    setTimeout,
    clearTimeout
} = require('timers');

const fs = require('fs');

var Timer = function (db) {
    this.db = db;
    this.start(db.options.sleep);
};

Timer.prototype.save = function () {
    let db = this.db;

    if (db.changes === 0) return;

    while (db.ids.length > db.options.maxlength) {
        let id = db.ids.shift();
        delete db.rows[id];
    }
    let lines = [];
    for (let id in db.rows) {
        lines.push(id + ':' + JSON.stringify(db.rows[id]));
    }
    db.changes = 0;

    let content = lines.join('\r\n');
    fs.writeFileSync(db.options.filepath, content, {
        encoding: 'utf8'
    });
};
Timer.prototype.start = function (sleep) {
    this.stop();
    let _this = this;
    var saveAuto = function () {
        _this.save();
        _this.clock = setTimeout(saveAuto, sleep);
    };
    this.clock = setTimeout(saveAuto, sleep);
};
Timer.prototype.stop = function () {
    if (this.clock) {
        clearTimeout(this.clock);
        this.clock = null;
    }
};
module.exports = Timer;