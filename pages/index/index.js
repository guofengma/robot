//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    scale: 18,
    latitude1: 0,
    longitude1: 0,
    la:0,
    long:0,
    markers: [],
    name:'', 
    address:'',
    distance:'',
    location:'',
    src1: '/images/nav.png',
    hidden:false,
    memberId:'', 
    start:'',
    stop:''
  },
// 页面加载 
  onLoad: function (options) {      
    // 1.设置地图控件的位置及大小，通过设备宽高定位      
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.getSystemInfo({
      success: (res) => {       
        that.setData({
          controls: [{
            id: 1,
            iconPath: '/images/location.png',
            position: {
              left: 20,
              top: res.windowHeight - 75,
              width: 40,
              height: 40
            },
            clickable: true
          },
          {
            id: 2,
            iconPath: '/images/use.png',
            position: {
              left: res.windowWidth / 2 - 90,
              top: res.windowHeight - 80,
              width: 180,
              height: 50
            },
            clickable: true
          },
          {
            id: 3,
            iconPath: '/images/warn.png',
            position: {
              left: res.windowWidth - 57,
              top: res.windowHeight - 130,
              width: 40,
              height: 40
            },
            clickable: true
          },
          {
            id: 4,
            iconPath: '/images/marker.png',
            position: {
              left: res.windowWidth / 2 - 14,
              top: res.windowHeight / 2 - 43,
              width: 27,
              height: 42
            },
            clickable: true
          },
          {
            id: 5,
            iconPath: '/images/avatar.png',
            position: {
              left: res.windowWidth - 57,
              top: res.windowHeight - 75,
              width: 40,
              height: 40
            },
            clickable: true
          }]
        })
      }
    });
    if (that.data.longitude == 0) { 
    //2.获取用户坐标
    wx.getLocation({
      type: "gcj02" ,
      success: (res) => {
                that.setData({
                  longitude: res.longitude,
                  latitude: res.latitude,         
                });

                // 3.请求服务器，显示附近的充电桩，用marker标记
                wx.request({
                  url: app.conf.hosts + '/mp_nearByGps.action',
                  data: {
                    //memberId: app.globalData.memberId,
                    longitude: that.data.longitude,
                    latitude: that.data.latitude,
                    //devType: 2,
                  },
                  method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                  // header: {}, // 设置请求的 header
                  success: (res) => {
                    wx.hideLoading();
                    if (res.data.list.length == 0) {
                      wx.showToast({
                        title: '暂无设备',
                        icon: 'loading',
                        duration: 2000
                      })

                    } else {
                      var param = {};
                      for (var i = 0; i < res.data.list.length; i++) {
                        
                        var string = "markers[" + i + "].id";
                        param[string] = res.data.list[i];

                        var string = "markers[" + i + "].latitude";
                        param[string] = res.data.list[i].location.latitude;

                        var string = "markers[" + i + "].longitude";
                        param[string] = res.data.list[i].location.longitude;

                        var string = "markers[" + i + "].width";
                        param[string] = 40;

                        var string = "markers[" + i + "].height";
                        param[string] = 40;

                        var string = "markers[" + i + "].iconPath";
                        param[string] = "/images/markers.png";
                        
                      }
                      that.setData(param);
                      var markk = that.data.markers;
                      that.setData({
                        markers: markk
                      })

                    }

                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '服务打烊了',
                      icon: 'loading',
                      duration: 1000
                    })
                  },
                  complete: function (res) {
                    // complete
                  }
                });
      },fail:function(){
        wx.hideLoading();
        wx.showToast({
          title: '授权未位置',
          icon: 'loading',
          duration: 2000
        })
        setTimeout(function () {
            wx.openSetting({
                success: (res2) => {
                  if (res2.authSetting["scope.userLocation"]) {////如果用户重新同意了授权位置 
                    that.onLoad();              
                  }
                }, fail: function (res) {
                  wx.showToast({
                    title: '位置未授权',
                    icon: 'loading',
                    duration: 2000
                  })
                }
            },3000)
        })
        
      }
      
     
    });  
  } 

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              app.getID(function (res1) {
                //console.log(res1, 'res1')
                if (res1.userInfo) { } else {
                  that.setData({
                    memberId: res1.data.miniMember.id,
                  }) 
                  app.globalData.memberId = res1.data.miniMember.id;
                  //console.log(app.globalData.memberId)
                  wx.hideLoading();
                }
              });

            }
          })
        }
      }
    });  

  }, 
