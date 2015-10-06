var hash = require('farmhash').fingerprint64;
var stream = require('readable-stream');
var util = require('util');

var HashSet;

if (!global.Set) {
  HashSet = require('hashes').HashSet;

  Object.defineProperties(HashSet.prototype, {
    has: {
      value: function (key){
        return this.contains(key);
      }
    },
    size: {
      get: function (){
        return this.count();
      }
    }
  });
} else {
  HashSet = global.Set;
}

function Transformer(){

  stream.Transform.call(this);

  Object.defineProperty(this, 'set', {
    value: new HashSet()
  });

  this.count = 0;

  this.started = false;

  this.process = function process(element){
    var key = hash(element);

    this.count++;
    if (!this.set.has(key)) {
      this.set.add(key);
      if (this.started) {
        this.push('\n' + element);
      } else {
        this.push(element);
        this.started = true;
      }
    }
  };

  this._transform = function (chunk, encoding, done) {
    var data = chunk.toString();
    if (this._lastLineData) { data = this._lastLineData + data; }

    var lines = data.split('\n');
    this._lastLineData = lines.splice(lines.length - 1, 1)[0];

    lines.forEach(this.process, this);

    done();
  };

  this._flush = function (done) {
    if (this._lastLineData) {
      this.process.bind(this, this._lastLineData);
    }
    this._lastLineData = null;
    done();
  };

}

// inherit from the Transform stream
util.inherits(Transformer, stream.Transform);

// export the new stream
module.exports = Transformer;