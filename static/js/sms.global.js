var OPENAPI_SERVER = '//localhost:8088/scoreapi/';
var ECOAPI_APPID = 'e3e7d1976c444ba7ac7f8972831f62b4';
var ECOAPI_APPKEY = '578cf0678f425621';
var ECOAPI_SERVER = '//dev.teewon.net:7000/';
var TENANT_ID = 'E000027';

$(document).ready(function () {
});

function resize() {
	var contentHeight = $('.content-container').height() - 40;
	$('.content-wrapper>section').css('min-height', contentHeight + 'px');
}

function sms_store($key, $value, $autoLogin) {
    if ($value == undefined) {
        var ret = $.cookie($key);
        if (ret == undefined) return null;
        return ret;
    } else {
        $option = {};
        if ($autoLogin) {
            var date = new Date();
            var days = 7;
            date.setTime(date.getTime() + (7 * 24 * 3600 * 1000));
            $option = { expires: date, path: '/' };
        }
        $.cookie($key, $value, $option);
    }
}

function sms_remove_store($key) {
    $.removeCookie($key);
}

window.ParameterMap = function() {
    var parameterMap = {};
    var search = location.search || location.hash;
    if (!search) {
        return parameterMap;
    }
    var qPos = search.indexOf('?');
    if (qPos == -1) return parameterMap;

    search = search.substr(qPos + 1); //Removing leading ?

    var param, pos, name, value;
    var paramArray = search.split('&');
    for (var i in paramArray) {
        param = paramArray[i];
        pos = param.indexOf('=');
        if (pos < 0) {
            name = param;
            value = null;
        } else {
            name = param.substr(0, pos);
            value = decodeURIComponent(param.substr(pos + 1));
        }
        parameterMap[name] = value;
    }

    return parameterMap;
}();