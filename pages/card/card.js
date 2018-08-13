// pages/card/card.js
const app = getApp()
const baseUrl = app.conf.hosts

Page({
    data: {
        input: '',
        src1: '/images/saoma.png',
        src2: '/images/nodata.png',
        src3: '/images/huawen.png',
        card: {},
        true: true,
        hidden: false,
        code: '',
        cardNumber:''
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({
            title: '我的绑定卡'
        });
        var that = this;
        wx.showLoading({
            title: '加载中',
        })
        wx.request({
            url: app.conf.hosts + '/mp_cardList.action',
            data: {
                memberId: app.globalData.memberId
            },
            success: function(res) {
                wx.hideLoading();
                that.setData({
                    card: res.data.list.reverse()
                });
                if (res.data.list.length == 0) {
                    that.setData({
                        hidden: true,
                        true: false
                    })
                } else {
                    that.setData({
                        hidden: false,
                        true: true
                    })
                }
            },
            fail: function(res) {
                wx.showToast({
                    title: '服务打烊了',
                    icon: 'loading',
                    duration: 500
                })
            }
        })
    },
    //解绑卡号
    jieb: function(res) {
        var that = this;
        var card = res.currentTarget.dataset.card;
        var id = res.currentTarget.dataset.id;
        that.setData({
            input: ''
        })
        wx.showModal({
            title: "",
            content: "〒_〒确定要解绑此卡？",
            showCancel: true,
            success: function(res) {
                if (res.confirm) {
                    wx.request({
                        url: app.conf.hosts + '/mp_unbindCard.action',
                        data: {
                            memberId: app.globalData.memberId,
                            id: id
                        },
                        success: function(res) {
                            if (res.data.normal == 1) {
                                wx.showToast({
                                    title: '解绑成功',
                                    icon: 'sucess',
                                    duration: 1000
                                })
                                wx.request({
                                    url: app.conf.hosts + '/mp_cardList.action',
                                    data: {
                                        memberId: app.globalData.memberId,
                                    },
                                    success: function(res) {

                                        that.setData({
                                            card: res.data.list.reverse()
                                        });
                                        if (res.data.list.length == 0) {
                                            that.setData({
                                                hidden: true,
                                                true: false
                                            })
                                        } else {
                                            that.setData({
                                                hidden: false,
                                                true: true
                                            })
                                        }
                                    },
                                    fail: function(res) {
                                        wx.showToast({
                                            title: '服务打烊了',
                                            icon: 'loading',
                                            duration: 500
                                        })
                                    }
                                })
                            } else {
                                wx.showToast({
                                    title: '服务异常',
                                    icon: 'loading',
                                    duration: 1000
                                })
                            }
                        }
                    });
                } else if (res.cancel) {

                }
            }
        })
    },
    //扫描绑定卡,只允许从相机扫
    saoma: function(res) {
        var that = this;
        wx.scanCode({
            // onlyFromCamera: true,
            success: (res) => {
                //console.log(res.result)
                var bianhao = res.result;
                wx.request({
                    url: app.conf.hosts + '/mp_bindCard.action',
                    data: {
                        memberId: app.globalData.memberId,
                        userCardId: bianhao
                    },
                    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                    // header: {}, // 设置请求的 header
                    success: (res) => {
                        //console.log(res); 
                        if (res.data.normal == 1) {
                            wx.showToast({
                                title: '绑定成功',
                                icon: 'sucess',
                                duration: 500
                            });
                            that.setData({
                                input: bianhao
                            })
                            wx.request({
                                url: app.conf.hosts + '/mp_cardList.action',
                                data: {
                                    memberId: app.globalData.memberId,
                                },
                                success: function(res) {

                                    that.setData({
                                        card: res.data.list.reverse()
                                    });
                                    if (res.data.list.length == 0) {
                                        that.setData({
                                            hidden: true,
                                            true: false
                                        })
                                    } else {
                                        that.setData({
                                            hidden: false,
                                            true: true
                                        })
                                    }
                                },
                                fail: function(res) {
                                    wx.showToast({
                                        title: '服务打烊了',
                                        icon: 'loading',
                                        duration: 500
                                    })
                                }
                            })
                        } else if (res.data.normal == -1) {
                            wx.showToast({
                                title: '无此用户',
                                icon: 'loading',
                                duration: 1000
                            })
                        } else if (res.data.normal == -2) {
                            wx.showToast({
                                title: '缺少参数',
                                icon: 'loading',
                                duration: 1000
                            })
                        } else if (res.data.normal == 0) {
                            wx.showToast({
                                title: '系统出错',
                                icon: 'loading',
                                duration: 1000
                            })

                        } else if (res.data.normal == 2) {
                            wx.showToast({
                                title: '此卡被占用',
                                icon: 'loading',
                                duration: 1000
                            })
                        } else if (res.data.normal == 3) {
                            wx.showToast({
                                title: '设备状态错误',
                                icon: 'loading',
                                duration: 1000
                            })
                        } else if (res.data.normal == 4) {
                            wx.showToast({
                                title: '卡不存在',
                                icon: 'loading',
                                duration: 1000
                            })
                        } else {
                            wx.showToast({
                                title: '绑定失败',
                                icon: 'loading',
                                duration: 1000
                            })
                        }
                    },
                    fail: function(res) {
                        wx.showToast({
                            title: '服务打烊了',
                            icon: 'loading',
                            duration: 500
                        })
                    },
                    complete: function(res) {
                        // complete
                    }
                })
            }
        })
    },
    formSubmit(e) {

        let { userCardId } = e.detail.value
        if (userCardId == '') {
            wx.showToast({
                title: '请输入卡号',
                icon: 'loading',
                duration: 500
            })
            return false
        } 
        wx.request({
            url: `${baseUrl}/mp_bindCard.action`,
            method:'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            data:{
                memberId: app.globalData.memberId,
                userCardId
            },
            success:res => {
                console.log(res)
                let { msg , normal } = res.data
                // 成功绑定
                if (normal==1) {
                    wx.showToast({
                        title: '绑定成功',
                        icon:'success',
                        duration:1000
                    })
                }else {
                    // 失败的绑定
                    wx.showToast({
                        title: `${msg}`,
                        icon:'loading',
                        duration:1000
                    })
                    return
                }
                // 绑定成功后
                wx.request({
                    url: app.conf.hosts + '/mp_cardList.action',
                    data: {
                        memberId: app.globalData.memberId,
                    },
                    success:res => {

                        this.setData({
                            card: res.data.list.reverse()
                        });
                        if (!res.data.list.length) {
                            this.setData({
                                hidden: true,
                                true: false
                            })
                        } else {
                            this.setData({
                                hidden: false,
                                true: true
                            })
                        }
                    },
                    fail: function (res) {
                        wx.showToast({
                            title: '服务打烊了',
                            icon: 'loading',
                            duration: 500
                        })
                    }
                })
            }
        })
    }
})