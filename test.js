var Mocha = require("mocha");

// Code coverage
require("blanket")({
    "pattern":[
        "lib/UniqueReader.js",
        "lib/neek.js"
    ]
});

// Mocha instance
var mocha = new Mocha({
    ui:"bdd",
    reporter:process.argv[2] || "mocha-lcov-reporter"
});

// Add the tests to the Mocha instance
mocha.addFile('./test/test.js');

// Run the files in Mocha
mocha.run(function(failures){
    process.exit(failures);
});