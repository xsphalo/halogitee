// pages/confirmorders/confirmorders.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: { country: '暂无地址信息', address: '' },
    mreduce: 0,
    reduce: 0,
    discount: 0,
    mtext: '',
    text: '请选择',
    date: '请选择日期',
    time: '请选择时间',
    paytype:2,
    shows:[],
    imgDomain: app.globalData.url2,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  
  formSubmit: function (e) {
    var that = this;
    var openid = wx.getStorageSync("openid");
    var shopid = wx.getStorageSync("shopid");
   
    wx.request({
      method: 'post',
      url: app.globalData.url + '/cy/order/detail',
      data: {
        'openid': openid,
        'shopid': shopid,
        
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.applying();
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/shoplist/shoplist',
            });
          }, 1000);

        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
 
  odershow:function(){
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var items = wx.getStorageSync('items');
    var addressid = wx.getStorageSync('addressid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/order/show',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        subsid: subsid,
        items: items,
        addressid: addressid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var glist = res.data.results.goods;
          that.setData({ glist: glist });
          that.goodsprice();
          that.getExpress();
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  getDefaultAddress: function () {
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var addressid = wx.getStorageSync('addressid');
    var that = this;
    if (addressid != undefined && addressid != '') {
      wx.request({
        url: app.globalData.url + '/cy/address/detail',
        method: 'post',
        data: {
          shopid: shopid,
          openid: openid,
          subsid: subsid,
          id: addressid
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            that.setData({ address: res.data.results })
            that.getExpress();
          } else {
            
          }
        }
      })
    } else {
      wx.request({
        url: app.globalData.url + '/cy/address/default',
        method: 'post',
        data: {
          shopid: shopid,
          openid: openid,
          subsid: subsid
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            that.setData({ address: res.data.results });
            wx.setStorageSync('addressid', res.data.results.id);
            that.getExpress();
          } else {
            wx.showToast({
              title: res.data.errorStr,
            })
          }
        }
      })
    }
  },
  memberInfo: function () {
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/member/center',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ member: res.data.results });
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  orderprice: function () {
    var gtotal = this.data.gtotal;
    var expressprice = this.data.expressprice;
    var ototal = gtotal + parseFloat(expressprice);
    this.setData({ ototal: ototal, gtotal: gtotal });
    this.mcardDiscount();
  },
  goodsprice: function () {
    var glist = this.data.glist;
    var len = glist.length;
    var gtotal = 0;
    for (var i = 0; i < len; i++) {
      gtotal += glist[i].info.price * glist[i].count;
    }
    this.setData({ gtotal: gtotal });
  },
  getExpress: function () {
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var addressid = wx.getStorageSync('addressid');
    var price = this.data.gtotal;
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/order/express',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        addressid: addressid,
        price: price
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          that.setData({ expressprice: res.data.results });
          that.orderprice();
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.errorStr,
          })
        }
      }
    })
  },
  setRemarks: function (event) {
    this.setData({ remarks: event.detail.value });
  },
  create: function () {
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var items = wx.getStorageSync('items');
    var oid = this.data.oid;
    var cindex = this.data.cindex;
    var cards = this.data.cards;
   
    var carrytime = this.data.date + ' ' + this.data.time;
    var that = this;
    var code = '';
    var dtype = 1;
    var num = this.data._num;
    if (num == 2) {
      dtype = 1;
    }
    if (cards[cindex] != undefined) {
      code = cards[cindex].code;
    }
    if (oid == undefined || oid == 0) {
      var that = this;
      if (dtype == 1 && (this.data.address == undefined || this.data.address == null)) {
        wx.showModal({
          title: '提示',
          content: '请选择地址',
        });
        return;
      }
      var addressid = this.data.address.id;
      if (dtype == 1 && (addressid == undefined || addressid == 0)) {
        wx.showModal({
          title: '提示',
          content: '请选择地址',
        });
        return;
      }
      
      if (dtype == 0 && (carrytime == undefined || carrytime == '')) {
        wx.showModal({
          title: '提示',
          content: '请选择配送时间',
        });
        return false;
      }
      var did = wx.getStorageSync('did');
      if (did == undefined || did == null || did == '') {
        did = 0;
      }

      var remarks = wx.getStorageSync('remarks');
      wx.removeStorageSync('remarks');
      wx.request({
        url: app.globalData.url + '/cy/order/create',
        method: 'post',
        data: {
          shopid: shopid,
          subsid: subsid,
          openid: openid,
          items: items,
          dtype: dtype,
          addressid: addressid,
          remarks: remarks,
          
          carrytime: carrytime,
          code: code,
          did: did
        },
        success: function (res) {
          if (res.data.errorCode == 0) {
            var oid = res.data.results;
            that.setData({ oid: oid });
            that.setData({
              actionSheetHidden: !that.data.actionSheetHidden
            });
            that.pay();
          } else if (res.data.errorCode == 2008) {
            wx.showModal({
              title: '提示',
              content: res.data.errorStr,
            })
          } else {
            wx.showToast({
              title: res.data.errorStr,
            })
          }
        }
      })
    } else {
      this.setData({
        actionSheetHidden: !this.data.actionSheetHidden
      })
    }

  },
  /**
   * 支付
   */
  pay: function () {
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var subsid = wx.getStorageSync('subsid');
    var paytype = this.data.paytype;
    
    var ototal = this.data.ototal;
    var balance = this.data.member.balance;
    if (paytype == 1 && parseFloat(ototal) > parseFloat(balance)) {
      wx.showToast({
        title: '余额不足',
      })
      return false;
    }
    var oid = this.data.oid;
    wx.request({
      url: app.globalData.url + '/cy/order/pay',
      method: 'post',
      data: {
        shopid: shopid,
        subsid: subsid,
        openid: openid,
        id: oid,
        paytype: paytype
      },
      success: function (res) {
        if (res.data.errorCode == 0 && paytype == 2) {
          var results = res.data.results;
          if (results.return_code == 'SUCCESS' && results.result_code == 'SUCCESS') {
            wx.requestPayment({
              timeStamp: results.timeStamp,
              nonceStr: results.nonceStr,
              package: results.package,
              signType: results.signType,
              paySign: results.paySign,
              success: function (res) {
                wx.redirectTo({
                  url: '/pages/orders/orders?status=1',
                })
              }
            })
          } else {
            wx.showToast({
              title: results.return_msg,
            })
          }
        } else if (res.data.errorCode == 0 && paytype == 1) {
          wx.redirectTo({
            url: '/pages/orders/orders?status=1',
          })
        } else {
          wx.showToast({
            title: res.data.errorStr,
          })
        }
      }
    })
  },
  //获取卡券列表
  getCards: function () {
    var that = this;
    var ext = wx.getExtConfigSync();
    var shopid = ext.shopid;
    var openid = wx.getStorageSync('openid');
    wx.request({
      url: app.globalData.url + '/cy/coupon/ocard',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid,
        fee: that.data.ototal
      },
      success: function (res) {
        if (res.data.errorCode == 0) {
          var clen = res.data.results.length;
          if (clen > 0) {
            that.setData({ nocards: false, cards: res.data.results });
            wx.setStorageSync('cards', res.data.results);
            that.showDiscount();
          } else {
            wx.setStorageSync('cards', []);
            that.setData({ cards: [] });
          }
        }
      }
    })
  },
  //打开卡券列表
  cardList: function () {
    
    wx.navigateTo({
      url: '/pages/cards/cards',
    })
  },
  //显示优惠
  showDiscount: function () {
    var cindex = parseInt(this.data.cindex);
    var cards = this.data.cards;
    var text = '请选择';
    var reduce = 0;
    if (isNaN(cindex) || cindex < 0 || cindex >= cards.length) {
      // return;
    } else {
      var card = cards[cindex];
      var gtotal = parseFloat(this.data.gtotal);

      if (card.type == 'CASH') {
        text = '-' + card.reduce;
        var reduce = parseFloat(card.reduce).toFixed(2);
      } else if (card.type == 'DISCOUNT') {
        text = card.discount + '折';
        var reduce = gtotal - (gtotal * card.discount / 10).toFixed(2);
      }

    }
    this.setData({ text: text, reduce: reduce });
  },
  //会员卡折扣
  mcardDiscount: function () {
    var shopid = wx.getStorageSync('shopid');
    var openid = wx.getStorageSync('openid');
    var that = this;
    wx.request({
      url: app.globalData.url + '/cy/coupon/omcard',
      method: 'post',
      data: {
        shopid: shopid,
        openid: openid
      },
      success: function (res) {
        if (res.data.errorCode == 0 && res.data.results != null) {
          that.setData({ mdiscount: res.data.results.discount });
          var gtotal = parseFloat(that.data.gtotal);
          var mtext = res.data.results.discount + '折';
          that.setData({ mreduce: gtotal - parseFloat((gtotal * res.data.results.discount / 10)).toFixed(2), mtext: mtext })
        }
        that.getCards();
      }
    })
  },
  toaddress: function () {
    wx.setStorageSync('from', 'order');
    wx.navigateTo({
      url: '/pages/addresslist/addresslist',
    })
  },
  bindDateChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    this.setData({ oid: 0 });
    this.getDefaultAddress();
    this.odershow();
    this.memberInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})