// 页面显示
  onShow: function(){   
    var that =this; 
    // 创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("myMap");
    this.movetoPosition(); 
  },
// 地图控件点击事件
  bindcontroltap: function(e){   
    
    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id   
    switch(e.controlId){
      // 点击定位控件      
      case 1: this.movetoPosition();
        break;
      // 点击扫码充电，判断当前是否正在计费
      case 2: 
          // 没有在计费就扫码
        if (app.globalData.memberId != null) {

          wx.scanCode({
            success: (res) => {
              // 正在验证余额校验
              var url = res.result;
              if (url.indexOf("?ck") >= 0) { //判断url地址中是否包含ck字符串 
                var a = function () {
                  if (url.indexOf("=") != -1) {
                    var start = url.indexOf("=") + 1;
                    var result = new Array();
                    var i = 0;
                    if (url.search("&") > 0) {
                      var end = url.indexOf("&");
                      result[i] = url.substring(start, end);
                      start = url.indexOf("=", end) + 1;
                      while (url.indexOf("&", start) != -1) {
                        end = url.indexOf("&", start);
                        result[++i] = url.substring(start, end);
                        start = url.indexOf("=", end) + 1;
                      }
                      start = url.indexOf("=", end) + 1;
                      result[++i] = url.substring(start, url.length);
                    }
                    return result;
                    // return result.toString ;
                  } else {
                    console.log('没有参数')
                  }
                };
                //console.log(a()[0]);                
                var ck = a()[0];//获取第一参数ck值
                //开始请求
               
                  wx.request({
                    url: app.conf.hosts + '/mp_parseCk.action',
                    data: {
                      ck: ck,
                      memberId: app.globalData.memberId,
                    },
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: (res) => {
                      if (res.data.products.length>0){
                        if (res.data.normal == 1) {
                          wx.navigateTo({
                            url: '../choose/choose?ck=' + ck,
                          })
                        } else {
                          wx.showToast({
                            title: '设备离线',
                            icon: 'loading',
                            duration: 1000
                          })
                        }
                      }else{
                        wx.showModal({
                          title: "",
                          content: "该插座已被占用，请使用其他插座",
                          showCancel: false,
                          confirmText: "好的",
                          confirmColor: "#3c89ef",                          
                        })
                      }                
                      
                    },
                    fail: function (res) {
                      wx.showToast({
                        title: '服务打烊了',
                        icon: 'loading',
                        duration: 500
                      })
                    },
                    complete: function (res) {
                      // complete
                    }
                  });
                 
              } else {
                wx.showLoading({
                  title: '二维码不可用',
                  mask: true,
                  duration: 1000
                })
              }
            },
            fail: (res) => {
              wx.showToast({
                title: '取消扫码',
                icon: 'loading',
                duration: 1000
              })
            }
          })

        } else {
          wx.navigateTo({
            url: '../my/index?cback=true'
          });
          }
          
        
     
        break;

      // 点击保障控件，跳转到列表页
      case 3: if (app.globalData.memberId != null) {
        wx.navigateTo({
          url: '../list/list'
        }); 
      }else{
        wx.showToast({
          title: '请登录',
          icon: 'loading',
          duration: 1000
        })
        
        wx.navigateTo({
          url: '../my/index'
        });
      }
           
        break;
      // 点击头像控件，跳转到个人中心
      case 5:
        wx.navigateTo({
          url: '../my/index'
        });
     
        break; 
      default: break;
    } 
  },
