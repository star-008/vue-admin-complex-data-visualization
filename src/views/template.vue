<template>
    <section>
        <el-row class="container" v-if="!SMSUtil.isIFrame()">
            <el-col :span="24" class="header">
                <div class="logo">
                    <img src="static/img/sc-login-logo.png" />
                    <span class="sms-header-title">成绩管理系统</span>
                </div>
                <span class="sms-header-school"> | {{ user.school.name }}</span>
                <div class="userinfo">
                    <el-dropdown trigger="hover" style="height:43px;">
                        <a href="javascript:;" class="el-dropdown-link userinfo-inner">{{sysUserName}}</a>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="changePwd">修改密码</el-dropdown-item>
                            <el-dropdown-item divided @click.native="logout">退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                    <img src="static/img/poweroff.png" class="userinfo-quit" @click="logout"/>
                </div>
            </el-col>
            <el-dialog title="密码变更" v-model="passwordFormVisible" :close-on-click-modal="false" class="medium">
                <el-form :model="passwordForm" label-width="100px" :rules="passwordFormRules" ref="passwordForm">
                    <el-form-item label="以前密码" prop="originPass">
                        <el-input type="password" v-model="passwordForm.originPass" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="现在密码" prop="currentPass">
                        <el-input type="password" v-model="passwordForm.currentPass" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="密码确认" prop="confirmPass">
                        <el-input type="password" v-model="passwordForm.confirmPass" auto-complete="off"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click.native="passwordFormVisible = false">取消</el-button>
                    <el-button type="primary" @click.native="confirmSubmit" :loading="confirmLoading">提交</el-button>
                </div>
            </el-dialog>

            <el-col :span="24" class="main">
                <aside :class="{ 'sc-content-closed':!isOpened }">
                    <!--导航菜单-->
                    <el-menu :default-active="$route.path" class="el-menu-vertical-demo vscroll nohscroll" :class="{ 'sc-content-closed':!isOpened }" unique-opened router ref="mainmenu">
                        <div class="el-menu-empty"></div>
                        <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
                            <el-submenu :index="item.path" v-if="!item.leaf && isOpened" class="root-menu">
                                <template slot="title"><i :class="item.iconCls"></i>{{item.name}}</template>
                                <template v-for="(item,index) in item.children" v-if="!item.hidden && isOpened">
                                    <el-submenu :index="item.path" v-if="!item.leaf">
                                        <template slot="title"><i :class="item.iconCls"></i>{{item.name}}</template>
                                        <span class="selectable"><el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">{{child.name}}</el-menu-item></span>
                                    </el-submenu>
                                    <span class="selectable"><el-menu-item v-if="item.leaf&&item.children&&item.children.length>0" :index="item.children[0].path"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item></span>
                                    <span class="selectable"><el-menu-item v-if="item.leaf&&!item.children" :index="item.path"><i :class="item.iconCls"></i>{{item.name}}</el-menu-item></span>
                                </template>
                            </el-submenu>
                            <span class="selectable root-menu" v-if="isOpened" @click="homeClicked"><el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item></span>
                            <span class="selectable root-menu" v-if="!isOpened"><el-menu-item :index="getFirstChildPath(item)"><i :class="item.iconCls"></i>{{item.name}}</el-menu-item></span>
                        </template>
                    </el-menu>
                    <div class="sc-left-help" :class="{ 'sc-content-closed':!isOpened }">
                        <span class="sc-left-help-tdl" v-if="isOpened">
                            <a href="help" class="sc-left-help-href">帮助中心</a>
                        </span>
                        <span class="sc-left-help-tdr">
                            <a href="javascript:;" @click="toggleMenu" :class="{ 'sc-left-help-arrl':isOpened, 'sc-left-help-arrr':!isOpened }"></a>
                        </span>
                    </div>
                </aside>
                <section class="content-container vscroll">
                    <div class="grid-content bg-purple-light">
                        <el-row>
                            <el-col :span="24">
                                <my-breadcrumb ref="breadcrumb" :steps="steps" v-if="$route.meta.breadcrumb != false"></my-breadcrumb>
                            </el-col>
                            <el-col :span="24" class="content-wrapper">
                                <transition name="fade" mode="out-in">
                                    <router-view></router-view>
                                </transition>
                            </el-col>
                        </el-row>
                    </div>
                    <div class="footer">
                        Copyright © 2008-2018 天闻数媒科技（北京）有限公司
                    </div>
                </section>
            </el-col>
        </el-row>
        <section class="iframe-container vscroll" v-else>
            <transition name="fade" mode="out-in">
                <router-view></router-view>
            </transition>
        </section>
        <iframe id="download_iframe" name="download_iframe"  src="" style="display:none"></iframe>
    </section>
</template>

