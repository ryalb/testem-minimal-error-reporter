const TapReporter = require('testem/lib/reporters/tap_reporter');
const colors = require('colors/safe');
const displayutils = require('testem/lib/utils/displayutils');
const fs = require("fs");

class MinimalErrorReporter extends TapReporter {
  constructor(silent, out, config) {
    super(silent, out, config);
    this.todo = 0;
    this.failed = 0;
    this.failedTests = [];
    this.skippedTests = [];
    this.startTime = new Date();
    this.endTime = null;
    this.out.write(`Starting at ${this.startTime.toISOString().substring(11, 19)}\n\n`);
  }

  finish() {
    if (this.silent) {
      return;
    }
    this.endTime = new Date();
    this.out.write('\n' + this.summaryDisplay() + '\n');
  }

  display(prefix, result) {
    if (result.passed) this.out.write('.');
    else if (result.skipped) this.out.write('*');
    else if (result.todo) {
      this.out.write('-');

      const skippedTest = {
        id: this.id,
        prefix,
        result,
      }

      this.skippedTests.push(skippedTest);

    } else {
      this.out.write('F');

      const failedTest = {
        id: this.id,
        prefix,
        result,
      }

      this.failedTests.push(failedTest);
    }
  }

  summaryDisplay() {
    let lines = [
      '+---------------+',
      '| SUMMARY       |',
      '+---------------+',
      '| PASSED...' + this.pass.toString().padStart(4, '.') + ' |',
      '| SKIPPED..' + this.skipped.toString().padStart(4, '.') + ' |',
      '| TODO.....' + this.todo.toString().padStart(4, '.') + ' |',
      '| FAILED...' + this.failed.toString().padStart(4, '.') + ' |',
      '+---------------+',
      '| TOTAL....' + this.total.toString().padStart(4, '.') + ' |',
      '+---------------+',
    ];

    if (this.failedTests.length > 0) {
      lines.push('');
      lines.push('FAILED TESTS:');

      this.failedTests.forEach((failedTest) => {
        lines.push(displayutils.resultString(failedTest.id, failedTest.prefix, failedTest.result, this.quietLogs, this.strictSpecCompliance))
      });
    }

    return lines.join('\n');
  }

  report(prefix, data) {
    this.results.push({
      launcher: prefix,
      result: data
    });
    this.display(prefix, data);
    this.total++;
    if (data.todo) {
      this.todo++;
    } else if (data.skipped) {
      this.skipped++;
    } else if (data.passed) {
      this.pass++;
    } else {
      this.failed++;
    }
  }
}

class MinimalErrorColoredReporter extends MinimalErrorReporter {
  constructor(silent, out, config) {
    super(silent, out, config);
    fs.truncate('failures.ansi', 0, () => {});
  }
  display(prefix, result) {
    const line = result.name.replace(/Exam Partition .* -/, '').trim()
    if (result.skipped) {
      this.skippedTests.push(line);
    }
    
    if (!result.passed && !result.skipped && !result.todo) {
      this.failedTests.push(line)
      fs.appendFile("failures.ansi", '\n\n\n' + colors.blue(line) + '\n\n', (err) => {
        if (!err) { return ; }
        console.error(err);
      });

      const resultString = displayutils.resultString(this.id, prefix, result, this.quietLogs, this.strictSpecCompliance)
      fs.appendFile("failures.ansi", colors.brightRed(resultString), (err) => {
        if (!err) { return ; }
        console.error(err);
      });
    }
    let output = '■';
    if (result.passed) this.out.write(colors.green(output));
    else if (result.skipped) this.out.write(colors.gray(output));
    else if (result.todo) this.out.write(colors.yellow(output));
    else this.out.write(colors.brightRed(output));
  }

  summaryDisplay() {
    let lines = [
      '+---------------+',
      '| SUMMARY       |',
      '+---------------+',
      '| ' + colors.green('PASSED...' + this.pass.toString().padStart(4, '.')) + ' |',
      '| ' + colors.gray('SKIPPED..' + this.skipped.toString().padStart(4, '.')) + ' |',
      '| ' + colors.yellow('TODO.....' + this.todo.toString().padStart(4, '.')) + ' |',
      '| ' + colors.brightRed('FAILED...' + this.failed.toString().padStart(4, '.')) + ' |',
      '+---------------+',
      '| ' + colors.white('TOTAL....' + this.total.toString().padStart(4, '.')) + ' |',
      '+---------------+',
    ];

    if (this.failedTests.length > 0) {
      lines.push('');
      lines.push('FAILED TESTS:');
      lines.push('-------------');
      this.failedTests.sort();
      this.failedTests.forEach(function (failedTest) {
        const failedTestParts = failedTest.split(':');
        lines.push('» ' + colors.blue(failedTestParts[0]) + ':' + colors.brightRed(failedTestParts[1]));
      });
      lines.push('');
    }

    if (this.skippedTests.length > 0) {
      lines.push('');
      lines.push('SKIPPED TESTS:');
      lines.push('--------------');
      this.skippedTests.sort();
      this.skippedTests.forEach(function (skippedTest) {
        const skippedTestParts = skippedTest.split(':');
        lines.push('» ' + colors.blue(skippedTestParts[0]) + ':' + colors.gray(skippedTestParts[1]));
      });
      lines.push('');
    }

    var elapsed = this.endTime - this.startTime;
    var date = new Date(0);
    date.setMilliseconds(elapsed); // specify value for SECONDS here
    var timeString = date.toISOString().substring(11, 19);
    lines.push('');
    lines.push(`Started at   : ${this.startTime.toISOString().substring(11, 19)}`);
    lines.push(`Finishing at : ${this.endTime.toISOString().substring(11, 19)}`);
    lines.push(colors.yellow(`Elapsed      : ${timeString}`));

    return lines.join('\n');
  }
}

module.exports = {
  MinimalErrorReporter: MinimalErrorReporter,
  MinimalErrorColoredReporter: MinimalErrorColoredReporter
};
