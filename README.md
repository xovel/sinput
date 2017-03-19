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
- maxLength: 0 数值，指定input元素的maxlength，如果input元素本身已经设定了maxlength，则取两者的最小值。
- height: 200 数值，**必须**，下拉框的最大高度。
- fontSize: '12px' 字符串，指定下拉框内各子元素的字体大小。
- border: '1px solid #66afe9' 字符串，指定下拉框的边框样式。
- background: '#fff' 字符串，指定下拉框的CSS背景。
- padding: '5px' 字符串，指定下拉框内各子元素的内边距。
- zIndex: 0 数值，指定下拉框的z-index值，如果为0，则忽略该参数。
- hoverColor: '#fff' 数值，指定下拉框内当前被选中的元素的颜色。
- hoverBackground: '#3399ff' 字符串，指定下拉框内当前被选中的元素的CSS背景。
- title: true 布尔值，下拉框内下拉子元素是否添加title属性，title与文本一致。
- ellipsis: false 布尔值，下拉框内下拉子元素是否在超出时显示省略符。如果为真，下拉子元素将不会进行折行显示。
- extraData: [] 数组，指定额外数据，如果设置该值，在进行点击等相关操作时，会同时提取对应的额外数据。如果下一条参数为真，则额外数据将会以隐藏的input进行追加。
- extraDataName: false 数组或布尔值，指定上一条额外数据对应的名称，如果设置为true，名称将保持与额外数据的一致；如果设置为false，额外数据将会直接挂载到input元素之上。
- preventKeyEvent: false 布尔值，input元素的上下方向键输入时是否阻止默认事件。
- data: [] 数组，指定下拉框内的数据来源，数组内的子元素可以是字符串，也可以是对象。如果ajax参数为真，则忽略该参数；如果ajax为false，则必须设定该参数。
- text: 'text' 字符串，**必须**，下拉框内数据来源的名称。根据该参数进行数据的读取。
- scroller: false _jQuery选择器_，页面滚动时下拉框位置调整，本参数指定触发滚动的元素，默认为false。
- highlight: false 布尔值，在进行搜索时，是否对匹配的结果进行高亮显示。高亮方式为常规的b标签加粗。
- add: false 布尔值，如果输入的元素未能完全匹配到结果，是否保留该值。
- callback: null 函数，在点击下拉子元素时触发的回调函数。
- onHide: false 布尔值，在其它地方按下鼠标时，是否触发callback回调函数。
- onInput: false 布尔值或函数，在进行搜索时，在出现完全匹配的结果时，触发的回调函数。如果为真并且不为函数，则使用callback回调函数。
- forceTrigger: false 布尔值，在进行搜索时，是否强制进行回调函数的触发。
- responseReader: 'data' 字符串，ajax获取到的数据的读取器。如果不进行设置，则使用ajax返回的数据。
- headers: {} 对象，发送ajax请求时的headers值。
- init: true 布尔值，ajax加载数据时，是否直接进行初始化获取。
- cache: false 布尔值，是否对ajax结果进行缓存。如果设置为false，则相关数据均会从ajax获取。
- url: '' 字符串，ajax请求的路径。如果设置了ajax，该值必须指定。
- urlParse: false 布尔值，是否对url进行解析，提取url中自带的参数。仅对type为post时有效。
- type: 'get' 字符串，ajax请求的提交类型，一般为get或post。如果设置了ajax，该值必须指定。
- dataType: 'json' 字符串，ajax请求的datatype值。如果type为post并且dataType为json，则强制添加json的相关的headers。
- stringify: true 布尔值，ajax请求的type为post时，是否对提交的数据进行字符串转换。
- searchName: '' 字符串，ajax请求时的搜索字段的名称。如果为指定，则取text参数。
- searchParam: {} 对象，ajax请求时默认提交的参数。
- searchForce: false 布尔值，是否对ajax搜索到的数据进行强制性过滤。

## Build

1. 将本repo的代码clone至本地： `git clone git@github.com:xovel/sinput.git`
2. 安装所需依赖： `npm install`
3. 运行gulp进行文件的提取与打包： `gulp`，生成的文件将会放置在`dist`目录下。
4. 运行`gulp build`将会从`config.js`提取相关信息进行文件的生成，`config.js`为默认值预设文件。

代码的压缩采用`uglifyjs`，压缩后的文件名以`.min`方式追加。

## TODO

- [ ] ajax数据过多时的分页操作
- [ ] 插件文档页面
- [ ] 英文文档

