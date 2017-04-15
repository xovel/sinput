/*!
 * sinput 1.0.7
 * Copyright 2017 xovel, MIT licensed
 * https://github.com/xovel/sinput
 */
if (typeof jQuery === 'undefined') {
  throw new Error('Sinput\'s JavaScript requires jQuery')
}

+function ($) {
  'use strict';

  $.fn.sinput = function (options) {

    options = $.extend(true, {
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
      clickLoad: true,
      callback: null,
      onHide: false,
      emptyTrigger: true,
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
      searchForce: false,
      i18n: {
        'default': {
          maxLength: 'The text is too long.',
          ajaxLoading: 'Loading data...',
          typeError: 'Data type error',
          noResult: 'No result',
          noSearchResult: 'No result for this',
          addText: 'No result for this, addable',
          ajaxError: 'Ajax error'
        }
      }
    }, $.fn.sinput._default, options);

    if (options.extraDataName === true) {
      options.extraDataName = options.extraData;
    }

    if (options.urlParse && options.type.toUpperCase() === 'POST') {
      var temp, temp2, temp3;

      temp = options.url.split("?");
      options.url = temp[0];

      if (temp[1]) {
        temp2 = temp[1].split("&");
        for (var i = 0; i < temp2.length; i++) {
          temp3 = temp2[i].split("=");
          options.searchParam[temp3[0]] = temp3[1];
        }
      }
    }

    if ($.isFunction(options.__)) {
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

    var msg = options.i18n[options.lang] || options.i18n['default'];

    return this.each(function () {

      var guid = $.fn.sinput.guid = $.fn.sinput.guid + 1;
      var $input = $(this).attr('autocomplete', 'off').data('sinput-guid', guid);

      // remove all `.sinput` event ever bind
      $input.off('.sinput');

      // set max length, if the element has a maxlength attribute already, use the minimal
      if (options.maxLength) {
        var maxLength = parseInt($input.attr('maxlength'), 10);
        if (maxLength && maxLength > 0) {
          maxLength = Math.min(maxLength, options.maxLength);
        } else {
          maxLength = options.maxLength;
        }
        $input.attr('maxlength', maxLength);
      }

      if (options.name) {
        $input.attr('name', options.name);
      }

      // --------
      if (options.placeholder) {
        $input.attr('placeholder', options.placeholder);
      }

      // erase pre extra element
      $input.nextAll('.sinput-extra').remove();

      // init extra data
      if (options.extraData) {
        $.each(options.extraData, function (index, value) {
          if (options.extraDataName) {
            var name = options.extraDataName[index] || options.extraData[index];
            $('<input>').attr({
              'class': 'sinput-extra',
              'name': name,
              'type': 'hidden'
            }).val('').insertAfter($input);
          } else {
            // avoid to get an undefined value
            $input.attr('data-' + value, '');
          }
        });
      }

      // input event has some quirk problems within IE, e.g placeholder/trigger automatically
      // Change the event type to keyup to fix this problem.
      var inputEvent = 'ActiveXObject' in window ? 'keyup.sinput' : 'input.sinput';

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
      if (options.unique) {
        id = 'sinput-dropdown-' + (id ? id : guid);
        $('#' + id).remove();
        $dropdown.attr('id', id);
      }

      if (options.zIndex) {
        $dropdown.css({
          zIndex: options.zIndex
        });
      }

      var _init = false;
      var _message = '';

      var $ajax;

      var originalData = [];
      var searchResultData = [];

      if (options.init && options.url) {
        loadAjaxData('', function(){
          _init = true;
          renderDropdown();
        });
      } else {
        originalData = parseData(options.data);
        renderDropdown();
      }

      function loadAjaxData(text, callback) {

        var type = options.type;
        var url = options.url;
        var dataType = options.dataType;
        var headers = options.headers;
        var param = options.searchParam;

        param[options.searchName] = text || '';

        if (type.toUpperCase() === 'POST' && options.stringify) {
          param = JSON.stringify(param);
        }

        if ($ajax && $ajax.readyState !== 4) {
          $ajax.abort();
        }

        $ajax = $.ajax({
          headers: headers,
          url: url,
          type: type,
          data: param,
          dataType: dataType,
          beforeSend: function () {
            _message = msg.ajaxLoading;
            showMessage(_message);
          },
          success: function (res) {

            var list;
            var ret = [];

            _message = '';

            if (options.responseReader) {
              list = readFromResponse(res, options.responseReader); // res[options.responseReader];
            } else {
              list = res;
            }

            if ($.type(list) !== 'array') {
              _message = msg.typeError;
              showMessage(_message);
              return false;
            }

            if (list.length < 1) {
              _message = !text ? msg.noResult : options.add ? msg.addText : msg.noSearchResult;
              showMessage(_message);
            } else {
              originalData = parseData(list);

              callback();
            }
          },
          error: function () {
            _message = msg.ajaxError;
            $message.html(_message);
          }
        });
      }

      function readFromResponse(response, reader) {
        var readers = reader.split('.');
        var temp = response;
        var ret;
        for (var i = 0; i < readers.length; i++) {
          ret = temp[readers[i]];
          temp = ret;
        }
        return ret;
      }

      function showMessage(str) {
        $message.html(str).show().appendTo($dropdown).siblings().remove();
      }

      function hideMessage() {
        $message.remove();
      }

      function setDropdownPostion() {
        var position = $input.offset();
        var height = $input.outerHeight();
        var width = $input.outerWidth();

        $dropdown.css({
          width: width,
          left: position.left,
          top: position.top + height
        });
      }

      $input.on('click.sinput', function (e) {

        if ($dropdown.is(':visible')) {
          return;
        }

        $dropdown.show();
        setDropdownPostion();

        var value = $.trim($(this).val());

        if (_init) {
          _init = false;
        } else {
          if (options.url && !options.cache) {
            loadAjaxData(options.clickLoad ? '' : value, function () {
              options.clickLoad ? renderDropdown('', value) : renderDropdown(options.searchForce ? value : '', value);
            });
          } else {
            options.clickLoad ? renderDropdown('', value) : renderDropdown(value);
          }
        }

      }).on(inputEvent, function () {

        var value = $(this).val();
        var force;

        clearExtraData();
        $dropdown.empty().show();

        if (options.maxLength && value.length > maxLength) {
          $message.html(msg.maxLength).show();
          return;
        }

        value = $.trim(value);

        if (options.url && !options.cache) {
          loadAjaxData(value, function () {
            renderDropdown(value);
          });
        } else {
          renderDropdown(value);
        }

      });

      $body.off('.s' + guid).on('mousedown.sinput.s' + guid, function (e) {
        var $temp = $(e.target).closest('.' + options.kls);
        var isDropdownVisible = $dropdown.is(':visible');
        if (isDropdownVisible && $temp.length < 1) {
          hideDropdown(true);
        }
      });

      $window.off('.s' + guid).on('resize.sinput.s' + guid, function () {
        setDropdownPostion();
      });

      $(options.scroller).off('.s' + guid).on('scroll.sinput.s' + guid, function () {
        if ($dropdown.is(':hidden')) {
          return;
        }

        setDropdownPostion();
      });

      $dropdown.on('click', '.sinput-item', function () {
        var $this = $(this);
        var value = $this.text();
        $input.val(value);

        var _index = $this.attr('data-index');

        setExtraData(_index);

        runCallback(value, searchResultData[_index]);

        hideDropdown();

        $input.focus();
      });

      // set $message's click event
      // $message.on('click' ... cannot work because `render` will remove it
      // so just set a class to $message and use event delegate
      if (options.add) {
        $dropdown.on('click', '.sinput-message', function () {
          if ($message.html() !== msg.addText) {
            return;
          }
          $dropdown.hide();
          runCallback($input.val(), {});
        });
      }

      function hideDropdown(hasOperation) {

        $dropdown.hide();

        if (!hasOperation) {
          return;
        }

        var data;
        var curValue = $.trim($input.val());

        $.each(searchResultData, function (index, item) {
          if (curValue === item[options.text]) {
            data = item;
            if (options.onHide) {
              setExtraData(index);
              runCallback(curValue, data);
            }
            return false;
          }
        });

        if (!data) {
          if (!options.add) {
            // no match and options.add is false
            curValue = '';
            $input.val('');
            renderDropdown();
          }
          if (options.emptyTrigger && curValue === '') {
            runCallback('', {});
          }
        }
      }

      function runCallback(value, data) {
        if ($.isFunction(options.callback)) {
          options.callback.call($input, value, data); // set scope
        }
      }

      function setExtraData(dataIndex) {
        var _data = searchResultData[+dataIndex];

        if (_data) {
          $.each(options.extraData, function (index, value) {
            var _v = _data[value];

            if (options.extraDataName) {
              var name = options.extraDataName[index] || options.extraData[index];
              $input.nextAll('.sinput-extra[name="' + name + '"]').val(_v);
            } else {
              $input.removeAttr('data-' + value);
              $input.attr('data-' + value, _v);
            }
          });
        }
      }

      function clearExtraData() {
        $.each(options.extraData, function (index, value) {
          if (options.extraDataName) {
            var name = options.extraDataName[index] || options.extraData[index];
            $input.nextAll('.sinput-extra[name="' + name + '"]').val(''); // do not remove it
          } else {
            $input.removeAttr('data-' + value);
          }
        });
      }

      var skipMouseEvent = false;

      $dropdown.on('mouseenter', '.sinput-item', function () {
        if (skipMouseEvent) {
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
      $input.on('keydown.sinput', function (e) {
        var isDropdownHidden = $dropdown.is(':hidden');
        switch (e.keyCode) {
          case keys.esc:
          case keys.tab: {
            if (!isDropdownHidden) {
              hideDropdown(true);
            }
            break;
          }
          case keys.up: {
            if (options.preventKeyEvent) {
              e.preventDefault();
            }
            moveItemUpOrDown(true);
            break;
          }
          case keys.down: {
            if (options.preventKeyEvent) {
              e.preventDefault();
            }
            if (isDropdownHidden) {
              $dropdown.show();
              setDropdownPostion();
              renderDropdown($input.val());
            } else {
              moveItemUpOrDown();
            }
            break;
          }
          case keys.enter: {
            e.preventDefault();
            if (isDropdownHidden) {
              $input.trigger('click.sinput');
            } else {
              $dropdown.find('.hover').trigger('click');
            }
            break;
          }
        }
      });

      function moveItemUpOrDown(direction) {
        var $currentItem = $dropdown.find('.hover');
        var $destItem;

        if (direction) {
          $destItem = $currentItem.prev('.sinput-item');
        } else {
          $destItem = $currentItem.next('.sinput-item');
        }

        if ($destItem.length === 0) {
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

      function fixVisible($item, direction) {
        var scrollTop = $dropdown.scrollTop();

        if (direction) {
          var offsetTop = $item.offset().top - $dropdown.offset().top + scrollTop;

          if (scrollTop > offsetTop) {
            skipMouseEvent = true;
            $dropdown.scrollTop(offsetTop);
          }
        } else {
          var scrollBottom = $dropdown.height();
          var itemBottom = $item.offset().top - $dropdown.offset().top + $item.outerHeight();

          if (scrollBottom < itemBottom) {
            skipMouseEvent = true;
            $dropdown.scrollTop(scrollTop + itemBottom - scrollBottom);
          }
        }
      }

      function parseData(data) {
        var ret = [];
        var temp = {};
        $.each(data, function(index, value){
          if (typeof value === 'string') {
            temp[options.text] = value;
          } else {
            temp = value;
            temp[options.text] = temp[options.text] || '';
          }
          ret.push(temp);
        });

        return ret;
      }

      function renderDropdown(filterText, defaultHighlightText) {

        filterText = $.trim(filterText);

        if (_message) {
          showMessage(_message);
          return;
        }

        showMessage('');

        searchResultData = $.grep(originalData, function (item) {
          if (filterText === '') {
            return true;
          }
          if (item[options.text].indexOf(filterText) !== -1) {
            return true;
          }
        });

        if (searchResultData.length < 1) {
          $message.html(!$input.val() ? msg.noResult : options.add ? msg.addText : msg.noSearchResult);
          return;
        }

        hideMessage();
        $dropdown.empty();

        var ret = [];
        var klass = 'sinput-item';
        var cssText = 'padding:' + options.padding;

        if (options.ellipsis) {
          cssText += '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis';
        }

        // highlight item
        var highlightText = filterText || defaultHighlightText;
        var highlightItemIndex = 0;
        var highlightFlag = false;

        $.each(searchResultData, function (index, item) {

          var text = item[options.text];
          var str = '<div class="';

          if (!highlightFlag && highlightText && text.indexOf(highlightText) !== -1) {
            highlightItemIndex = index;
            highlightFlag = true;
          }

          str += klass + '"';
          str += ' style="' + cssText + '"';
          str += 'data-index=' + index; // data track index

          if (options.title) {
            str += ' title="' + item[options.text] + '"';
          }

          if (options.highlight && highlightText) {
            var reg = new RegExp(highlightText, 'g');
            text = text.replace(reg, function (a) {
              return '<b>' + a + '</b>';
            });
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

        if (highlightItemIndex > 2) {
          var _height = $dropdown.find('.sinput-item').eq(0).outerHeight();
          var scrollTop = _height * (highlightItemIndex - 2);
          $dropdown.scrollTop(scrollTop);
        }
      }

    });
  }

  $.fn.sinput.guid = 0;

}(jQuery);
