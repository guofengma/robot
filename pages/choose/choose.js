// pages/choose/index.js
var app = getApp()
Page({
  data:{
    inputValue: 0,
    products:{},
    rechargeBases: {},    
    items: [
      { name: 'ye', value: '余额' },
      { name: 'wx', value: '微信支付', checked: 'true' },
    ],       
    src1:'/images/cz.png',
    src1s: '/images/cz2.png',
    src2: '/images/down.png',
    radio1: '/images/radio1.png',
    radio2: '/images/radio2.png',
    sort:'#', 
    money:0,
    name:'',
    addmoney:'0',
    dismoney:'0',
    time:0,
    id:'0',
    price:0,
    radio:'wx',
    dicount:'1',
    sn: '',
    sid: '',
    devType: '',
    picker: [],
    pickerindex:0,
    disabled:false,
    sbbh:''
  },
  
// 页面加载
  onLoad:function(options){
    var that =this;  
    wx.setNavigationBarTitle({
      title: '选择充电口'
    })
    wx.showLoading({
      title: '加载中',
    })  
      wx.request({
        url: app.conf.hosts + '/mp_parseCk.action',
        data: {
          ck: options.ck,
          memberId: app.globalData.memberId 
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: (res) => { 
            wx.hideLoading();                  
            var money = res.data.balance.total;           
            var dicount = parseInt(res.data.rechargeData.discount) / 100;
            var addmoney = parseInt(res.data.rechargeData.list['0'].money) / 100;
            that.setData({
              money: money,//获取余额
               name: res.data.devInfo.devName,//获取设备名称
               sbbh: res.data.devInfo.sn,//获取设备编号
               productnum: res.data.products.length,
               products: res.data.products,//获取可使用插头
               sort: res.data.products[0].sid,//默认选中列表中第一个插座,
               picker:res.data.rechargeData.list,
               sid: res.data.products["0"].sid,
               addmoney: parseInt(res.data.rechargeData.list['0'].money) / 100,        
               dicount: dicount,
               dismoney: (dicount * 10) * (addmoney * 10) / 100,
               sn: res.data.devInfo.sn,
               sid: res.data.products['0'].sid,             
               devType: res.data.devInfo.devType,
               typep: res.data.rechargeData.type
            })
           
            if (money <1) {//判断默认选中支付方式              
              that.setData({
                items: [
                  { name: 'ye', value: '余额'},
                  { name: 'wx', value: '微信支付', checked: 'true'},
                ],
                radio:'wx'
              })
            } else {
              that.setData({
                items: [
                  { name: 'ye', value: '余额', checked: 'true'},
                  { name: 'wx', value: '微信支付'},
                ],
                radio:'ye'
              })
            }
          

        },
        fail: function (res) {
          wx.showToast({
            title: '余额不足',
            icon: 'loading',
            duration: 1000
          })
        },
        complete: function (res) {
          // complete
        }
      });
    
    
  },

// 选择充电插头编号
  choosenum: function (event){
    var that = this;
    //console.log(event.currentTarget);
    var ids = event.currentTarget.dataset.id;            
    that.setData({
      sid: parseInt(event.currentTarget.dataset.sort), 
      sort: parseInt(event.currentTarget.dataset.sort), 
      //sid: event.currentTarget.dataset.sort,
      id: ids//变色    
    }) 
  },
  //选择充值时间下拉
  bindPickerChange: function (e) {
    //console.log(e.detail.value, e, e.target.dataset)
    var i = e.detail.value;
    var addmoney= parseInt(this.data.picker[i].money) / 100;
    var discount = this.data.dicount;
    //console.log(i, this.data.picker[i].money);
    this.setData({
      pickerindex: i,
      addmoney: parseInt(this.data.picker[i].money)/100,
      dismoney: (discount * 10) * (addmoney * 10) / 100,
    })
  },
 
 //选择支付方式
  radioChange: function (e) {
    var that = this;    
    //console.log('radio发生change事件，携带value值为：', e.detail.value)
    that.setData({
      radio: e.detail.value
    })
    
  },
  //开始充电付款
  charge: function (e) {
    var that = this;
    var formIds = e.detail.formId;
    that.setData({
      disabled: true
    })
    //判断是否已选金额与充电插口
    var num =this.data.sort;
    var addmoney = this.data.addmoney;
    var radio = that.data.radio;
    wx.showLoading({
      title: '请稍后',
    })
    if(num=='#'){
      wx.showToast({
        title: '未选择充电插头',
        icon: 'loading',
        duration: 500
      })
    } else if (addmoney === 0) {
      wx.showToast({
        title: '未选择时间',
        icon: 'loading',
        duration: 500
      })
    } else if (radio=='wx'){
        wx.login({
          success(res){
            wx.request({
              url: app.conf.hosts + '/mp_weixinPay.action',
              method:'GET',
              data: {
                memberId: app.globalData.memberId,
                total_fee: Number(that.data.dismoney) * 100, //实际金额
                //total_fee: Number(that.data.dismoney),//测试金额
                code: res.code,                              
                openid: app.globalData.openid,            
                'devAttach.sn': that.data.sn,
                'devAttach.sid': that.data.sid,
                'devAttach.devType': that.data.devType,
                //'devAttach.memberId': app.globalData.memberId,
                'devAttach.moneys': parseInt(that.data.addmoney)*100,
                'devAttach.payMoney': parseInt(that.data.dismoney)*100    
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              success: function (e) {
                //console.log(e);
                wx.hideLoading();
                that.setData({
                  disabled: false
                })
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
                        content: "开始充电，充满自动断电",
                        showCancel: false,
                        confirmText: "好的",
                        confirmColor: "#3c89ef",
                        success: function (res) {
                          wx.navigateBack({
                            url: '../index/index'
                          })
                        }
                      })
                  },
                  'fail': function (res) {
                    wx.showModal({
                      title: "",
                      content: "取消支付",
                      showCancel: false,
                      confirmText: "好的",
                      confirmColor: "#3c89ef",
                      success: function (res) {   
                        that.setData({
                          disabled: false
                        })                     
                      }
                    })
                  }
                })
              },
              fail: function (res) {
                wx.showToast({
                  title: "服务打烊",
                  icon: "loading",
                  duration: 2000
                })
              }
            })
          }
        })
    } 
    else{
      if (formIds == 'the formId is a mock one') {
        wx.showModal({
          title: "",
          content: "请在真实设备中使用余额支付",
          showCancel: false,
          confirmText: "好吧",
          confirmColor: "#3c89ef",
          success: function (res) {
            that.setData({
              disabled: false
            })
          }
        })
        wx.hideLoading();
      } else {        
        wx.request({
          url: app.conf.hosts + '/mp_balancePay.action',
          data: {                   
            sn: that.data.sn,
            sid: that.data.sid,
            devType: that.data.devType,
            payMoney: parseInt(that.data.dismoney) * 100,    
            moneys: parseInt(that.data.addmoney) * 100,   
            memberId: app.globalData.memberId,                    
            formId: formIds,
            openid: app.globalData.openid,
          },
          success: function (res) {
            //console.log(res.data.normal)
            wx.hideLoading();
            that.setData({
              disabled: false
            })
            if (res.data.normal == 0) {
              wx.showToast({
                title: "设备异常",
                icon: "loading",
                duration: 2000
              })
            } else if (res.data.normal == 1) {
              wx.showModal({
                title: "",
                content: "开始充电",
                showCancel: false,
                confirmText: "好滴",
                confirmColor: "#3c89ef",
                success: function (res) {
                  wx.navigateBack({
                    url: '../index/index'
                  })
                }
              })
            } else if (res.data.normal == 2) {
              wx.showToast({
                title: "余额不足",
                icon: "loading",
                duration: 2000
              })
            }
          },
          fail: function () {
            wx.showModal({
              title: "",
              content: "服务中断",
              showCancel: false,
              confirmText: "返回",
              confirmColor: "#3c89ef",
              success: function (res) {
                wx.navigateBack({
                  url: '../index/index'
                })
              }
            })
          }
        })

      }
      
    }
    
  }, 
// 页面销毁，更新本地金额，（累加）
  onUnload:function(){
    wx.getStorage({
      key: 'overage',
      success: (res) => {
        wx.setStorage({
          key: 'overage',
          data: {
            overage: parseInt(res.data.overage) - parseInt(this.data.inputValue)
          }
        })
      },
      // 如果没有本地金额，则设置本地金额
      fail: (res) => {
        wx.setStorage({
          key: 'overage',
          data: {
            overage: parseInt(this.data.inputValue),
            sort:0,
          },
        })
      }
    }) 
  },
  
 //跳转到充值页面
 tiaochong:function(){
   wx.navigateTo({
     url: '../charge/index' 
   })
 }
  

})
