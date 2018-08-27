// pages/nearby/nearby.js
const app = getApp()
Page({
    data: {
        latitude:0,
        longitude:0,
        isShow:true,
        listData:[],
        src2: '/images/nodata.png'
    },
    onLoad () {
        wx.showLoading({
            title: '加载中',
            icon:'loading',
            duration:1500
        })
        wx.getLocation({
            type:'gcj02',
            success: res => {
                let { latitude, longitude } = res
                this.setData({
                    latitude,
                    longitude
                })
                this._getNearByGps(latitude, longitude)
            }
        })
    },
    _getNearByGps(latitude, longitude) {
        wx.request({
            url: `${app.conf.hosts}/mp_nearByGps.action`,
            method: 'POST',
            data:{
                longitude,
                latitude
            },
            header:{
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: res => {
                const { list } =  res.data
                if (!list.length) {
                    this.setData({
                        isShow:false
                    })
                }else {
                    this.setData({
                        isShow: true,
                        listData:list
                    })
                }
                
            },
            fail: res => {
                wx.showToast({
                    title: '服务打烊了',
                    icon: 'loading',
                    duration: 500
                })
                this.setData({
                    isShow: false
                })
            },
        })
    },
    go: e => {
        const { latitude, longitude, name, address } = e.currentTarget.dataset.marker
        wx.openLocation({
            latitude,
            longitude,
            scale: 18,
            name,
            address
        })
    },
    chong: e => {
        let { ck, free } = e.currentTarget.dataset
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
        } else {
            wx.showToast({
                title: '请登录',
                icon: 'loading',
                duration: 1000
            })
        } 
    }
})