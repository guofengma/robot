// pages/my/index.js
var app = getApp()
Page({
  data:{
    // 用户信息
    userInfo: {
      avatarUrl: "",
      nickName: ""
    },
    bType: "primary", // 按钮类型
    actionText: "登录", // 按钮文字提示
    lock: true,//登录按钮状态，false表示未登录
    ticket: 0,
    overage:'',
    srcqian: '/images/money.png', 
    srccard: '/images/card.png', 
    srctrangel: '/images/right.png', 
    srcrecord: '/images/record.png',
    srcwe: '/images/we.png',
    srcchong:'/images/chong.png',
    real:0,
    send:0 ,
    memberId:'',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    comeback:false,
    loading:1
  },
// 页面加载
  onLoad:function(options){
    wx.showLoading({
      title: '加载中',
    })
    if (options.cback){
      this.data.comeback = true;
    }
    var that=this;
    // 设置本页导航标题
    wx.setNavigationBarTitle({
      title: '个人中心'
    })       
    // 获取本地数据-用户信息    
    wx.getStorage({
      key: 'userInfo',
      // 能获取到则显示用户信息，并保持登录状态，不能就什么也不做
      success: (res) => {              
        this.setData({
          userInfo: {
            avatarUrl: res.data.userInfo.avatarUrl,
            nickName: res.data.userInfo.nickName
          },
          bType: res.data.bType,
          actionText: res.data.actionText,
          lock: false
        })
        wx.hideLoading(); 
      },fail: function (res) {
        wx.showToast({
          title: '获取失败',
          icon: 'loading',
          duration: 500
        })
      },
    });   

    if (!this.data.lock){
      wx.showLoading({
        title: '加载中',
      })
      app.getID(function (res1) {
        console.log(res1, 'res1')
        if (res1.userInfo) { } else {
          that.setData({
            memberId: res1.data.miniMember.id,
          })
          wx.request({
            url: app.conf.hosts + '/mp_getBalance.action',
            data: {
              memberId: app.globalData.memberId
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: (res) => {
              that.setData({
                overage: res.data.balance.total,
                real: res.data.balance.real,
                send: res.data.balance.send,
                ticket: res.data.rechargeCount,
                loading:2
              })
              wx.hideLoading();
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
          })

        }
      });

    }else{
     
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
                  wx.request({
                    url: app.conf.hosts + '/mp_getBalance.action',
                    data: {
                      memberId: app.globalData.memberId
                    },
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header                    
                    success: (res) => {           
                      that.setData({
                        overage: res.data.balance.total,
                        real: res.data.balance.real,
                        send: res.data.balance.send,
                        ticket: res.data.rechargeCount,
                        loading: 2
                      })
                      wx.hideLoading();
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
                  })

                }
              });
              
            },
            fail: function (res) {
              wx.showToast({
                title: '获取失败',
                icon: 'loading',
                duration: 500
              })
            },
          })
        }
      }
    });
    
  },
  bindGetUserInfo: function (e) {
    //this.data.lock = !this.data.lock;
    if (app.globalData.memberId == null && this.data.lock && e.detail.userInfo){
      var that = this;       
      var iv = e.detail.iv;
      var encryptedData = e.detail.encryptedData
      var name = e.detail.userInfo.nickName;
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.getUserInfo({
              //withCredentials: false,
              success: (res) => {                
                that.setData({
                  userInfo: {
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                  },
                  bType: "warn",
                  actionText: "退出登录"
                });
                //wx.hideLoading();
                // 存储用户信息到本地
                wx.setStorage({
                  key: 'userInfo',
                  data: {
                    userInfo: {
                      avatarUrl: res.userInfo.avatarUrl,
                      nickName: res.userInfo.nickName
                    },
                    bType: "warn",
                    actionText: "退出登录"
                  },
                  success: function (res) {
                    //console.log("存储成功")
                  }
                }); 
                app.getID(function (res1) {
                  //console.log(res1,'res1')
                  if (res1.userInfo){}else{
                    that.setData({
                      memberId: res1.data.miniMember.id,
                    })                   
                    wx.request({
                      url: app.conf.hosts + '/mp_getBalance.action',
                      data: {
                        memberId: app.globalData.memberId
                      },
                      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                      // header: {}, // 设置请求的 header
                      success: (res) => {                       
                        that.setData({
                          overage: res.data.balance.total,
                          real: res.data.balance.real,
                          send: res.data.balance.send,
                          ticket: res.data.rechargeCount,
                          loading: 2
                        })
                        wx.hideLoading();
                        if (that.data.comeback) {//扫码未登录跳转
                          wx.navigateBack({
                            url: '../index/index'
                          })
                          wx.showToast({
                            title: '登录成功',
                            icon: 'loading',
                            duration: 500
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
                    })
                  }
                });    
              }
            })
            
          } else {
            console.log('获取用户登录态失败！' + res.errMsg);
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '服务打烊了',
            icon: 'loading',
            duration: 500
          })
        }
      });

    } 


  },
