(function (window, document) {
  // dom打印节点id options用户输入的参数
  var Print = function (dom, options) {
    if (!(this instanceof Print)) return new Print(dom, options);
    //默认参数修改 与用户输入修改
    this.options = this.extend({
      noPrint: '.no-print',
      onStart: function () { },
      onEnd: function () { },
      append: null, //网页前加入字段
      prepend: null, //网页后加入字段
      margin:0, //网页打印边距
      size:'portrait'   //portrait;（纵向) landscape;（横向)
    }, options);

    if ((typeof dom) === "string") {
      this.dom = document.querySelector(dom);
    } else {
      this.dom = dom;
    }

    this.init();
  };
  Print.prototype = {
    init: function () {
      var appendDate =  this.options.append!=null?'<div style="width:100%;height: 40px;display: flex;margin:10px 0;"><span style="display: block;margin: 0 auto;line-height: 40px;font-size: 26px;">'+this.options.append+'</span></div>':'';
      var prependDate =  this.options.prepend!=null?'<div style="width:100%;height: 60px;display: flex;"><span style="display: block;margin: 0 auto;line-height: 60px;">'+this.options.prepend+'</span></div>':'';
      var content = appendDate+ this.getStyle() + this.getHtml() + prependDate;
      this.writeIframe(content);
    },
    extend: function (obj, obj2) {
      for (var k in obj2) {
        obj[k] = obj2[k];
      }
      return obj;
    },
    // 获取父页面样式
    getStyle: function () {
      var str = "",
        styles = document.querySelectorAll('style,link');
      for (var i = 0; i < styles.length; i++) {
        str += styles[i].outerHTML;
      }
      // 将所有样式整合在一起
      str += "<style>" + (this.options.noPrint ? this.options.noPrint : '.no-print') + "{display:none;}</style>";
      str += "<style>@media print {@page {margin: "+this.options.margin+";size: "+this.options.size+";}}</style>";
      return str;
    },
    //对打印的数据做处理返回html页面
    getHtml: function () {
      var inputs = document.querySelectorAll('input');
      var textareas = document.querySelectorAll('textarea');
      var selects = document.querySelectorAll('select');

      for (var k in inputs) {
        if (inputs[k].type == "checkbox" || inputs[k].type == "radio") {
          if (inputs[k].checked == true) {
            inputs[k].setAttribute('checked', "checked")
          } else {
            inputs[k].removeAttribute('checked')
          }
        } else if (inputs[k].type == "text" || inputs[k].type == "number") {
          inputs[k].setAttribute('value', inputs[k].value)
        }
      }

      for (var k2 in textareas) {
        if (textareas[k2].type == 'textarea') {
          textareas[k2].innerHTML = textareas[k2].value
        }
      }

      for (var k3 in selects) {
        if (selects[k3].type == 'select-one') {
          var child = selects[k3].children;
          for (var i in child) {
            if (child[i].tagName == 'OPTION') {
              if (child[i].selected == true) {
                child[i].setAttribute('selected', "selected")
              } else {
                child[i].removeAttribute('selected')
              }
            }
          }
        }
      }
      // 数据布局后的html页面
      return this.dom.outerHTML;
    },
    //执行打印框架
    writeIframe: function (content) {
      // 创建一个新的iframe
      var w, doc, iframe = document.createElement('iframe'),
        f = document.body.appendChild(iframe); // 加到body下
      iframe.id = "myIframe";
      iframe.style = "position:absolute;width:0;height:0;top:-10px;left:-10px;";
      w = f.contentWindow || f.contentDocument; //指向iframe window对象
      doc = f.contentDocument || f.contentWindow.document;
      doc.open();
      doc.write(content); //将打印内容加入iframe
      doc.close();
      this.toPrint(w, function () {
        document.body.removeChild(iframe)
      });
    },

    toPrint: function (w, cb) {
      var _this = this;
      w.onload = function () {
        try {
          setTimeout(function () {
            w.focus();
            typeof _this.options.onStart === 'function' && _this.options.onStart();
            if (!w.document.execCommand('print', false, null)) {
              w.print(
                  {
                    orientation:'landscape'
                  }
              );
            }
            typeof _this.options.onEnd === 'function' && _this.options.onEnd();
            w.close();
            cb && cb()
          });
        } catch (err) {
          console.log('err', err);
        }
      }
    }
  };
  window.Print = Print;
}(window, document));