//点击冒泡事件
 bindmarkertap:function(res){
   //console.log(res)
   var that =this;   
   var devId = res.markerId.devId;
   var markers = that.data.markers;
   for (var i = 0; i < markers.length; i++){
     if (markers[i].id.devId == devId){
       markers[i].height = 50;
       markers[i].width = 50;
     }else{
       markers[i].height = 40;
       markers[i].width = 40;
     }
   }   
   that.setData({
     markers: markers,
     name: res.markerId.name,
     address: res.markerId.address,
     distance: res.markerId.distance,
     location: res.markerId.location,
     ck: res.markerId.ck,
     sum: res.markerId.free,
     hidden:true
   });
},
//点击地图
  mapclick:function(e){
    var that = this
    that.setData({
      hidden: false//隐藏冒泡框
    })
  },
 
// 地图视野改变事件  
  bindregionchange: function(e){
    if (app.globalData.memberId != null){    
      var that = this
      that.setData({
        hidden: false//隐藏冒泡框
      })     
      var time = parseInt(e.timeStamp);      
      //var distime = time[1]-time[0];
      //console.log(time);
      // 拖动地图，获取附件充电桩位置
      if (e.type == "begin") {
        that.setData({
          start: parseInt(e.timeStamp)
        })
        // 停止拖动，显示充电桩位置
      } else if (e.type == "end") { 
        that.setData({
          stop: parseInt(e.timeStamp)
        }) 
        that.getLngLat();//获取拖动中心点坐标
        //var distime = that.data.stop - that.data.start;
        //if (distime > 150) {}
      } 
    }
  },
  //获取中间点的经纬度
  getLngLat: function () {
    var that = this;
    this.mapCtx = wx.createMapContext("myMap");
    this.mapCtx.getCenterLocation({
      success: function (res) {        
        that.setData({ 
          la: res.latitude,
          long: res.longitude
         });

        //console.log(that.data.long, that.data.la);

        if (that.data.long != 0) {
          wx.showLoading({
            title: '加载中',
          })
          wx.request({
            url: app.conf.hosts + '/mp_nearByGps.action',
            data: {
              longitude: that.data.long,
              latitude: that.data.la
            },
            method: 'GET',
            success: (res) => {
              var param = {};
              for (var i = 0; i < res.data.list.length; i++) {

                var string = "markers[" + i + "].id";
                param[string] = res.data.list[i];

                var string = "markers[" + i + "].iconPath";
                param[string] = "/images/markers.png";

                var string = "markers[" + i + "].latitude";
                param[string] = res.data.list[i].location.latitude;

                var string = "markers[" + i + "].longitude";
                param[string] = res.data.list[i].location.longitude;

                var string = "markers[" + i + "].width";
                param[string] = 40;

                var string = "markers[" + i + "].height";
                param[string] = 40;

              }
              if (res.data.list.length == 0) {
                that.setData({ markers: "" });
              } else {
                that.setData(param);
                var markk = that.data.markers;
                that.setData({ markers: markk });
                //console.log(markk.length);
              }
              wx.hideLoading();
            },
          })
        }


      }
    })
  },
  //地图导航到位置
  go: function (res) {
    //console.log(res)
    wx.openLocation({
      latitude: res.currentTarget.dataset.marker.latitude,
      longitude: res.currentTarget.dataset.marker.longitude,
      scale: 18,
      name: res.currentTarget.dataset.name,
      address: res.currentTarget.dataset.address
    })
  },
  //去充电
  chong:function(res){
    //console.log(res);
    var ck = res.currentTarget.dataset.ck;
    var sum = res.currentTarget.dataset.sum;
    if (app.globalData.memberId != null) {
      if (sum > 0) {
        wx.navigateTo({
          url: '../choose/choose?ck=' + ck
        });
      } else {
        wx.showToast({
          title: '无可用插座',
          icon: 'loading',
          duration: 1000
        })
      }
    }else{
      wx.navigateTo({
        url: '../my/index'
      });
    }
    
    
  },
// 定位函数，移动位置到地图中心
  movetoPosition: function(){
    this.mapCtx.moveToLocation();
  }
})
