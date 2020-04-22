var stageNum = 0;   // current question stage
var types = ["善良", "胆小", "天真"]; // result types
var userType = [0, 0, 0]; // initial user scores

var questions = [
  {
    "question": "你最喜欢的食物是什么？", //question
    "choices": [    // answer choices
      "苹果",
      "香蕉",
      "梨子",
      "菠萝"
    ],
    "scores": [ // scores corresponding to each answer choice
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
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
    ],
    "scores": [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
      [1, 1, 0]
    ]
  },

  {
    "question": "你最喜欢的角色是谁？",
    "choices": [
      "范闲",
      "司里里",
      "海棠朵朵"
    ],
    "scores": [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]
  }
];


// pages/main/main.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stage: stageNum,
    questions: questions,
    result: ""
  },

  chosen: function(e) {

    // console.log(e);
    for(var i = 0; i < userType.length; i++){ // add scores
      userType[i] += questions[stageNum].scores[e.target.id][i];
    }

    // increment questions stage number
    stageNum++;
    this.setData({
      stage: stageNum
    })

    console.log(userType);

    if(stageNum == questions.length){ // if no questions left
      var max = userType[0];
      var maxIndex = 0; // find type with max score
      for (var i = 1; i < userType.length; i++) {
        if (userType[i] > max) {
          maxIndex = i;
          max = userType[i];
        }
      }
      this.setData({  // return result
        result: "您是一个" + types[maxIndex] + "的人！"
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