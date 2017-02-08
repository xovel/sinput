# sinput

A search input plugin, based on jQuery.

## Background

因项目之前所用到的模糊下拉搜索插件存在的问题较多，修复这些功能造成的代码改动太大，故此考虑重新设计一款插件来实现业务需求。

## Options

参数说明：（冒号前为参数名称，后面为默认值）
- kls: 'sinput' 字符串，**必须**，指定input元素和下拉框的类名。
- unique: false 布尔值，设定下拉框的唯一性，如果input元素未指定id，则忽略该参数。
- name: '' 字符串，指定input元素的name。
- placeholder: '' 字符串，指定input元素的placeholder。
- maxLength: 0 数值，指定input元素的maxlength，如果input元素本身已经设定了maxlength，则取两者的最小值作为maxlength。
- height: 200 数值，**必须**，下拉框的最大高度。
- fontSize: '12px' 字符串，指定下拉框内各子元素的字体大小。
- border: '1px solid #66afe9' 字符串，指定下拉框的边框样式。
- padding: '5px' 字符串，指定下拉框内各子元素的内边距。
- zIndex: 0 数值，指定下拉框的z-index值，如果为0，则忽略该参数。
- hoverColor: '#fff' 数值，指定下拉框内当前被选中的元素的颜色。
- hoverBackground: '#999' 数值，指定下拉框内当前被选中的元素的背景。
- title: true 布尔值，下拉框内下拉子元素是否添加title属性，title与文本一致。
- ellipsis: false 布尔值，下拉框内下拉子元素是否在超出时以省略符进行显示，如果为真，下拉子元素将不会进行折行显示。
- extraData: [] 数组，指定额外数据，如果设置该值，在进行点击等相关操作时，会同时提取对应的额外数据。如果下一条参数为真，则额外数据将会以隐藏的input进行追加。
- extraDataName: false 数组或布尔值，指定上一条额外数据对应的名称，如果设置为true，名称将保持与额外数据的一致；如果设置为false，额外数据将会直接挂载到input元素之上。
- idPrefix: 'sinput-' 字符串，指定额外数据的id前缀。如果extraDataName为真，该值必须进行指定，否则忽略该参数。
- preventKeyEvent: false 布尔值，input元素的上下方向键输入时是否阻止其他事件。
- data: [] 数组，指定下拉框内的数据来源，数组内的子元素可以是字符串，也可以是对象。如果ajax参数为真，则忽略该参数；如果ajax为false，则必须设定该参数。
- text: 'text' 字符串，**必须**，下拉框内数据来源的名称。根据该参数进行数据的读取。
- highlight: false 布尔值，在进行搜索时，是否对匹配的结果进行高亮显示。高亮方式为常规的b标签加粗。
- add: false 布尔值，如果输入的元素未能完全匹配到结果，是否保留该值。
- callback: null 函数，在点击下拉子元素时触发的回调函数。
- onHide: false 布尔值，在其它地方按下鼠标时，是否触发callback回调函数。
- onInput: false 布尔值或函数，在进行搜索时，在出现完全匹配的结果时，触发的回调函数。如果为真并且不为函数，则使用callback回调函数。
- forceTrigger: false 布尔值，在进行搜索时，是否强制进行回调函数的触发。
- ajax: false 布尔值，是否启用ajax获取数据。如果data参数未设置，则该值必须设置为true。
- responseReader: 'data' 字符串，ajax获取到的数据的读取器。如果不进行设置，则使用ajax返回的数据。
- headers: {} 对象，发送ajax请求时的headers值。
- init: true 布尔值，ajax加载数据时，是否直接进行初始化获取。
- cache: false 布尔值，是否对ajax结果进行缓存。如果设置为false，则相关数据均会从ajax获取。
- url: '' 字符串，ajax请求的路径。如果设置了ajax，该值必须指定。
- urlParse: false 布尔值，是否对url进行解析，提取url中自带的参数。
- type: 'get' 字符串，ajax请求的提交类型，一般为get或post。如果设置了ajax，该值必须指定。
- dataType: 'json' 字符串，ajax请求的datatype值。如果type为post并且dataType为json，则强制添加json的相关的headers。
- stringify: true 布尔值，ajax请求的type为post时，是否对提交的数据进行字符串转换。
- searchName: 'q' 字符串，ajax请求时的搜索字段的名称。如果设置了ajax，该值必须指定。
- searchParam: {} 对象，ajax请求时默认提交的参数。
- searchForce: false 布尔值，是否对ajax搜索到的数据进行强制性过滤。
- searchUrl: '' 字符串，ajax搜索时的路径，如果未指定，则使用url参数。
- searchHeaders: {} 对象，ajax搜索时的附加headers。
- searchType: '' 字符串，ajax搜索时的类型，如果未指定则使用type参数。
- searchDataType: '' 字符串，ajax搜索时的datatype，如果未指定则使用datatype参数。

