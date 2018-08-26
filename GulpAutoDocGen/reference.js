/*
var gulp = require('gulp');

gulp.task('css', function () {
    return gulp.src('src/css/style.css')
        .pipe(gulp.dest('public/css'));
});
*/

const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const less = require('gulp-less');
const uglify = require('gulp-uglify');
const del = require('del');

gulp.task('css', function () {
  return gulp.src('src/sass/style.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css'));
});

gulp.task('lessCss', function () {
  return gulp.src('src/less/style.less')
    .pipe(less())
    //.pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/css'));
});

gulp.task('watchLess', function () {
  gulp.watch('src/less/*.less', ['lessCss']);
});

gulp.task('jsMinify', function () {
  return gulp.src('src/js/app.js')
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});

gulp.task('one', function (done) {
  console.log('one');
  done();
});

gulp.task('two', function (done) {
  console.log('two');
  done();
});

gulp.task('par', gulp.parallel('one', 'two', function (done) {
  console.log('par');
  done();
}));

gulp.task('clean', function (done) { console.log('clean'); done(); });
gulp.task('styles', gulp.series('clean', function (done) { console.log('styles'); done(); }));
gulp.task('scripts', gulp.series('clean', function (done) { console.log('scripts'); done(); }));
gulp.task('default', gulp.series('scripts', 'styles', function (done) { console.log('default'); done(); }));

//(gulp.task('default'))();
//gulp.task('par')();


gulp.task('delete', function (done) {
  return del(['build/'], done);
});

gulp.task('w0', function () {
  gulp.watch('.txt', function () { console.log('af'); });
});

// prior to v4
/*
gulp.task('default', ['scripts', 'styles'], function() { console.log('default'); });

// Both scripts and styles call clean
gulp.task('styles', ['clean'], function() { console.log('styles'); });
gulp.task('scripts', ['clean'], function() { console.log('scripts'); });

// Clean wipes out the build directory
gulp.task('clean', function() { console.log('clean'); });
*/

gulp.task('exe:del', function (done) {
  console.log('delete exe');
  return del(['exe/*.exe'], done);
});

gulp.task('xml2html', function (done) {
  console.log('xml to html');
  done();
});

gulp.task('onCompileEnd', gulp.parallel('exe:del', 'xml2html', function (done) {
  console.log('onCompileEnd');
  done();
}));

gulp.task('finalize', gulp.series('onCompileEnd', function (done) {
  console.log('finalize');
  done();
}));

/*
gulp.task('default', gulp.series('onCompileEnd', function(done) { 
  const { spawn, exec } = require('child_process');
  const fs = require("fs");
  const libxmljs = require("libxmljs");

  fs.readdir(__dirname + "\\cs", function(err, files) {
    if (err) 
       return console.error(err);
    
    fileNames = "";
    files.forEach((fileName) => {
      fileNames += " cs\\" + fileName;
    });
    console.log(fileNames);
    exec('csc' + ' /out:exe\\src.exe' + ' /doc:xml\\src.xml' + fileNames, function() {
      console.log('finish compiling');
      gulp.task('finalize')();

      fs.readFile(__dirname + '\\xml\\src.xml', 'utf8', function(err, data) {
        var xmlDoc = libxmljs.parseXmlString(data);
        var classes = xmlDoc.find('/doc/members/member[summary]');
        var members = xmlDoc.find('/doc/members/member');
        
        var ndxClasses = 0;
        for (var ndx in members) {
          if (classes[ndxClasses] && members[ndx].attr('name').value() === classes[ndxClasses].attr('name').value()) {
            ++ndxClasses;
          }
          else {
            classes[ndxClasses - 1].addChild(members[ndx]);
          }
        }
        var xmls = [];
        
        classes.forEach((value) => {
          var doc = new libxmljs.Document();
          doc.node('members').addChild(value);
          xmls.push(doc);
        });
        xmls.forEach((xml) => {
          console.log(xml.toString());
          console.log('\n');
        })
      });
    });
  });
  done(); 
}));
*/

gulp.task('default', gulp.series('onCompileEnd', function (done) {
  const { spawn, exec } = require('child_process');
  const fs = require("fs");
  const libxmljs = require("libxmljs");

  var csFileRelPaths = [];
  var searchFiles = function (dirRoot, dirCurrent) {
    var dir = (dirCurrent == undefined) ? dirRoot : (dirRoot + "\\" + dirCurrent);

    var fileNames = fs.readdirSync(dir);
    fileNames.forEach((fileName) => {
      var filePath = dir + "\\" + fileName;
      var fileRelPath = (dirCurrent == undefined) ? fileName : (dirCurrent + "\\" + fileName);
      var fileStats = fs.lstatSync(filePath);
      if (fileStats.isDirectory()) {
        arguments.callee(dirRoot, fileRelPath);
      }
      else if (fileStats.isFile()) {
        var fileNameSplitted = fileName.split('.');
        if (fileNameSplitted[fileNameSplitted.length - 1] === 'cs')
          csFileRelPaths.push(fileRelPath);
      }
    });
  };
  searchFiles(__dirname);

  var csFileRelPathStr = "";
  csFileRelPaths.forEach((relPath) => {
    csFileRelPathStr += " " + relPath;
  });
  console.log(csFileRelPathStr);

  exec('csc' + ' /out:exe\\src.exe' + ' /doc:xml\\src.xml' + csFileRelPathStr, function () {
    console.log('finish compiling');
    gulp.task('finalize')();

    fs.readFile(__dirname + '\\xml\\src.xml', 'utf8', function (err, data) {
      var xmlDoc = libxmljs.parseXmlString(data);
      var classes = xmlDoc.find('/doc/members/member[summary]');
      var members = xmlDoc.find('/doc/members/member');

      var ndxClasses = 0;
      for (var ndx in members) {
        if (classes[ndxClasses] && members[ndx].attr('name').value() === classes[ndxClasses].attr('name').value()) {
          ++ndxClasses;
        }
        else {
          classes[ndxClasses - 1].addChild(members[ndx]);
        }
      }

      var xmlDocs = [];
      classes.forEach((value) => {
        var xmlDoc = new libxmljs.Document();
        xmlDoc.node('members').addChild(value);
        xmlDocs.push(xmlDoc);
      });
      xmlDocs.forEach((xmlDoc) => {
        console.log(xmlDoc.toString());
        console.log('\n');
      })
    });
  });

  done();
}));
