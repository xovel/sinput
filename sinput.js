if (typeof jQuery === 'undefined') {
  throw new Error('Sinput\'s JavaScript requires jQuery')
}

+function($){
  'use strict';

  $.fn.sinput = function(options){

    if(typeof options !== 'object'){
      throw new Error('Need options');
    }

    if(!options.data && !options.ajax){
      throw new Error('Need data');
    }

    options = $.extend({
      id: '',
      kls: 'sinput',
      name: '',
      placeholder: '',
      maxLength: 0,
      height: 200,
      fontSize: '12px',
      border: '1px solid #66afe9',
      padding: '5px',
      zIndex: 0,
      hoverColor: '#fff',
      hoverBackground: '#999',
      title: true,
      ellipsis: true,
      extraData: [],
      extraDataName: false,
      idPrefix: 'sinput-',
      preventKeyEvent: false,
      data: [],
      text: 'text',
      add: false,
      callback: null,
      ajax: true,
      responseReader: 'data',
      headers: {},
      init: true,
      cache: false,
      url: '',
      urlParse: false,
      type: 'get',
      dataType: 'json',
      stringify: true,
      searchName: 'q',
      searchParam: {},
      searchForce: false,
      searchUrl: '',
      searchHeaders: {},
      searchType: '',
      searchDataType: ''
    }, options);

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
      var $input = $(this).addClass(options.kls);
      var position = $input.position();
      var height = $input.outerHeight();
      var width = $input.outerWidth();

      var $dropdown = $('<div>').attr('id', options.id).addClass(options.kls);
      var $message = $('<div>');
      var $pager = $('<div>');

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

      $message.css({
        padding: options.padding,
        fontSize: options.fontSize
      }).hide().appendTo($dropdown);

      $dropdown.css({
        maxHeight: options.height,
        fontSize: options.fontSize,
        border: options.border,
        cursor: 'pointer',
        position: 'absolute',
        display: 'none',
        overflowX: 'hidden',
        overflowY: 'auto'
      }).appendTo('body');

      if(options.zIndex){
        $dropdown.css({
          zIndex: options.zIndex
        });
      }

      var _focus = false;
      var _init = false;

      var origData = [];

      if(options.ajax){
        if(options.init){
          loadAjaxData();
        }
      }else{
        origData = parseData(options.data);
      }

      function loadAjaxData(text, callback){

        // ajax dealer
        var type = options.type;
        var url = options.url;
        var dataType = options.dataType;
        var headers = options.headers;
        var param = options.searchParam;

        var temp, temp2, temp3;

        if(text){
          url = options.searchUrl || url;
          type = options.searchType || type;
          dataType = options.searchDataType || dataType;
          headers = options.searchHeaders || headers;
        }

        if(options.urlParse){
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

        if(options.stringify){
          param = JSON.stringify(param);
        }

        $.ajax({
          headers: headers,
          url: url,
          type: type,
          data: param,
          datatype: dataType,
          beforeSend: function () {
            $message.html('正在加载数据...').show().siblings().remove();
          },
          success: function(res){

            var list;
            var ret = [];
            var message = '';

            _init = true;

            if(options.responseReader){
              list = readFromResponse(res, options.responseReader); // res[options.responseReader];
            }else{
              list = res;
            }

            if($.type(list) !== 'array'){
              $message.html('数据类型错误，请检查相关配置').show();
              return false;
            }

            if(list.length < 1){
              message = !text ? '暂无数据' : options.add ? '没有该数据，可添加' : '没有该数据';
              $message.html(message).show();
            }else{

              origData = parseData(list);

              if(options.searchForce){
                renderDropdown(origData, text);
              }else{
                renderDropdown(origData);
              }

              if($.isFunction(callback)){
                callback.call();
              }
            }
                        
          },
          error: function(){
            $message.html('网络异常，请稍后再试').show();
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

      $input.on('focus click', function(e){

        if(e.type === 'focus'){
          _focus = true;
        }

        if(_focus && e.type === 'click'){
          _focus = false;
          return;
        }

        var position = $input.position();
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
          renderDropdown(origData);
        }else{
          if(options.ajax && !options.cache){
            loadAjaxData(value);
          }else{
            renderDropdown(origData, value);
          }
        }

      }).on('input', function(){
        var value = $(this).val();

        clearExtraData();
        $message.empty().hide().siblings().remove();
        
        if(options.ajax && !options.cache){          
          loadAjaxData(value, function(){
            _setExtraData(value);
          });
        }else{
          renderDropdown(origData, value);
          _setExtraData(value);
        }

        function _setExtraData(value){
          $dropdown.find('.sinput-item').each(function(){
            var $this = $(this);
            if(value === $this.text()){
              setExtraData($this);
              return false;
            }
          });
        }
      });

      $('body').on('mousedown', function(e){
        var $temp = $(e.target).closest('.sinput');
        if($temp.length < 1){
          hideDropdown(true);
        }
      });

      $dropdown.on('click', '.sinput-item', function(){
        var $this = $(this);
        var value = $this.text();
        $input.val(value);
        if(options.extraData){
          setExtraData($this);
        }

        if($.isFunction(options.callback)){
          options.callback.call(this, this, value);
        }

        hideDropdown();
      });

      function hideDropdown(isAdd){

        $dropdown.hide();

        if(!isAdd || options.add){
          return;
        }

        var isIn = false;
        var curValue = $input.val();

        $dropdown.find('.sinput-item').each(function(){
          var $this = $(this);
          if(curValue === $this.text()){
            isIn = true;
            return false;
          }
        });

        if(!isIn){
          $input.val('');
        }        
      }

      function setExtraData($item){
        $.each(options.extraData, function(index, value){
          var _v = $item.data(value);
          if(options.extraDataName){
            var name = options.extraDataName[index];
            $('#'+ options.idPrefix + name).remove();
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
      }

      function clearExtraData(){
        $.each(options.extraData, function(index, value){
          if(options.extraDataName){
            var name = options.extraDataName[index];
            $('#'+ options.idPrefix + name).remove();
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
      $input.on('keydown', function(e){
        switch(e.keyCode){
          case keys.esc:
          case keys.tab: {
            hideDropdown(true);
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
            var isDropdownHidden = $dropdown.is(':hidden');
            if(isDropdownHidden){              
              $dropdown.show();
              renderDropdown(origData, $input.val());
            }else{
              moveItemUpOrDown();
            }
            break;
          }
          case keys.enter: {
            $dropdown.find('.hover').trigger('click');
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
        var i = 0;
        $.each(data, function(index, value){
          if(typeof value === 'string'){
            temp.text = value;
          }else{
            temp = value;
            temp.text = temp[options.text] || temp.text || '';
          }
          temp._index = i++;
          ret.push(temp);
        });

        return ret;
      }

      function renderDropdown(items, filterText){
        $message.empty().hide().siblings().remove();

        items = searchItems(items, filterText);

        if(items.length<1){
          $message
            .html('未找到"' + $input.val() + '"')
            .show();
          return;
        }

        $.each(items, function(index, item){
          var $item = $('<div>');
          if(index === 0){
            $item.addClass('hover').css({
              color: options.hoverColor,
              background: options.hoverBackground
            });
          }
          $item.addClass('sinput-item')
            .attr('data-index', item._index)
            .html(item.text)
            .css({
              padding: options.padding
            })
            .appendTo($dropdown);
          if(options.title){
            $item.attr('title', item.text)
          }
          if(options.ellipsis){
            $item.css({
              'white-space': 'nowrap',
              'overflow': 'hidden',
              'text-overflow': 'ellipsis'
            });
          }
          if(options.extraData){
            $.each(options.extraData, function(index, value){
              $item.attr('data-' + value, item[value]);
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
          if(item.text.indexOf(value)!==-1){
            ret.push(item);
          }
        });

        return parseData(ret);
      }
    });
  }

}(jQuery);