<template>
    <section>
        <div style="border-bottom:1px solid #e9ecee;height:35px;margin-bottom:10px;">
            <div class="sms-page-title">
                最新考试列表
            </div>
            <span style="float:right;margin-bottom:5px;" v-if="SMSUtil.isManager()">
                <el-button size="small" type="primary" class="primary" @click="createExam()" v-if="SMSUtil.isScoreManager()">新建考试</el-button>
                <el-button size="small" @click="syncExam()">同步考试信息</el-button>
            </span>
        </div>
        <el-row style="clear:both">
            <el-form label-width="90px" size="small">
                <el-col :span="6">
                    <el-form-item label="学期:">
                        <el-select size="small" v-model="filters.termid">
                            <el-option :label="SMSUtil.getTermName(item)" :value="item.termId" v-for="(item, idx) in terms" :key="idx"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="考试类型:">
                        <el-select size="small" v-model="filters.examtypeid">
                            <el-option label="全部" value=""></el-option>
                            <el-option v-for="(item, idx) in examtypes" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option> 
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="考试名称:">
                        <el-input size="small" class="sms-examfilter" v-model="filters.examname" @keyup.enter.native="search" :maxlength="64" style="width:calc(100% - 94px);float:left;"></el-input>
                        <el-button type="search" size="small" style="margin-left:20px;width:60px" @click="search" :loading="listLoading">查询</el-button>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>
        <div class="sms-page-panel" v-for="(exam, idx) in exams" :key="idx">
            <sms-exambrief :exam="exam" @delete="onDeleteExam"></sms-exambrief>
        </div>
        <div class="sc-nodate" v-if="!isfirst && exams.length==0">
            <img src="static/img/no-data.png">
            <p>暂无数据</p>
        </div>

        <!-- 同步考试 Dialog Begin -->
        <el-dialog class="small sms-dialog-noheader" title="" v-model="syncProgressDialog" width="30%" :close-on-click-modal="false">
            <el-row>
                <el-col :span="24">
                    <div class="sms-progress-title" :class="{ 'sms-progress-success':progressStatus=='success', 'sms-progress-failed':progressStatus=='failed' }">
                        <span>{{ getSyncStatusTitle() }}</span>
                    </div>
                </el-col>
                <el-col :span="24" v-if="nothingToSync">
                    <span style="display:inline-block;width:100%;text-align:center;color:red;">{{ failComment }}</span>
                </el-col>
                <el-col :span="24" v-if="!nothingToSync">
                    <div class="sms-progress-desc">{{ currentExamName }}</div>
                </el-col>
                <el-col :span="24" class="center" v-if="!nothingToSync">
                    <el-progress :stroke-width="5" :percentage="progressPercent" :status="progressStatus"></el-progress>
                </el-col>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="onConfirmFailure()" v-if="progressStatus == 'failed' || nothingToSync">确定</el-button>
            </div>
        </el-dialog>
        <!-- 同步考试 Dialog End -->
    </section>
</template>

