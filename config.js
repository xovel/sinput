// set default
+function(){

  $.fn.sinput._default = {
    preventKeyEvent: true,
    cache: false,
    ellipsis: true,
    zIndex: 2147483646,
    unique: true,
    onHide: true,
    onInput: true,
    scroller: '.wrapper',
    padding: '2px 5px',
    hoverBackground: '#1e90ff',
    __: function(options){

      var token = sessionStorage && sessionStorage.token;
      var headers = {};

      if(token){
        token = JSON.parse(token);
        headers['Authorization'] = token.token_type + ' ' + token.access_token;
      }

      if(options.dataType.toUpperCase() === 'JSON' && options.type.toUpperCase() === 'POST'){
        headers['Accept'] = 'application/json';
        headers['Content-Type'] = 'application/json';
      }

      options.headers = $.extend({}, options.headers, headers);

      return options;
    }
  }
}();