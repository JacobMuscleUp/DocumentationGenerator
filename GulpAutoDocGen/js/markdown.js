const fs = require('fs');
const utils = require('./utils');

module.exports = {
    // applied to libxmljs.Document objects
    genFileMarkdown: function (path, classNames, callback) {
        var txt = '';

        var elemClass = this.get('/doc/members/member')
            , elemMembers = this.find('{0}/member'.format(elemClass.path()))
            , classPathTyped = elemClass.attr('name').value()
            , classPathSplit = classPathTyped.split(':')[1].split('.')
            , className = classPathSplit[classPathSplit.length - 1]
            , classNamespace = 'None';
        for (var i = 0, iEnd = classPathSplit.length - 1; i < iEnd; ++i)
            classNamespace = (classNamespace === 'None') ? classPathSplit[i] : '{0}.{1}'.format(classNamespace, classPathSplit[i])

        txt += '---\
                \nlayout: page\
                \ntitle: {0}\
                \npermalink: /{1}/\
                \n---'.format(className, className);
        txt += '\n';
        txt += '\nNamespace: {0}'.format(classNamespace);
        txt += '\n';
        txt += '\n**{0}**'.format(className);
        txt += '\n* {0}'.format(this.get('{0}/summary'.format(elemClass.path())).text().trim());

        //////////////////////////////////////////////
        /////////////////////////////
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

                    memberName = '{0}(*'.format(tmpArr0[0]);
                    for (var i in argArray) {
                        var tmpArr2 = [];
                        argArray[i].split('.').forEach((val) => {
                            tmpArr2.push(val);
                        });
                        for (var j in tmpArr2) {
                            var val = tmpArr2[j];
                            memberName += !classNames.includes(val)
                                ? val : '[{0}](../{1}/)'.format(val, val);
                            if (j < tmpArr2.length - 1)
                                memberName += '.';
                        }
                        if (i < argArray.length - 1)
                            memberName += ', ';
                    }
                    memberName += '*){0}'.format(tmpArr1[1]);
                }
                else {
                    memberName += '()';
                }
            }

            // MEMBER INFO
            txt += '\n\t* {0}{1}'.format('{0} '.format(
                (memberType === 'M') && attrType
                    ? '*{0}*'.format(
                        !classNames.includes(attrType.value())
                            ? attrType.value() : '[{0}](../{1}/)'.format(attrType.value(), attrType.value()))
                    : '')
                , memberName);
            txt +=
                (memberType === 'F') && attrType
                    ? '(*{0}*)'.format(
                        !classNames.includes(attrType.value())
                            ? attrType.value() : '[{0}](../{1}/)'.format(attrType.value(), attrType.value()))
                    : '';
            for (var i in elemMemberSummaries)
                txt += '\n\t\t* {0}'.format(elemMemberSummaries[i].text().trim());
            if (elemMemberReturn)
                txt += '\n\t\t* @return: {0}'.format(elemMemberReturn.text().trim());
            for (var i in elemMemberParams) {
                var attrName = elemMemberParams[i].attr('name');
                txt += '\n\t\t* @param {0}: {1}'.format(attrName ? attrName.value() : 'undefined', elemMemberParams[i].text().trim());
            }
            //! MEMBER INFO

            mapMemberType2TxtList[memberType] = mapMemberType2TxtList[memberType] || [];
            mapMemberType2TxtList[memberType].push(txt);
        });
        for (var memberType in mapMemberType2TxtList) {
            txt += '\n* *{0}*'.format(utils.formalMemberType(memberType));
            var txtList = mapMemberType2TxtList[memberType];
            txtList.forEach((txt0) => {
                txt += txt0;
            });
        }
        ////////////////////////////////////////
        ///////////////

        fs.writeFile(path, txt, (err) => {
            if (err) throw err;
            callback(path);
        });
    }
};