<script>
    import SMSUtil from '../../common/js/util';
    import { CLASS_TYPE, SYNC_STATUS } from '../../common/js/const';
    import { queryTermList, queryDictItemList, queryExamInfoList, queryExamInfo, getSimpleExamList, getRecentExams, getExamExamTypeList, getExamYearTermList, syncBase, syncExam, deleteExam } from '../../api/api';

    export default {
        data() {
            return {
                filters: {
                    termid:'',
                    examtypeid: '',
                    examname: ''
                },
                terms: [],
                examtypes: [],
                schoolsections: [],
                grades: [],
                subjects: [],
                page_size:65536,
                exams:[],
                SMSUtil:SMSUtil,
                listLoading:false,

                isfirst: true,

                syncExams: [],
                syncProgressDialog: false,
                progressStatus: 'prepare',
                progressPercent: 0,
                progressInterval: null,
                prepareInterval: null,
                currentExamName: '',
                currentExamIndex: 0,

                isYearTermLoaded: -1,
                isExamTypeLoaded: -1,
                isSchoolSectionLoaded: -1,
                isGradesLoaded: -1,
                gradeLoadedCount: 0,
                isSubjectsLoaded: -1,
                isExamLoaded: -1,

                nothingToSync: false,
                failComment: ''
            }
        },
        methods: {
            getSyncStatusTitle() {
                if (this.progressStatus == 'prepare') {
                    return '同步准备中...';
                } else if (this.progressStatus == 'progress') {
                    return '同步中...';
                } else if (this.progressStatus == 'success') {
                    return '同步成功！';
                } else if (this.progressStatus == 'failed') {
                    return '同步失败！';
                }
            },
            getExamYearTerms() {
                this.filters.termid = '';

                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    orgId: SMSUtil.getUser().orgId
                };
                this.terms = [];
                queryTermList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.terms = res.data.pageInfo.list;
                        if (this.terms.length > 0) {
                            this.checkYearTerm();
                        }
                        if (this.isfirst) {
                            this.load();
                        }
                        this.isYearTermLoaded = 1;
                    } else {
                        this.terms = [];
                        this.isYearTermLoaded = 0;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.terms = [];
                    this.isYearTermLoaded = 0;
                });
            },
            checkYearTerm() {
                if (this.$route.params.termid != null) {
                    this.filters.termid = this.$route.params.termid;
                    return;
                }

                for (var i=0; i<this.terms.length; i++) {
                    let startdate = new Date(this.terms[i].startDate);
                    let enddate = new Date(this.terms[i].endDate);
                    let now = new Date();
                    if (now > startdate && now < enddate) {
                        this.filters.termid = this.terms[i].termId;
                        return;
                    }
                }

                this.filters.termid = this.terms[0].termId;
            },
            getExamTypes() {
                this.examtypes = [];
                this.filters.examtypeid = '';

                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"EVALUATIONTYP",
                    lang:"zh_CN"
                };

                this.examtypes = [];
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examtypes = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                        this.isExamTypeLoaded = 1;
                    } else {
                        this.examtypes = [];
                        this.isExamTypeLoaded = 0;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.examtypes = [];
                    this.isExamTypeLoaded = 0;
                });
            },
            getSchoolSections() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"SCHOOL_SECTION",
                    lang:"zh_CN"
                };
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.schoolsections = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                        let _this = this;
                        this.schoolsections.forEach(function(schoolsection) {
                            _this.getGrades(schoolsection.dictvalue);
                        });
                        this.isSchoolSectionLoaded = 1;
                    } else {
                        this.schoolsections = [];
                        this.isSchoolSectionLoaded = 0;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.schoolsections = [];
                    this.isSchoolSectionLoaded = 0;
                });
            },
            getGrades(schoolsection) {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"SCHOOL_SECTION",
                    schoolSection:schoolsection,
                    lang:"zh_CN"
                };
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = SMSUtil.concat(this.grades, res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item)));
                        this.gradeLoadedCount += 1;
                        if (this.gradeLoadedCount == this.schoolsections.length) {
                            this.isGradesLoaded = 1;
                        }
                    } else {
                        this.grades = [];
                        this.isGradesLoaded = 0;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.grades = [];
                    this.isGradesLoaded = 0;
                });
            },
            getSubjects() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"SUBJECT",
                    lang:"zh_CN"
                };
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                        this.isSubjectsLoaded = 1;
                    } else {
                        this.subjects = [];
                        this.isSubjectsLoaded = 0;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subjects = [];
                    this.isSubjectsLoaded = 0;
                });
            },
            load() {
                let param = {
                    conditions: [
                        {
                            fieldName: 'termid',
                            fieldValues: [
                                this.filters.termid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                if (this.filters.examtypeid != '') {
                    param.conditions.push({
                        fieldName: 'examtypeid',
                        fieldValues: [
                            this.filters.examtypeid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examname != '') {
                    param.conditions.push({
                        fieldName: 'examname',
                        fieldValues: [
                            this.filters.examname
                        ],
                        operator: 'FUZZY_MATCH'
                    });
                }
                getRecentExams(this.page_size, param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let exams = res.data.pageInfo.list;
                        for (var i=0; i<exams.length; i++) {
                            exams[i].classSubjectList.sort(SMSUtil.examGradeSort);
                        }
                        this.exams = exams;
                        this.isfirst = false;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.exams = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.exams = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            search() {
                this.listLoading = true;
                this.load();
            },
            createExam() {
                this.$router.push('/exam/create');
            },
            isValid(exam, exams) {
                for (var i=0; i<exams.length; i++) {
                    if (exams[i].id != exam.examId && exams[i].examname == exam.examName) return false;
                    if (exams[i].id != exam.examId && new Date(exams[i].examstartday.split(' ')[0]) == new Date(exam.startdate.split(' ')[0])) return false;
                    if (exams[i].synctime != null && SMSUtil.formatDate.parse(exams[i].synctime, 'yyyy-MM-dd h:m:s') >= SMSUtil.formatDate.parse(exam.lastModfiTime, 'yyyy-MM-dd h:m:s')) return false;
                    if (exams[i].id == exam.examId && exams[i].syncstatus == SYNC_STATUS.CLOSED) return false;
                }
                return true;
            },
            syncExam() {
                this.isExamLoaded = -1;
                this.nothingToSync = false;
                this.syncExams = [];

                this.prepareSync();
                getSimpleExamList({}).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let allExams = res.data.pageInfo.list;
                        let params = {
                            pageNo:1,
                            numPerPage:1000,
                            orgId: SMSUtil.getUser().orgId
                        };
                        queryExamInfoList(params, this.$message).then((res) => {
                            if (res.data.serverResult.resultCode == "200") {
                                this.syncExams = res.data.pageInfo.list.filter(item => item.classList && item.classList.length > 0 && this.isValid(item, allExams));
                                this.isExamLoaded = 1;
                            } else {
                                this.syncExams = [];
                                this.isExamLoaded = 0;
                            }
                        }).catch((err) => {
                            console.log(err);
                            this.syncExams = [];
                            this.isExamLoaded = 0;
                        });
                    }
                }).catch((err) => {

                });
            },
            getClassSubjectList(exam) {
                let classlist = exam.classList;
                let result = [];
                let classByGrade = [];
                while (classlist.length > 0) {
                    let sameones = classlist.filter(item=>item.gradeId == classlist[0].gradeId);
                    classByGrade.push(sameones);
                    classlist = SMSUtil.removeArrayItems(classlist, sameones);
                }

                classByGrade.forEach((classes) => {
                    let examClassList = classes.map(item=>({
                        classid:item.classId,
                        classInfo:{
                            adviserids:'',
                            advisernames:'',
                            bhwllx:'',
                            classid:item.classId,
                            description:'',
                            gradeid:item.gradeId,
                            id:item.classId,
                            name:item.className,
                            orgid:exam.orgId,
                            schoolsectionid:exam.schoolSection,
                            status:'1'
                        }
                    }));
                    let examSpecialityClassList = [];
                    let examSubjectList = classes[0].classSubject.map(item=>({subjectid:item.subjectId}));;
                    result.push({
                        gradeid: classes[0].gradeId,
                        examClassList: examClassList,
                        examSpecialityClassList: examSpecialityClassList,
                        examSubjectList: examSubjectList
                    });
                });
                return result;
            },
            prepareSync() {
                let _this = this;

                this.isSchoolSectionLoaded = -1;
                this.isGradesLoaded = -1;
                this.isSubjectsLoaded = -1;
                this.gradeLoadedCount = 0;
                this.loadBase();

                this.syncProgressDialog = true;
                this.progressStatus = 'prepare';
                this.progressPercent = 0;
                this.currentExamName = '';

                if (this.prepareInterval != null) {
                    window.clearInterval(this.prepareInterval);
                    this.prepareInterval = null;
                }
                this.prepareInterval = window.setInterval(function() {
                    if (_this.isYearTermLoaded == 1) {
                        _this.progressPercent += 5;
                        _this.isYearTermLoaded = 2;
                        console.log('yearterm',_this.progressPercent);
                    }
                    if (_this.isExamTypeLoaded == 1) {
                        _this.progressPercent += 5;
                        _this.isExamTypeLoaded = 2;
                        console.log('examtype',_this.progressPercent);
                    }
                    if (_this.isSchoolSectionLoaded == 1) {
                        _this.progressPercent += 20;
                        _this.isSchoolSectionLoaded = 2;
                        console.log('schoolsection',_this.progressPercent);
                    }
                    if (_this.isGradesLoaded == 1) {
                        _this.progressPercent += 20;
                        _this.isGradesLoaded = 2;
                        console.log('grade',_this.progressPercent);
                    }
                    if (_this.isSubjectsLoaded == 1) {
                        _this.progressPercent += 20;
                        _this.isSubjectsLoaded = 2;
                        console.log('subject',_this.progressPercent);
                    }
                    if (_this.isExamLoaded == 1) {
                        if (_this.syncExams.length == 0) _this.noSync();
                        _this.progressPercent += 30;
                        _this.isExamLoaded = 2;
                        console.log('exams',_this.progressPercent);
                    }
                    if (_this.isYearTermLoaded == 2 && 
                        _this.isExamTypeLoaded == 2 && 
                        _this.isSchoolSectionLoaded == 2 && 
                        _this.isGradesLoaded == 2 && 
                        _this.isSubjectsLoaded == 2 && 
                        _this.isExamLoaded == 2) {
                        window.clearInterval(_this.prepareInterval);
                        _this.prepareInterval = null;
                        _this.isYearTermLoaded = 1;
                        _this.isExamTypeLoaded = 1;
                        window.setTimeout(_this.syncBase, 1000);
                    }
                    if (_this.isYearTermLoaded == 0 || 
                        _this.isExamTypeLoaded == 0 || 
                        _this.isSchoolSectionLoaded == 0 || 
                        _this.isGradesLoaded == 0 || 
                        _this.isSubjectsLoaded == 0 || 
                        _this.isExamLoaded == 0) {
                        window.clearInterval(_this.prepareInterval);
                        _this.prepareInterval = null;
                        _this.isYearTermLoaded = 1;
                        _this.isExamTypeLoaded = 1;
                        window.setTimeout(_this.failedPrepare, 1000);
                    }
                }, 100);
            },
            syncBase() {
                let params = {
                    termlist: this.terms,
                    schoolsectionlist: this.schoolsections,
                    gradelist: this.grades,
                    subjectlist: this.subjects,
                    typelist: this.examtypes
                };
                this.syncSuccessCount = 0;
                syncBase(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        if (!this.nothingToSync) this.doSync(0);
                    } else {
                        this.failedPrepare();
                    }
                }).catch((err) => {
                    this.failedPrepare();
                });
            },
            failedPrepare() {
                this.nothingToSync = true;
                this.failComment = '同步准备失败了。';
            },
            doSync(index) {
                let _this = this;
                this.currentExamIndex = index;
                this.syncProgressDialog = true;
                this.progressStatus = 'progress';
                this.progressPercent = 0;
                this.currentExamName = this.syncExams[index].examName;

                if (this.progressInterval != null) {
                    window.clearInterval(this.progressInterval);
                    this.progressInterval = null;
                }
                this.progressInterval = window.setInterval(function() {
                    _this.progressPercent = Math.min(_this.progressPercent + 2, 98);
                }, 1000);

                let exam = this.syncExams[index];
                queryExamInfo(exam.examId).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let examDetail = res.data.responseEntity;
                        let schoolSection = exam.classList[0].schoolSection;

                        let params = {
                            exam: {
                                examid: exam.examId,
                                examname: exam.examName,
                                termid: exam.term,
                                examtypeid: exam.examType,
                                schoolsectionid: schoolSection,
                                examstartday: exam.startdate,
                                examendday: exam.enddate,
                                schoolid: exam.orgId,
                                synctime: exam.lastModfiTime,
                                classSubjectList: this.getClassSubjectList(exam)
                            },
                            scoreList: examDetail.scoreList.map(item => ({
                                examid: exam.examId,
                                subjectid: item.subject,
                                classtype: CLASS_TYPE.NORMAL,
                                stuno: item.studentId,
                                score: item.score
                            }))
                        };

                        syncExam(params).then((res) => {
                            if (res.data.serverResult.resultCode == "200") {
                                this.doneSync(index);
                            } else {
                                this.failedSync(index);
                            }
                        }).catch((err) => {
                            this.failedSync(index);
                        });
                    } else {
                        this.failedSync(index);
                    }
                }).catch((err) => {
                    this.failedSync(index);
                })
            },
            doneSync(index) {
                let _this = this;
                window.clearInterval(this.progressInterval);
                this.progressInterval = null;
                this.progressStatus = 'success';
                this.progressPercent = 100;
                this.syncSuccessCount += 1;
                window.setTimeout(function() {
                    _this.syncProgressDialog = false;
                    if (index < _this.syncExams.length - 1) {
                        _this.doSync(index + 1);
                    } else {
                        _this.load();
                    }
                }, 3000);
            },
            failedSync(index) {
                let _this = this;
                window.clearInterval(this.progressInterval);
                this.progressInterval = null;
                this.progressStatus = 'failed';
            },
            noSync() {
                this.nothingToSync = true;
                this.failComment = '无同步的考试。';
            },
            loadBase() {
                this.getSchoolSections();
                this.getSubjects();
            },
            onConfirmFailure() {
                this.syncProgressDialog = false;
                if (!this.nothingToSync) {
                    if (this.currentExamIndex < this.syncExams.length - 1) {
                        this.doSync(this.currentExamIndex + 1);
                    } else {
                        if (this.syncSuccessCount > 0) this.load();
                    }
                }
            },
            doDeleteExam(exam) {
                deleteExam(exam.examid).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '删除成功！',
                            type: 'success'
                        });
                        this.load();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            onDeleteExam(exam) {
                var _this = this;
                this.$confirm('确认删除吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    _this.doDeleteExam(exam);
                }).catch(() => {
                });
            }
        },
        created() {
            this.getExamYearTerms();
            this.getExamTypes();
        },
        mounted() {
            resize();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .el-form-item {
        margin-bottom:15px;
    }
    .el-select {
        width:100%;
    }
</style>