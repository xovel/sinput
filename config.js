// set default
+function(){
  var token = JSON.parse((sessionStorage && sessionStorage.token));

  // 设置默认参数
  $.fn.sinput._default = {
    headers: {"Authorization": token.token_type + " " + token.access_token},
    preventKeyEvent: true,
    ajax: true,
    cache: false,
    ellipsis: true,
    zIndex: 2147483646,
    unique: true,
    onHide: true,
    onInput: true,
    scroller: '.wrapper',
    padding: '2px 5px',
    hoverBackground: '#1e90ff'
  }
}();