<script>
    import SMSUtil from '../common/js/util';
    import { updatePwdECO } from '../api/api';
    import CryptoJS from 'crypto-js';

    export default {
        data() {
            return {
                SMSUtil: SMSUtil,
                user: null,
                sysUserName: '',
                sysUserAvatar: '',
                sysUserId: '',
                form: {
                    name: '',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },
                passwordFormVisible: false,//新增界面是否显示
                confirmLoading: false,
                passwordFormRules: {
                    originPass: [
                        { required: true, message: '请输入以前密码', trigger: 'blur' }
                    ],
                    currentPass: [
                        { required: true, message: '请输入现在密码', trigger: 'blur' }
                    ],
                    confirmPass: [
                        { required: true, message: '请输入密码确认', trigger: 'blur' }
                    ]
                },
                //新增界面数据
                passwordForm: {
                    originPass: "",
                    currentPass: "",
                    confirmPass: ""
                },

                isOpened: true
            }
        },
        computed: {
            steps() {
                let steps = [];
                for (var i=0; i<this.$route.matched.length; i++) {
                    if (this.$route.matched[i].meta.breadcrumb == true) {
                        steps.push({
                            title: this.$route.matched[i].name,
                            url: this.$route.matched[i].meta.path
                        });
                    }
                }
                if (this.$route.params.name) {
                    steps.push({
                        title: this.$route.params.name,
                        url: 'javascript:;'
                    })
                }

                return steps;
            }
        },
        methods: {
            //退出登录
            logout: function () {
                var _this = this;
                this.$confirm('确认退出吗？', '提示', {
                    type: 'info'
                }).then(() => {
                    _this.doLogout();
                }).catch(() => {
                });
            },
            doLogout() {
                sms_remove_store('sms-user');
                sms_remove_store('sms-token');
                this.$router.push('/login');
            },
            changePwd: function() {
                this.passwordForm.originPass = "";
                this.passwordForm.currentPass = "";
                this.passwordForm.confirmPass = "";
                this.passwordFormVisible = true;
            },
            homeClicked() {
                $('.root-menu.is-opened div.el-submenu__title').click();
            },
            getFirstChildPath(item) {
                if (item.children == undefined || item.children.length == 0) return item.path;
                return this.getFirstChildPath(item.children[0]);
            },
            confirmSubmit: function() {
                this.$refs.passwordForm.validate((valid) => {
                    if (valid) {
                        if (this.passwordForm.currentPass == this.passwordForm.confirmPass) {
                            // 对密码进行加密
                            var key = CryptoJS.enc.Utf8.parse(ENCRYPT_KEY);
                            //这一段就是上面的client_secret
                            var oldPwd = CryptoJS.AES.encrypt(this.passwordForm.originPass, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7});
                            var newPwd = CryptoJS.AES.encrypt(this.passwordForm.currentPass, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7});
                            let param ={
                                "oldPassword": oldPwd.toString(),
                                "staticPassword": newPwd.toString(),
                                "userId": JSON.parse(sms_store('sms-user')).userId
                            };
                            updatePwdECO(param, this.$message).then((res) =>{
                                this.updateLoading = false;
                                if (res.data.serverResult.resultCode == "200") {
                                    var resultMessage = res.data.serverResult.resultMessage;
                                    this.$message({
                                        message: resultMessage,
                                        type: 'success'
                                    });
                                    this.passwordFormVisible = false;
                                } else {
                                    var resultMessage = res.data.serverResult.resultMessage;
                                    this.$message({
                                        message: resultMessage,
                                        type: 'error'
                                    });
                                }
                            });
                        } else {
                            this.$message({
                                message: "重复密码与新密码不一致",
                                type: 'error'
                            });
                        }
                    }
                });
            },
            toggleMenu() {
                this.isOpened = !this.isOpened;
            }
        },
        created() {
            let user = sms_store('sms-user');
            if (user) {
                this.user = JSON.parse(user);
                this.sysUserName = this.user.realName || '';
                this.sysUserAvatar = this.user.avatar || '';
                this.sysUserId = this.user.userId;
            }
            window.EventHub.$on('token-is-expired', this.doLogout);
            window.EventHub.$on('token-has-caught', this.doLogout);
            window.EventHub.$on('token-is-invalid', this.doLogout);
        },
        mounted() {
            $(".content-container").on('scroll', function() {
                if ($(".is-reverse").length > 0 && $(".is-reverse").offset().top < 20) {
                    $(".is-reverse").click();
                }
            });
        }
    }