## History

### 1.0.2

- 参数相关变更
  - `unique`默认值由true变更为false
  - 删除参数`hideTrigger`
  - 新增参数`onHide`，替代`hideTrigger`
  - 新增参数`onInput`，指定搜索时的回调函数，默认仅在搜索结果完全匹配时进行触发
  - 新增参数`forceTrigger`，指定搜索时的回调函数触发方式，为true时强制触发
- 修正：input输入时，避免因为键盘回车操作之后的下拉框消失的情形
- 新增：如果设置了maxLength参数，则在input输入时，直接进行判断，避免可能会出现的长文本
- 更新：隐藏下拉框时的数据处理逻辑
- 更新：下拉数据的获取方式直接由`text`参数指定，避免可能会出现的原始数据的text节点值被覆盖
- 更新：设置额外参数的相关操作修改，不再进行DOM的获取以提升处理速度
- 优化：input键盘操作时，ESC和TAB按下时，如果下拉框已经隐藏则不做处理

### 1.0.1

- 参数相关变更
  - 新增参数`unique`，对下拉框进行可能的唯一性确认
  - 新增参数`highlight`，对搜索结果进行高亮
  - 新增参数`hideTrigger`，指定是否在隐藏下拉框时触发回调函数
  - `ellipsis`默认值由true变更为false
  - `ajax`默认值由true变更为false
  - 删除参数`id`
- 新增`$.fn.sinput._default`，可以通过该值进行默认参数的预设
- 修正获取input元素相关规则和位置的逻辑
- 添加unique对应的操作，对下拉框进行唯一性设置
- 添加错误标志，在ajax获取信息失败时，直接进行错误提示
- 搜索时的相关逻辑修改，较少DOM操作以提升搜索的处理速度
- 设置seachHeader时的相关逻辑修改
- 修改stringify的逻辑，只在type为post时进行相关处理
- 指定当ajax的请求类型为post且数据类型为json时的头信息
- 优化当input点击时，下拉框已经弹出时的操作
- 对input的相关事件添加命名空间，避免重新调用本插件时可能出现的多个事件响应

### 1.0.0

**初代版本发布**

- 实现input下拉搜索
- 支持ajax获取数据
- 支持ajax缓存
- 键盘支持：上下键选择、回车确认选择、ESC取消、TAB失去焦点

## jQuery API used

- $()
- $.extend
- $.fn.position
- $.fn.outerHeight
- $.fn.outerWidth
- $.fn.attr
- $.fn.css
- $.fn.hide
- $.fn.show
- $.fn.appendTo
- $.ajax
- $.fn.html
- $.fn.on
- $.fn.off
- $.type
- $.isFunction
- $.fn.text
- $.fn.val
- $.fn.find
- $.fn.data
- $.fn.removeAttr
- $.fn.insertAfter
- $.each
- $.fn.addClass
- $.fn.removeClass
- $.fn.siblings
- $.fn.trigger
- $.fn.prev
- $.fn.next
- $.fn.scrollTop
- $.fn.offset
- $.fn.height
- $.fn.remove
- $.fn.empty
- $.fn.closest
- $.fn.is

## Lisence

[MIT](https://github.com/xovel/sinput/blob/master/LICENSE)