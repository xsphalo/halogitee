//app.js
var api = 'https://b.3dsort.com';
App({
  globalData: {
    url2: 'http://www.maidianxiu.com',
    url: api,
    userInfo: null,
    locationInfo: null
  },
  login: function (relua) {
    // 展示本地存储能力
    var url = api;
    // 登录
    var that = this
    var user = wx.getStorageSync('user') || {};
    var userInfo = wx.getStorageSync('userInfo') || {};
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;

    // var shopid = 1;
    wx.setStorageSync('shopid', shopid);
    wx.login({
      success: function (res) {
        var code_ = res.code;
        if (res.code) {
          wx.getUserInfo({
            success: function (res) {
              //console.log(objz);  
              wx.setStorageSync('userInfo', res.userInfo);//存储userInfo  
              userInfo = res.userInfo;
              wx.request({
                url: url + '/cy/member/check',
                data: {
                  code: code_,
                  shopid: shopid,
                  userinfo: userInfo
                },
                method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT    
                // header: {}, // 设置请求的 header    
                success: function (res) {
                  if (res.data.errorCode == 0) {
                    wx.setStorageSync('openid', res.data.results.openid);
                    wx.setStorageSync('icode', res.data.results.icode);

                    that.getShopInfo(relua);

                  } else {
                  }

                }
              });
            }
          });
          var d = that.globalData;//这里存储了appid、secret、token串    
        }
      }
    });

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  //获取首页店铺的信息
  getShopInfo: function (relua) {
    let _this = this;
    let openid = wx.getStorageSync('openid');
    let shopid = wx.getStorageSync('shopid');
    let subsid = wx.getStorageSync('subsid');

    // if (!subsid) {
    //   wx.navigateTo({
    //     url: '/pages/storeList/storeList'
    //   })
    // }else {
    wx.request({
      url: api + '/cy/index/shop',
      method: 'post',
      data: {
        'openid': openid,
        'shopid': shopid,
        'subsid': subsid,
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          wx.setStorageSync('shopinfo', res.data.results);
          wx.reLaunch({
            url: relua,
          })
        }
      }
    })
    // }
  },
  bindInviter: function () {
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var icode = wx.getStorageSync('inviter');
    console.log('icode', icode);
    wx.request({
      url: api + '/cy/member/bind',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        icode: icode
      },
      success: function (res) {
      }
    })
  },

})