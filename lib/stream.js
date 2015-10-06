var Stream = require('readable-stream');
var util = require('util');

// Init function
function StringStream(init) {
  // Init via super
  Stream.super_.call(this);
  // Init the data
  this._data = init || '';
}

// Inherit from Stream
util.inherits(StringStream, Stream);

// Emit the end event on end
StringStream.prototype.end = function(){
  this.emit('end');
  this.emit('finish');
};

// Return the current data
StringStream.prototype.get = function(){
  return this._data;
};

// Writing is purely appending the string
StringStream.prototype.write = function(data){
  this._data += data;
};

// Export as a module
module.exports = StringStream;