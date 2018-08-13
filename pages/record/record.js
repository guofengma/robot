// pages/record/index.js
var app = getApp()
Page({
  data: {
    array: {     
    }, 
    array2: {
    },    
    src1: '/images/nav.png',
    src2: '/images/nodata.png',
    hidden: false,
    tabs:0,
    tab2: false,
    tab1: true,
    pageSize:10,
    i:1,
    i2:1,
    showdes: false,
    none:''
  },
// 页面加载

  onLoad:function(options){
    var that=this;   
    wx.setNavigationBarTitle({
      title: '交易记录'
    });
    wx.showLoading({
      title: '加载中',
    })
    if(that.data.tabs==0){
      that.setData({
        tab1: false,
        tab2: true,
      })
      wx.request({
        url: app.conf.hosts + '/mp_consumeRecord.action',
        data:{
          memberId: app.globalData.memberId,
          pageIndex:that.data.i,
          pageSize: that.data.pageSize
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: (res) => {          
          wx.hideLoading();
          that.setData({
            array2: res.data.list,
            showdes: true
          })
          if (res.data.list.length == 0) {
            that.setData({
              hidden: true,
              showdes: false,
              none: ''
            })           
          } else if (res.data.list.length < 10) {
            that.setData({
              showdes: false,
              none: ''
            })
          } else {
            that.setData({
              hidden: false          
            })
          }
        }
      })      

    } if (that.data.tabs == 1){
      that.setData({
        tab2: false,
        tab1: true
      })
      wx.request({
        url: app.conf.hosts + '/mp_rechargeRecord.action',
        data: {
          unionId: app.globalData.userInfo.unionId,
          pageIndex: that.data.i2,
          pageSize: that.data.pageSize
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: (res) => {
          wx.hideLoading();
          that.setData({
            array: res.data.list,
            showdes: true
          })

          if (res.data.list.length == 0) {
            that.setData({
              hidden: true,
              showdes: false,
              none: ''
            })            
          }else if (res.data.list.length < 10) {
            that.setData({
              showdes: false,
              none: ''
            })
          }
          else{
            that.setData({
              hidden: false              
            })            
          }

        },
        fail: function (res) {
          wx.showToast({
            title: '连接失败',
            duration: 500
          })
          that.setData({
            hidden: false
          })
        },
        complete: function (res) {
          // complete
        }
      })
    } 
  },
  tab:function(res){
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      tabs: res.target.dataset.tab,
      i:1,
      i2:1,
      showdes: false      
    });   
    if (that.data.tabs == 0) {
      that.setData({
        tab1: false,
        tab2: true,        
      })
      wx.request({
        url: app.conf.hosts + '/mp_consumeRecord.action',
        data: {
          memberId: app.globalData.memberId,
          pageIndex: that.data.i,
          pageSize: that.data.pageSize
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: (res) => {
          //console.log(res);
          wx.hideLoading();
          that.setData({
            array2: res.data.list,
            showdes: true          
          })
          if (res.data.list.length == 0) {
            that.setData({
              hidden: true,
              showdes: false,
              none: ''
            })
            //console.log(res.data.list.length)
          } else if (res.data.list.length < 10) {
            that.setData({
              hidden: false,
              showdes: false,
              none: ''
            })
          } else {
            that.setData({
              hidden: false
            })
          }
        }
      })

    } else {
      that.setData({
        tab2: false,
        tab1: true
      })
      wx.request({
        url: app.conf.hosts + '/mp_rechargeRecord.action',
        data: {
          memberId: app.globalData.memberId,
          pageIndex: that.data.i2,
          pageSize: that.data.pageSize
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: (res) => {
          wx.hideLoading();
          that.setData({
            tab2: false,
            tab1: true,
            array: res.data.list,
            showdes: true         
          })
          if (res.data.list.length == 0) {
            that.setData({
              hidden: true,
              showdes: false,
              none: ''
            })
            //console.log(res.data.list.length)
          } else if (res.data.list.length < 10) {
            that.setData({
              hidden: false,
              showdes: false,
              none: ''
            })
          }else {
            that.setData({
              hidden: false
            })
          }

        },
        fail: function (res) {
          wx.showToast({
            title: '连接失败',
            duration: 500
          })
          that.setData({
            hidden: false
          })
        },
        complete: function (res) {
          // complete
        }
      })
    }
       
  },

  showmore:function(){
    var that =this;
    wx.showLoading({
      title: '加载更多',
    });
    if (that.data.tabs == 0) {    
      that.setData({
        tab1: false,
        tab2: true,
        i: that.data.i+1  
      })     
      wx.request({
        url: app.conf.host + '/mp_consumeRecord.action',
        data: {
          memberId: app.globalData.memberId,
          pageIndex:that.data.i,
          pageSize: that.data.pageSize
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: (res) => {
          //console.log(res);
          wx.hideLoading();
          that.setData({           
            array2: that.data.array2.concat(res.data.list)            
          })
          if (res.data.list.length < 10) {
            that.setData({             
              i: that.data.i,
              showdes: false,
              none: '＞ω＜没有更多内容了'
            })           
          } 
        },fail: function (res) {
          wx.showToast({
            title: '连接失败',
            duration: 500
          })
          that.setData({
            hidden: false
          })
        },
        
      })

    } else {
      that.setData({
        tab2: false,
        tab1: true,
        i2: that.data.i2 + 1 
      })
      wx.request({
        url: app.conf.hosts + '/mp_rechargeRecord.action',
        data: {
          memberId: app.globalData.memberId,
          pageIndex: that.data.i2,
          pageSize: that.data.pageSize
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: (res) => {
          wx.hideLoading();
          that.setData({
            tab2: false,
            tab1: true,
            array: that.data.array.concat(res.data.list) 
          })
          if (res.data.list.length < 10) {
            that.setData({
              i: that.data.i,
              showdes: false,
              none: '＞ω＜没有更多内容了'
            })            
          } else{
            that.setData({
              i: that.data.i,
              showdes: true
            })  
          }

        },
        fail: function (res) {
          wx.showToast({
            title: '连接失败',
            duration: 500
          })
          that.setData({
            hidden: false
          })
        },
        complete: function (res) {
          // complete
        }
      })
    }

  }

})