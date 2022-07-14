// pages/transfer/transfer.js
import { ajax, ajax2, cdnStaticResourceUrl, YDH,YdhRecommend } from "../../../utils/util";
import getLocation from '../../../utils/getLocation.js'
const API = {
  getHistoryDrugStoreType: 'drugstore/ykq/mini/v1/getHistoryDrugStoreType',//获得访问药店数量接口
  getRelationInfo: "api/user/doctor/relation/info",//查询用户医生绑定关系
  bindRelationInfo: 'api/user/doctor/relation/bind',// 用户关系绑定
  getServiceStatus: 'api/patientinfo/getServiceStatus2' //获取是否开启问诊服务的状态
}
import timManager from "../../../tim/timManager";
import { initIMSingle, handleGetUserEasemoInfo } from "../../../common/toChatroom";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    options: '',
    url_link: cdnStaticResourceUrl,
    missingDataShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onload')
    this.data.options = options;
    if (getApp().globalData.sess_key) {
      // this.initChatInfo(options)
    }
  },
  onShow() {
    console.log('onshow')
    getApp().globalData.hasBackIcon = false;
    // 未登陆跳转登陆页面进行授权
    if (!getApp().globalData.sess_key) {
      this.goToAuth()
      return
    }
    
    
    // 获取经纬度存储到全局
    let lonlat = getApp().address_data.longitude && getApp().address_data.latitude
    // 如果全局有经纬度不需要获取直接跳转
    lonlat ? this.setJumpPage() : this.getLatLong()
  },
  initChatInfo(options){
    let userId = wx.getStorageSync('userInfo').userId
    getApp().globalData.timManager = timManager.getImInstanceof(userId)
    if (options.path !== scanInquiryPath) {
      handleGetUserEasemoInfo(userId, initIMSingle)
    } else {
      handleGetUserEasemoInfo(userId)
    }
  },
  // 获取经纬度
  getLatLong() {
    getLocation.init((res) => {
      if (res.longitude && res.latitude) {
        getApp().address_data = res
        this.setJumpPage()
      } else {
        wx.showToast({
          title: '获取经纬度失败，请重新进入',
        })
      }
    })
  },
  // 跳转授权页面
  goToAuth() {
    console.log('中转页面-------------')
    var url = "/pages/note/login/login"
    wx.navigateTo({
      url: url
    })
  },
  getServiceStatus(type) {
    let params
    type == 1 ? params = {} : params = {
      poiId: this.data.options.lzStoreId,
      type: 'lz' //灵芝门店ID，公众号来源
    }
    ajax('post', API.getServiceStatus, params, res => {
      if (res.data.code == 0) {
        let data = res.data.result
        type == 1 ? this.getCountToPage(data) : this.getSkipUrlToPage(data)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },
  // 公众号入口在线找到-根据用户访问的数量判断跳转数量
  getCountToPage(data) {
    const _pages = [
      '/pages/noteIndex/noteIndex',//首页
      `/pages/onlineGoods/drugList/drugList?drugStoreId=${data.drugstoreId}`,//门店主页
      `/pages/note/nearbyDrugstoreList/nearbyDrugstoreList?type="transfer"`//门店列表
    ]
    if (data.drugstoreCount == 0) {
      getApp().globalData.publicDomain = 1;
      wx.switchTab({
        url: `/pages/noteIndex/noteIndex`
      })
    } else {
      getApp().globalData.publicDomain = 0;
      wx.redirectTo({
        url: _pages[data.drugstoreCount > 1 ? 2 : data.drugstoreCount],
      })
    }
  },
  // 公众号卡片跳转，根据服务状态判断是否
  getSkipUrlToPage(data) {
    let url;
    if (!data) return false;
    getApp().globalData.publicDomain = 0;
    // skipUrl 1:药店首页 2：扫码补方
    if (data.skipUrl == 1) {
      url = `/pages/onlineGoods/drugList/drugList?drugStoreId=${data.ykqId}`
    } else if (data.skipUrl == 2) {
      url = `/pages/scan/pages/addInformation/addInformation?scene=${data.organSign}`
    } else if (data.skipUrl == 3) {
      this.setData({
        missingDataShow: true
      })
      return false
    }
    wx.navigateTo({ url })
  },
  setJumpPage() {
    let options = this.data.options
    getApp().globalData.loggerSDK.info(`公众号中转页面跳转 options ${JSON.stringify(options)}`)
    // 参数控制公域还是私域
    getApp().globalData.publicDomain = 0
    // 公众号消息只有药店id 和店员id
    if (options.drugstoreId && options.accountId) {
      getApp().globalData.promoterAccountId = options.accountId;
      wx.redirectTo({
        url: `/pages/onlineGoods/drugList/drugList?drugStoreId=${options.drugstoreId}`,
      })
      return
    }
    
    if (options.type) {
      // console.log(options.type)
      // return 
      // 满足经纬度，登录条件后跳转页面
      // 访问过的药店数量=0，跳转至【宜块钱首页】
      // 访问过的药店数量=1，跳转至【门店主页】
      // 访问过的药店数量>1，跳转至【药店列表页】
      const pageConfig = {
        1: () => {
          this.getServiceStatus(1)
        },
        2: (res) => {
          wx.redirectTo({
            url: `/pages/note/myIndentDetail/myIndentDetail?orderNo=${res.orderNo}`
          })
        },
        3: () => {
          wx.switchTab({
            url: '/pages/my/myDrug/myInfo/myInfo'
          })
        },
        4: (res) => {
          if (res.brandId) getApp().globalData.hasBackIcon = true
          wx.redirectTo({
            url: `/pages/note/brandDrugstoreList/brandDrugstoreList?brandId=${res.brandId}`//门店列表
          })
        },

        5: () => {
          this.getServiceStatus(5)
        },
        6: () => {
          // 医带患 菜单进来
          this.getRelation()
        },
        7: () => {
          this.checkStatus()
        },
        8: () => {
          // 医带患进提交订单
          if (options.isYDH && options.inquiryId) {
            // 跳转至提交订单页面
            YDH(options.inquiryId);
          }else{
            wx.navigateTo({
              url: `/pages/noteIndex/noteIndex`
            })
          }
        },
        9: () => {
          // 通过医生id跳转医生主页
          if (options.doctorId) {
            wx.redirectTo({
              url: `/pages/famousDoctors/page/myDoctor/myDoctor?doctorId=${options.doctorId}&isTransfer=${true}`
            })
          }else{
            wx.navigateTo({
              url: `/pages/noteIndex/noteIndex`
            })
          }
        },
        10: () => {//进行医患绑定，关闭小程序
          wx.redirectTo({
            url: `/pages/my/myInfo/myInfo?doctorId=${options.doctorId}&type=10`
          })
        },
        11: () => {//推荐商品推送，
          YdhRecommend(options.doctorId,options.recommendId,options.recommendType)
          // wx.redirectTo({ 
          //   url: `/pages/my/myInfo/myInfo?doctorId=${options.doctorId}&type=11&recommendId=${options.recommendId}`
          // })
        },
      }
      pageConfig[options.type](options)
    }
  },
  getRelation() {
    // 菜单或者医生卡片进入的 
    // 根据来源和绑定关系在判断跳转关系
    //优先判断是否开启是否开启医带患权限
    wx.showLoading({
      title: '加载中',
    })
    var data = {
      doctorGuid: this.data.options.doctorId,
      bindSource: "1"
    }
    let that = this;
    ajax2('post', API.getRelationInfo, data, res => {
      wx.hideLoading({})
      if (res.data.code == 0) {
        var url;
        var relationInfo = res.data.result
        // 先根据来源在根据医患关系绑定状态去跳转 
        if (this.data.options && this.data.options.source && this.data.options.source == 'FAMOUS_DOCTOR') {
          // 从医生卡片来 
          //  判断权限未开启 跳转至 首页
          //  开启 绑定关系跳转至 患者信息报道页
          var url;
          if (relationInfo.physicianInvitePatientEnableStatus != undefined && relationInfo.physicianInvitePatientEnableStatus === 0) {
            wx.switchTab({
              url: `/pages/noteIndex/noteIndex`
            })
          } else {
            this.bindRelation()
          }
        } else {
          if (relationInfo.userDoctorBindCount) {
            var url = '/pages/my/myDoctor/doctorList/doctorList';
            wx.navigateTo({
              url: url,
            })
          } else if (relationInfo.poiList.length) {

            // 绑定过药店 去往药店 变为私域
            const _pages = [
              '/pages/noteIndex/noteIndex',//首页
              `/pages/onlineGoods/drugList/drugList?drugStoreId=${relationInfo.poiList[0]}`,//门店主页
              `/pages/note/nearbyDrugstoreList/nearbyDrugstoreList?type="transfer"`//门店列表
            ]
            if (relationInfo.poiList.length == 0) {
              getApp().globalData.publicDomain = 1;
              wx.switchTab({
                url: `/pages/noteIndex/noteIndex`
              })
            } else {
              wx.redirectTo({
                url: _pages[relationInfo.poiList.length > 1 ? 2 : relationInfo.poiList.length],
              })
            }
            wx.navigateTo({
              url: url,
            })
          } else {
            // 去首页
            wx.switchTab({
              url: `/pages/noteIndex/noteIndex`
            })
          }
        }
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },
  bindRelation() {
    // 绑定用户医生关系
    var obj = {
      doctorGuid: this.data.options.doctorId,
      bindSource: 1
    }
    ajax2('post', API.bindRelationInfo, obj, res => {
      wx.hideLoading({})
      if (res.data.code == 0) {
        // 医患关系绑定成功 跳转至 患者报道页面
        wx.redirectTo({
          url: `/pages/famousDoctors/page/patientReports/patientReports?doctorId=${this.data.options.doctorId}`// 跳转至报道页面
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },
  //医带患 公众消息 校验是否有问诊中的单子，有到im页，没有到医生主页。
  checkStatus() {
    ajax2('POST', `api/extremeInterrogation/checkFamousInquiry?inquiryType=5&doctorId=${this.data.options.inquiryGuid}`, {}, (res) => {
      wx.hideLoading()
      if (res.data.code == 0) {
        let infoData = res.data.result
        console.log(infoData, 'infodata')
        if (infoData.status == 3) {
          wx.redirectTo({
            url: `/pages/inquiry/chat/pages/chatroom?inquiryId=${infoData.inquiryId}&guidance=1`
          })
        } else {
          wx.redirectTo({
            url: `/pages/famousDoctors/page/myDoctor/myDoctor?doctorId=${this.data.options.doctorId}&isTransfer=${true}`
          })
        }
      } else {
        wx.showToast({
          icon: 'none',
          title: res.data.msg
        })
      }
    })
  }
})