// pages/wallet/index.js 
var app = getApp()
Page({
  data: {
    latitude: 0,
    longitude: 0,
    array: {},      
    src2: '/images/nodata.png',  
    hidden:true,    
  },
// 页面加载
  onLoad:function(options){
    var that =this
    wx.setNavigationBarTitle({
      title: '附近充电站'
    });
    wx.showLoading({
      title: '加载中',
    })
    wx.getLocation({
       type: "gcj02",
      success: function(res) {
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
        
          wx.request({
            url: app.conf.hosts + '/mp_nearByGps.action',
            data: {
              //memberId: app.globalData.memberId,
              longitude: that.data.longitude,
              latitude: that.data.latitude,
              //pageIndex: 0,
              //size: 30,
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: (res) => {
              if (res.data.list.length == 0) {
                that.setData({
                  hidden: true,
                  reply: false
                })
              } else {
                that.setData({
                  hidden: false,
                  reply: true
                })
              }
              that.setData({
                array: res.data.list,
                src1: '/images/nav.png',
              })
              wx.hideLoading();
            },
            fail: function (res) {
              wx.showToast({
                title: '服务打烊了',
                icon: 'loading',
                duration: 500
              })             
              that.setData({
                hidden: true,
                reply: false
              })
            },
            complete: function (res) {
              // complete
            }
          })
      },
    })
  },  
 
//地图导航到位置
 go:function(res){
   //console.log(res.currentTarget.dataset.marker)
   wx.openLocation({
     latitude: res.currentTarget.dataset.marker.latitude,
     longitude: res.currentTarget.dataset.marker.longitude,
     scale: 18,
     name: res.currentTarget.dataset.name,
     address: res.currentTarget.dataset.address
   })  
 },

 chong:function(res){   
   var ck = res.currentTarget.dataset.ck;
   var free = res.currentTarget.dataset.free; 
   if (app.globalData.memberId != null) {
     if (free > 0) {
       wx.navigateTo({
         url: '../choose/choose?ck=' + ck
       })
     } else {
       wx.showToast({
         title: '无可用插座',
         icon: 'loading',
         duration: 1000
       })
     }
   }else{
     wx.showToast({
       title: '请登录',
       icon: 'loading',
       duration: 1000
     })
   }  
   
  
 }

 

})