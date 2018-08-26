const gulp = require('gulp');
const del = require('del');
const { spawn, exec } = require('child_process');
const fs = require("fs");
const libxmljs = require("libxmljs");
const utils = require('./js/utils');
const html = require('./js/html')
const markdown = require('./js/markdown');
const xml = require('./js/xml');

String.prototype.format = utils.stringFormat;

libxmljs.Document.prototype.genFileXML = xml.genFileXML;

libxmljs.Document.prototype.genFileMarkdown = markdown.genFileMarkdown;

libxmljs.Document.prototype.genFileHTML0 = html.genFileHTML0;
libxmljs.Document.prototype.genFileHTML = html.genFileHTML;
libxmljs.Document.prototype.genFileHTMLFormatted = html.genFileHTMLFormatted;

libxmljs.Document.prototype.splitIncorrect = function () {
  var xmlDocs = [];

  //var classes = xmlDoc.find('/doc/members/member[summary]');
  var classes = [], members = this.find('/doc/members/member');
  members.forEach((member) => {
    var memberName = member.attr('name').value();
    var memberNameSplit = memberName.split(':');
    if (memberNameSplit[0] === 'T')
      classes.push(member);
  });

  var ndxClasses = 0;
  for (var ndx in members) {
    if (classes[ndxClasses] && members[ndx].attr('name').value() === classes[ndxClasses].attr('name').value()) {
      ++ndxClasses;
    }
    else {
      classes[ndxClasses - 1].addChild(members[ndx]);
    }
  }

  classes.forEach((elemClass) => {
    var xmlDoc = new libxmljs.Document();
    xmlDoc.node('doc')
      .node('members').addChild(elemClass);
    xmlDocs.push(xmlDoc);
  });

  return xmlDocs;
}

libxmljs.Document.prototype.split = function () {
  var xmlDocs = [];
  var classes = [], members = this.find('/doc/members/member');

  // NEW CHECK
  var memberClassName;
  for (var i = 0; i < members.length; ++i) {
    var memberName = members[i].attr('name').value();
    var memberNameSplit = memberName.split(':');
    //var memberPathSplit = memberNameSplit[1].split('.');
    var memberPathSplit = memberNameSplit[1].split('(')[0].split('.');
    var tmpName = undefined;

    if (memberClassName) {
      var memberClassNameSplit = memberClassName.split('.');
      //for (var j = 0, jEnd = memberClassNameSplit.length; j < jEnd; ++j)
      for (var j = 0, jEnd = utils.min(memberClassNameSplit.length, memberPathSplit.length - 1); j < jEnd; ++j)
        tmpName = !tmpName ? memberPathSplit[j] : '{0}.{1}'.format(tmpName, memberPathSplit[j]);
    }

    if (i === 0) {
      if (memberNameSplit[0] !== 'T') {
        for (var j = 0, jEnd = memberPathSplit.length - 1; j < jEnd; ++j)
          tmpName = !tmpName ? memberPathSplit[j] : '{0}.{1}'.format(tmpName, memberPathSplit[j]);
        memberClassName = tmpName;
        var prevSibling = new libxmljs.Element(this, 'member').attr({ name: 'T:{0}'.format(memberClassName) });
        prevSibling.node('summary', 'Missing Description');
        members[i].addPrevSibling(prevSibling);
      }
      else
        memberClassName = memberNameSplit[1];
    }
    else if (memberNameSplit[0] === 'T') {
      memberClassName = memberNameSplit[1];
    }
    else if (tmpName !== memberClassName) {
      memberClassName = tmpName;
      var prevSibling = new libxmljs.Element(this, 'member').attr({ name: 'T:{0}'.format(memberClassName) });
      prevSibling.node('summary', 'Missing Description');
      members[i].addPrevSibling(prevSibling);
    }
  }
  members = this.find('/doc/members/member');

  //var doc = new libxmljs.Document();
  //doc.root(this.get('/doc'));
  //console.log(doc.toString());
  //! NEW CHECK

  members.forEach((member) => {
    var memberName = member.attr('name').value();
    var memberNameSplit = memberName.split(':');
    if (memberNameSplit[0] === 'T')
      classes.push(member);
  });

  var ndxClasses = 0;
  for (var ndx in members) {
    if (classes[ndxClasses] && members[ndx].attr('name').value() === classes[ndxClasses].attr('name').value()) {
      ++ndxClasses;
    }
    else {
      classes[ndxClasses - 1].addChild(members[ndx]);
    }
  }

  classes.forEach((elemClass) => {
    var xmlDoc = new libxmljs.Document();
    xmlDoc.node('doc')
      .node('members').addChild(elemClass);
    xmlDocs.push(xmlDoc);
  });

  return xmlDocs;
}

