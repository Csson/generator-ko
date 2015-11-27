'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');

var ComponentGenerator = yeoman.generators.NamedBase.extend({

  detectCodeLanguage: function() {
    this.codeFileExtension = '.js';
  },

  init: function () {
    var codeLanguage = 'JavaScript';

    var dasherized_name = this._.dasherize(this.name);
    this.componentName = dasherized_name.replace(/\//g, '-');
    this.dirname = dasherized_name.replace(/\/[^/]*$/, '') + '/';
    this.fulldirname = 'src/components/' + this.dirname;
    this.filename = dasherized_name.replace(/^.*\//, '');
    this.dashname = dasherized_name;
    this.viewModelClassName = this._.classify(this.name);
    console.log('Creating component \'' + this.componentName + '\' in <' + this.dirname + '> (' + codeLanguage + ')...');
  },

  template: function () {
    var codeExtension = '.js';
    this.copy('view.html', this.fulldirname + this.filename + '.html');
    this.copy('viewmodel' + this.codeFileExtension, this.fulldirname + this.filename + this.codeFileExtension);
  },

  addComponentRegistration: function() {
    var startupFile = 'src/app/startup' + this.codeFileExtension;
    readIfFileExists.call(this, startupFile, function(existingContents) {
        var existingRegistrationRegex = new RegExp('\\bko\\.components\\.register\\(\s*[\'"]' + this.componentName + '[\'"]');
        if (existingRegistrationRegex.exec(existingContents)) {
            this.log(chalk.white(this.dashname) + chalk.cyan(' is already registered in ') + chalk.white(startupFile));
            return;
        }

        var token = '// [Scaffolded component registrations will be inserted here. To retain this feature, don\'t remove this comment.]',
            regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
            modulePath = 'components/' + this.dirname + this.filename,
            lineToAdd = 'ko.components.register(\'' + this.componentName + '\', { require: \'' + modulePath + '\' });',
            newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
        fs.writeFile(startupFile, newContents);
        this.log(chalk.green('   registered ') + chalk.white(this.filename) + chalk.green(' in ') + chalk.white(startupFile));

        if (fs.existsSync('gulpfile.js')) {
            this.log(chalk.magenta('To include in build output, reference ') + chalk.white('\'' + modulePath + '\'') + chalk.magenta(' in ') + chalk.white('gulpfile.js'));
        }
    });
  }

});

function readIfFileExists(path, callback) {
    if (fs.existsSync(path)) {
        callback.call(this, this.readFileAsString(path));
    }
}

module.exports = ComponentGenerator;