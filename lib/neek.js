var fs = require('fs');

var Transformer = require('./transform');
var StringStream = require('./stream');

module.exports = {

  unique: function unique(input, output, callback) {

    if (!isReadStream(input)) {
      throw new Error('No input stream specified!');
    }

    if (!isWriteStream(output)) {
      throw new Error('No output stream specified!');
    }

    if (typeof input === 'string') {
      input = fs.createReadStream(input);
    }

    var stream = null;

    if (output !== 'string') {
      if (typeof output === 'string') {
        stream = fs.createWriteStream(output);
      } else {
        stream = output;
      }
    } else {
      stream = new StringStream();
    }

    var transformer = new Transformer();

    input
      .pipe(transformer)
      .pipe(stream);

    stream.once('finish', function (){
      if (callback) {
        if (output !== 'string') {
          transformer.unpipe(output);
        } else {
          transformer.unpipe(stream);
        }
        callback({
          output: output !== 'string' ? null : stream.get(),
          total: transformer.count,
          unique: transformer.set.size
        });
      }
    });

  }

};

function isReadStream(rs){
  return isStream(rs, process.stdin, '_read');
}

function isWriteStream(ws){
  return isStream(ws, process.stdout, '_write');
}

function isStream(st, sys, prop){
  return st && (st === sys|| typeof(st[prop]) === 'function' || typeof(st) === 'string');
}