// 登录或退出登录按钮点击事件
  bindAction: function(){
    var that=this;
    // 如果没有登录，登录按钮操作    
    if(this.data.lock){
      wx.showLoading({
        title: "正在登录"
      });      
      wx.login({
        success: (res) => {          
          var code =res.code;
          wx.getUserInfo({
            //withCredentials: false,
            success: (res) => {              
              that.setData({
                userInfo: {
                  avatarUrl: res.userInfo.avatarUrl,
                  nickName: res.userInfo.nickName
                },
                bType: "warn",
                actionText: "退出登录"
              });  
              wx.hideLoading();     
              // 存储用户信息到本地
              wx.setStorage({
                key: 'userInfo',
                data: {
                  userInfo: {
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                  },
                  bType: "warn",
                  actionText: "退出登录"
                },
                success: function(res){
                  //console.log("存储成功")
                }
              });
              app.globalData.memberId = app.globalData.oldMemberId;
              that.setData({
                lock: false
              }) 
            }     
          })
        }
      })
    // 如果已经登录，退出登录按钮操作     
    }else{
      wx.showModal({
        title: "确认退出?",
        content: "退出后将不能使用",
        success: (res) => {
          if(res.confirm){           
            // 退出登录则移除本地用户信息
            wx.removeStorageSync('userInfo')
            this.setData({
              userInfo: {
                avatarUrl: "",
                nickName: "",

              },
              bType: "primary",
              actionText: "登录"
            })
            app.globalData.oldMemberId = app.globalData.memberId;
            app.globalData.memberId = null;
            that.setData({
              lock: true
            })  
          }else {            
            that.setData({
              lock: false
            })  
          }
        },fail: function (res) {
          wx.showToast({
            title: '服务打烊了',
            icon: 'loading',
            duration: 500
          })
        },
      })
    }   
  },

// 我的绑定卡
 card:function(){
   if (this.data.loading == 2){
     wx.navigateTo({
       url: '../card/card'
     })
   }else{
     wx.showToast({
       title: '请稍后',
       icon: 'loading',
       duration: 1000
     })
   }
  
 } ,
 //余额明细
 detail:function(){
   if (this.data.loading == 2) {
     if (this.data.overage!=0){
       wx.showModal({
         title: "",
         content: "充值" + this.data.real + '元，赠送' + this.data.send + '元',
         showCancel: false,
         confirmText: "土豪你好",
         confirmColor: "#3c89ef"
       })   
     }else{
       wx.showModal({
         title: "",
         content: "您还没有余额哦→_→",
         showCancel: false,
         confirmText: "好的",
         confirmColor: "#3c89ef"
       })  
     }   
       
   } else {
     wx.showToast({
       title: '请稍后',
       icon: 'loading',
       duration: 1000
     })
   }   
 },
 // 充值记录
 showTicket: function (res) {   
   var ticket = res.currentTarget.dataset.tiao;   
   if (this.data.loading == 2)  {
      if (ticket == 0) {
        wx.showModal({
          title: "",
          content: "您还没有充值记录",
          showCancel: false,
          confirmText: "好吧",
          confirmColor: "#3c89ef"
        })
      }else{
        //跳转到充值记录列表
        wx.navigateTo({
          url: '../record/record'
        })
      }     
   }else{
     wx.showToast({
       title: '请稍后',
       icon: 'loading',
       duration: 1000
     })
   }
 },
 // 跳转到充值页面
 movetoCharge: function () {
   // 关闭当前页面，跳转到指定页面，返回时将不会回到当前页面
   if (this.data.loading == 2) {
     wx.navigateTo({
       url: '../charge/index'
     })   
   }else{
     wx.showToast({
       title: '请稍后',
       icon: 'loading',
       duration: 1000
     })
   }
   
 },
})