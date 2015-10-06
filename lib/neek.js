var fs = require('fs');

var Transformer = require('./transform');
var StringStream = require('./stream');

function Neek(opts){

  this.input = opts && opts.input || undefined;

  this.output = opts && opts.output || undefined;

  this.unique = function(callback) {

    var _this = this;

    if (!isReadStream(_this.input)) {
      throw new Error('No input stream specified!');
    }

    if (!isWriteStream(_this.output)) {
      throw new Error('No output stream specified!');
    }

    if (typeof _this.input === 'string') {
      _this.input = fs.createReadStream(_this.input);
    }

    var stream = null;

    if (_this.output !== 'string') {
      if (typeof _this.output === 'string') {
        stream = fs.createWriteStream(_this.output);
      } else {
        stream = _this.output;
      }
    } else {
      stream = new StringStream();
    }

    var transformer = new Transformer();

    _this.input
      .pipe(transformer)
      .pipe(stream);

    stream.once('finish', function (){
      if (callback) {
        if (_this.output !== 'string') {
          transformer.unpipe(_this.output);
        } else {
          transformer.unpipe(stream);
        }
        callback({
          output: _this.output !== 'string' ? null : stream.get(),
          total: transformer.count,
          unique: transformer.set.size
        });
      }
    });

  };

}

function isReadStream(rs){
  return isStream(rs, process.stdin, '_read');
}

function isWriteStream(ws){
  return isStream(ws, process.stdout, '_write');
}

function isStream(st, sys, prop){
  return st && (st === sys|| typeof(st[prop]) === 'function' || typeof(st) === 'string');
}

module.exports = Neek;