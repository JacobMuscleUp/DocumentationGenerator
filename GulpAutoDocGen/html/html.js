function stringFormat() {
    a = this;
    for (k in arguments) {
        a = a.replace("{" + k + "}", arguments[k]);
    }
    return a;
}
String.prototype.format = stringFormat;

var ids = { selectClass: 'selectClass' };

var flagNav2Class = false;
function nav2Class(id) {
    var elemClassName = document.getElementById(id);
    if (flagNav2Class) {
        flagNav2Class = false;
        if (elemClassName.value != 'default')
            window.location.href = '{0}.html'.format(elemClassName.value);
    }
    else
        flagNav2Class = true;
    //window.location.href = '{0}.html'.format(elemClassName.value);
}

window.onload = function () {
    var elemSearchField = document.getElementById('searchField')
        , elemSelectClass = document.getElementById('selectClass')
        , elemSearchBar = document.getElementById('search-bar')
        , elemSearchMenu = document.getElementById('search-menu');
    var classNameList = [];

    for (var i = 0, iEnd = elemSelectClass.options.length; i < iEnd; ++i)
        classNameList.push(elemSelectClass.options[i].value);
    elemSearchField.addEventListener('click', () => {
        if (elemSearchField.value === 'search classes')
            elemSearchField.value = '';
    });
    elemSearchField.addEventListener('keyup', () => {
        var currentClassNameList = classNameList.slice(0, classNameList.length);
        var keyword = elemSearchField.value;
        for (var i = currentClassNameList.length - 1; i >= 0; --i) {
            if (currentClassNameList[i].length < keyword.length) {
                currentClassNameList.splice(i, 1);
                continue;
            }
            for (var j = keyword.length - 1; j >= 0; --j) {
                if (currentClassNameList[i].charAt(j).toLowerCase() != keyword.charAt(j).toLowerCase()) {
                    currentClassNameList.splice(i, 1);
                    break;
                }
            }
        }
        for (var i = elemSelectClass.options.length - 1; i >= 0; --i)
            elemSelectClass.remove(i);
        currentClassNameList.forEach((className) => {
            var elemOption = document.createElement('option');
            elemOption.text = className;
            elemSelectClass.add(elemOption);
        });
    });
    
    elemSelectClass.addEventListener('click', () => {
        if (flagNav2Class) {
            flagNav2Class = false;
            if (elemSelectClass.value != 'default')
                window.location.href = '{0}.html'.format(elemSelectClass.value);
        }
        else
            flagNav2Class = true;
    });
    
    elemSelectClass.addEventListener('mouseleave', () => {
        flagNav2Class = false;
    });

    elemSearchBar.addEventListener('keyup', () => {
        var filter = elemSearchBar.value.toLowerCase();
        var elemMenuOptions = elemSearchMenu.getElementsByTagName('li');
        Array.prototype.forEach.call(elemMenuOptions, (li) => {
            var a = li.getElementsByTagName('a')[0];
            if (a.innerHTML.toLowerCase().indexOf(filter) !== -1)
                li.style.display = '';
            else
                li.style.display = 'none';
        });
    });

    elemSearchBar.addEventListener('click', () => {
        elemSearchBar.placeholder = '';
    });
};