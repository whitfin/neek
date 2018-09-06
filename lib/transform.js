var hash = require('farmhash').fingerprint64;
var stream = require('readable-stream');
var util = require('util');

function Transformer(){

  // call the parent
  stream.Transform.call(this);

  // polyfill for non-ES6
  if (!global.Set) {
    // lazy load a HashSet impl
    global.Set = require('hashes').HashSet;

    // polyfill methods to match ES6 Set
    if (!Set.prototype.has) {
      Object.defineProperties(Set.prototype, {
        has: {
          get: function (){
            return this.contains;
          }
        },
        size: {
          get: function (){
            return this.count();
          }
        }
      });
    }
  }

  // define props
  this.count = 0;
  this.set = new Set();
  this.started = false;

  // processing piece
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

  // implement _transform on the stream
  this._transform = function (chunk, encoding, done) {
    var data = chunk.toString();
    if (this._lastLineData) { data = this._lastLineData + data; }

    var lines = data.split('\n');
    this._lastLineData = lines.splice(lines.length - 1, 1)[0];

    lines.forEach(this.process, this);

    done();
  };

  // implement _flush on the stream
  this._flush = function (done) {
    if (this._lastLineData) {
      this.process.bind(this)(this._lastLineData);
    }
    this._lastLineData = null;
    done();
  };

}

// inherit from the Transform stream
util.inherits(Transformer, stream.Transform);

// export the new stream
module.exports = Transformer;
