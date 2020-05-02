// pages/main/main.js
const util = require('../../utils/util.js');
const app = util.app;
var stageNum = 0;   // current question stage
var types = []; // result types
var userType = []; // initial user scores
var questions = [];
var userInfo = {};
var nickName = "";
var openid;
var testName = "";
var delayTime = 1000;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    stage: stageNum,
    questions: questions,
    result: "",
    resultStatus: false,
    imagesrc: "",
    name: "",
    hasUserInfo: false,
    percentage: 0,
    delayTime: delayTime
  },



  chosen: function(e) {

    //console.log(e.target.dataset);
    for(var i = 0; i < userType.length; i++){ // add scores
      userType[i] += questions[stageNum].scores[e.target.id][i];
    }

    // increment questions stage number
    stageNum++;
    let percent = (stageNum / questions.length * 100).toFixed(1);
    var that = this;
    setTimeout(function(){
      that.setData({
        stage: stageNum,
        percentage: percent
      })
    }, delayTime)
    //console.log(this.data.percentage)

    //console.log(userType);

    wx.showToast({
      title: '选择成功',
      icon: '../images/response/icon_nav_feedback.png',
      mask: true,
      duration: delayTime
    })

    if(stageNum == questions.length){ // if no questions left
      var maxIndex = util.pickIndexOfMax(userType);
      var that = this;
      setTimeout(function () {
        that.setData({
          resultStatus: true
        })
      }, delayTime)

      wx.showToast({
        title: '选择成功',
        icon: '../images/response/icon_nav_feedback.png',
        mask: true,
        duration: delayTime
      })
      
      this.setData({  // return result
        result: types[maxIndex]
      })
      let name = this.data.name;
      let result = this.data.result;
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          userInfo = res.userInfo;
          nickName = userInfo.nickName;
          // console.log("success", res)
        },
        complete: res => {
          if (app.globalData.openid) {
            this.setData({
              openid: app.globalData.openid
            })
          }
          const db = wx.cloud.database();
          var d = new Date();
          db.collection('user-history').where({
            _openid: this.data.openid,
            qname: name
          }).get({
            success: res => {
              if(res.data.length){
                db.collection('user-history').doc(res.data[0]._id).update({
                  data: {
                    date: d,
                    result: result
                  }
                })
                if(!Object.keys(res.data[0].userInfo).length){
                  db.collection('user-history').where({
                    _openid: this.data.openid,
                  }).get({
                    success: res => {
                      for(var i = 0; i < res.data.length; i++){
                        db.collection('user-history').doc(res.data[i]._id).update({
                          data: {
                            nickName: nickName,
                            userInfo: userInfo
                          }
                        })
                      }
                    }
                  })
                }
              }else{
                // console.log("complete", res)
                db.collection('user-history').add({
                  data: {
                    qname: name,
                    result: result,
                    nickName: nickName,
                    date: d,
                    userInfo: userInfo
                  }
                })
              }
            }
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const db = wx.cloud.database();
    testName = options.id;
    db.collection('questions-lists').where({
      name: options.id
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res);
        questions = res.data[0].questions;
        types = res.data[0].types;
        userType = [];
        for(var i = 0; i < types.length; i++){
          userType.push(0);
        }
        stageNum = 0;
        this.setData({
          name: options.id,
          imagesrc: res.data[0].imagesrc,
          questions: questions,
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
  },

  getUserInfo: function (e) {
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
      }
    })
    wx.redirectTo({
      url: '../result/result?test=' + testName +"&result=" + this.data.result
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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