libxmljs.Document.prototype.split0 = function () {
  var xmlDocs = [];

  var classes = [], members = this.find('/doc/members/member'), classElems = [];
  members.forEach((member) => {
    var memberName = member.attr('name').value();
    var memberNameSplit = memberName.split(':');
    if (memberNameSplit[0] === 'T')
      classes.push(member);
  });

  for (var i in classes) {
    classElems.push(new Array());
    classElems[i].push(classes[i]);
  }

  /*for (var i = 0, iEnd = classes.length - 1; i < iEnd; ++i) {
    classElems.push(new Array());
    classElems[i].push(classes[i]);
  }*/

  var ndxClasses = 0;
  for (var ndx in members) {
    if (classes[ndxClasses] && members[ndx].attr('name').value() === classes[ndxClasses].attr('name').value()) {
      ++ndxClasses;
    }
    else {
      classElems[ndxClasses - 1].push(members[ndx]);
      //classes[ndxClasses - 1].addChild(members[ndx]);
    }
  }

  classes.forEach((elemClass) => {
    var xmlDoc = new libxmljs.Document();
    var node = xmlDoc
      .node('doc')
      .node('members');
    classElems.forEach((classElem) => {
      node.addChild(classElem);
    });
    //xmlDoc.node('doc')
    //  .node('members').addChild(elemClass);
    xmlDocs.push(xmlDoc);
  });

  return xmlDocs;
}

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

