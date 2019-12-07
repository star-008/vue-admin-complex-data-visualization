import { SCORE_GRADE, ORDER_GRADE, GOODNESS_GRADE, EXAM_QUESTION_VOLUME } from './const';
import config from '../../../config/index.js';

var SIGN_REGEXP = /([yMdhsm])(\1*)/g;
var DEFAULT_PATTERN = 'yyyy-MM-dd';

function padding(s, len) {
    var len = len - (s + '').length;
    for (var i = 0; i < len; i++) { s = '0' + s; }
    return s;
};

export default {
    getQueryStringByName: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
    },
    getParamWithToken: function(params) {
        if (params == null) {
            params = {};
        }
        var user = JSON.parse(sms_store('sms-user'));
        params.token = user.token;
        return params;
    },
    formatDate: {
        format: function (date, pattern) {
            pattern = pattern || DEFAULT_PATTERN;
            return pattern.replace(SIGN_REGEXP, function ($0) {
                switch ($0.charAt(0)) {
                    case 'y': return padding(date.getFullYear(), $0.length);
                    case 'M': return padding(date.getMonth() + 1, $0.length);
                    case 'd': return padding(date.getDate(), $0.length);
                    case 'w': return date.getDay() + 1;
                    case 'h': return padding(date.getHours(), $0.length);
                    case 'm': return padding(date.getMinutes(), $0.length);
                    case 's': return padding(date.getSeconds(), $0.length);
                }
            });
        },
        parse: function (dateString, pattern) {
            var matchs1 = pattern.match(SIGN_REGEXP);
            var matchs2 = dateString.match(/(\d)+/g);
            if (matchs1.length == matchs2.length) {
                var _date = new Date(1970, 0, 1);
                for (var i = 0; i < matchs1.length; i++) {
                    var _int = parseInt(matchs2[i]);
                    var sign = matchs1[i];
                    switch (sign.charAt(0)) {
                        case 'y': _date.setFullYear(_int); break;
                        case 'M': _date.setMonth(_int - 1); break;
                        case 'd': _date.setDate(_int); break;
                        case 'h': _date.setHours(_int); break;
                        case 'm': _date.setMinutes(_int); break;
                        case 's': _date.setSeconds(_int); break;
                    }
                }
                return _date;
            }
            return null;
        }
    },
    formatNumber: function(val, precision) {
        if (val === null || val === '') return '';
        return Math.floor(val * Math.pow(10, precision)) / Math.pow(10, precision);
    },
    pickFileNameOnly: function(fileName) {
        return fileName.substring(0, fileName.lastIndexOf("."));
    },
    pickFileFormatOnly: function(fileName) {
        return fileName.substring(fileName.lastIndexOf('.')+1 , fileName.lastIndexOf(''));
    },
    setSession(user, autoLogin) {
        var jsonUser = JSON.stringify(user);
        sms_store('sms-user', jsonUser, autoLogin);
        sms_store('sms-token', user.token, autoLogin);
    },
    checkToken: function(promise) {
        promise.then((res) => {
            if (res.data.serverResult.resultCode == "-108") { // expired
                window.EventHub.$emit('token-is-expired');
            } else if (res.data.serverResult.resultCode == "-107") { // logged in on other machine
                window.EventHub.$emit('token-has-caught');
            } else if (res.data.serverResult.resultCode == "-100") { // not correct
                window.EventHub.$emit('token-is-invalid');
            }
        });

        return promise;
    },
    checkECOToken: function(promise, message) {
        promise.then((res) => {
        }).catch((err) => {
            console.log(err);
            message({
                message: '您的会话超时，请重新登录！',
                type: 'error'
            });
            window.EventHub.$emit('token-is-expired');
        });
        return promise;
    },
    getFileSize: function(sizeInByte, precision) {
        if (sizeInByte == null || isNaN(sizeInByte)) return '0Byte';

        if (sizeInByte < 1024) {
            return sizeInByte + 'B';
        } else if (sizeInByte < 1024 * 1024) {
            return Math.floor((sizeInByte / 1024) * Math.pow(10, precision)) / Math.pow(10, precision) + 'KB';
        } else if (sizeInByte < 1024 * 1024 * 1024) {
            return Math.floor((sizeInByte / 1024 / 1024) * Math.pow(10, precision)) / Math.pow(10, precision) + 'MB';
        } else {
            return Math.floor((sizeInByte / 1024 / 1024 / 1024) * Math.pow(10, precision)) / Math.pow(10, precision) + 'GB';
        }
    },
    formatDuration(seconds) {
        var hour = Math.floor(seconds / 3600);
        var min = Math.floor((seconds - 3600 * hour) / 60);
        var sec = seconds % 60;
        var result = '';
        if (hour == 0) {
            hour = '';
        } else {
            hour = hour + '时';
        }
        if (min == 0) {
            min = '';
        } else {
            min = min + '分';
        }
        if ((hour!=0 || min!=0) && sec == 0) {
            sec = '';
        } else {
            sec = sec + '秒';
        }
        result = hour + min + sec;

        return result + '中';
    },
    download: function(url) {
        var link = $('#download_iframe');
        link.attr('src', url);
    },
    getHtmlCode: function(str) {
        return decodeURI(str);
    },
    concat(source, items) {
        for (var i=0; i<items.length; i++) {
            source.push(items[i]);
        }
        return source;
    },
    password(str) {
        let newstr = str.replace(/\s/i, '');
        return newstr;
    },
    account(str) {
        let newstr = str.replace(/\s/i, '');
        do {
            str = newstr;
            newstr = str.replace(/[^\da-z_A-Z@\.&^\*-]/i, '');
        } while (newstr != str);
        return newstr;
    },
    alphanumeric(str) {
        let newstr = str.replace(/\s/i, '');
        do {
            str = newstr;
            newstr = str.replace(/[^\da-zA-Z]/i, '');
        } while (newstr != str);
        return newstr;
    },
    examname(str) {
        let newstr = str;
        do {
            str = newstr;
            newstr = str.replace(/[@&^\*]/i, '');
        } while (newstr != str);
        return newstr;
    },
    numeric(str, min, spaceenabled) {
        var newstr = (str+'').replace(/[^\d]/i, '');
        do {
            str = newstr;
            newstr = str.replace(/[^\d]/i, '');
        } while (newstr != str);
        if (newstr == '')  return spaceenabled?'':min;
        return Math.max(1, parseInt(newstr));
    },
    removeArrayItems(source, items) {
        for (var i=0; i<items.length; i++) {
            var index = source.indexOf(items[i]);
            source.splice(index, 1);
        }
        return source;
    },
    /////////////// User Management ///////////////
    getUser() {
        let user = JSON.parse(sms_store('sms-user'));
        return user;
    },
    isLoggedIn() {
        let user = JSON.parse(sms_store('sms-user'));
        if (user != null) return true;
        return false;
    },
    isStudent() {
        if (this.isLoggedIn()) {
            let user = JSON.parse(sms_store('sms-user'));
            if (user.roleIdList == null) return false;
            for (var i=0; i<user.roleIdList.length; i++) {
                if (user.roleIdList[i] == '1000000003') {
                    return true;
                }
            }
        }
        return false;
    },
    isTeacher() {
        if (this.isLoggedIn()) {
            let user = JSON.parse(sms_store('sms-user'));
            if (user.roleIdList == null) return false;
            for (var i=0; i<user.roleIdList.length; i++) {
                if (user.roleIdList[i] == '1000000002' ||
                    user.roleIdList[i] == '1000000007' ||
                    user.roleIdList[i] == '1000000009') {
                    return true;
                }
            }
        }
        return false;
    },
    isParent() {
        if (this.isLoggedIn()) {
            let user = JSON.parse(sms_store('sms-user'));
            if (user.roleIdList == null) return false;
            for (var i=0; i<user.roleIdList.length; i++) {
                if (user.roleIdList[i] == '1000000004') {
                    return true;
                }
            }
        }
        return false;
    },
    isManager() {
        if (this.isLoggedIn()) {
            let user = JSON.parse(sms_store('sms-user'));
            if (user.roleIdList == null) return false;
            for (var i=0; i<user.roleIdList.length; i++) {
                if (user.roleIdList[i] == '1000000001' || 
                    user.roleIdList[i] == '1000000005' || 
                    user.roleIdList[i] == '1000000006' || 
                    user.roleIdList[i] == '10000000010' ||
                    user.roleIdList[i] == '10000000011') {
                    return true;
                }
            }
        }
        return false;
    },
    isScoreManager() {
        if (this.isLoggedIn()) {
            let user = JSON.parse(sms_store('sms-user'));
            if (user.roleIdList == null) return false;
            for (var i=0; i<user.roleIdList.length; i++) {
                if (user.roleIdList[i] == '10000000011') {
                    return true;
                }
            }
        }
        return false;
    },
    /*** only teacher, parent, manager is allowed but student ***/
    isAllowed(user) {
        if (user.roleIdList == null) return false;
        for (var i=0; i<user.roleIdList.length; i++) {
            if (user.roleIdList[i] == '1000000001' || 
                user.roleIdList[i] == '1000000002' || 
                user.roleIdList[i] == '1000000004' || 
                user.roleIdList[i] == '1000000005' || 
                user.roleIdList[i] == '1000000006' || 
                user.roleIdList[i] == '1000000007' || 
                user.roleIdList[i] == '1000000009' || 
                user.roleIdList[i] == '10000000010' || 
                user.roleIdList[i] == '10000000011') {
                return true;
            }
        }
        return false;
    },
    /////////////// User Management End ///////////////

    composeSysDict(dictitem) {
        let item = {
            dictid: dictitem.dictId,
            dictvalue: dictitem.dictValue,
            dicttypeid: dictitem.dictTypeId,
            dictname: dictitem.dictName,
            status: dictitem.status,
            sortno: dictitem.sortNo,
            parentdictid: dictitem.parentDictId,
            remark: dictitem.remark,
            iseditable: dictitem.isEditable,
            lastmodifytime: dictitem.lastModifyTime,
            lang: dictitem.lang
        };
        return item;
    },
    getVolume(volumename) {
        for (var i=0; i<EXAM_QUESTION_VOLUME.length; i++) {
            if (EXAM_QUESTION_VOLUME[i].dictname == volumename) {
                return EXAM_QUESTION_VOLUME[i];
            }
        }

        return null;
    },
    getVolumeByValue(volumevalue) {
        for (var i=0; i<EXAM_QUESTION_VOLUME.length; i++) {
            if (EXAM_QUESTION_VOLUME[i].dictvalue == volumevalue) {
                return EXAM_QUESTION_VOLUME[i];
            }
        }

        return null;
    },
    getTermName(term) {
        if (term == null) return '';
        return term.termName;
    },
    
    getClassName(classInfo, classid='') {
        if (classInfo == null) return classid;

        if (classInfo.name == null || classInfo.name == '') return classInfo.classId;

        if (classInfo.extInfo && classInfo.extInfo.BHWLLX) {
            return classInfo.name + '（' + classInfo.extInfo.BHWLLX + '）';
        }
        if (classInfo.bhwllx == null || classInfo.bhwllx == '') {
            return classInfo.name;
        }
        return classInfo.name + '（' + classInfo.bhwllx + '）';
    },

    getContext() {
        return process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath;
    },

    gotoPath(path) {
        let context = this.getContext();
        window.location.href = context + path;
    },

    isIFrame() {
        if (window.ParameterMap.iframe != undefined) {
            let iframe = window.ParameterMap.iframe == '1'?true:false;
            return iframe;
        }
        return false;
    },

    adjustSubjects(subjects) {
        let height = $('.table-view').height();
        let maxlength = 2;
        for (var i=0; i<subjects.length; i++) {
            if (subjects[i].dictname.length > maxlength) {
                maxlength = subjects[i].dictname.length;
            }
        }
        //if (height > 40) {
        $('.table-view .el-radio').css("width", (maxlength * 14 + 26) + "px");
        $('.table-view .el-checkbox').css("width", (maxlength * 14 + 26) + "px");
        //} else {
        //    $('.table-view .el-radio').css("cssText", "margin-right: 20px !important;");
        //    $('.table-view .el-checkbox').css("cssText", "margin-right: 20px !important;");
        //}
    },

    showMessage(code, text, message) {
        message({
            message: text,
            type: 'error'
        });
    },

    numberSort(a, b) {
        if (parseInt(a) < parseInt(b))
            return -1;
        if (parseInt(b) < parseInt(a))
            return 1;
        return 0;
    },
    examGradeSort(a, b) {
        if (parseInt(a.gradeid) < parseInt(b.gradeid)) return -1;
        if (parseInt(a.gradeid) > parseInt(b.gradeid)) return 1;
        return 0;
    },
    subjectSort(a, b) {
        if (a.dictvalue < b.dictvalue) return -1;
        if (a.dictvalue > b.dictvalue) return 1;
        return 0;
    },
    classIdSort(a, b) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    },
    classSort(a, b) {
        if (a.classId < b.classId) return -1;
        if (a.classId > b.classId) return 1;
        return 0;
    }
};
