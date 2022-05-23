/*
matrix-tool-lab.js
*/

const
	{TestCase} = require('../index'),
	{Lab} = require('@garypeterson/js-common');

class TestCaseLab extends Lab {

	static go() {
		const lab = new TestCaseLab();
		lab.sample_core_1();
		//Lab.boo
	}

	sample_core_1() {
		const tc = new TestCase();
		this.compare(tc.constructor.name, TestCase.name, 'constructing TestCase object');
	}
}

//-----------------------------------------------------
//Run Experiments

TestCaseLab.go();