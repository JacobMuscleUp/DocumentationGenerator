const fs = require('fs');
const utils = require('./utils');

module.exports = {
    genFileHTML0: function (path, classNames, callback) {
        var txtFront = fs.readFileSync('template0.html', 'utf8')
            , txtBack = fs.readFileSync('template1.html', 'utf8')
            , txtMiddle = ''
            , txt;

        classNames.sort();

        var elemClass = this.get('/doc/members/member')
            , elemMembers = this.find('{0}/member'.format(elemClass.path()))
            , classPathTyped = elemClass.attr('name').value()
            , classPathSplit = classPathTyped.split(':')[1].split('.')
            , className = classPathSplit[classPathSplit.length - 1]
            , classNamespace = 'None';
        for (var i = 0, iEnd = classPathSplit.length - 1; i < iEnd; ++i)
            classNamespace = (classNamespace === 'None') ? classPathSplit[i] : '{0}.{1}'.format(classNamespace, classPathSplit[i])

        txtMiddle += '<h1>Namespace: {0}</h1>'.format(classNamespace);
        txtMiddle += '<ul><b>{0}</b>'.format(className);
        txtMiddle += '<li>{0}</li>'.format(this.get('{0}/summary'.format(elemClass.path())).text().trim());
        elemMembers.forEach((elemMember) => {// iterate members
            var elemMemberSummaries = this.find(elemMember.path() + '/summary')
                , elemMemberSummary1st = elemMemberSummaries[0]
                , attrType = elemMemberSummary1st ? elemMemberSummary1st.attr('type') : undefined
                , memberPathTyped = elemMember.attr('name').value()
                , memberPathTypedSplit = memberPathTyped.split(':')
                , memberPathSplit = memberPathTypedSplit[1].split('.')
                , memberType = memberPathTypedSplit[0]
                , memberName = '';
            for (var i = classPathSplit.length, iEnd = memberPathSplit.length; i < iEnd; ++i)
                memberName = (memberName === '') ? memberPathSplit[i] : '{0}.{1}'.format(memberName, memberPathSplit[i])

            txtMiddle += '<li>{0}(<i><b>{1}</b></i>)'.format(memberName, memberType)
                + (attrType
                    ? ('(<b><a href="{0}.html">{1}</a></b>)'.format(attrType.value(), attrType.value()))
                    : '');
            txtMiddle += '<ul>';
            for (var i in elemMemberSummaries)
                txtMiddle += '<li>{0}</li>'.format(elemMemberSummaries[i].text().trim());
            txtMiddle += '</ul>';
            txtMiddle += '</li>'
        });
        txtMiddle += '</ul>';

        txtMiddle += '<input id="searchField" type="text" value="search classes"></input>';

        txtMiddle += '<select id="selectClass" onchange="nav2Class(ids.selectClass)">';
        txtMiddle += '<option value="" selected disabled hidden>Select a class</option>';
        classNames.forEach((className) => {
            txtMiddle += '<option value="{0}">{1}</option>'.format(className, className);
        });
        txtMiddle += '</select>';

        txt = txtFront + txtMiddle + txtBack;

        fs.writeFile(path, txt, (err) => {
            if (err) throw err;
            callback(path);
        });
    }

    , genFileHTML: function (path, classNames, callback) {
        var txtFront = fs.readFileSync('template0.html', 'utf8')
            , txtBack = fs.readFileSync('template1.html', 'utf8')
            , txtMiddle = ''
            , txt;

        classNames.sort();

        // INIT
        var elemClass = this.get('/doc/members/member')
            , elemMembers = this.find('{0}/member'.format(elemClass.path()))
            , classPathTyped = elemClass.attr('name').value()
            , classPathSplit = classPathTyped.split(':')[1].split('.')
            , className = classPathSplit[classPathSplit.length - 1]
            , classNamespace = 'None';
        for (var i = 0, iEnd = classPathSplit.length - 1; i < iEnd; ++i)
            classNamespace = (classNamespace === 'None') ? classPathSplit[i] : '{0}.{1}'.format(classNamespace, classPathSplit[i])
        //! INIT

        txtMiddle += '<h1>Namespace: {0}</h1>'.format(classNamespace);
        txtMiddle += '<ul><b>{0}</b>'.format(className);
        txtMiddle += '<li>{0}</li>'.format(this.get('{0}/summary'.format(elemClass.path())).text().trim());

        var mapMemberType2TxtList = {};
        elemMembers.forEach((elemMember) => {// iterate members
            // INIT
            var elemMemberSummaries = this.find(elemMember.path() + '/summary')
                , elemMemberSummary1st = elemMemberSummaries[0]
                , elemMemberReturn = this.get(elemMember.path() + '/returns')
                , elemMemberParams = this.find(elemMember.path() + '/param')
                , attrType = elemMemberSummary1st ? elemMemberSummary1st.attr('type') : undefined
                , memberPathTyped = elemMember.attr('name').value().replace("``1", "{T}")
                , memberPathTypedSplit = memberPathTyped.split(':')
                , memberPathSplit = memberPathTypedSplit[1].split('.')
                , memberType = memberPathTypedSplit[0]
                , memberName
                , txt = '';
            for (var i = classPathSplit.length, iEnd = memberPathSplit.length; i < iEnd; ++i)
                memberName = !memberName ? memberPathSplit[i] : '{0}.{1}'.format(memberName, memberPathSplit[i]);
            //! INIT

            if (memberType === 'M') {
                var tmpArr0 = memberName ? memberName.split('(') : undefined
                    , tmpArr1 = (tmpArr0 && tmpArr0[1]) ? tmpArr0[1].split(')') : undefined
                    , tmp0 = tmpArr1 ? tmpArr1[0] : undefined;
                if (tmp0) {
                    var argArray = tmp0.split(',');

                    memberName = '{0}(<b>'.format(tmpArr0[0]);
                    for (var i in argArray) {
                        var tmpArr2 = [];
                        argArray[i].split('.').forEach((val) => {
                            tmpArr2.push(val);
                        });
                        for (var j in tmpArr2) {
                            var val = tmpArr2[j];
                            memberName += !classNames.includes(val)
                                ? val : '<a href="{0}.html">{1}</a>'.format(val, val);
                            if (j < tmpArr2.length - 1)
                                memberName += '.';
                        }
                        /*
                        memberName += !classNames.includes(argArray[i])
                          ? argArray[i] : '<a href="{0}.html">{1}</a>'.format(argArray[i], argArray[i]);
                        */
                        if (i < argArray.length - 1)
                            memberName += ', ';
                    }
                    memberName += '</b>){0}'.format(tmpArr1[1]);
                }
                else {
                    memberName += '()';
                }
            }

            // MEMBER INFO
            txt += '<li>{0}{1}'.format('{0} '.format(
                (memberType === 'M') && attrType
                    ? '<b>{0}</b>'.format(
                        !classNames.includes(attrType.value())
                            ? attrType.value() : '<a href="{0}.html">{1}</a>'.format(attrType.value(), attrType.value()))
                    : '')
                , memberName);
            //txt += '<li>{0}(<i><b>{1}</b></i>)'.format(memberName, memberType);
            txt +=
                (memberType === 'F') && attrType
                    ? '(<b>{0}</b>)'.format(
                        !classNames.includes(attrType.value())
                            ? attrType.value() : '<a href="{0}.html">{1}</a>'.format(attrType.value(), attrType.value()))
                    //? ('(<b><a href="{0}.html">{1}</a></b>)'.format(attrType.value(), attrType.value()))
                    : '';
            txt += '<ul>';
            for (var i in elemMemberSummaries)
                txt += '<li>{0}</li>'.format(elemMemberSummaries[i].text().trim());
            if (elemMemberReturn)
                txt += '<li><i>@return</i>: {0}</li>'.format(elemMemberReturn.text().trim());
            for (var i in elemMemberParams) {
                var attrName = elemMemberParams[i].attr('name');
                txt += '<li><i>@param</i> {0}: {1}</li>'.format(attrName ? attrName.value() : 'undefined', elemMemberParams[i].text().trim());
            }
            txt += '</ul>';
            txt += '</li>';
            //! MEMBER INFO

            mapMemberType2TxtList[memberType] = mapMemberType2TxtList[memberType] || [];
            mapMemberType2TxtList[memberType].push(txt);
        });
        for (var memberType in mapMemberType2TxtList) {
            txtMiddle += '<li><ul><i><b>{0}</b></i>'.format(utils.formalMemberType(memberType));
            var txtList = mapMemberType2TxtList[memberType];
            txtList.forEach((txt) => {
                txtMiddle += txt;
            });
            txtMiddle += '</ul></li>';
        }
        txtMiddle += '</ul>';// txtMiddle += '<ul><b>{0}</b>'.format(className);

        {// SEARCH MENU DROPDOWN
            txtMiddle += '<input id="searchField" type="text" value="search classes"></input>';

            txtMiddle += '<select id="selectClass">';
            //txtMiddle += '<select id="selectClass" onclick="nav2Class(ids.selectClass)">';
            txtMiddle += '<option value="default" selected disabled hidden>Select a class</option>';
            classNames.forEach((className) => {
                txtMiddle += '<option value="{0}">{1}</option>'.format(className, className);
            });
            txtMiddle += '</select>';
        }

        {// SEARCH MENU
            txtSearchMenuOptions = '';
            classNames.forEach((className) => {
                txtSearchMenuOptions += '<li><a href="{0}.html">{1}</a></li>'.format(className, className);
            });
            txtMiddle += '<div class="search-bar">';
            txtMiddle += '<input type="text" id="search-bar" placeholder="search"/>';
            txtMiddle += '</div>';
            txtMiddle += '<div id="search-menu">';
            txtMiddle +=
                '<ul> \
                {0} \
                </ul>'.format(txtSearchMenuOptions);
            txtMiddle += '</div>';
        }

        txt = txtFront + txtMiddle + txtBack;

        fs.writeFile(path, txt, (err) => {
            if (err) throw err;
            callback(path);
        });
    }

    , genFileHTMLFormatted: function (path, classNames, callback) {
        var txtFront = fs.readFileSync('template0.html', 'utf8')
            , txtBack = fs.readFileSync('template1.html', 'utf8')
            , txtMiddle = ''
            , txt;

        classNames.sort();

        // INIT
        var elemClass = this.get('/doc/members/member')
            , elemMembers = this.find('{0}/member'.format(elemClass.path()))
            , classPathTyped = elemClass.attr('name').value()
            , classPathSplit = classPathTyped.split(':')[1].split('.')
            , className = classPathSplit[classPathSplit.length - 1]
            , classNamespace = 'None';
        for (var i = 0, iEnd = classPathSplit.length - 1; i < iEnd; ++i)
            classNamespace = (classNamespace === 'None') ? classPathSplit[i] : '{0}.{1}'.format(classNamespace, classPathSplit[i])
        //! INIT

        txtMiddle += '\n\t\t<h1> \
                      \n\t\t\tNamespace: {0} \
                      \n\t\t</h1>'.format(classNamespace);
        txtMiddle += '\n\t\t<ul><b>{0}</b>'.format(className);
        txtMiddle += '\n\t\t\t<li> \
                      \n\t\t\t\t{0} \
                      \n\t\t\t</li>'.format(this.get('{0}/summary'.format(elemClass.path())).text().trim());

        var mapMemberType2TxtList = {};
        elemMembers.forEach((elemMember) => {// iterate members
            // INIT
            var elemMemberSummaries = this.find(elemMember.path() + '/summary')
                , elemMemberSummary1st = elemMemberSummaries[0]
                , elemMemberReturn = this.get(elemMember.path() + '/returns')
                , elemMemberParams = this.find(elemMember.path() + '/param')
                , attrType = elemMemberSummary1st ? elemMemberSummary1st.attr('type') : undefined
                , memberPathTyped = elemMember.attr('name').value().replace("``1", "{T}")
                , memberPathTypedSplit = memberPathTyped.split(':')
                , memberPathSplit = memberPathTypedSplit[1].split('.')
                , memberType = memberPathTypedSplit[0]
                , memberName
                , txt = '';
            for (var i = classPathSplit.length, iEnd = memberPathSplit.length; i < iEnd; ++i)
                memberName = !memberName ? memberPathSplit[i] : '{0}.{1}'.format(memberName, memberPathSplit[i])
            //! INIT

            if (memberType === 'M') {
                var tmpArr0 = memberName ? memberName.split('(') : undefined
                    , tmpArr1 = (tmpArr0 && tmpArr0[1]) ? tmpArr0[1].split(')') : undefined
                    , tmp0 = tmpArr1 ? tmpArr1[0] : undefined;
                if (tmp0) {
                    var argArray = tmp0.split(',');

                    memberName = '{0}(<b>'.format(tmpArr0[0]);
                    for (var i in argArray) {
                        var tmpArr2 = [];
                        argArray[i].split('.').forEach((val) => {
                            tmpArr2.push(val);
                        });
                        for (var j in tmpArr2) {
                            var val = tmpArr2[j];
                            memberName += !classNames.includes(val)
                                ? val : '<a href="{0}.html">{1}</a>'.format(val, val);
                            if (j < tmpArr2.length - 1)
                                memberName += '.';
                        }
                        if (i < argArray.length - 1)
                            memberName += ', ';
                    }
                    memberName += '</b>){0}'.format(tmpArr1[1]);
                }
                else {
                    memberName += '()';
                }
            }

            // MEMBER INFO
            txt += '\n\t\t\t\t\t<li>{0}{1}'.format('{0} '.format(
                (memberType === 'M') && attrType
                    ? '<b>{0}</b>'.format(
                        !classNames.includes(attrType.value())
                            ? attrType.value() : '<a href="{0}.html">{1}</a>'.format(attrType.value(), attrType.value()))
                    : '')
                , memberName);
            //txt += '<li>{0}(<i><b>{1}</b></i>)'.format(memberName, memberType);
            txt +=
                (memberType === 'F') && attrType
                    ? '(<b>{0}</b>)'.format(
                        !classNames.includes(attrType.value())
                            ? attrType.value() : '<a href="{0}.html">{1}</a>'.format(attrType.value(), attrType.value()))
                    //? ('(<b><a href="{0}.html">{1}</a></b>)'.format(attrType.value(), attrType.value()))
                    : '';
            txt += '\n\t\t\t\t\t\t<ul>';
            for (var i in elemMemberSummaries)
                txt += '\n\t\t\t\t\t\t\t<li> \
                    \n\t\t\t\t\t\t\t\t{0} \
                    \n\t\t\t\t\t\t\t</li>'.format(elemMemberSummaries[i].text().trim());
            if (elemMemberReturn)
                txt += '\n\t\t\t\t\t\t\t<li><i>@return</i>:  \
                    \n\t\t\t\t\t\t\t\t{0} \
                    \n\t\t\t\t\t\t\t</li>'.format(elemMemberReturn.text().trim());
            for (var i in elemMemberParams) {
                var attrName = elemMemberParams[i].attr('name');
                txt += '\n\t\t\t\t\t\t\t<li><i>@param</i> {0}:  \
                    \n\t\t\t\t\t\t\t\t{1} \
                    \n\t\t\t\t\t\t\t</li>'.format(attrName ? attrName.value() : 'undefined', elemMemberParams[i].text().trim());
            }
            txt += '\n\t\t\t\t\t\t</ul>';
            txt += '\n\t\t\t\t\t</li>';
            //! MEMBER INFO

            mapMemberType2TxtList[memberType] = mapMemberType2TxtList[memberType] || [];
            mapMemberType2TxtList[memberType].push(txt);
        });
        for (var memberType in mapMemberType2TxtList) {
            txtMiddle += '\n\t\t\t<li> \
                        \n\t\t\t\t<ul><i><b>{0}</b></i>'.format(utils.formalMemberType(memberType));
            var txtList = mapMemberType2TxtList[memberType];
            txtList.forEach((txt) => {
                txtMiddle += txt;
            });
            txtMiddle += '\n\t\t\t\t</ul> \
                        \n\t\t\t</li>';
        }

        txtMiddle += '\n\t\t</ul>';

        txtMiddle += '\n\t\t<input id="searchField" type="text" value="search classes"></input>';

        txtMiddle += '\n\t\t<select id="selectClass">';
        //txtMiddle += '<select id="selectClass" onclick="nav2Class(ids.selectClass)">';
        txtMiddle += '\n\t\t\t<option value="default" selected disabled hidden>Select a class</option>';
        classNames.forEach((className) => {
            txtMiddle += '\n\t\t\t<option value="{0}">{1}</option>'.format(className, className);
        });
        txtMiddle += '\n\t\t</select>';

        txt = txtFront + txtMiddle + '\n' + txtBack;

        fs.writeFile(path, txt, (err) => {
            if (err) throw err;
            callback(path);
        });
    }
};