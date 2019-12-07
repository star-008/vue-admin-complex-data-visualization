<template>
  <section>
    <div v-if="!SMSUtil.isIFrame()">
      <div id="header">
        <a href="javascript:;" class="sc-login-logo">
          <img src="static/img/sc-login-logo.png">
          成绩管理系统
        </a>
      </div>
      <div id="body" class="scroll vscroll">
        <div style="width: 1200px; margin: 0 auto; height: 100%; position: relative;background: url(static/img/sms-bg.png) no-repeat left center;">
          <div class="login-container sc-sso-panel" id="sso_desc">
            正在单点登录中 。。。
          </div>
        </div>
      </div>
      <div id="footer">
        Copyright © 2008-2018 天闻数媒科技（北京）有限公司
      </div>
    </div>
    <div v-if="SMSUtil.isIFrame()">
      <div id="sso_desc" style="width:100%;text-align:center;">
        正在单点登录中 。。。
      </div>
    </div>
    <!-- School Choosing Dialog -->

    <el-dialog class="small" title="选择学校" v-model="chooseSchoolDlgVisible" width="30%" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="选择学校" style="margin-bottom:0">
          <el-col :span="24">
            <el-select v-model="selectedSchoolIdx">
              <el-option :key="idx" v-for="(school,idx) in schools" :label="school.name" :value="idx"></el-option>
            </el-select>
          </el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="doChooseSchool(schools[selectedSchoolIdx])">确定</el-button>
      </div>
    </el-dialog>

    <!-- School Choosing Dialog End -->
  </section>
</template>

<script>
  import SMSUtil from '../common/js/util';
  import { ssoLogin, joinSearchSchools } from '../api/api';

  export default {
    data() {
      return {
        SMSUtil: SMSUtil,
        schools: [],
        selectedSchoolIdx: 0,
        chooseSchoolDlgVisible: false,
        user: null,
        interval: null
      };
    },
    methods: {
      gotoLogin() {
        setTimeout(function() {
          SMSUtil.gotoPath('login');
        }, 1000);
      },
      onFail(msg) {
        if (SMSUtil.isIFrame()) {
          $("#sso_desc").html(msg);
        } else {
          this.gotoLogin();
        }
      },
      startAnim() {
        if (this.interval == null) {
          this.interval = window.setInterval(function() {
            var text = $("#sso_desc").html();
            if (text.indexOf('。。。') != -1) {
              $("#sso_desc").html('正在单点登录中 。');
            } else if (text.indexOf('。。') != -1) {
              $("#sso_desc").html('正在单点登录中 。。。');
            } else if (text.indexOf('。') != -1) {
              $("#sso_desc").html('正在单点登录中 。。');
            }
          }, 1000);
        }
      },
      stopAnim() {
        if (this.interval != null) {
          window.clearInterval(this.interval);
        }
      },
      checkSSO() {
        if (window.ParameterMap && window.ParameterMap.accredit_code) {
          let param = {
            accredit_code: window.ParameterMap.accredit_code,
            appId:ECOAPI_APPID,
            appKey:ECOAPI_APPKEY
          };
          if (window.ParameterMap.token) {
            param.access_token = window.ParameterMap.access_token;
          }
          this.startAnim();
          ssoLogin(param).then((res) => {
            if (res.data.serverResult.resultCode == "200") {
              this.user = res.data.responseEntity;
              if (!SMSUtil.isAllowed(this.user)) {
                if (!SMSUtil.isIFrame()) {
                  this.$message({
                    message: '学生不能登录！',
                    type: 'error'
                  });
                }
                this.onFail('学生不能登录！');
              } else {
                sms_store('sms-token', this.user.token, true);
                this.chooseSchool();
              }
            } else {
              if (!SMSUtil.isIFrame()) {
                this.$message({
                  message: res.data.serverResult.resultMessage,
                  type: 'error'
                });
              }
              this.onFail(res.data.serverResult.resultMessage);
            }
            this.stopAnim();
          }).catch((err) => {
            console.log(err);
            if (!SMSUtil.isIFrame()) {
              this.$message({
                message: 'SSO登录失败！',
                type: 'error'
              });
            }
            this.onFail('SSO登录失败！');
            this.stopAnim();
          })
        } else {
          this.onFail('');
        }
      },
      chooseSchool() {
        let params = {
          pageNo:1,
          numPerPage:1000,
          orgId: this.user.orgId
        };
        joinSearchSchools(params, this.$message).then((res) => {
          if (res.data.serverResult.resultCode == "200") {
            this.schools = res.data.pageInfo.list;
            if (this.schools.length == 0) {
              this.$message({
                message: '你没有学校可管理。',
                type: 'error'
              });
              return;
            }
            if (this.schools.length > 1) {
              this.chooseSchoolDlgVisible = true;
            } else {
              this.doChooseSchool(this.schools[0]);
            }
          } else {
            this.$message({
              message: res.data.serverResult.resultMessage,
              type: 'error'
            });
          }
        }).catch((err) => {
          console.log(err);
          this.$message({
            message: '登录失败！',
            type: 'error'
          });
        });
      },
      doChooseSchool(school) {
        this.user.school = school;
        SMSUtil.setSession(this.user, true);
        if (SMSUtil.isIFrame()) {
          let path = sessionStorage.getItem('sms-redirect-url');
          if (path != null) {
            window.ParameterMap = { iframe: '1' };
            this.$router.push(path + '?iframe=1');
          }
        } else {
          SMSUtil.gotoPath('home');
        }
      }
    },
    mounted() {
      this.checkSSO();
    }
  }

</script>

<style lang="scss" scoped>
  @import '~scss_vars';
  
  #header {
    width: 1200px;
    margin: 0 auto;
    height: 80px;
    position: relative;
  }
  #body {
    top: 70px;
    width: 100%;
    height: 600px;
    background-color:#186ed9;
  }
  #footer {
    width: 100%;
    color: #666;
    text-align: Center;
    background: white;
    font-size: 12px;
    margin-top: 70px;
  }
  .login-container {
    margin: 100px 129px 0px 0px;
    width: 320px;
    padding: 10px 25px 10px 25px;
    background: #fff;
    float: right;
    .title {
      padding: 10px 0px;
      font-size: 18px;
      border-bottom: 1px solid #e4e5eb;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
    #captchaText {
      img {
        margin: 0px 10px;
        vertical-align: top;
      }
      a {
        color: #333;
        text-decoration: none;
      }
    }
  }
  .sc-sso-panel {
    margin-top:200px;
    padding-left:85px;
    padding-top:0px;
    height:200px;
    line-height:200px;
    background-color:rgba(255,255,255,0.2);
    color:white;
    font-size:16px;
  }
</style>