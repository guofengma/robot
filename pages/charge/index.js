// pages/charge/index.js
var app = getApp()
Page({
  data:{
    inputValue: 0,    
    id: '0',
    displayNums:[],
    id:'0',
    disabled: false
  },  
// 页面加载
  onLoad:function(options){
    var that =this;
    wx.setNavigationBarTitle({
      title: '充值'
    });
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.conf.hosts + '/mp_rechargeBase.action',
      data: {
        memberId: app.globalData.memberId
      },
      success: function (res) {
        that.setData({
          displayNums: res.data.displayNums,
          inputValue: res.data.displayNums[0].amount
        })
        wx.hideLoading();
      },fail(){
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 1000
        })
      }
    }); 
  },

// 选择固定金额
  choosemoney: function (event){
    var that =this;
    var ids = event.currentTarget.dataset.id;  
    //console.log(event.currentTarget.dataset)
    this.setData({
      inputValue:event.currentTarget.dataset.sort,
      id: ids//变色
    })
  }, 
// 充值
  charge: function(){
    var that =this;
    that.setData({
      disabled: true
    })
    wx.login({
      success: function (res) {
        //console.log(res);
        if (res.code) {
          that.setData({
            code: res.code
          });

          // 必须输入大于0的数字
          if (parseInt(that.data.inputValue) <= 0 || isNaN(that.data.inputValue)) {
            wx.showModal({
              title: "",
              content: "请选择充值额度",
              showCancel: false,
              confirmText: "好滴",
              confirmColor: "#3c89ef"
            })
          } else {
            wx.request({
              url: app.conf.hosts + '/mp_recharge.action',
              data: {
                memberId: app.globalData.memberId,
                total_fee: Number(that.data.inputValue)*100,//实际金额
                //total_fee: Number(that.data.inputValue),//测试金额
                openid: app.globalData.openid,
                //code:res.code
              },
              success: function (e) {
                //console.log(e);
                var timeStamp = e.data.paramsMap.timeStamp;
                var nonceStr = e.data.paramsMap.nonceStr;
                var package1 = e.data.paramsMap.package;
                var paySign = e.data.paramsMap.paySign;
                wx.requestPayment({
                  'timeStamp': timeStamp,
                  'nonceStr': nonceStr,
                  'package': package1,
                  'signType': 'MD5',
                  'paySign': paySign,
                  'success': function (res) {
                      wx.showModal({
                        title: "",
                        content: "充值成功",
                        showCancel: false,
                        confirmText: "好滴",
                        confirmColor: "#3c89ef",
                        success: function (res) {
                          wx.navigateBack({
                            url: '../my/index'
                          })
                        }
                      })                    
                  },
                  'fail': function (res) {
                    wx.showModal({
                      title: "",
                      content: "取消付款",
                      showCancel: false,
                      confirmText: "好的",
                      confirmColor: "#3c89ef"                      
                    })
                  }
                })
                that.setData({
                  disabled: false
                })
              },
              fail: function (res) {
                wx.showToast({
                  title: "服务打烊",
                  icon: "loading",
                  duration: 2000
                });               
              }
            })
          }

          
        } else {
          wx.showToast({
            title: "未登陆",
            icon: "loading",
            duration: 2000
          });
        }
      }
    });
    
  },
  


})
