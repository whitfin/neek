Neek [![Build Status](https://travis-ci.org/zackehh/neek.svg?branch=master)](https://travis-ci.org/zackehh/neek) [![Code Climate](https://codeclimate.com/github/iwhitfield/neek/badges/gpa.svg)](https://codeclimate.com/github/iwhitfield/neek) [![Test Coverage](https://codeclimate.com/github/iwhitfield/neek/badges/coverage.svg)](https://codeclimate.com/github/iwhitfield/neek)
====

A simple way to filter duplicate lines from a list, à la uniq. Takes an input and filters to an output removing duplicates.

### Compatibility ###

the current version of `Neek` is designed using several features of `ES6`; namely the `Set` interface. If this is not available, it will fall back to a library interface which is not as fast (but it's still pretty good). As such, best performance occurs when on `Node >= v4.0.0` and all numbers in this README will refer to this version.

Neek is built on Travis against the latest version of Node, Node 0.12.x and Node 0.10.x. Older versions of Node are not supported, however Neek was functional on 0.8.x with version `0.2.2` (admittedly with slower performance).

Build results are sent over to [Code Climate](https://codeclimate.com/github/zackehh/neek) for analysis.

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
$ neek --input dup_file.txt -o output.txt

$ cat dup_file.txt | neek -o output.txt
```

The shell version takes these parameters:

```
-i, --input         an input file to process
-o, --output        a file to output to
-q, --quiet         only output the processed data
```

The other use is from within a Node module which requires some processing to output text without duplicates, although I expect this will be less common. Below is an example inside Node:

```
var Neek = require('neek);

var neek = new Neek({
  input: fs.createReadStream('./test/resources/lines_with_dups.txt'),
  output: fs.createWriteStream('./test/resources/output_without_dups.txt');
});

neek.unique(function(result){
  console.log(result);
});
```

You can use the constructor to define your streams. You then call `unique()` to actually remove the duplicate data. `output` can take a parameter "string", which will pass the output to the callback as described below. `unique()` can take an optional algorithm param (defaulting to SHA1), and a callback function which is passed a result object.

If you pass a String type to `output` (which `!== 'string'`) it will be wrapped up in a write stream, assuming it is a file path.

This object contains three fields; output, size and count. These fields translate to the following:

```
output  - output of the process, if you chose a string output - otherwise null
total   - the number of lines processed
unique  - the final amount of lines (without duplicate data)
```

### Comparison ###

On a test set of a 527MB file containing 1,071,367 total lines with 443,917 unique lines, below is a comparison of the performance of Unix tools `uniq` and `sort`, and then `neek`. `uniq` is assuming that your data is sorted.

**Uniq**

```
$ time uniq test-set.txt > deduplicated.txt

real	0m38.922s
user	0m37.647s
sys	    0m1.105s
```

In the unfortunately case that your data isn't sorted, you would have to use `sort`, however Neek behaves the same regardless of order.

**Sort**

```
$ time sort -u test-set.txt > deduplicated.txt

real	2m16.459s
user	2m13.757s
sys	    0m2.186s
```

Now let's look at Neek!

**Neek**

```
$ time bin/neek --input test-set.txt -o deduplicated.txt

real	0m9.581s
user	0m8.615s
sys	    0m1.588s
```

As you can see, Neek is ~4.1x (around 400%) faster to run than `uniq` and ~14.2x (around 1400%) faster to run than `sort`, meaning it's invaluable for larger files. Aside from being far faster Neek uses efficient pipes, which is far better for memory usage. Tools like `sort` will buffer the entire file into memory, making it a bad choice for large files.

### Redirection ###

On versions **prior** to Node v4.x one important thing to note is that a shell redirection is slightly faster than using the `--output` flag. In the processing of the above file, the `--output` flag took an extra 9 seconds due to the overheads inside Node.

Where possible, I would recommend simply using a shell redirection. If you do use a redirection, make sure to pass `-q`. Here is a comparison:

```
$ time bin/neek --input test-set.txt -q > deduplicated.txt

real	0m19.928s
user	0m16.596s
sys	    0m3.653s

$ time bin/neek --input test-set.txt --output deduplicated.txt

real	0m30.536s
user	0m22.242s
sys	    0m10.883s
```

In post Node v4.x, this is **not** an issue (in fact the situation is almost reversed, shell redirection is far slower).
