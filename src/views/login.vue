<template>
  <div>
    <div id="header">
      <a href="javascript:;" class="sc-login-logo">
        <img src="static/img/sc-login-logo.png">
        成绩管理系统
      </a>
    </div>
    <div id="body" class="scroll vscroll">
      <div style="width: 1200px; margin: 0 auto; height: 100%; position: relative;background: url(static/img/sms-bg.png) no-repeat left center;">
        <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px" class="demo-ruleForm login-container">
          <div class="title">系统登录</div>
          <el-form-item prop="account" style="padding-top:24px">
            <el-input type="text" v-model="ruleForm2.account" ref="account" auto-complete="off" @keyup.native="checkAccount" placeholder="请输入登录账号"></el-input>
            <span class="el-form-item__error" v-if="normalMessage!=''">{{ normalMessage }}</span>
          </el-form-item>
          <el-form-item prop="checkPass">
            <el-input type="password" v-model="ruleForm2.checkPass" ref="password" auto-complete="off" @keyup.enter.native="login" @keyup.native="checkPassword" placeholder="请输入登录密码"></el-input>
          </el-form-item>
          <el-form-item id="captchaText" prop="captchaKey" v-if="captchaMessage !== '' || ruleForm2.captcha !== ''">
            <el-col :span="10">
              <el-input type="text" v-model="ruleForm2.captchaKey" ref="captcha" @keyup.enter.native="login" @keyup.native="checkCapcha" placeholder="请输入验证码"></el-input>
              <span class="el-form-item__error" v-if="captchaMessage!=''">{{ captchaMessage }}</span>
            </el-col>
            <el-col :span="14">
              <img :src="ruleForm2.captcha" style="height: 38px; width: 100px"/>
              <a href="javascript:;" @click="changeCaptcha(1)">刷新</a>
            </el-col>
          </el-form-item>
          <el-checkbox class="remember" v-model="autoLogin" :true-value="true" :false-value="false">自动登录</el-checkbox>
          <el-form-item style="width:100%;">
            <el-button type="primary" style="width:100%;" @click="login" :loading="logining">登录</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Class Subject Dialog -->

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

      <!-- Catalog Tree Dialog End -->
    </div>
    <div id="footer">
      Copyright © 2008-2018 天闻数媒科技（北京）有限公司
    </div>
  </div>
</template>

<script>
  import SMSUtil from '../common/js/util';
  import { requestLogin, requestCaptcha, joinSearchSchools } from '../api/api';
  import CryptoJS from 'crypto-js';

  export default {
    data() {
      return {
        logining: false,
        schools: [],
        selectedSchoolIdx: 0,
        chooseSchoolDlgVisible: false,
        user: null,
        ruleForm2: {
          account: '',
          checkPass: '',
          captchaKey: '',
          captcha: '',
          verifyKey: ''
        },
        rules2: {
          account: [
            { validator: this.validateAccount, trigger: 'blur' }
          ],
          checkPass: [
            { validator: this.validatePassword, trigger: 'blur' }
          ],
          captchaKey: [
            { validator: this.validateCaptcha, trigger: 'blur' }
          ]
        },
        captchaMessage: '',
        normalMessage: '',

        autoLogin: false,
        interval: null
      };
    },
    methods: {      
      checkAccount() {
        this.ruleForm2.account = SMSUtil.account(this.ruleForm2.account);
      },
      checkPassword() {
        this.ruleForm2.checkPass = SMSUtil.password(this.ruleForm2.checkPass);
      },
      checkCapcha() {
        this.ruleForm2.captchaKey = SMSUtil.alphanumeric(this.ruleForm2.captchaKey);
      },
      validateAccount(rule, value, callback) {
        if (this.ruleForm2.account == "" || this.ruleForm2.account == null) {
            this.normalMessage = '';
            callback(new Error('请输入登录账号'));
        } else {
            callback();
        }
      },
      validatePassword(rule, value, callback) {
        if (this.ruleForm2.checkPass == "" || this.ruleForm2.checkPass == null) {
            callback(new Error('请输入登录密码'));
        } else {
            callback();
        }
      },
      validateCaptcha(rule, value, callback) {
          if (this.ruleForm2.captchaKey == "" || this.ruleForm2.captchaKey == null) {
            this.captchaMessage = '';
            callback(new Error('请输入验证码'));
          } else {
            callback();
          }
      },
      resetForm() {
        this.ruleForm2.captchaKey = '';
        this.ruleForm2.account = '';
        this.ruleForm2.checkPass = '';
        this.changeCaptcha(0);
      },
      login() {
        var _this = this;
        this.$refs.ruleForm2.validate((valid) => {
          if (valid) {
            // 对密码进行加密
            var key = CryptoJS.enc.Utf8.parse(ECOAPI_APPKEY);
            //这一段就是上面的client_secret
            var encryptPassword = CryptoJS.AES.encrypt(this.ruleForm2.checkPass, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7});
            var loginParams = { username: this.ruleForm2.account, password: encryptPassword.toString(), captcha: this.ruleForm2.captchaKey, verifykey: this.ruleForm2.verifyKey, autologin:this.autoLogin?'1':'0', appId:ECOAPI_APPID, appKey:ECOAPI_APPKEY};

            this.logining = true;
            requestLogin(loginParams).then((res) => {
              this.logining = false;
              if (res.data.serverResult.resultCode == "200") {
                this.user = res.data.responseEntity;
                if (!SMSUtil.isAllowed(this.user)) {
                  this.ruleForm2.captchaKey = "";
                  this.ruleForm2.account = '';
                  this.ruleForm2.checkPass = '';
                  this.normalMessage = '学生不能登录';
                  $($('.login-container input')[0]).focus();
                  this.changeCaptcha(0);
                  return;
                }
                sms_store('sms-token', this.user.token, this.autoLogin);
                this.chooseSchool();
              } else {
                var responseMessage = res.data.serverResult.resultMessage;
                this.ruleForm2.captchaKey = "";
                this.changeCaptcha(0);
                if (res.data.serverResult.resultCode == -1) {
                  this.ruleForm2.account = '';
                  this.ruleForm2.checkPass = '';
                  this.normalMessage = responseMessage;
                  $($('.login-container input')[0]).focus();
                } else if (res.data.serverResult.resultCode == -4) {
                  this.normalMessage = '';
                  this.captchaMessage = responseMessage;
                  $($('.login-container input')[2]).focus();
                }
              }
            }).catch((err) => {
              this.logining = false;
              this.ruleForm2.account = '';
              this.ruleForm2.checkPass = '';
              this.normalMessage = '登录失败';
              $($('.login-container input')[0]).focus();
            });
          } else {
            return false;
          }
        });
      },
      changeCaptcha(force) {
        this.loading = true;
        requestCaptcha(force).then((res) => {
          this.loading = false;
          if (res.data.responseEntity) {
            this.ruleForm2.captcha = res.data.responseEntity.url;
            this.ruleForm2.verifyKey = res.data.responseEntity.verifykey;
          } else {
            this.ruleForm2.captcha = '';
            this.ruleForm2.verifyKey = '';
          }
        }).catch((err) => {
          console.log(err);
          this.ruleForm2.captcha = '';
          this.ruleForm2.verifyKey = '';
        });
      },
      chooseSchool() {
        let params = {
          pageNo:1,
          numPerPage:1000,
          orgId:this.user.orgId
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
        SMSUtil.setSession(this.user, this.autoLogin);
        SMSUtil.gotoPath('home');
      }
    },
    mounted() {
      this.changeCaptcha(0);
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
      color: #333;
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
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #0bc2b6;
    border-color: #0cafa4;
  }
</style>