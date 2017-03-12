/*!
 * sinput 1.0.3
 * Copyright 2017 xovel, MIT licensed
 * https://github.com/xovel/sinput
 */
if (typeof jQuery === 'undefined') {
  throw new Error('Sinput\'s JavaScript requires jQuery')
}

+function($){
  'use strict';

  $.fn.sinput = function(options){

    options = $.extend({
      kls: 'sinput',
      unique: false,
      name: '',
      placeholder: '',
      maxLength: 0,
      height: 200,
      fontSize: '12px',
      border: '1px solid #66afe9',
      background: '#fff',
      padding: '5px',
      zIndex: 0,
      hoverColor: '#fff',
      hoverBackground: '#3399ff',
      title: true,
      ellipsis: false,
      extraData: [],
      extraDataName: false,
      preventKeyEvent: false,
      data: [],
      text: 'text',
      scroller: false,
      highlight: false,
      add: false,
      callback: null,
      onHide: false,
      onInput: false,
      emptyTrigger: true,
      forceTrigger: false,
      responseReader: 'data',
      headers: {},
      init: true,
      cache: true,
      url: '',
      urlParse: false,
      type: 'get',
      dataType: 'json',
      stringify: true,
      searchName: '',
      searchParam: {},
      ajaxOptions: {},
      searchForce: false
    }, $.fn.sinput._default, options);

    if($.isFunction(options.__)){
      // Internal usage
      // do this only you know what it means
      options = options.__(options);
    }

    var keys = {
      tab: 9,
      enter: 13,
      esc: 27,
      left: 37,
      up: 38,
      right: 39,
      down: 40
    }

    if(options.extraDataName === true){
      options.extraDataName = options.extraData;
    }

    return this.each(function(){
      var $input = $(this).attr('autocomplete', 'off');

      var $dropdown = $('<div>')
        .addClass(options.kls)
        .css({
          maxHeight: options.height,
          fontSize: options.fontSize,
          border: options.border,
          background: options.background,
          cursor: 'pointer',
          boxSizing: 'border-box',
          position: 'absolute',
          display: 'none',
          overflowX: 'hidden',
          overflowY: 'auto'
        });
      var $message = $('<div>')
        .css({
          padding: options.padding,
          fontSize: options.fontSize,
          display: 'none'
        });

      var id = $input.attr('id');
      if(id && options.unique){
        id = 'sinput-dropdown-' + id;
        $('#' + id).remove();
        $dropdown.attr('id', id);
      }

      if(options.name){
        $input.attr('name', options.name);
      }
      if(options.placeholder){
        $input.attr('placeholder', options.placeholder);
      }

      if(options.maxLength){
        var maxLength = parseInt($input.attr('maxlength'), 10);
        if(maxLength && maxLength > 0){
          maxLength = Math.min(maxLength, options.maxLength);
        }else{
          maxLength = options.maxLength;
        }
        $input.attr('maxlength', maxLength);
      }

      if(options.zIndex){
        $dropdown.css({
          zIndex: options.zIndex
        });
      }

      var _init = false;
      var _error = '';

      var originalData = [];
      var searchResultData = [];

      if(options.url){
        if(options.init){
          loadAjaxData('', function(){
            _init = true;
          });
        }
      }else{
        originalData = parseData(options.data);
      }

      function loadAjaxData(text, callback, beforeSend){

        // ajax dealer
        var type = options.type;
        var url = options.url;
        var dataType = options.dataType;
        var headers = options.headers;
        var param = options.searchParam;

        if(options.urlParse){
          var temp, temp2, temp3;

          temp = url.split("?");
          url = temp[0];

          if(temp[1]){
            temp2 = temp[1].split("&");
            for(var i=0; i<temp2.length; i++){
              temp3 = temp2[i].split("=");
              param[temp3[0]] = temp3[1];
            }
          }
        }

        param[options.searchName] = text || '';

        if(type.toLowerCase() === 'post'){
          if(options.stringify && typeof JSON === 'object' && JSON.stringify){
            param = JSON.stringify(param);
          }
          if(dataType.toLowerCase() === 'json'){
            headers = $.extend({}, headers, {"Accept": "application/json", "Content-Type": "application/json"});
          }
        }

        $.ajax({
          headers: headers,
          url: url,
          type: type,
          data: param,
          dataType: dataType,
          beforeSend: function () {
            _error = '';
            if($.isFunction(beforeSend)){
              beforeSend();
            }
          },
          success: function(res){

            var list;
            var ret = [];
            var message = '';

            if(options.responseReader){
              list = readFromResponse(res, options.responseReader); // res[options.responseReader];
            }else{
              list = res;
            }

            if($.type(list) !== 'array'){
              _error = '数据类型错误，请检查相关配置';
              return false;
            }

            if(list.length < 1){
              _error = !text ? '暂无数据' : options.add ? '没有该数据，可添加' : '没有该数据';
            }else{
              originalData = parseData(list);

              renderDropdown(originalData, options.searchForce ? text : '');

              if($.isFunction(callback)){
                callback.call();
              }
            }
          },
          error: function(){
            _error = '网络异常，请稍后再试';
          }
        });
      }

      function readFromResponse(response, reader){
        var readers = reader.split('.');
        var temp = response;
        var ret;
        for(var i = 0; i < readers.length; i++){
          ret = temp[readers[i]];
          temp = ret;
        }
        return ret;
      }

      $input.off('.sinput');

      $input.on('click.sinput', function(e){

        if($dropdown.is(':visible')){
          return;
        }

        var position = $input.offset();
        var height = $input.outerHeight();
        var width = $input.outerWidth();

        $dropdown.css({
          width: width,
          left: position.left,
          top: position.top + height,
          display: 'block'
        });
        
        var value = $(this).val();

        if(_init && !value){
          _init = false;
          renderDropdown(originalData);
        }else{
          if(options.ajax && !options.cache){
            loadAjaxData(value);
          }else{
            renderDropdown(originalData, value);
          }
        }

      }).on('input.sinput', function(){
        var value = $(this).val();
        var force;

        clearExtraData();
        $dropdown.show();
        $message.empty().hide().siblings().remove();

        if(options.maxLength && value.length > maxLength){
          $message.html('输入文本已超出最大长度').show();
          return;
        }

        force = value === '' ? options.emptyTrigger : options.forceTrigger;
        
        if(options.ajax && !options.cache){
          loadAjaxData(value, function(){
            setExtraData(value, options.onInput, force);
          });
        }else{
          renderDropdown(originalData, value);
          setExtraData(value, options.onInput, force);
        }
      });

      $('body').on('mousedown.sinput', function(e){
        var $temp = $(e.target).closest('.' + options.kls);
        var isDropdownVisible = $dropdown.is(':visible');
        if(isDropdownVisible && $temp.length < 1){
          hideDropdown(true);
        }
      });

      $(options.scroller).on('scroll.sinput', function(){
        if($dropdown.is(':hidden')){
          return;
        }

        var position = $input.offset();
        var height = $input.outerHeight();
        var width = $input.outerWidth();

        $dropdown.css({
          width: width,
          left: position.left,
          top: position.top + height
        });
      });

      $dropdown.on('click', '.sinput-item', function(){
        var $this = $(this);
        var value = $this.text();
        $input.val(value);

        setExtraData(value, options.callback);

        hideDropdown();

        _focus = true;
        $input.trigger('click.sinput');
      });

      function hideDropdown(isAdd){

        $dropdown.hide();

        var data;
        var curValue = $input.val();
        var force = false;

        if(!isAdd || options.add || (curValue === '' && options.emptyTrigger)){
          return;
        }

        $.each(searchResultData, function(index, item){
          if(curValue === item[options.text]){
            data = item;
            return false;
          }
        });

        if(!data){
          force = true;
          curValue = '';
          $input.val('');
        }
        if(options.onHide && (force || !options.onInput) && $.isFunction(options.callback)){
          options.callback.call(null, curValue, data);
        }
      }

      function setExtraData(searchText, hasCallback, noNeedData){
        var _data;
        $.each(searchResultData, function(index, item){
          if(searchText === item[options.text]){
            _data = item;
            return false;
          }
        });

        if(_data){
          $.each(options.extraData, function(index, value){
            var _v = _data[value];

            if(options.extraDataName){
              var name = options.extraDataName[index];
              $('#' + options.idPrefix + name).remove();
              $('<input>').attr({
                'id': options.idPrefix + name
                ,'name': name
                ,'type': 'hidden'
              }).val(_v).insertAfter($input);
            }else{
              $input.removeAttr('data-' + value);
              $input.attr('data-' + value, _v);
            }
          });
        }else{
          if(!noNeedData){
            return;
          }
        }

        if(hasCallback){
          var fnCallback = $.isFunction(hasCallback) ? hasCallback : $.isFunction(options.callback) ? options.callback : $.noop;
          fnCallback.call(null, searchText, _data);
        }
      }

      function clearExtraData(){
        $.each(options.extraData, function(index, value){
          if(options.extraDataName){
            var name = options.extraDataName[index];
            $('#' + options.idPrefix + name).remove();
          }else{
            $input.removeAttr('data-' + value);
          }
        });
      }

      var skipMouseEvent = false;

      $dropdown.on('mouseenter', '.sinput-item', function(){
        if(skipMouseEvent){
          skipMouseEvent = false;
          return;
        }
        $(this).addClass('hover').css({
          color: options.hoverColor,
          background: options.hoverBackground
        }).siblings().removeClass('hover').css({
          color: '',
          background: ''          
        });
      });

      // $input.add($dropdown)
      $input.on('keydown.sinput', function(e){
        var isDropdownHidden = $dropdown.is(':hidden');
        switch(e.keyCode){
          case keys.esc:
          case keys.tab: {
            if(!isDropdownHidden){
              hideDropdown(true);
            }
            break;
          }
          case keys.up: {
            if(options.preventKeyEvent){
              e.preventDefault();
            }
            moveItemUpOrDown(true);
            break;
          }
          case keys.down: {
            if(options.preventKeyEvent){
              e.preventDefault();
            }
            if(isDropdownHidden){              
              $dropdown.show();
              renderDropdown(originalData, $input.val());
            }else{
              moveItemUpOrDown();
            }
            break;
          }
          case keys.enter: {
            if(isDropdownHidden){
              $input.trigger('focus.sinput');
            }else{
              $dropdown.find('.hover').trigger('click');
            }
            break;
          }
        }
      });

      function moveItemUpOrDown(direction){
        var $currentItem = $dropdown.find('.hover');
        var $destItem;
        
        if(direction){
          $destItem = $currentItem.prev('.sinput-item');
        }else{
          $destItem = $currentItem.next('.sinput-item');
        }

        if($destItem.length === 0){
          return;
        }

        $destItem.addClass('hover').css({
          color: options.hoverColor,
          background: options.hoverBackground
        });
        $currentItem.removeClass('hover').css({
          color: '',
          background: ''
        });

        fixVisible($destItem, direction);
      }

      function fixVisible($item, direction){
        var scrollTop = $dropdown.scrollTop();
        
        if(direction){
          var offsetTop = $item.offset().top - $dropdown.offset().top + scrollTop;

          if(scrollTop > offsetTop){
            skipMouseEvent = true;
            $dropdown.scrollTop(offsetTop);
          }
        }else{
          var scrollBottom = $dropdown.height();
          var itemBottom = $item.offset().top - $dropdown.offset().top + $item.outerHeight();

          if(scrollBottom < itemBottom){
            skipMouseEvent = true;
            $dropdown.scrollTop(scrollTop + itemBottom - scrollBottom);
          }
        }
      }

      function parseData(data){
        var ret = [];
        var temp = {};
        $.each(data, function(index, value){
          if(typeof value === 'string'){
            temp[options.text] = value;
          }else{
            temp = value;
            temp[options.text] = temp[options.text] || '';
          }
          ret.push(temp);
        });

        return ret;
      }

      function renderDropdown(items, filterText){

        if(_error){
          $message.show();
          return;
        }

        $message.empty().hide().siblings().remove();

        searchResultData = searchItems(items, filterText);

        if(searchResultData.length<1){
          $message
            .html(!$input.val() ? '暂无数据' : options.add ? '没有该数据，可添加' : '没有该数据')
            .show();
          return;
        }

        $.each(searchResultData, function(index, item){

          var $item = $('<div>');
          if(index === 0){
            $item.addClass('hover').css({
              color: options.hoverColor,
              background: options.hoverBackground
            });
          }
          $item.addClass('sinput-item')
            .html(function(){
              var text = item[options.text];
              if(options.highlight && filterText){
                var reg = new RegExp(filterText, 'g');
                text = text.replace(reg, function(a){
                  return '<b>' + a + '</b>';
                });
              }
              return text;
            })
            .css({
              padding: options.padding
            })
            .appendTo($dropdown);
          if(options.title){
            $item.attr('title', item[options.text]);
          }
          if(options.ellipsis){
            $item.css({
              'white-space': 'nowrap',
              'overflow': 'hidden',
              'text-overflow': 'ellipsis'
            });
          }
        });
      }

      function searchItems(items, value){
        var ret = [];
        
        if(typeof value !== 'string' || value === ''){
          return items;
        }
        $.each(items, function(index, item){
          if(item[options.text].indexOf(value)!==-1){
            ret.push(item);
          }
        });

        return ret;
      }
    });
  }

}(jQuery);