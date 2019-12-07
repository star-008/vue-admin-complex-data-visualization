<template>
    <section>
        <el-row :span="24" class="sms-content-panel">
            <el-form label-width="90px" class="sms-filter-panel">
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="学期:">
                            <el-select size="small" v-model="filters.termid" @change="onChangeYearTerm">
                                <el-option label="全部" value=""></el-option>
                                <el-option :key="idx" :data="item" v-for="(item, idx) in terms" 
                                    :label="SMSUtil.getTermName(item)" 
                                    :value="item.termId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="考试类型:">
                            <el-select size="small" v-model="filters.examtypeid" @change="onChangeExamType">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in examtypes" :label="item.dictname" :value="item.dictvalue" :key="idx" :data="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="考试名称:">
                            <el-select size="small" v-model="filters.examid" @change="onChangeExam" class="sms-examfilter">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in exams" :label="item.examname" :value="item.examid" :key="idx" :data="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="年级:">
                            <el-select size="small" v-model="filters.gradeid" @change="onChangeGrade">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in filters.grades" :label="item.dictname" :value="item.dictvalue" :key="idx" :data="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="班级:">
                            <el-select size="small" v-model="filters.classid" @change="onChangeClass" popper-class="scm-class-dropdown">
                                <el-option label="全部" value=""></el-option>
                                <el-option-group label="行政班" v-if="filters.normalClasses.length>0">
                                    <el-option v-for="(item, idx) in filters.normalClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                                </el-option-group>
                                <el-option-group label="教学班" v-if="filters.specialClasses.length>0">
                                    <el-option v-for="(item, idx) in filters.specialClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                                </el-option-group>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="姓名:">
                            <el-input size="small" v-model="filters.name" :maxlength="64" style="max-width:calc(28em + 27px);"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="科目:">
                            <el-radio-group v-model="filters.subjectid" class="table-view">
                                <el-radio label="">全部</el-radio>
                                <el-radio size="small" v-for="(item, idx) in filters.subjects" :label="item.dictvalue" :key="idx" :data="item">{{ item.dictname }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="审核状态:">
                            <el-select size="small" v-model="filters.status">
                                <el-option label="全部" value=""></el-option>
                                <el-option label="待审核" value="0"></el-option>
                                <el-option label="已通过" value="4"></el-option>
                                <el-option label="未通过" value="5"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-button size="small" type="search" v-on:click="search" id="searchBtn" style="margin-left:20px;width:60px">查询</el-button>
                    </el-col>
                </el-row>
            </el-form>

            <el-table :data="proposals" v-loading="listLoading" border>
                <el-table-column prop="studentSubjectScore.stuno" label="学号" align="left" width="100">
                </el-table-column>
                <el-table-column prop="studentSubjectScore.stuname" label="姓名" align="left" width="100">
                </el-table-column>
                <el-table-column prop="studentSubjectScore.exam.examname" label="考试名称" align="left" width="200">
                </el-table-column>
                <el-table-column prop="studentSubjectScore.classInfo.name" label="班级" align="left" :formatter="formatClassName">
                </el-table-column>
                <el-table-column prop="studentSubjectScore.subject.dictname" label="科目" align="left">
                </el-table-column>
                <el-table-column prop="score" label="原成绩" align="left">
                </el-table-column>
                <el-table-column prop="modifyscore" label="新成绩" align="left">
                </el-table-column>
                <el-table-column label="更改原因" align="left" width="150">
                    <template slot-scope="proposal">
                        <el-tooltip class="item" effect="dark" :content="proposal.row.modifyreason" placement="left">
                            <span>{{ proposal.row.modifyreason }}</span>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column label="申请日期" align="left" width="150" :formatter="formatApplTime">
                </el-table-column>
                <el-table-column prop="applicantname" label="申请人" align="left">
                </el-table-column>
                <el-table-column label="状态" align="left">
                    <template slot-scope="proposal">
                        <span class="sms-operation" v-if="proposal.row.status=='0'">
                            <a class="sms-operation-anchor" href="javascript:;" @click="onReview(proposal.row)">
                                {{ formatStatus(proposal.row.status) }}
                            </a>
                        </span>
                        <el-tooltip class="item" effect="dark" :content="proposal.row.appview" placement="left" v-if="proposal.row.status!='0' && (proposal.row.appview != null && proposal.row.appview != '')">
                            <span :class="{ 'color-red':proposal.row.status=='5' }">{{ formatStatus(proposal.row.status) }}</span>
                        </el-tooltip>
                        <span :class="{ 'color-red':proposal.row.status=='5' }" v-if="proposal.row.status != '0' && (proposal.row.appview == null || proposal.row.appview == '')">{{ formatStatus(proposal.row.status) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="审核日期" align="left" width="150" :formatter="formatApprTime">
                </el-table-column>
                <el-table-column prop="approvername" label="审核人" align="left">
                </el-table-column>
            </el-table>
            <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>
        </el-row>

        <!-- Propose Dialog Start -->

        <el-dialog title="审核" v-model="reviewDlgVisible" :close-on-click-modal="false">
            <el-form>
                <el-form-item label="审核意见：">
                    <el-input type="textarea" :rows="4" v-model="remark"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click.native="doAccept" :loading="acceptLoading">通过</el-button>
                <el-button size="small" @click.native="doReject" :loading="rejectLoading">不通过</el-button>
            </div>
        </el-dialog>

        <!-- Propose Dialog End -->
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import { filter } from '../../../mixins/filter';
    import SMSUtil from '../../../common/js/util';
    import { getUpdateScoreProposalList, acceptUpdateScoreProposal, rejectUpdateScoreProposal, getSimpleExamList, getExamYearTermList, getExamExamTypeList, getExamGradeList, getExamClassList, getExamSubjectList } from '../../../api/api';

    export default {
        mixins: [ filter ],
        data() {
            return {
                type: 'review',
                SMSUtil:SMSUtil,
                filters: {
                    termid: '',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                    classid: '',
                    name: '',
                    status: '',
                    subjectid: '',
                    
                    grades: [],
                    classes: [],
                    normalClasses: [],
                    specialClasses: [],
                    subjects: []
                },

                terms: [],
                examtypes: [],
                exams: [],

                reviewDlgVisible: false,
                stumodifyscoreid: '',
                remark: '',
                acceptLoading: false,
                rejectLoading: false,

                proposals: [],
                listLoading: false,
                candidate: [],

                /////////// Pagination ///////////
                total: 0,
                page: 1,
                page_size: 10,
                /////////// Pagination End ////////

                isfirst: true
            }
        },
        methods: {
            formatClassName(row, col) {
                return SMSUtil.getClassName(row.studentSubjectScore.classInfo);
            },
            search() {
                this.page = 1;
                this.loadProposals();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.loadProposals();
            },
            pageSizeChanged(val) {
                this.page_size = val;
            },
            formatApplTime(row, col) {
                if (row.appltime) return row.appltime;
                return '';
            },
            formatApprTime(row, col) {
                if (row.apprtime) return row.apprtime;
                return '';
            },
            loadProposals() {
                let param = {
                    pagination:{
                        numPerPage:this.page_size,
                        pageNo:this.page,
                        calTotal:true
                    },
                    conditions: []
                };
                if (this.filters.examid != '') {
                    param.conditions.push({
                        fieldName: 'pt.examid',
                        fieldValues: [
                            this.filters.examid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.gradeid != '') {
                    param.conditions.push({
                        fieldName: 'gradeid',
                        fieldValues: [
                            this.filters.gradeid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.classid != '') {
                    param.conditions.push({
                        fieldName: 'classid',
                        fieldValues: [
                            this.filters.classid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.subjectid != '') {
                    param.conditions.push({
                        fieldName: 'subjectid',
                        fieldValues: [
                            this.filters.subjectid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.status != '') {
                    param.conditions.push({
                        fieldName: 'pt.status',
                        fieldValues: [
                            this.filters.status
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.name != '') {
                    param.conditions.push({
                        fieldName: 'applicantname',
                        fieldValues: [
                            this.filters.name
                        ],
                        operator: 'FUZZY_MATCH'
                    });
                }

                this.listLoading = true;
                getUpdateScoreProposalList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.total = res.data.pageInfo.total;
                        this.proposals = res.data.pageInfo.list;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.total = 0;
                        this.proposals = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.total = 0;
                    this.proposals = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            getExams() {
                this.exams = [];

                let param = {
                    pubstatus:'2'
                };
                if (this.filters.termid != '') {
                    param.termid = this.filters.termid;
                }
                if (this.filters.examtypeid != '') {
                    param.examtypeid = this.filters.examtypeid;
                }
                getSimpleExamList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.exams = res.data.pageInfo.list;
                        if (this.exams.length > 0) {
                            for (var i=0; i<this.exams.length; i++) {
                                if (this.exams[i].examid == this.filters.examid) return;
                            }
                        }
                        this.filters.examid = '';
                        this.onChangeExam();
                    } else {
                        this.exams = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.exams = [];
                });
            },
            getGrades() {
                this.filters.grades = [];

                var param = {
                    examid:this.filters.examid,
                    pubstatus:'2'
                };
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.filters.grades = res.data.pageInfo.list.filter(item => item!=null);
                        let set = false;
                        for (var i=0; i<this.filters.grades.length; i++) {
                            if (this.filters.grades[i].dictvalue == this.filters.gradeid) {
                                set = true;
                                break;
                            }
                        }
                        if (!set) this.filters.gradeid = '';
                        this.onChangeGrade();
                    } else {
                        this.filters.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.filters.grades = [];
                });
            },
            getClasses() {
                this.filters.classes = [];

                let param = { pubstatus:'2' };
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                if (this.filters.gradeid != '') {
                    param.gradeid = this.filters.gradeid;
                }
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.filters.classes = res.data.pageInfo.list;
                        this.filters.normalClasses = this.filters.classes.filter(item => item.classtype==CLASS_TYPE.NORMAL);
                        this.filters.specialClasses = this.filters.classes.filter(item => item.classtype==CLASS_TYPE.SPECIAL);
                        let set = false;
                        for (var i=0; i<this.filters.classes.length; i++) {
                            if (this.filters.classes[i].classid == this.filters.classid) {
                                set = true;
                                break;
                            }
                        }
                        if (!set) this.filters.classid = '';
                        this.onChangeClass();
                    } else {
                        this.filters.classes = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.filters.classes = [];
                });
            },
            getSubjects() {
                this.filters.subjects = [];
                this.filters.subjectid = '';

                let param = { pubstatus:'2' };
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                if (this.filters.gradeid != '') {
                    param.gradeid = this.filters.gradeid;
                }
                if (this.filters.classid != '') {
                    let classInfo = this.filters.classes.filter(item => item.classid==this.filters.classid);
                    if (classInfo.length > 0) {
                        param.classid = classInfo[0].classid;
                        param.classtype = classInfo[0].classtype;
                    }
                }
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.filters.subjects = res.data.pageInfo.list.filter(item => item!=null);

                        let _this = this;
                        this.$nextTick(function() {
                            SMSUtil.adjustSubjects(_this.filters.subjects);
                        });

                        if (this.isfirst) {
                            this.loadProposals();
                            this.isfirst = false;
                        }
                    } else {
                        this.filters.subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.filters.subjects = [];
                });
            },
            formatStatus(status) {
                if (status == "0") {
                    return "待审核";
                } else if (status == "4") {
                    return "已通过";
                } else if (status == "5") {
                    return "未通过";
                } else if (status == "9") {
                    return "已删除";
                }
            },
            doAccept() {
                let param = [];
                for (var i=0; i<this.candidate.length; i++) {
                    param.push({
                        stumodifyscoreid: this.candidate[i].stumodifyscoreid,
                        stusubjectid: this.candidate[i].stusubjectid,
                        modifyscore: this.candidate[i].modifyscore,
                        appview: this.remark
                    })
                }

                this.acceptLoading = true;
                acceptUpdateScoreProposal(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '审批成功！',
                            type: 'success'
                        });
                        this.loadProposals();
                        this.reviewDlgVisible = false;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.acceptLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.acceptLoading = false;
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            doReject() {
                let param = [];
                for (var i=0; i<this.candidate.length; i++) {
                    param.push({
                        stumodifyscoreid: this.candidate[i].stumodifyscoreid,
                        appview: this.remark
                    })
                }

                this.rejectLoading = true;
                rejectUpdateScoreProposal(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '审批成功！',
                            type: 'success'
                        });
                        this.loadProposals();
                        this.reviewDlgVisible = false;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.rejectLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.rejectLoading = false;
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            onChangeExamType() {
                this.getExams();
            },
            onChangeExam() {
                this.getGrades();
            },
            onChangeGrade() {
                this.getClasses();
            },
            onChangeClass() {
                this.getSubjects();
            },
            onReview(proposal) {
                this.candidate = [ proposal ];
                this.reviewDlgVisible = true;
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .el-select {
        width: 100%;
    }
    .line-block {
        display:inline-block; margin-left:10px;
    }
    .color-red {
        color: red;
    }
</style>