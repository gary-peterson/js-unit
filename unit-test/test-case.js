// noinspection JSUnusedLocalSymbols

'use strict';
/*
	TestCase
	Abstract class implementing minimal JUnit 5 protocol
	*/

//----------------------------------------------------

const
    {Test} = require('./unit-test-framework'),
    {Tools} = require('@garypeterson/js-common'),
    {prn} = require('@garypeterson/js-common');

//==============================================

class TestCase {
    /*ivars:
    Note: don't start ivars with 'test' as that is how test selectors are named*/
    subTests;	//(lazily initialized)
    count;
    failureCount;
    exceptionCount;
    currentSubTest;
    log;

    constructor() {
        this.clear();
    }

    hasSubTestWithFailure() {
        for (let eachTest of this.getSubTests())
            if (eachTest.hasFailureOrExeption())
                return true;
        return false;
    }

    isPassing() {
        return !this.hasSubTestWithFailure();
    }

    statusLabel() {
        return this.isPassing() ? 'PASSED' : 'ERRORS';
    }

    setCurrentSubTest(subTest) {
        this.currentSubTest = subTest;
    }

    assertEquals(expected, actual, optionalMsg) {
        this.basicAssertEquals(expected, actual, true, optionalMsg);
    }

    assertNotEquals(expected, actual, optionalMsg) {
        this.currentSubTest.incrementCount();
        //this.count++;
        if (this.assertEqualsSafely(expected, actual)) {
            //this.failureCount++;
            this.currentSubTest.incrementFailures();
            this.show(`FAILED (assertNotEquals) -- actual <${actual}> should be NOT equal to expected <${expected}> ${this.conformAssertMsg(optionalMsg)}\n`);
        }
    }

    assertTrue(condition, optionalMsg) {
        this.basicAssertEquals(true, condition, optionalMsg === undefined, optionalMsg);

    }

    basicAssertEquals(expected, actual, shouldCompare, optionalMsg) {
        this.currentSubTest.incrementCount();
        //this.count++;
        if (!this.assertEqualsSafely(expected, actual)) {
            //this.failureCount++;
            this.currentSubTest.incrementFailures();
            this.show(`FAILED (${this.currentSubTest.getTestLabel()})${this.conformCompare(expected, actual, shouldCompare)}${this.conformAssertMsg(optionalMsg)}`);
        }
    }

    assertFloatEquals(expected, actual, tolerance, optionalMsg) {
        //this.count++;
        this.currentSubTest.incrementCount();
        if (Math.abs(actual - expected) > Math.abs(tolerance)) {
            //this.failureCount++;
            this.currentSubTest.incrementFailures();
            this.show(`FAILED (${this.currentSubTest.getTestLabel()})${this.conformCompare(expected, actual, true)}${this.conformAssertMsg(optionalMsg)}`);
        }
    }

    clear() {
        this.subTests = null;	//lazily initialized
        //this.count = 0;
        //this.failureCount = 0;
        //this.exceptionCount = 0;
        this.currentSubTest = null;
        this.log = '';
    }

    conformAssertMsg(aMsg) {
        return aMsg ? ` -- ${aMsg}` : '';
    }

    conformCompare(expected, actual, shouldCompare) {
        return shouldCompare
            ? ` -- actual <${actual}> should be equal to expected <${expected}>`
            : '';
    }

    fail(msg) {
        //Record test as failed
        this.show(`Failed -- ${msg}`);
        this.assertTrue(false);
    }

    header(header) {
        this.show(`\nStarting test: ${header}`);
    }

    assertEqualsSafely(a, b) {
        //If only one is nil, then false, use XOR (no xor in js)*/
        if (a === null && b !== null) return false;
        if (a !== null && b === null) return false;
        //We now know that if either is null, they both are
        if (a === null)
            return true;
        //Finally a safe equals
        //ASSUME -- this is prims only
        if (Array.isArray(a))
            return this.basicCompareArrays(a, b);
        if (!isNaN(a) && !isNaN(b))
            return Math.abs(a - b) <= Math.abs(0.0000000001);
        return a === b;
    }

    basicCompareArrays(a, b) {
        return a.filter((ea, index) => ea !== b[index]).length === 0;
    }

    printSubTestSummary(testeeType) {
        this.show(`----------- TEST Listing for ${testeeType.toString()} -----------\n`);
        for (let eachSubTest of this.getSubTests())
            this.show(eachSubTest.toString());
        this.show('');
    }

    getSummaryResultsColHeaders(testeeType) {
        return ['Unit Test', 'Testee Type', 'Count', 'Passed']
    }

