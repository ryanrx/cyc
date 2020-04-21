var stageNum = 0;
var numQues = 3;

// pages/main/main.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stage: 0,
    questions:[
      {
        "question": "你最喜欢的食物是什么？",
        "choices": [
          "苹果",
          "香蕉",
          "梨子",
          "菠萝"
        ]
      },
      {
        "question": "你最喜欢的动物是什么？",
        "choices": [
          "狮子",
          "老虎",
          "兔子",
          "大象",
          "黄鼠狼"
        ]
      },
      {
        "question": "你最喜欢的角色是谁？",
        "choices": [
          "范闲",
          "司里里",
          "海棠朵朵"
        ]
      }
    ]
  },

  chosen: function() {
    if(stageNum < numQues - 1){
      stageNum++;
      this.setData({
        stage: stageNum
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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