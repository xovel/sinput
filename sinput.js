/*!
 * sinput 1.0.5
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
      unique: true,
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
      urlParse: true,
      type: 'GET',
      dataType: 'json',
      stringify: true,
      searchName: '',
      searchParam: {},
      searchForce: false
    }, $.fn.sinput._default, options);

    if(options.extraDataName === true){
      options.extraDataName = options.extraData;
    }

    if(options.urlParse && options.type.toUpperCase() === 'POST'){
      var temp, temp2, temp3;

      temp = options.url.split("?");
      options.url = temp[0];

      if(temp[1]){
        temp2 = temp[1].split("&");
        for(var i = 0; i < temp2.length; i++){
          temp3 = temp2[i].split("=");
          options.searchParam[temp3[0]] = temp3[1];
        }
      }
    }

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

    // cache body and window
    var $body = $('body');
    var $window = $(window);

    // set guid to every sinput instance
    $.fn.sinput.guid = $.fn.sinput.guid || 0;

    return this.each(function(){

      var guid = ++$.fn.sinput.guid;
      var $input = $(this).attr('autocomplete', 'off').data('sinput-guid', guid);

      // remove all `.sinput` event ever bind
      $input.off('.sinput');

      // set max length, if the element has a maxlength attribute already, use the minimal
      if(options.maxLength){
        var maxLength = parseInt($input.attr('maxlength'), 10);
        if(maxLength && maxLength > 0){
          maxLength = Math.min(maxLength, options.maxLength);
        }else{
          maxLength = options.maxLength;
        }
        $input.attr('maxlength', maxLength);
      }

      if(options.name){
        $input.attr('name', options.name);
      }

      // --------
      if(options.placeholder){
        $input.attr('placeholder', options.placeholder);
      }

      // init extra data
      if(options.extraData){
        var _n = options.extraData.length;

        // set an order to extra data
        $.each(options.extraData.reverse(), function(index, value){
          if(options.extraDataName){
            var name = options.extraDataName[index] || options.extraData[index];
            $('<input>').attr({
              'class': 'sinput-extra'
              ,'name': name
              ,'type': 'hidden'
              ,'data-extra-order': _n - index
            }).val('').insertAfter($input);
          }else{
            // avoid to get an undefined value
            $input.attr('data-' + value, '');
          }
        });
      }

      // input event has some quirk problems within IE, e.g placeholder/trigger automatically
      // Change the event type to keyup to fix this problem.
      var inputEvent = 'ActiveXObject' in window ? 'keyup.sinput' : 'input.sinput';

      // // fix IE placeholder's bug
      // var placeholder = $input.attr('placeholder');
      // var $placeholder = $('<div>');

      // if('ActiveXObject' in window){
      //   placeholder = options.placeholder || placeholder;

      //   if(placeholder){
      //     $input.removeAttr('placeholder');

      //     $placeholder.html(placeholder).css({
      //       position: 'absolute',
      //       background: 'transparent',
      //       boxSizing: 'border-box',
      //       color: '#a9a9a9', // darkgray
      //       overflow: 'hidden',
      //       paddingLeft: '5px',
      //       fontSize: options.fontSize
      //     }).appendTo($body).on('click', function(){
      //       $placeholder.hide();
      //       $input.trigger('click.sinput').trigger('focus');
      //     });

      //     // I just can't understand the 8px
      //     setPlaceholderPostion(-8);

      //     // extra event
      //     $input.on('blur.sinput.placeholder', function(){
      //       if($.trim($input.val()) === ''){
      //         $placeholder.show();
      //       }
      //     }).on('focus.sinput.placeholder'
      //     + ' input.sinput.placeholder'
      //     + ' change.sinput.placeholder', function(){
      //       $placeholder.hide();
      //     });

      //     // resize also
      //     $(window).on('resize.sinput.placeholder', function(){
      //       setPlaceholderPostion();
      //     });

      //     // scroller also
      //     $(options.scroller).on('scroll.sinput.placeholder', function(){
      //       setPlaceholderPostion();
      //     });
      //   }
      // }else{

      // }

      // function setPlaceholderPostion(fixLeft){
      //   var position = $input.offset();
      //   var height = $input.outerHeight();
      //   var width = $input.outerWidth();

      //   $placeholder.css({
      //     width: width,
      //     height: height,
      //     lineHeight: height + 'px',
      //     left: position.left + (fixLeft || 0),
      //     top: position.top
      //   });
      // }
      // //--------- placeholder fixed

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
        }).appendTo($body);
      var $message = $('<div>')
        .addClass('sinput-message')
        .css({
          padding: options.padding,
          fontSize: options.fontSize,
          display: 'none'
        });

      var id = $input.attr('id');
      if(options.unique){
        id = 'sinput-dropdown-' + (id ? id : guid);
        $('#' + id).remove();
        $dropdown.attr('id', id);
      }

      if(options.zIndex){
        $dropdown.css({
          zIndex: options.zIndex
        });
      }

      var _init = false;
      var _message = '';

      var $ajax;

      var originalData = [];
      var searchResultData = [];

      if(options.init && options.url){
        loadAjaxData('', function(){
          _init = true;
          renderDropdown();
        });
      }else{
        originalData = parseData(options.data);
        renderDropdown();
      }

      function loadAjaxData(text, callback){

        var type = options.type;
        var url = options.url;
        var dataType = options.dataType;
        var headers = options.headers;
        var param = options.searchParam;

        param[options.searchName] = text || '';

        if(type.toUpperCase() === 'POST'){
          if(options.stringify && typeof JSON === 'object' && JSON.stringify){
            param = JSON.stringify(param);
          }
        }

        if($ajax && $ajax.readyState !== 4){
          $ajax.abort();
        }

        $ajax = $.ajax({
          headers: headers,
          url: url,
          type: type,
          data: param,
          dataType: dataType,
          beforeSend: function(){
            _message = '正在加载数据...';
            showMessage(_message);
          },
          success: function(res){

            var list;
            var ret = [];

            _message = '';

            if(options.responseReader){
              list = readFromResponse(res, options.responseReader); // res[options.responseReader];
            }else{
              list = res;
            }

            if($.type(list) !== 'array'){
              _message = '数据类型错误，请检查相关配置';
              showMessage(_message);
              return false;
            }

            if(list.length < 1){
              _message = !text ? '暂无数据' : options.add ? '没有该数据，可添加' : '没有该数据';
              showMessage(_message);
            }else{
              originalData = parseData(list);

              callback();
            }
          },
          error: function(){
            _message = '网络异常，请稍后再试';
            $message.html(_message);
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

      function showMessage(str){
        $message.html(str).show().appendTo($dropdown).siblings().remove();
      }

      function hideMessage(){
        $message.remove();
      }

      function setDropdownPostion(){
        var position = $input.offset();
        var height = $input.outerHeight();
        var width = $input.outerWidth();

        $dropdown.css({
          width: width,
          left: position.left,
          top: position.top + height
        });
      }

      $input.on('click.sinput', function(e){

        if($dropdown.is(':visible')){
          return;
        }

        $dropdown.show();
        setDropdownPostion();

        var value = $.trim($(this).val());

        if(_init && !value){
          _init = false;
        }else{
          if(!options.init || !!value){
            if(options.url && !options.cache){
              loadAjaxData(options.clickLoad ? '' : value, function(){
                options.clickLoad ? renderDropdown('', value) : renderDropdown(options.searchForce ? value : '', value);
              });
            }else{
              options.clickLoad ? renderDropdown('', value) : renderDropdown(value);
            }
          }
        }

      }).on(inputEvent, function(){

        var value = $(this).val();
        var force;

        clearExtraData();
        $dropdown.empty().show();

        if(options.maxLength && value.length > maxLength){
          $message.html('输入文本已超出最大长度').show();
          return;
        }

        force = value === '' ? options.emptyTrigger : options.forceTrigger;

        value = $.trim(value);

        if(options.url && !options.cache){
          loadAjaxData(value, function(){
            renderDropdown(value);
            setExtraData(value, options.onInput, force);
          });
        }else{
          renderDropdown(value);
          setExtraData(value, options.onInput, force);
        }

      });

      $body.on('mousedown.sinput.s' + guid, function(e){
        var $temp = $(e.target).closest('.' + options.kls);
        var isDropdownVisible = $dropdown.is(':visible');
        if(isDropdownVisible && $temp.length < 1){
          hideDropdown(true);
        }
      });

      $window.on('resize.sinput.s' + guid, function(){
        setDropdownPostion();
      });

      $(options.scroller).on('scroll.sinput.s' + guid, function(){
        if($dropdown.is(':hidden')){
          return;
        }

        setDropdownPostion();
      });

      $dropdown.on('click', '.sinput-item', function(){
        var $this = $(this);
        var value = $this.text();
        $input.val(value);

        setExtraData(value, options.callback, null, true);

        hideDropdown();

        $input.focus();
      });

      // set $message's click event
      // $message.on('click' ... cannot word because render will remove this event
      // so just set a class to $message and use event delegate
      if(options.add){
        $dropdown.on('click', '.sinput-message', function(){
          if($message.html().indexOf('可添加')===-1){
            return;
          }
          $dropdown.hide();
          if($.isFunction(options.callback)){
            options.callback.call(null, $input.val(), {});
          }
        });
      }

      function hideDropdown(isAdd){

        $dropdown.hide();

        var data;
        var curValue = $.trim($input.val());
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
          renderDropdown();
        }

        if(options.onHide && (force || !options.onInput) && $.isFunction(options.callback)){
          options.callback.call(null, curValue, data);
        }
      }

      function setExtraData(searchText, hasCallback, noNeedData, isClick){
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
              var name = options.extraDataName[index] || options.extraData[index];
              $input.siblings('.sinput-extra[name="'+name+'"]').val(_v);
            }else{
              $input.removeAttr('data-' + value);
              $input.attr('data-' + value, _v);
            }
          });

          if(!options.matchTrigger && !isClick){
            return;
          }
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
            var name = options.extraDataName[index] || options.extraData[index];
            $input.siblings('.sinput-extra[name="'+name+'"]').val(''); // do not remove it
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

        var $hover = $dropdown.find('.hover');
        var $this = $(this);

        if($this.hasClass('hover')){
          return;
        }else{
          $hover.removeClass('hover').css({
            color: '',
            background: ''
          });
          $this.addClass('hover').css({
            color: options.hoverColor,
            background: options.hoverBackground
          });
        }
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
              setDropdownPostion();
              renderDropdown($input.val());
            }else{
              moveItemUpOrDown();
            }
            break;
          }
          case keys.enter: {
            if(isDropdownHidden){
              $input.trigger('click.sinput');
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

      function renderDropdown(filterText, defaultHighlightText /* Internal */){

        filterText = $.trim(filterText);

        if(_message){
          showMessage(_message);
          return;
        }

        showMessage('');

        searchResultData = searchItems(originalData, filterText);

        if(searchResultData.length<1){
          $message.html(!$input.val() ? '暂无数据' : options.add ? '没有该数据，可添加' : '没有该数据');
          return;
        }

        hideMessage();
        $dropdown.empty();

        var ret = [];
        var klass = 'sinput-item';
        var cssText = 'padding:' + options.padding;

        if(options.ellipsis){
          cssText += '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis';
        }

        // highlight item
        var highlightText = filterText || defaultHighlightText;
        var highlightItemIndex = 0;
        var highlightFlag = false;

        $.each(searchResultData, function(index, item){

          var text = item[options.text];
          var str = '<div class="';

          if(!highlightFlag && highlightText && text.indexOf(highlightText) !== -1){
            highlightItemIndex = index;
            highlightFlag = true;
          }

          str += klass + '"';
          str += ' style="' + cssText + '"';

          if(options.title){
            str += ' title="' + item[options.text] + '"';
          }

          if(options.highlight){
            if(highlightText){
              var reg = new RegExp(highlightText, 'g');
              text = text.replace(reg, function(a){
                return '<b>' + a + '</b>';
              });
            }
          }

          str += '>' + text + '</div>';
          ret.push(str);
        });

        ret[highlightItemIndex] = ret[highlightItemIndex].replace(
          'style="',
          'style="color: ' + options.hoverColor + ';background: ' + options.hoverBackground + ';'
        ).replace(
          'class="',
          'class="hover '
        );

        $dropdown.html(ret.join(''));

        if(highlightItemIndex > 2){
          var _height = $dropdown.find('.sinput-item').eq(0).outerHeight();
          var scrollTop = _height * (highlightItemIndex - 2);
          $dropdown.scrollTop(scrollTop);
        }
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