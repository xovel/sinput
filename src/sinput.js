/*!
 * sinput 2.0.0
 * Copyright 2017 xovel, MIT licensed
 * https://github.com/xovel/sinput
 */
if (typeof jQuery === 'undefined') {
  throw new Error('Sinput\'s JavaScript requires jQuery')
}

(function (window, $, undefined) {
  'use strict';

  // cache body and window
  var $body = $('body');
  var $window = $(window);

  var keys = {
    tab: 9,
    enter: 13,
    esc: 27,
    left: 37,
    up: 38,
    right: 39,
    down: 40
  }

  var defaultOptions = {
    name: '',
    placeholder: '',
    maxLength: 0,
    zIndex: 0,
    data: [],
    text: 'text',
    highlight: false,
    title: true,
    add: false,
    clickLoad: false,
    callback: null,
    url: '',
    init: true,
    cache: true,
    type: 'GET',
    dataType: 'json',
    stringify: true,
    responseReader: 'data',
    limit: 0,
    searchName: '',
    searchParam: {}
  };

  var GUID = 1;

  $.fn.sinput = function (options) {
    if (typeof options === 'string') {
      switch (options) {
        case 'remove':
          return this.each(function () {
            var $this = $(this);
            var id = $this.data('sinput-id');
            $this.removeClass('sinput-hide');
            $('#' + id).empty().remove();
          });
        case 'render':

        default:
          return $.error('Unsupported method: ' + options);
      }
    }

    options = $.extend({}, defaultOptions, $.fn.sinput._default, options);

    if (!options.searchName) {
      options.searchName = options.text;
    }

    return this.each(function () {
      var $this = $(this);
      var isOn = false;
      var sinputData = [];

      var isSelect = this.nodeName.toUpperCase() === 'SELECT';

      var guid = GUID++;
      var ename = '.sinput.sinput' + guid;
      var curIndex = 0;

      var $sinput = $('<div class="sinput">').insertAfter($this);
      $this.addClass('sinput-hide');
      var $input = $('<input autocomplete="off">');
      $input.appendTo($sinput).wrap('<div class="sinput-input">');

      var $dropdown = $('<div class="sinput-dropdown">').appendTo($sinput);
      if (options.clear) {
        var $clear = $('<div class="sinput-clear">&times</div>').click(function (e) {
          $input.val('').focus();
          $this.val('');
          $dropdown.find('.cur').removeClass('cur');
          $dropdown.children().eq(0).addClass('cur');
          $dropdown.scrollTop(0);
          e.preventDefault();

          if (options.onEmpty) {
            runCallback('', {});
          }

          return false;
        }).appendTo($sinput);
      }

      var id = $this.attr('id');
      id = 'sinput-dropdown-' + (id ? id : guid);
      $('#' + id).remove();
      $sinput.attr('id', id);
      $this.data('sinput-id', id).data('sinput-ename', ename);

      if (options.zIndex) {
        $sinput.css({
          zIndex: options.zIndex
        });
      }

      resetPosition();

      var maxLength = parseInt($this.attr('maxlength'), 10);
      if (options.maxLength) {
        if (maxLength && maxLength > 0) {
          maxLength = Math.min(maxLength, options.maxLength);
        } else {
          maxLength = options.maxLength;
        }
      }
      if (maxLength) {
        $input.attr('maxlength', maxLength);
      }

      if (options.name) {
        $input.attr('name', options.name);
      }

      // --------
      if (options.placeholder) {
        $input.attr('placeholder', options.placeholder);
      }

      if (!options.url) {
        sinputData = parseData(options.data, options.text);
        if (sinputData.length < 1 && isSelect) {
          sinputData = parseOption($this);
        }
      }

      $input.parent().click(function () {
        if (!isOn) {
          $sinput.addClass('sinput-on');
          isOn = true;
          curIndex = 0;
          var val = $input.val();
          $.each(sinputData, function (_, item) {
            if (item[options.text].indexOf(val) !== -1) {
              curIndex = _;
              return false;
            }
          });
          renderDropdown(sinputData);
        }
      });

      $input.on('keydown', function (e) {
        var $cur = $dropdown.find('.cur');
        var curIndex = $cur.index();
        switch (e.keyCode) {
          case keys.esc:
          case keys.tab: {
            if (isOn) {
              hideSinput();
            }
            break;
          }
          case keys.up: {
            var $prev = $cur.prevAll('.sinput-item').not('.sinput-hide').first();
            if ($prev.length > 0) {
              e.preventDefault();
              $prev.addClass('cur');
              $cur.removeClass('cur');
              makeCurInsight(2);
            }
            break;
          }
          case keys.down: {
            if (isOn) {
              var $next = $cur.nextAll('.sinput-item').not('.sinput-hide').first();
              if ($next.length > 0) {
                e.preventDefault();
                $next.addClass('cur');
                $cur.removeClass('cur');
                makeCurInsight(3);
              }
            } else {
              $input.parent().click();
            }
            break;
          }
          case keys.enter: {
            e.preventDefault();
            if (isOn) {
              $dropdown.find('.cur').click();
            } else {
              $input.parent().click();
            }
            break;
          }
        }
      });

      $input.on('input', function () {
        var value = $(this).val();

        $dropdown.empty();

        if (options.url && !options.cache) {
          return loadAjaxData(value);
        }

        var curData = [];
        $.each(sinputData, function (_, item) {
          if (item[options.text].indexOf(value) !== -1) {
            curData.push(item);
          }
        });

        if (curData.length > 0) {
          curIndex = 0;
          renderDropdown(curData);
          if (options.highlight) {
            var fn = $.isFunction(options.highlight) ? options.highlight : function (a) {
              return '<b>' + a + '</b>';
            };
            $dropdown.find('.sinput-item').each(function (_) {
              $(this).html(curData[_][options.text].replace(new RegExp(value, 'g'), fn));
            });
          }
        } else {
          setMessage('没有该数据', options.add);
        }

        // var bFind = false;
        // var $items = $dropdown.find('.sinput-item');
        // $dropdown.find('.sinput-message').remove();
        // $items.each(function () {
        //   $(this).removeClass('sinput-hide').removeClass('cur');
        // });
        // if (!isOn) {
        //   $sinput.addClass('sinput-on');
        //   isOn = true;
        // }
        // $.each(sinputData, function (_, item) {
        //   var $item = $items.eq(_);
        //   if (item[options.text].indexOf(value) === -1) {
        //     $item.addClass('sinput-hide');
        //   } else {
        //     if (!bFind) {
        //       bFind = true;
        //       $item.addClass('cur');
        //     }
        //     if (options.highlight) {
        //       $item.html(function () {
        //         var text = item[options.text];
        //         var fn = $.isFunction(options.highlight) ? options.highlight : function (a) {
        //           return '<b>' + a + '</b>';
        //         };
        //         text = text.replace(new RegExp(value, 'g'), fn);
        //         return text;
        //       });
        //     }
        //   }
        // });
        // if (!bFind) {
        //   setMessage('没有该数据', options.add);
        // }
      });

      $dropdown.on('click', '.sinput-item', function () {
        var $item = $(this);
        var value = $item.text();
        $input.val(value);

        curIndex = $item.attr('data-index');

        runCallback(value, sinputData[curIndex]);

        hideSinput();

        if (isSelect) {
          $this.val(sinputData[curIndex].value).change();
        }

        $input.focus();
      });

      function runCallback(value, data) {
        if ($.isFunction(options.callback)) {
          options.callback.call($input, value, data);
        }
      }

      $body.off(ename).on('mousedown' + ename, function (e) {
        var $temp = $(e.target).closest('.sinput');
        if (isOn && $temp.length < 1) {
          hideSinput();
        }
      });

      if (options.resize) {
        $window.off(ename).on('resize' + ename, function (e) {
          resetPosition();
        });
      }

      if (options.scroller) {
        $(options.scroller).off(ename).on('scroll' + ename, function () {
          if (isOn) {
            resetPosition();
          }
        });
      }

      function parseOption(selector) {
        var $elem = $(selector);
        var ret = [];
        $elem.find('option').each(function (_) {
          var $option = $(this);
          var temp = {};
          var val = $option.val();
          var text = $option.text();
          temp.value = val;
          temp[options.text] = text;
          if ($option.is(':selected')) {
            curIndex = _;
            $input.val(text);
          }
          ret.push(temp);
        });
        return ret;
      }

      function renderDropdown(data) {
        if (data.length < 1) {
          setMessage('暂无数据');
        } else {
          $dropdown.html(genDropdownHTML(data));
          makeCurInsight(1);
        }
      }

      function setMessage(str, isAdd) {
        var $message = $('<div class="sinput-message">');
        $message.html(str + (isAdd ? '，可添加' : '')).appendTo($dropdown).siblings().addClass('sinput-item');
        if (isAdd) {
          $message.click(function () {
            hideSinput();
            runCallback($input.val(), {});
          });
        }
      }

      function hideSinput() {
        $sinput.removeClass('sinput-on');
        isOn = false;
      }

      function makeCurInsight(type) {
        var $cur = $dropdown.find('.cur');
        var scrollTop = $dropdown.scrollTop();
        switch (type) {
          case 1:
            var hIndex = $cur.index();
            if (hIndex > 2) {
              var _height = $dropdown.find('.sinput-item').eq(0).outerHeight();
              var _scrollTop = _height * (hIndex - 2);
              $dropdown.scrollTop(_scrollTop);
            } else {
              $dropdown.scrollTop(0);
            }
            break;
          case 2:
            var curTop = $cur.offset().top;
            var dropdownTop = $dropdown.offset().top;
            var offsetTop = curTop - dropdownTop + scrollTop;
            if (scrollTop > offsetTop) {
              $dropdown.scrollTop(offsetTop);
            }
            break;
          case 3:
            var scrollBottom = $dropdown.height();
            var itemBottom = $cur.offset().top - $dropdown.offset().top + $cur.outerHeight();

            if (scrollBottom < itemBottom) {
              $dropdown.scrollTop(scrollTop + itemBottom - scrollBottom);
            }
            break;
        }
      }

      function resetPosition() {
        var position = $this.offset();
        var height = $this.outerHeight();
        var width = $this.outerWidth();

        $input.outerHeight(height).outerWidth(width);

        $sinput.outerWidth(width);
      }

      function genDropdownHTML(data) {
        var ret = [];
        $.each(data, function (_, item) {
          var text = item[options.text];
          var str = '<div class="sinput-item"';
          if (options.title) {
            str += ' title="' + text + '"';
          }
          str += ' data-index="' + _ + '">';
          str += text;
          str += '</div>';
          ret.push(str);
        });
        ret[curIndex] = ret[curIndex].replace('sinput-item', 'sinput-item cur');
        return ret;
      }

    });

  };

  // reader
  function readData(response, reader) {
    var ret = response[reader];
    var temp;
    var readers;

    if (!ret) {
      temp = response;
      readers = reader.split('.');
      try {
        for (var i = 0; i < readers.length; i++) {
          ret = temp[readers[i]];
          temp = ret;
        }
      } catch (e) {
        //
      }
    }

    return ret;
  }

  // parse
  function parseData(data, key) {
    var ret = [];
    $.each(data, function(index, value){
      var temp = {};
      if (typeof value === 'string') {
        temp[key] = value;
      } else {
        temp = value;
        temp[key] = temp[key] || '';
      }
      ret.push(temp);
    });

    return ret;
  }

})(window, jQuery);
