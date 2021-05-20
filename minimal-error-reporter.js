const TapReporter = require('testem/lib/reporters/tap_reporter');
const colors = require('colors/safe');

class MinimalErrorReporter extends TapReporter {
  display(prefix, result) {
    if (!result.passed && !result.skipped && !result.todo) {
      const line = result.name.replace(/Exam Partition .* -/, '').trim()
      const output = '\n' + colors.red('[FAILED] ') + line + '\n';
      this.out.write(output);
    } else {
      let output = '■';
      if (result.passed) output = colors.green(output);
      else if (result.skipped) output = colors.gray(output);
      else if (result.todo) output = colors.yellow(output);
      this.out.write(output);
    }
  }
}

module.exports = MinimalErrorReporter;
