var NeekReader = require('./reader');

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
            throw new Error("No input stream specified!");
        }

        if (!_this.output) {
            throw new Error("No output format specified!");
        }
        
        if (!algorithm) {
            algorithm = null;
            callback = new Function();
        }

        if (typeof algorithm == "function") {
            callback = algorithm;
            algorithm = null;
        }

        var output = "";

        var reader = new NeekReader();

        reader.algorithm = algorithm;

        _this.input.pipe(reader);

        if(_this.output != "string"){
            reader.pipe(_this.output);
        } else {
            reader.on('data', function(data){
                output += data;
            });
        }

        reader.on('end', function () {
            var total = reader.count,
                unique = reader.set.count();

            reader.reset();

            if (callback) {
                if (_this.output != "string" && _this.output != process.stdout) {
                    reader.unpipe(_this.output);
                }
                callback({
                    output: _this.output != "string" ? null : output,
                    total: total,
                    unique: unique
                });
            }
        });
    }
};