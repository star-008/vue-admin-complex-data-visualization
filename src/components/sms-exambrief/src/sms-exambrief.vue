<template>
    <div>
        <el-row>
            <el-col :span="24" style="margin-top:10px">
                <i v-if="exam.syncstatus==SYNC_STATUS.CLOSED" style="float:right;color:red;font-style:italic;"></i>
                <a class="sms-title" href="javascript:;" @click="onClickExam(exam)">{{ exam.examname }}</a>
                <span class="sms-badge sms-badge-green">{{ exam.creatorname }}</span>
                <span class="sms-badge sms-badge-green">{{ exam.examstartday.split(' ')[0] }}</span>
                <span class="sms-badge sms-badge-green" v-if="exam.status==0 || exam.status==1">录入中</span>
                <span class="sms-badge sms-badge-blue" v-if="exam.status==2">待发布</span>
                <span class="sms-badge sms-badge-orange" v-if="exam.status==3">已发布</span>
                <span class="sc-main-table-title-func">
                    <a :href="'exam/' + exam.examid" class="sc-main-table-edit" v-if="exam.syncstatus==1 && exam.status<2 && exam.creatorid == SMSUtil.getUser().userId"></a>
                    <a href="javascript:;" class="sc-main-table-del" v-if="exam.status<3 && exam.creatorid == SMSUtil.getUser().userId" @click="onDelete"></a>
                </span>
                <a href="javascript:;" v-if="exam.syncstatus==SYNC_STATUS.SYNCED && exam.status==3" style="float:right;color:red;" @click="onCloseSync">关闭更新</a>
                <a href="javascript:;" v-if="exam.syncstatus==SYNC_STATUS.CLOSED" style="float:right;color:red;font-style:italic;cursor:default;">关闭更新</a>
            </el-col>
        </el-row>
        <div :class="{ 'collapsed':iscollapsed, 'uncollapsed':!iscollapsed }" style="position:relative;display:inline-block;width:100%">
            <div ref="content" style="padding-right:60px; line-height:2em;">
                <a ref="handler" :class="{ 'sms-toggle-up':iscollapsed, 'sms-toggle-down':!iscollapsed }" style="display:none" @click="toggle()">{{ toggleText }}</a>
                <el-row v-for="(classSubject,idx) in exam.classSubjectList" :key="idx">
                    <el-row v-if="classSubject.grade!=null">
                        <el-col :span="24">
                            <span class="sms-info-title">考试年级：</span>
                            <span class="sms-info-label" v-if="classSubject.grade">{{ classSubject.grade.dictname }}</span>
                        </el-col>
                    </el-row>
                    <el-row v-if="classSubject.examSubjectList.length>0">
                        <el-col :span="12">
                            <span class="sms-info-title">常规科目：</span>
                            <span class="sms-info-label">
                                <span v-for="(examSubject,idx) in classSubject.examSubjectList" :key="idx" v-if="examSubject.subject != null">{{ examSubject.subject.dictname }}&nbsp;&nbsp;</span>
                            </span>
                        </el-col>
                        <el-col :span="12">
                            <span class="sms-info-title">考试班级：</span>
                            <span class="sms-info-label">
                                <span class="sms-comma-seperation" v-for="(examClass,idx) in classSubject.examClassList" :key="idx">
                                    {{ SMSUtil.getClassName(examClass.classInfo, examClass.classid) }}
                                </span>
                            </span>
                        </el-col>
                    </el-row>
                    <el-row :key="idx" v-for="(specialityEntity,idx) in classSubject.examSpecialityClassList">
                        <el-col :span="12">
                            <span class="sms-info-title">走班科目：</span>
                            <span class="sms-info-label" v-if="specialityEntity.examSubject.subject!=null">
                                {{ specialityEntity.examSubject.subject.dictname }}
                            </span>
                        </el-col>
                        <el-col :span="12">
                            <span class="sms-info-title">考试班级：</span>
                            <span class="sms-info-label">
                                <span class="sms-comma-seperation" v-for="(examClass,idx) in specialityEntity.examClassList" :key="idx">
                                    {{ SMSUtil.getClassName(examClass.classInfo, examClass.classid) }}
                                </span>
                            </span>
                        </el-col>
                    </el-row>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { SYNC_STATUS } from '../../../common/js/const';
    import { closeExam } from '../../../api/api';

    export default {
        data() {
            return {
                iscollapsed:true,
                SMSUtil:SMSUtil,
                SYNC_STATUS: SYNC_STATUS
            }
        },
        props:{
            exam:Object
        },
        computed:{
            toggleText() {
                if (this.iscollapsed) return '展开';
                return '收起';
            }
        },
        methods:{
            toggle() {
                this.iscollapsed = !this.iscollapsed;
            },
            refreshHandler() {
                if ($(this.$refs.content).height() > 56) {
                    $(this.$refs.handler).show();
                } else {
                    $(this.$refs.handler).hide();
                }
            },
            readyForRedirect(exam) {
                this.$router.param = { termid:exam.termid, examid:exam.examid, examname:exam.examname };
            },
            onClickExam(exam) {
                if (SMSUtil.isManager() && (exam.status == 0 || exam.status == 1)) {
                    this.readyForRedirect(exam);
                    if (exam.creatorid != SMSUtil.getUser().userId || localStorage.getItem(exam.examid)) {
                        this.$router.push('/score/input/subjectscore');
                    } else {
                        this.$router.push('/score/setting/subjectscore');
                    }
                } else if (SMSUtil.isManager() && exam.status == 2) {
                    this.readyForRedirect(exam);
                    this.$router.push('/score/input/publishscore');
                } else if (exam.status == 3) {
                    this.readyForRedirect(exam);
                    this.$router.push('/stat/order/all');
                }
            },
            onDelete() {
                this.$emit('delete', this.exam);
            },
            onCloseSync() {
                closeExam(this.exam.examid).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.exam.syncstatus = SYNC_STATUS.CLOSED;
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        mounted() { 
            this.refreshHandler();
        },
        updated() { 
            this.refreshHandler();
        }
    }
</script>

<style scoped>
    .sms-toggle-down {
        position:absolute;
        right:0px;
        background: url(../../../../static/img/sms-arr-upper.png) no-repeat right center;
        height: 26px;
        line-height:26px;
        cursor: pointer;
        padding-right:15px;
        color:#186ed9;
        font-size:12px;
        bottom: 0px;
    }
    .sms-toggle-up {
        position:absolute;
        right:0px;
        background: url(../../../../static/img/sms-arr-down.png) no-repeat right center;
        height: 26px;
        line-height:26px;
        cursor: pointer;
        padding-right:15px;
        color:#186ed9;
        font-size:12px;
        bottom: 0px;
    }
    .collapsed {
        width:100%;
        height:60px;
        overflow-y:hidden;
    }
    .uncollapsed {
        width:100%;
    }
</style>