    getResultRows(testeeType) {
        let unitTestName, unitType, tests, count, passed, percent, labeledValueResults;
        unitTestName = this.constructor.name;
        unitType = testeeType;
        tests = this.getSubTests();
        count = tests.reduce((runningCount, test) => runningCount + test.getTotalCount(), 0);
        passed = tests.reduce((runningCount, test) => runningCount + test.getPassedCount(), 0);
        percent = (count > 0) ? 100.0 * passed / count : 0;
        labeledValueResults = [];
        labeledValueResults.push(
            [['unitTestName', 'Unit Test', unitTestName],
                ['unitType', 'Unit Type', unitType],
                ['count', 'Count', count],
                ['passed', 'Passed', passed],
                ['Percent', 'Percent', percent]]);
        return labeledValueResults;
    }

    printSummary(testeeType) {
        //cr();
        this.printSubTestSummary(testeeType);
/* -- moved to UnitTestManager>>runTestCaseClasses
        let results, tests, count, passedCount, percent;
        results = this.getResultRows(testeeType);
        this.show(`----------- TEST SUMMARY for ${testeeType}-----------`);
        results.forEach(ea => {
            this.show(`${ea[0][2]} tests ${ea[1][2]} -- ${ea[2][2]}/${ea[3][2]} -- ${ea[4][2]}%`);
        });*/
        // this.show(`Unit Test: ${results.unitTestName}`);
        // this.show(`Unit Type: ${results.unitType}`);
        // this.show(`Test Count: ${results.count}`);
        // this.show(`Passing Count: ${results.passed}`);
        // this.show(`Passing Percent: ${results.percent.toFixed(0)}%`);
    }

    newSubTest(subTestLabel, testFunction) {
        return new Test(this, subTestLabel, testFunction);
    }

    incrementExceptionCount() {
        //this.exceptionCount++;
        if (this.currentSubTest)
            this.currentSubTest.incrementExceptions();
        //Return this for method cascading
        return this;
    }

    getLog() {
        return this.log;
    }

    show(msg) {
        //to console
        prn(msg);
        //to local log variable
        let log = this.getLog();
        if (log.length > 0)
            log += '\n';
        log += msg;
        this.log = log;
        //Return this for method cascading
        return this;
    }

    //----------------- Virtual Optional -----------------

    beforeEach() {
        //Called before each sub test
        //Optional override
    }

    afterEach() {
        //Called after each sub test
        //Optional override
    }

    beforeAll() {
        //Called before any sub test has been run
        //Optional override
        this.show(`==========================================================\n`);
        this.show(`----------- TEST Log for ${this.getUnitName()} -----------\n`);
    }

    afterAll() {
        //Called after any sub test has been run
        //Optional override
    }

    getUnitName() {
        //virtual optional
        //Default is to extract model name as:
        //RectangleTest => Rectangle
        Tools.implementedBySubclass(this, "getUnitName");
        /*const testCaseName = this.constructor.name;
        const i = testCaseName.indexOf('Test');
        if (i <= 0)
            return 'Test Case';
        return testCaseName.substring(0, i);*/
        return null;
    }

    getUnitClass() {
        implementedBySubclass(this, "getUnitName");
        return null;
    }

    //----------------- Non Virtual -----------------

    getSubTests() {
        if (this.subTests === null) this.subTests = this.buildSubTests();
        return this.subTests;
    }

    buildSubTests() {
        //Build the sub-tests
        let properties = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        properties = properties.filter(eachProp => typeof this[eachProp] === 'function');
        properties = properties.filter(eachProp => eachProp.startsWith('test'));
        const tests = [];
        for (let p of properties) {
            tests.push(this.newSubTest(p, () => this[p]()));
        }
        return tests;
    }

    preTest() {
        //Check to make sure we can continue with tests
        //Safety check as they might say in airline world
        //Make sure we can find the unit model class (to test)
        let uname = null;
        try {
            const unitClass = this.getUnitClass();
            if (unitClass)
                return null;
            uname = this.getUnitName();
        } catch (ex) {
            return ex.message;
        }
        const unitClass = coerceClass(uname);
        if (typeof unitClass !== 'function')
            return `Unit model class "${uname}" does not exist`;
        return null;
    }

}

//==============================================

//----------------------------------------------------
//Helpers


//----------------------------------------------
//Test Case Management

let
    testClassClasses = [],
    currentTestCaseClass = null;

function assureCurrentTestCase() {
    if (!currentTestCaseClass)
        currentTestCaseClass = testClassClasses[0];
}

function addTestCase(testCaseClassName) {
    //const testCaseClass = coerceClass(testCaseClassName);
    testClassClasses.push(testCaseClassName);
}

function newTestCase() {
    assureCurrentTestCase();
    if (currentTestCaseClass) {
        const cl = coerceClass(currentTestCaseClass);
        return new cl();
    }
    return null;
}

function setCurrentTestCase(aTestCaseClassName) {
    currentTestCaseClass = aTestCaseClassName;
}

//--------------------------------
// Exporting

exports.TestCase = TestCase;


