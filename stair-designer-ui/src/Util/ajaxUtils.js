export function postAjax(url, data) {
    // var params = typeof data == 'string' ? data : Object.keys(data).map(
    //         function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
    //     ).join('&');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { console.log(xhr.responseText); }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
    return xhr;
};

