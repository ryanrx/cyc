// pages/main/main.js
const util = require('../../utils/util.js');
const app = util.app;
const db = util.dbUtil;
var stageNum = 0;   // current question stage
var types = []; // result types
var userType = []; // initial user scores
var questions = [];
var userInfo = {};
var nickName = "";
var openid;
var testName = "";
var delayTime = 500;
var resultTitle = "";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    stage: stageNum,
    questions: questions,
    resultIndex: "",
    resultStatus: false,
    imagesrc: "",
    name: "",
    hasUserInfo: false,
    percentage: 0,
    delayTime: delayTime,
    platformType: "",
    quesNum: ""
  },



  chosen: function(e) {

    //console.log(e.target.dataset);
    for(var i = 0; i < userType.length; i++){ // add scores
      userType[i] += questions[stageNum].scores[e.target.id][i];
    }
    // console.log(userType);

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

    wx.showToast({
      title: '选择成功',
      icon: 'none',
      mask: true,
      duration: delayTime
    })

    if(stageNum == questions.length){ // if no questions left
      var maxIndex = util.pickIndexOfMax(userType);
      resultTitle = types[maxIndex].title;
      var that = this;
      setTimeout(function () {
        that.setData({
          resultStatus: true
        })
      }, delayTime)
      
      this.setData({  // return result
        resultIndex: maxIndex
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({platformType: util.platformType})
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    testName = options.id;
    db.collection('questions-lists').where({
      name: options.id
    }).get({
      success: res => {
        // console.log('[数据库] [查询记录] 成功: ', res);
        questions = res.data[0].questions;
        types = res.data[0].types
        userType = [];
        for(var i = 0; i < types.length; i++){
          userType.push(0);
        }
        stageNum = 0;
        this.setData({
          name: options.id,
          imagesrc: res.data[0].bg_img,
          questions: questions,
          quesNum: questions.length
        });

        wx.cloud.callFunction({
          name: 'incCount',
          data: {
            _id: res.data[0]._id,
          }, success: function (res) {
            // console.log(res)
          }, fail: function (res) {
            // console.log(res)
          }
        })
        
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取信息失败,请检查是否连接到网络'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  getUserInfo: function (e) {
    var that = this;
    const getInfo = new Promise((resolve) => {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          userInfo = res.userInfo;
          nickName = userInfo.nickName;
          // console.log("success")
        },
        complete: res => {
          // console.log(res);

          // console.log(app.globalData.openid)

          if (app.globalData.openid) {
            openid = app.globalData.openid
          }

          // console.log(userInfo)

          if (Object.keys(userInfo).length) {
            // console.log('updating')
            // console.log(openid)
            wx.cloud.callFunction({
              name: 'updateUserInfo',
              data: {
                openid: openid,
                userInfo: userInfo
              }, success: function (res) {
                // console.log(res)
              }, fail: function (res) {
                // console.log(res)
              }
            })
          }

          var d = new Date();
          db.collection('user-history').where({
            _openid: openid,
            qname: that.data.name
          }).get({
            success: res => {
              // console.log(res)
              if (res.data.length) {
                db.collection('user-history').doc(res.data[0]._id).update({
                  data: {
                    date: d,
                    resultIndex: that.data.resultIndex,
                    resultTitle: resultTitle
                  }
                })

                resolve();
              } else {
                // console.log("complete", res)
                db.collection('user-history').add({
                  data: {
                    qname: that.data.name,
                    resultIndex: that.data.resultIndex,
                    resultTitle: resultTitle,
                    nickName: nickName,
                    date: d,
                    userInfo: userInfo
                  }
                })
                resolve();
              }
            }
          })
        }
      })
    })

    getInfo.then(() => {
      wx.redirectTo({
        url: '../result/result?test=' + testName + "&resultIndex=" + that.data.resultIndex
      });
    })
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

  },

  homePage: function () {
    wx.switchTab({
      url: '../home/home',
    })
  }
})