var crypto = require('crypto'),
    HashSet = require('hashes').HashSet,
    stream = require('readable-stream');

module.exports = function(){
    var reader = new stream.Transform();

    reader.algorithm = "sha1";

    reader.count = 0;

    reader.reset = function(){
        this.count = 0;
        this.set.clear();
    };

    reader.process = function(element){
        var hash = crypto
            .createHash(this.algorithm || "sha1")
            .update(element)
            .digest("hex");

        this.count++;
        if (!this.set.contains(hash)) {
            this.set.add(hash);
            this.push(element + "\n");
        }
    };

    reader.set = new HashSet();

    reader._transform = function (chunk, encoding, done) {
        var data = chunk.toString();
        if (this._lastLineData) data = this._lastLineData + data;

        var lines = data.split('\n');
        this._lastLineData = lines.splice(lines.length - 1, 1)[0];

        lines.forEach(this.process, this);

        done()
    };

    reader._flush = function (done) {
        if (this._lastLineData){
            this.process.bind(this, this._lastLineData);
        }
        this._lastLineData = null;
        done()
    };

    return reader;
};