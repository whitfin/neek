var assert = require('assert'),
    exec = require('child_process').exec,
    fs = require('fs'),
    Neek = require('../index'),
    path = require('path');

var without_dups;

describe('Neek', function(){

    before(function(start){
        without_dups = fs.readFileSync('./test/resources/lines_without_dups.txt').toString();
        start();
    });

    describe('filters out duplicates', function(){

        it('using the MD5 algorithm', function(next){

            new Neek()
                .setInput(fs.createReadStream('./test/resources/lines_with_dups.txt'))
                .setOutput("string")
                .unique('md5', function(result){
                    assert.strictEqual(result.output, without_dups);
                    next();
                });

        });

        it('using the SHA-1 algorithm', function(next){

            new Neek()
                .setInput(fs.createReadStream('./test/resources/lines_with_dups.txt'))
                .setOutput("string")
                .unique(function(result){
                    assert.strictEqual(result.output, without_dups);
                    next();
                });

        });

        it('using the SHA-256 algorithm', function(next){

            new Neek()
                .setInput(fs.createReadStream('./test/resources/lines_with_dups.txt'))
                .setOutput("string")
                .unique('sha256', function(result){
                    assert.strictEqual(result.output, without_dups);
                    next();
                });

        });

        it('using the SHA-512 algorithm', function(next){

            new Neek()
                .setInput(fs.createReadStream('./test/resources/lines_with_dups.txt'))
                .setOutput("string")
                .unique('sha512', function(result){
                    assert.strictEqual(result.output, without_dups);
                    next();
                });

        });

    });

    describe('handles unexpected situations', function(){

        it('by throwing errors if an input stream type is missing', function(next){

            try {
                new Neek()
                    .setOutput("string")
                    .unique('sha512', function (result) {
                        assert.strictEqual(result.output, without_dups);
                        next(new Error('No error thrown!'));
                    });
            } catch(e) {
                assert(e.message == "No input stream specified!");
                next();
            }

        });

        it('by throwing errors if an output stream type is missing', function(next){

            try {
                new Neek()
                    .setInput(fs.createReadStream('./test/resources/lines_with_dups.txt'))
                    .unique('sha512', function (result) {
                        assert.strictEqual(result.output, without_dups);
                        next(new Error('No error thrown!'));
                    });
            } catch(e) {
                assert(e.message == "No output format specified!");
                next();
            }

        });

        it('by handling cases with no arguments', function(next){
            new Neek()
                .setInput(fs.createReadStream('./test/resources/lines_with_dups.txt'))
                .setOutput(fs.createWriteStream('./test/resources/output_without_dups.txt'))
                .unique();

            next();
        });

    });

    describe('command line interface', function(){

        it('should write out to a stream', function(next){
            setTimeout(function(){
                var testFile = fs.readFileSync('./test/resources/output_without_dups.txt').toString();
                assert.equal(testFile, without_dups);
                next();
            }, 200);
        });

        it('should be usable via command line', function(next){

            var cmd = path.join(__dirname, '../bin/neek'),
                resource = path.join(__dirname, './resources/');

            exec(cmd + ' --input ' + resource + 'lines_with_dups.txt', function(err, stdout, stderr){
                assert(!err, err);
                assert(!stderr);
                assert.equal(stdout, without_dups + "\nProcessing complete: 13 -> 8\n");
                next();
            });

        });

    });

});
