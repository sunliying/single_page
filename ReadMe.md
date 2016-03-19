# A Single Page Application #

this single page application is a practice when I learning ***single page web application*** by Michael S.Mikowski and Josh C. Powell. It is a good example for single page application.                   
I changed something of this example. I'm doing it now...       
做这个应用，我更深刻的理解了js是一种基于事件驱动的编程语言，以及模块模板的特点和优势，首先介绍一下在单页应用书中提到的模块模板的写法
# 模块模板
---
## 自身基本信息
在部写明作者信息、目的、版本信息
## 声明全局变量
## IIFE 匿名自执行函数
### 声明并初始化模块作用域变量
configMap ： 保存模块配置
stateMap ： 保存运行时的状态值
jqueryMap :  缓存jQuery集合:大大减少jQuery对文档的遍历次数，提高性能。
###私有工具方法聚集
  这些方法不操作DOM，因此不需要浏览器就能运行
  如果一个方法不是单个模块的工具方法，则应该把它移到共享的工具方法库里面
###私有DOM方法聚集
  会访问和修改DOM，需要浏览器才能运行
###私有事件处理程序
  比如点击事件，接收web socket消息
  事件处理程序会调用DOM来修改DOM，而不是他们自己来修改
###回调方法
  属于准公开方法；写回调函数
###公开方法
  是模块公开接口的部分，包含configMoudle和initMoudle方法
###返回对象的公开方法
  return{}

## model模块和后台数据的交互 ##
在此应用中是使用socket.io进行的交互，现在正在做虚拟数据的交互
## model模块和前台的交互 ##
使用的是jQuery的全局自定义事件的方式，使用的是[mmikowski的jQuery插件
](https://github.com/mmikowski/jquery.event.gevent)

由于设计的最初想法是只有shell可以调用功能模块的方法，功能模块是不能与model模块之间相互调用的，所有的通信由shell模块一力承担，但是，虽说不能由功能模块调用model模块，但是在shell初始化的时候将model模块暴露的一些交口传递给了chat模块，相当于chat模块可以对model模块进行调用
**整体的流程就是用户的一个action触发一个事件，这个事件回调函数调用了经过shell配置允许的model模块的接口方法，并传入了相应的参数，这个model的方法接受参数之后对数据进行加工，通过socket.io的emit触发事件向后台传入经过一次处理的数据（前提是已经有了on绑定的回调函数），然后后台将model传入的数据进行分析和响应通过参数的形式返回给之前model里面on绑定的回调函数，然后这个函数将接受的参数经过处理之后通过全局自定义事件发布（$.gevent.publish('name',arguemnt)）,这是会调用之前功能模块里订阅的一个事件，并接收发布的参数，并显示在页面上，至此，一套流程基本走完**。          
基本上注意数据的接收和不同模块方法的调用。