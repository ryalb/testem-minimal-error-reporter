const TapReporter = require('testem/lib/reporters/tap_reporter');
const colors = require('colors/safe');

class MinimalErrorReporter extends TapReporter {
  constructor(silent, out, config) {
    super(silent, out, config);
    this.todo = 0;
    this.failed = 0;
    this.failedTests = [];
  }

  display(prefix, result) {
    if (!result.passed && !result.skipped && !result.todo) {
      const line = result.name.replace(/Exam Partition .* -/, '').trim()
      this.failedTests.push(line)
    }
    if (result.passed) this.out.write('.');
    else if (result.skipped) this.out.write('*');
    else if (result.todo) this.out.write('-');
    else this.out.write('F');
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
      this.failedTests.sort();
      this.failedTests.forEach(function (failedTest) {
        lines.push('> ' + failedTest);
      });
      lines.push('');
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
  display(prefix, result) {
    if (!result.passed && !result.skipped && !result.todo) {
      const line = result.name.replace(/Exam Partition .* -/, '').trim()
      this.failedTests.push(line)
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
      this.failedTests.sort();
      this.failedTests.forEach(function (failedTest) {
        const failedTestParts = failedTest.split(':');
        lines.push('> ' + colors.blue(failedTestParts[0]) + ':' + colors.brightRed(failedTestParts[1]));
      });
      lines.push('');
    }

    return lines.join('\n');
  }
}

module.exports = {
  MinimalErrorReporter: MinimalErrorReporter,
  MinimalErrorColoredReporter: MinimalErrorColoredReporter
};
