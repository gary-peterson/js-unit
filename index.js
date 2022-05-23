/*
index.js
run tests headless (console output)
*/

const
    {TestCase} = require('./unit-test/test-case'),
    {UnitTestManager} = require('./unit-test/unit-test-framework');

//---------------------------------------------------

exports.TestCase = TestCase;
exports.UnitTestManager = UnitTestManager;