</script>
<style scoped lang="scss">
    @import '~scss_vars';
    
    .container {
        position: absolute;
        top: 0px;
        bottom: 0px;
        width: 100%;
        .header {
            height: 60px;
            line-height: 60px;
            background: $color-primary;
            color:#fff;
            .userinfo {
                text-align: right;
                padding-right: 25px;
                float: right;
                a {
                    margin: 0px 2px 0px 2px;
                    color: #fff;
                    display: inline-block;
                    font-size: 16px;
                    text-decoration: none;
                }
                img {
                    width: 40px;
                    height: 40px;
                    border-radius: 20px;
                    margin: 10px 0px 0px 10px;
                }
                .userinfo-inner {
                    font-family: 'Microsoft yahei';
                    font-size: 14px;
                    background-image: url(../../static/img/sms-avatar.png);
                    background-repeat: no-repeat;
                    background-position-y: center;
                    background-position-x: left;
                    padding-left: 40px;
                    cursor: pointer;
                    color:#fff;
                }
                .userinfo-quit {
                    margin: 21px 0px 0px 5px;
                    float: right;
                    width: 16px;
                    height: 17px;
                    cursor: pointer;
                }
            }
            .logo {
                height:40px;
                font-size: 22px;
                margin: 6px 0px 0px 30px;
                float: left;
                img {
                    height: 40px;
                    float: left;
                    margin: 4px 0px;
                }
            }
        }
        .main {
            display: flex;
            position: absolute;
            top: 60px;
            bottom: 0px;
            overflow: hidden;
            aside {
                flex:0 0 200px;
                width: 200px;
                background-color: white;
                box-shadow: 0px 0px 19px rgb(206, 206, 206);
                z-index:1000;
                position:relative;
                .el-menu {
                    position: absolute;
                    bottom: 60px;
                    top: 0px;
                    width: 200px;
                }
            }
            .content-container {
                flex:1;
                background-color: #e9ecee;
                padding: 20px;
                min-width: 960px;
                section {
                    box-sizing: border-box;
                    background-color: white;
                    box-shadow: 0px 0px 6px rgb(206, 206, 206);
                    padding: 20px;
                }
            }
        }
        .footer {
            margin-top:20px;
            color: #666;
            text-align: center;
            font-size:12px;
        }
    }
    .iframe-container {
        background-color: #ffffff;
        min-width: 960px;
        section {
            box-sizing: border-box;
            background-color: white;
            box-shadow: 0px 0px 6px rgb(206, 206, 206);
            padding: 20px;
        }
    }
    .el-menu {
        background-color: white;
        .el-menu-empty {
            display: block;
            height: 10px;
            line-height: 10px;
        }
    }
    .el-menu--horizontal.el-menu--dark .el-submenu .el-menu-item.is-active, .el-menu-item.is-active {
        color: #186ed9;
    }
    li.el-submenu {
        i {
            color: $color-primary;
        }
    }
    .is-opened, .is-opened * {
        background-color: white;
    }
    .sc-left-help{position:absolute;height:60px;left:0px;bottom:0px;width:200px;padding-top:19px;border-top:1px solid #cad8e6;line-height:60px;background-color:white}
    .sc-left-help-href{background:url(../../static/img/sc-catlog-help.png) no-repeat left center;padding-left:22px;margin-left:20px;display:inline-block;width:105px;float:left;line-height:22px;}
    .sc-left-help-arrl{display:inline-block;width:50px;height:20px;border-left:1px solid #dddddd;background:url(../../static/img/sc-left-arrow.png) no-repeat center center;float:left;line-height:22px;}
    .sc-left-help-arrr{display:inline-block;width:50px;height:20px;border-left:1px solid #dddddd;background:url(../../static/img/sc-left-arrowr.png) no-repeat center center;float:left;line-height:22px;}
    .sc-left-help-href:hover{background:url(../../static/img/sc-catlog-help-sel.png) no-repeat left center;color:#186ed9;}
    .sc-left-help-arrl:hover{background:url(../../static/img/sc-left-arrow-sel.png) no-repeat center center;}
    .sc-left-help-arrr:hover{background:url(../../static/img/sc-left-arrowr-sel.png) no-repeat center center;}
    .sc-content-closed{flex-basis:49px !important;width:49px !important;}
</style>

<style lang="scss">
    .container .main .content-container section {
        box-sizing: border-box;
        background-color: white;
        box-shadow: 0px 0px 6px #cecece;
        padding: 20px;
        margin-bottom:20px;
    }
    .container .main .content-container section:last-child {
        margin-bottom:0px;
    }
    .main .el-submenu.is-opened > .el-submenu__title {
        box-shadow: none;
        font-weight: bold;
        color: #186ed9;
    }
    .main ul>span.selectable>li.is-active {
        box-shadow: inset 4px 0px #186ed9;
        font-weight: bold;
        background-color: #e7ecf3;
    }
    .main .el-submenu .el-menu-item:hover, .el-submenu__title:hover {
        background-color: #e7ecf3;
    }
    .main .root-menu>div, .main .root-menu>li {
        padding-left: 15px !important;
    }
</style>