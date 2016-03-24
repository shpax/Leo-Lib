/**
 * Created by max on 24.03.16.
 */

var leo = {};
(function(){

    function req(url,args) {
        var reqStr = url;
        if (args) {
            reqStr+='?';
            var pairs = [];
            for (name in args) if (args.hasOwnProperty(name)) pairs.push(asGet(name, args[name]))
            reqStr+= pairs.join('&')
        }
        return reqStr;
    }
    function asGet(objName, objInput) {
        if (Object.prototype.toString.call( objInput ) == "[object Array]") {
            return objInput.map(function(el) {
                return objName + '[]=' + (typeof el == 'string' ? el.replace(/\s/g,'%20') : el);
            }).join('&');
        }
        if (Object.prototype.toString.call( objInput ) == "[object Object]") {
            var pairs = [];
            for (var key in objInput) if (objInput.hasOwnProperty(key)) {
                var val = objInput[key];
                if (typeof val == 'object') pairs.push(asGet(objName + '[' + key + ']',val));
                else pairs.push(objName + '[' + key + ']=' + val)
            }
            return pairs.join('&');
        }
        return objName + '=' + objInput;
    }
    function asPost(name, value, formData) {
        if (Object.prototype.toString.call( value ) == "[object Array]") {
            value.forEach(function(el) {
                formData.append(name + '[]',el);
            });
        } else if (Object.prototype.toString.call( value ) == "[object Object]") {
            for (var key in value)
                if (value.hasOwnProperty(key)) asPost(name + '[' + key + ']', value[key], formData);
        } else {
            formData.append(name, value)
        }
    }
    function getCrossXHR() {
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
        if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    }

    function getRequest(method, args, errorIfNotJSON) {
        if (errorIfNotJSON == null) errorIfNotJSON = true;
        var xhr = getCrossXHR();
        xhr.errorIfNotJSON = errorIfNotJSON;
        xhr.href = req(method, args);
        xhr.error = function (callback) {
            this.errorCallback = callback;
            return this;
        };
        xhr.success = function(callback) {
            this.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200 && callback != undefined) {
                    var res;
                    try {
                        res = JSON.parse(xhr.responseText);
                        callback(res);
                    } catch (e) {
                        res = xhr.responseText;
                        if (xhr.errorIfNotJSON && xhr.errorCallback!=null) xhr.errorCallback(res);
                        else callback(res);
                    }

                }
            };
            this.open('GET',this.href,true);
            this.send();
        };
        xhr.exec = function() {
            this.open('GET',this.href,true);
            this.send();
        };
        return xhr;
    }
    function postRequest(url, data) {
        var xhr = getCrossXHR();
        xhr.href = url;

        switch (Object.prototype.toString.call(data.data)) {
            case "[object String]":
                var f = document.querySelector(data.data);
                if (f != null) {
                    xhr.data = new FormData(f);
                    for (var k in data) if (k!='data' && data.hasOwnProperty(k)) asPost(k,data[k],xhr.data);
                }
                break;
            case "[object FormData]":
                xhr.data = data.data;
                for (var k in data) if (k!='data' && data.hasOwnProperty(k)) asPost(k,data[k],xhr.data);
                break;
            default:
                xhr.data = new FormData();
                for (var key in data) if (data.hasOwnProperty(key)) asPost(key, data[key], xhr.data);
        }

        xhr.error = function (callback) {
            this.errorCallback = callback;
            return this;
        };
        xhr.success = function(callback) {
            this.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200 && callback != undefined) {
                    var res;
                    try {
                        res = JSON.parse(xhr.responseText);
                        callback(res);
                    } catch (e) {
                        res = xhr.responseText;
                        if (xhr.errorIfNotJSON && xhr.errorCallback!=null) xhr.errorCallback(res);
                        else callback(res);
                    }
                }
            };
            this.open('POST',this.href,true);
            this.send(this.data);
        };
        xhr.exec = function() {
            this.open('POST',this.href,true);
            this.send(this.data);
        };
        return xhr;
    }

    function element(tagName) {
        var element = document.createElement('tagName');
        element.class = function(name) {
            if (!this.classList.contains(name)) this.classList.add(name);
            return this;
        };
        element.on = function (ev, callback) {
            if (ev != null && callback != null) this.addEventListener(ev, callback);
            return this;
        };
        element.add = function (element) {
            if (element != null) this.appendChild(element);
            return this;
        };
        element.set = function(key, val) {
            if (val == null) val = '';
            if (key!= null) this.setAttribute(key,val);
            return this;
        };
        element.own = function(key, val) {
            if (this.hasOwnProperty(key)) this[key] = val;
            return this;
        };
        element.html = function (val) {
            if (val != null) this.innerHTML = val;
            return this;
        };

        return element;
    }

    leo.el = function (tagName) {
        return element(tagName);
    };
    leo.get = function(method, args) {
        return getRequest(method,args);
    };
    leo.post = function (url, data) {
        return postRequest(url, data);
    };

})();