Neek [![Build Status](https://travis-ci.org/iwhitfield/neek.svg?branch=master)](https://travis-ci.org/iwhitfield/neek) [![Code Climate](https://codeclimate.com/github/iwhitfield/neek/badges/gpa.svg)](https://codeclimate.com/github/iwhitfield/neek) [![Test Coverage](https://codeclimate.com/github/iwhitfield/neek/badges/coverage.svg)](https://codeclimate.com/github/iwhitfield/neek)
====

A simple way to filter duplicate lines from a list, à la uniq. Takes an input and filters to an output removing duplicates.

### Compatibility ###

This module is built on each commit with TravisCI on Node 0.8.x, 0.10.x and 0.11.x. It will *not* work on Node 0.6.x unfortunately. In order to maintain support throughout these versions, the [Hashes](https://npmjs.org/package/hashes "Hashes") library is used. There are more efficient alternatives (perhaps a gaining a second per 100,000 records), however they have native components and are unstable on 0.11.x at the moment. At some point in future, I'll revisit this and implement a better HashSet - perhaps when 0.12.x is live.

Build results are sent over to [Code Climate](https://codeclimate.com/github/iwhitfield/neek) for analysis.

### Setup ###

Depending on your use case, there are two different ways you can install Neek. The first is as a global module, mostly for use when scripting in a shell.

```
$ npm install -g neek
```

You can also install it as a local module in case you wish to use it inside another tool:

```
$ npm install neek
```

### Usage ###

As mentioned, there are two ways to use Neek. The first use, and probably the most common, is simply invoking via a shell, or using inside a shell to remove duplicate lines:

```
$ neek --input dup_file.txt > output.txt

$ cat dup_file.txt | neek > output.txt
```

The shell version takes these parameters:

```
-a, --algorithm     the cipher algorithm to use (default to SHA1)
-i, --input         an input file to process
-o, --output        a file to output to
-q, --quiet         only output the processed data
```

The other use is from within a Node module which requires some processing to output text without duplicates, although I expect this will be less common. Below is an example inside Node:

```
var Neek = require('neek);

new Neek()
    .setInput(fs.createReadStream('./test/resources/lines_with_dups.txt'))
    .setOutput(fs.createWriteStream('./test/resources/output_without_dups.txt'))
    .unique('md5', function(result){

    });
```

You can use `setInput()` and `setOutput()` to define your streams. You then call `unique()` to actually remove the duplicate data. `setOutput()` can take a parameter "string", which will pass the output to the callback as described below. `unique()` can take an optional algorithm param (defaulting to SHA1), and a callback function which is passed a result object.

This object contains three fields; output, size and count. These fields translate to the following:

```
output  - output of the process, if you chose a string output - otherwise null
total   - the number of lines processed
unique  - the final amount of lines (without duplicate data)
```

### Comparison ###

On a test set of a 293MB file containing 576,905 total lines with 322,392 unique lines, below is a comparison of the performance of Unix tool `uniq` and `neek`. This is assuming that your data is sorted.

**Uniq**

```
$ time uniq test-set.txt

# output

real	0m33.951s
user	0m27.086s
sys     0m2.161s
```

**Neek**

```
$ time bin/neek --input test-set.txt

# output

real	0m16.354s
user	0m13.733s
sys     0m2.217s
```

In the unfortunately case that your data isn't sorted, you would have to use `sort`, however Neek behaves the same regardless of order.

**Sort**

```
$ time sort -u test-set.txt

# output

real	1m39.203s
user	1m32.484s
sys     0m1.518s
```

As you can see, Neek is roughly 45% faster to run than Uniq and almost 85% faster to run than Sort, meaning it's invaluable for larger files.

### Redirection ###

One important thing to note here is that a shell redirection is slightly faster than using the `--output` flag. In the processing of the above file, the `--output` flag took an extra 9 seconds due to the overheads inside Node.

Where possible, I would recommend simply using a shell redirection. If you do use a redirection, make sure to pass `-q`. Here is a comparison:

```
$ time bin/neek --input test-set.txt -q > output.txt

real	0m16.354s
user	0m13.733s
sys     0m2.217s

$ time bin/neek --input test-set.txt --output output.txt

Processing complete: 576905 -> 322392

real	0m25.744s
user	0m14.974s
sys     0m6.657s
```
