var fs = require('fs');
var should = require('should');
var spawn = require('child_process').spawn;

var Neek = require('../index');

var dup_file = './test/resources/lines_with_dups.txt';

describe('Neek', function (){

  var without_dups;

  before(function (start){
    fs.readFile('./test/resources/lines_without_dups.txt', function (err, file){
      if(err){
        return start(err);
      }
      without_dups = file.toString();
      start();
    });
  });

  it('filters out duplicates', function (next){
    var neek = new Neek({
      input: fs.createReadStream(dup_file),
      output: 'string'
    });

    neek.unique(function (result){
      should(result).be.ok;
      should(result.output).be.ok;
      should(result.output).eql(without_dups);

      next();
    });
  });

  it('handles with String output', function(next){
    var neek = new Neek({
      input: fs.createReadStream(dup_file),
      output: 'tmp/first_output_without_dups.txt'
    });

    neek.unique(function (result){
      should(result).be.ok;
      should(result.total).be.ok;
      should(result.unique).be.ok;
      should(result.total).eql(13);
      should(result.unique).eql(8);

      next();
    });
  });

  it('handles with Stream output', function(next){
    var neek = new Neek({
      input: fs.createReadStream(dup_file),
      output: fs.createWriteStream('tmp/second_output_without_dups.txt')
    });

    neek.unique(function (result){
      should(result).be.ok;
      should(result.total).be.ok;
      should(result.unique).be.ok;
      should(result.total).eql(13);
      should(result.unique).eql(8);

      next();
    });
  });

  it('functions without a callback', function (start){
    var path = 'tmp/third_output_without_dups.txt';

    var neek = new Neek({
      input: fs.createReadStream(dup_file),
      output: fs.createWriteStream(path)
    });

    neek.unique();

    setTimeout(function (){

      fs.readFile(path, function (err, content){
        should(err).not.be.ok;
        should(content).be.ok;
        should(content.toString()).eql(without_dups);
        start();
      });

    }, 250);
  });

  it('is usable via command line', function (next){
    var child = spawn('./bin/neek', ['--input', dup_file]);
    var data = '';

    child.stdout.on('data', function (d){
      data += d.toString();
    });

    child.stderr.on('data', function (data) {
      should(data).not.be.ok;
    });

    child.stdout.on('end', function (){
      should(data).eql(without_dups);
      next();
    });
  });

  it('throws an error if an input stream type is missing', function (next){

    try {
      var neek = new Neek({
        output: 'string'
      });

      neek.unique(function (result){
        should(result).be.ok;
        should(result.output).be.ok;
        should(result.output).eql(without_dups);

        next(new Error('No error thrown!'));
      });
    } catch(e) {
      should(e.message).eql('No input stream specified!');
      next();
    }

  });

  it('throws an error if an output stream type is missing', function (next){

    try {
      var neek = new Neek({
        input: fs.createReadStream(dup_file)
      });

      neek.unique(function (result){
        should(result).be.ok;
        should(result.output).be.ok;
        should(result.output).eql(without_dups);

        next(new Error('No error thrown!'));
      });
    } catch(e) {
      should(e.message).eql('No output stream specified!');
      next();
    }

  });

});