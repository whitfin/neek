var NeekReader = require('./reader'),
    StringStream = require('./stream');

module.exports = function(){

    var _this = this;

    this.setInput = function(input) {
        this.input = input;
        return this;
    };

    this.setOutput = function(output) {
        this.output = output;
        return this;
    };

    this.unique = function(algorithm, callback) {
        if (!_this.input) {
            throw new Error('No input stream specified!');
        }

        if (!_this.output) {
            throw new Error('No output format specified!');
        }
        
        if (!algorithm) {
            algorithm = null;
            callback = function(){ };
        }

        if (typeof algorithm === 'function') {
            callback = algorithm;
            algorithm = null;
        }

        var reader = new NeekReader(),
            stream = null;

        reader.algorithm = algorithm;

        reader.isTTY = Boolean(_this.output.isTTY);

        _this.input.pipe(reader);

        if(_this.output !== 'string'){
            reader.pipe(_this.output);
        } else {
            reader.pipe((stream = new StringStream(), stream));
        }

        reader.on('end', function () {
            var total = reader.count,
                unique = reader.set.count();

            reader.reset();

            if (callback) {
                if (_this.output !== 'string') {
                    reader.unpipe(_this.output);
                } else {
                    reader.unpipe(stream);
                }
                callback({
                    output: _this.output !== 'string' ? null : stream.get(),
                    total: total,
                    unique: unique
                });
            }
        });
    };
};