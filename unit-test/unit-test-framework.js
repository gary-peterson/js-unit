'use strict';

const
    {Tools} = require('@garypeterson/js-common'),
    {prn} = require('@garypeterson/js-common');

class Test {
    /* unitTest
    testLabel
    testFunction*/

    constructor(unitTest, testLabel, testFunction) {
        this.unitTest = unitTest;
        this.testLabel = testLabel;
        this.testFunction = testFunction;
        this.count = 0;
        this.failed = 0;
        this.exceptions = 0;
    }

    incrementCount() {
        this.count++;
    }

    incrementFailures() {
        this.failed++;
    }

    incrementExceptions() {
        this.exceptions++;
    }

    getTotalCount() {
        //let us assume an exception supressed a count
        return this.count + this.exceptions;
    }

    hasFailureOrExeption() {
        return (this.failed > 0) || (this.exceptions > 0);
    }

    getPassedCount() {
        return Math.max(this.getTotalCount() - this.failed - this.exceptions, 0);
    }

    getPercentPassing() {
        //let us assume an exception supressed a count
        if (this.count === 0) return 0;
        return 100 * this.getPassedCount() / this.count;
    }

    getTestFunction() {
        return this.testFunction;
    }

    getTestLabel() {
        return this.testLabel;
    }

    run() {
        this.unitTest.show("Running -- " + this.testLabel);
        this.unitTest.setCurrentSubTest(this);
        this.testFunction();
        this.unitTest.setCurrentSubTest(null);
    }

    toString() {
        return `${this.testLabel} -- ${this.getPercentPassing()}% -- ${this.getPassedCount()} of ${this.getTotalCount()}`;
    }
}


//==================================================================

class TestRunner {
    /*unitTest
    subTests*/

    constructor(unitTest, subTests) {
        this.unitTest = unitTest;
        this.subTests = subTests;
    }

    preCheck() {
        const preTestError = this.unitTest.preTest();
        if (!preTestError)
            return true;
        const utest = this.unitTest;
        utest
            .show('PRE-CHECK FAILED')
            .show(`Error: ${preTestError}`)
            .show('Could not run tests')
            .incrementExceptionCount();
        return false;
    }

    runAll() {
        if (!this.preCheck()) return;
        const utest = this.unitTest;
        utest.beforeAll();
        for (let eachSubTest of this.subTests) {

            //utest.beforeEach();
            this.runSubTest(eachSubTest, utest);
            //utest.afterEach();
        }
        utest.afterAll();
        this.unitTest.show("");
        const uname = utest.getUnitName();
        if (!Tools.isString(uname))
            name = uname.name;
        utest.printSummary(uname);
    }

    runSubTest(subTest, utest) {
        //xdoc method cascading
        try {
            utest.beforeEach();
            subTest.run();
            utest.afterEach();
        } catch (ex) {
            const ut = this.unitTest;
            ut
                .incrementExceptionCount()
                .show(`EXCEPTION OCCURRED in ${subTest.toString()}`);
            Tools.exceptionToDisplayStrings(ex).forEach(each => ut.show(each));
            ut.show('');
        }
    }

    //--------------------------------------------------------

}

//==================================================================

class UnitTestManager {

    /*unitTest;
    subTests*/

    constructor(testee, subTests) {
        this.unitTest = testee;
        this.subTests = subTests;
    }

    getUnitTest() {
        return this.unitTest;
    }

    getSubTests() {
        return this.subTests;
    }

    testRunner() {
        return new TestRunner(this.unitTest, this.subTests);
    }

    runAll() {
        this.testRunner().runAll();
    }

    static runUnitTest(unitTest) {
        let mgr;
        mgr = new UnitTestManager(unitTest, unitTest.getSubTests());
        mgr.runAll();
        return unitTest;
    }

    static runUnitTestWith(unitTest, subTestNames) {
        let mgr, subTests;
        subTests = unitTest.getSubTests();
        subTests = subTests.filter(eaSubTest => subTestNames.includes(eaSubTest.getTestLabel()));
        mgr = new UnitTestManager(unitTest, subTests);
        mgr.runAll();
        return unitTest;
    }

    static runTestCaseClasses(testCaseClasses) {
        const resultRows = [];
        testCaseClasses.forEach((eaTestCaseClass) => {
            let tc, selectors, ut, results, r, s;
            tc = new eaTestCaseClass();
            selectors = tc.getSubTests().map(ea => ea.getTestLabel());
            ut = UnitTestManager.runUnitTestWith(tc, selectors);
            results = ut.getResultRows(eaTestCaseClass.name);
            r = results[0];
            resultRows.push(`${r[0][2]} tests ${r[1][2]} -- ${r[2][2]}/${r[3][2]} -- ${r[4][2]}%`);
        });
        prn(`----------- SUMMARY -----------\n`);
        resultRows.forEach(ea => prn(ea));
    }

}

//--------------------------------
// Exporting

exports.UnitTestManager = UnitTestManager;
exports.TestRunner = TestRunner;
exports.Test = Test;

