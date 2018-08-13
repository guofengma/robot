//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  appLogin: function (cb) {
    var that = this;  
  },  
  getID: function (callback, res1) {
    var that = this;
    wx.getUserInfo({
      success:function(e){
        var iv=e.iv;
        var encryptedData = e.encryptedData
        var name = e.userInfo.nickName;
        //console.log(e);
        wx.login({
          success: function (res) {
            if (res.code ) {
              wx.request({
                url: that.conf.hosts+'/mp_getMember.action',
                data: {
                  code: res.code,
                  iv:iv,
                  encryptedData: encryptedData,
                  name:name
                },
                success: function (res1) {                  
                  that.globalData.unionId = res1.data.miniMember.unionId;
                  that.globalData.openid = res1.data.miniMember.miniOpenid
                  that.globalData.memberId = res1.data.miniMember.id
                  callback(res1);
                },
                fail: function (res1) {
                  wx.showToast({
                    title: '服务打烊了',
                    icon: 'loading',
                    duration: 2000
                  })
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

      },
      fail:function () {
        wx.showModal({
          title: '警告',
          content: '您拒绝了授权,将无法正常显示个人信息,点击确定重新获取授权。',
          success: function (res2) {
            if (res2.confirm) {
              wx.openSetting({
                success: (res2) => {
                  if (res2.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                    wx.getUserInfo({
                      success: function (res2) {
                        var iv = res2.iv;
                        var encryptedData = res2.encryptedData
                        wx.login({
                          success: function (res) {
                            if (res.code) {
                              wx.request({
                                url: that.conf.hosts + '/mp_getMember.action',
                                data: {
                                  code: res.code,
                                  iv: iv,
                                  encryptedData: encryptedData
                                },
                                success: function (res1) {
                                  that.globalData.unionId = res1.data.miniMember.unionId;
                                  that.globalData.openid = res1.data.miniMember.miniOpenid
                                  that.globalData.memberId = res1.data.miniMember.id
                                  callback(res1);
                                },
                                fail: function (res1) {
                                  wx.showToast({
                                    title: '服务打烊了',
                                    icon: 'loading',
                                    duration: 500
                                  })
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
                    })                    
                  }                  
                }, fail: function (res) {

                }
              })

            }
          }
        })
      }


    });
    
  },  

  globalData: {
    userInfo:null,
    unionId:null,
    memberId:null,
    openid:null
  },
  conf: { 
    hosts: "https://cs.whxueying.com/mini_mczn/miniapp",     
    hostb: "http://localhost:8080/"
  },
  

})