gulp.task('default', gulp.series('onCompileEnd', function (done) {
  const args = (argList => {
    let args = {}, opt, optTrimmed, optCurrent;
    for (var ndx = 0; ndx < argList.length; ++ndx) {
      optTrimmed = argList[ndx].trim();
      opt = optTrimmed.replace(/^\-+/, '');

      // argument value
      if (opt === optTrimmed) {
        if (optCurrent)
          args[optCurrent] = opt;
        optCurrent = null;
      }
      // argument name
      else {
        optCurrent = opt;
        args[optCurrent] = true;
      }
    }
    return args;
  })(process.argv);
  console.log(args);

  const dirFullPath = args['a'] || __dirname;
  const dirRelPath = (args['a'] ? (args['a'] + '\\') : '');

  var csFileRelPaths = [];
  var searchFiles = function (dirRoot, dirCurrent) {
    var dir = !dirCurrent ? dirRoot : (dirRoot + '\\' + dirCurrent);

    var fileNames = fs.readdirSync(dir);
    fileNames.forEach((fileName) => {
      var filePath = dir + '\\' + fileName;
      var fileRelPath = !dirCurrent ? fileName : (dirCurrent + '\\' + fileName);
      var fileStats = fs.lstatSync(filePath);
      if (fileStats.isDirectory()) {
        arguments.callee(dirRoot, fileRelPath);
      }
      else if (fileStats.isFile()) {
        var fileNameSplitted = fileName.split('.');
        if (fileNameSplitted[fileNameSplitted.length - 1] === 'cs')
          csFileRelPaths.push(args['a'] ? utils.cscValidPath(args['a'] + '\\' + fileRelPath) : utils.cscValidPath(fileRelPath));
      }
    });
  };
  searchFiles(dirFullPath);

  var csFileRelPathSeq = "";
  csFileRelPaths.forEach((relPath) => {
    csFileRelPathSeq += " " + relPath;
  });
  //console.log(csFileRelPathSeq);

  var refDllPaths, csprojPath, refDllPathSeq;
  var dirFullPathSplit = dirFullPath.split('\\');
  var projName = args['c'] || dirFullPathSplit[dirFullPathSplit.length - 1];
  if (fs.existsSync(csprojPath = dirFullPath + '\\' + projName + '.xml')) {
    var csprojStr = fs.readFileSync(csprojPath, 'utf8');
    var csprojDoc = libxmljs.parseXmlString(csprojStr);
    var refDllPathNodes = csprojDoc.find('/Project/ItemGroup/Reference[HintPath]');
    refDllPaths = refDllPathNodes.map(dllPathNode => utils.cscValidPath((args['a'] ? (dirFullPath + '\\') : '') + dllPathNode.text().trim()));
    // optional
    refDllPathNodes.forEach((dllPathNode) => {
      var dllPath = utils.cscValidPath(dllPathNode.text().trim());
      refDllPathSeq ? (refDllPathSeq += ',' + dllPath) : (refDllPathSeq = dllPath);
    });
    //! optional
  }

  if (!fs.existsSync(dirFullPath + '\\exe'))
    fs.mkdirSync(dirFullPath + '\\exe');
  if (!fs.existsSync(dirFullPath + '\\xml'))
    fs.mkdirSync(dirFullPath + '\\xml');
  if (!fs.existsSync(dirFullPath + '\\html'))
    fs.mkdirSync(dirFullPath + '\\html');
  if (!fs.existsSync(dirFullPath + '\\md'))
    fs.mkdirSync(dirFullPath + '\\md');

  var cmd
    = 'csc'
    + ' /out:' + utils.cscValidPath(dirRelPath + 'exe\\prog.exe')
    + ' /doc:' + utils.cscValidPath(dirRelPath + 'xml\\index.xml');
  if (refDllPaths) {
    refDllPaths.forEach((dllPath) => {
      cmd += ' /r:' + dllPath;
    });
  }
  cmd += csFileRelPathSeq;
  var projFilePath = dirRelPath + projName + '.csproj';
  if (args['b'] && fs.existsSync(projFilePath))
    cmd = 'msbuild' + ' ' + utils.cscValidPath(projFilePath) + ' /p:DocumentationFile=xml\\index.xml';
  console.log(cmd);

  exec(cmd, function () {
    console.log('finish compiling');
    gulp.task('finalize')();

    fs.readFile(dirFullPath + '\\xml\\index.xml', 'utf8', function (err, data) {
      var xmlDoc = libxmljs.parseXmlString(data);

      var xmlDocs = xmlDoc.split()
        , mapXmlDoc2ClassName = {};
      xmlDocs.forEach((xmlDoc) => {
        var classPathSplit = (xmlDoc.get('/doc/members/member').attr('name').value().split(':'))[1].split('.');
        mapXmlDoc2ClassName[xmlDoc] = classPathSplit[classPathSplit.length - 1];
        //mapXmlDoc2ClassName[xmlDoc] = (xmlDoc.child(0).child(0).attr('name').value().split(':'))[1];
      });
      var classNames = utils.values(mapXmlDoc2ClassName);

      xmlDocs.forEach((xmlDoc) => {
        //console.log(xmlDoc.toString());
        //console.log('\n');

        var className = mapXmlDoc2ClassName[xmlDoc];
        xmlDoc.genFileXML(dirFullPath + '\\xml\\' + (className + '.xml'), (path) => {
          console.log(path + ' has been saved!');
        });
        xmlDoc.genFileHTML(dirFullPath + '\\html\\' + (className + '.html'), classNames, (path) => {
          console.log(path + ' has been saved!');
        });
        if (args['d'])
          xmlDoc.genFileMarkdown(dirFullPath + '\\md\\' + (className + '.md'), classNames, (path) => {
            console.log(path + ' has been saved!');
          });
      })// xmlDocs.forEach((xmlDoc) => {
      fs.copyFile('html_script_style\\html.js', '{0}\\html\\html.js'.format(dirFullPath), (err) => {
        console.log('html.js has been copied');
      });
      fs.copyFile('html_script_style\\main.css', '{0}\\html\\main.css'.format(dirFullPath), (err) => {
        console.log('main.css has been copied');
      });
    });// fs.readFile(dirFullPath + '\\xml\\index.xml', 'utf8', function (err, data) {
  });// exec(cmd, function () {

  done();
}));

//gulp jekyll --a "C:\Users\Jacob\Documents\jekyll test\testSite" --b "C:\Users\Jacob\LoopDir" --c "C:\Users\Jacob\Documents\jekyll test\testSite\_pages" --d 15
gulp.task('jekyll', function (done) {
  const args = utils.args(process.argv);
  var cmd = 'start /wait "jekyll" cmd /c jekyll_build "{0}" "{1}" "{2}" {3}'.format(args['a'], args['b'], args['c'], args['d']);
  exec(cmd, () => {
    fs.unlink('.jekyll-metadata', (err) => { });
    fs.unlink('{0}\\.jekyll-metadata'.format(args['a']), (err) => { });
    fs.unlink('{0}\\jekyll_build.bat'.format(args['a']), (err) => { });
    fs.unlink('{0}\\_site\\jekyll_build.bat'.format(args['a']), (err) => { });
  });
  done();
});

gulp.task('doxygen', function (done) {
  const args = utils.args(process.argv);
  var doxyFilePath = '{0}\\Doxyfile'.format(args['b']);
  if (fs.existsSync(doxyFilePath))
    fs.unlink(doxyFilePath, (err) => { });
  var cmd = 'start /wait "doxygen" cmd /c doxygen_build "{0}" "{1}"'.format(args['a'], args['b']);
  exec(cmd, () => { });
  done();
});