## History

### 1.0.5

- 添加隐藏参数`matchTrigger`，用于开启在输入时全匹配文本时，是否触发回调函数。无默认值，即默认值为`undefined`
- 更新：点击回调事件的处理逻辑更新，修复上一个功能带来的回调失效问题
- 更新：对于添加的额外数据，使用`extraDataName`时，input元素提交附加，后续不再对其进行删除重建的操作
- 修复：ajax加载数据返回为空时，加载提示信息不会消失的问题
- ~~修复：IE下placeholder的问题，修复失败，已采取下一条修复方式。~~
- 修复：IE下由于不明原因自动触发input元素的input事件造成的问题，将`input`事件修改为`keyup`事件
- 更新：options.init开启时，对下拉框提前渲染
- 新增：在options.add为真时，当出现可添加提示文字时，点击该文字隐藏下拉并触发回调
- 更新：隐藏下拉框时，如果已经对元素赋空值，则需要同步重新渲染下拉框
- 添加隐藏参数`clickLoad`，用于在点击时是否加载全部数据。无默认值，即默认值为`undefined`
- 更新：渲染下拉框的代码更新，主要用于针对新增参数`clickLoad`的适应性调整
  - 高亮的处理逻辑更新
  - 点击时根据高亮的元素进行自动定位
  - 下拉框内子元素的样式附加逻辑更新，使用直接的字符串拼接

### 1.0.4

- 参数相关变更
 - 删除参数`ajax`，通过指定`url`参数，直接开启ajax功能
 - 删除参数`idPrefix`，额外数据在使用`input`进行赋值时，不指定其id，改为使用`sinput-extra`类名进行标识
 - 新增参数`emptyTrigger`，指定输入框在进行输入时，当输入为空串时是否触发回调函数
 - `unique`默认参数值更改为`true`，开启对下拉元素的唯一性指定
 - `cache`参数默认值更改为`true`，默认开启对ajax结果的缓存
 - `type`参数默认值更改为`GET`，使用大写，以贴近ajax标准
 - `searchName`参数默认值为改为空串，表示与text参数相同
 - `urlParse`参数默认值改为`true`，对type类型为post的请求，默认解析url并提取参数放入到seachParam参数中
 - 删除参数`searchUrl`、`searchHeaders`、`searchType`、`searchDataType`，搜索时的各个参数直接由之前的进行指定即可，不需要重新指定一份
- 更新：去除对参数的判定，如果未指定数据来源，视为空数据
- 更新：`urlParse`的处理逻辑提升至参数初始化的阶段
- 新增：引入`$.fn.sinput.guid`，对每一个调用本插件的元素进行标识
- 更新：调整`unique`的逻辑，不论是否插件元素带有id，均进行指定，如果没有id，则使用上面的guid
- 更新：下拉框元素处理逻辑更新，消息提示元素的处理逻辑更新，提升操作的便利性
- 更新：删除插件元素的`focus`事件以及相关标记的状态
- 更新：优化ajax的请求，调用ajax时直接中止之前的ajax请求
- 修复：更改`$.ajax`参数名的错误`datatype`应为`dataType`
- 更新：消息提示元素的显示与隐藏逻辑更新
- 更新：为绑定`body`元素的`mousedown`事件添加一个命名
- 新增：为`window`的`resize`事件绑定调整下拉框位置的功能
- 更新：下拉框的`mouseenter`事件处理逻辑更新，提升操作速度
- 更新：渲染下拉框的下拉元素时的处理逻辑更新，大幅度提升多数据时的渲染速度

### 1.0.3

- 参数相关变更
  - 新增参数`background`，指定下拉框的CSS背景
  - 新增参数`scroller`，指定滚动触发元素
  - `hoverBackground`默认值变更为`#3399ff`，该值为FireFox浏览器select下拉框被选中的下拉元素的背景色
- 修复：数据初始化判断逻辑验证位置调整
- 新增：对下拉框添加`box-sizing`的CSS项，设定值为`border-box`
- 修复：获取input元素的位置时方法更改，避免定位问题造成的下拉框错位
- 新增：页面滚动时下拉框位置调整，参数项为`scroller`，默认为fasle，不做触发

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

[jQuery API Documentation](http://api.jquery.com/)

- $()
- $.extend
- $.fn.offset
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
- $.fn.height
- $.fn.remove
- $.fn.empty
- $.fn.closest
- $.fn.is

## Lisence

[MIT](https://github.com/xovel/sinput/blob/master/LICENSE)