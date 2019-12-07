<template>
    <section>
        <el-row class="sms-content-panel">
            <el-form label-width="90px" class="sms-filter-panel">
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="学期:">
                            <el-select size="small" v-model="filters.termid" @change="onChangeYearTerm">
                                <el-option :label="SMSUtil.getTermName(item)" :value="item.termId" v-for="(item, idx) in terms" :key="idx"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="考试类型:">
                            <el-select size="small" v-model="filters.examtypeid" @change="onChangeExamType">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in examtypes" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option> 
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="考试名称:">
                            <el-select size="small" v-model="filters.examid" @change="onChangeExam" class="sms-examfilter">
                                <el-option v-for="(item, idx) in exams" :key="idx" :label="item.examname" :value="item.examid"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="年级:">
                            <el-select size="small" v-model="filters.gradeid" @change="onChangeGrade">
                                <el-option v-for="(item, idx) in grades" :key="idx" :label="item.dictname" :value="item.dictvalue"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="班级:">
                            <el-select size="small" v-model="filters.classid" @change="onChangeClass" popper-class="scm-class-dropdown">
                                <el-option label="全部" value=""></el-option>
                                <el-option-group label="行政班" v-if="normalClasses.length>0">
                                    <el-option v-for="(item, idx) in normalClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                                </el-option-group>
                                <el-option-group label="教学班" v-if="specialClasses.length>0">
                                    <el-option v-for="(item, idx) in specialClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                                </el-option-group>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="科目:">
                            <el-radio-group v-model="filters.subjectid" class="table-view inline">
                                <el-radio size="small" v-for="(item, idx) in subjects" :label="item.dictvalue" :key="idx">{{ item.dictname }}</el-radio>
                            </el-radio-group>
                            <el-button size="small" type="search" @click="onSearch" :disabled="filters.subjectid == ''">查询</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <div class="sc-main-info-title" v-if="publishStatus=='2'">
                <span class="sc-main-info-title-span">
                    发布状态：<span class="sc-main-info-status">已发布</span>
                </span>
            </div>

            <!-- Question Score Table For Class -->
            
            <el-table :data="scorelist" v-loading="listLoading" border>
                <el-table-column label="班级名称" align="left" min-width="150" :formatter="formatClassName">
                </el-table-column>
                <el-table-column label="学号" prop="stuno" align="left" min-width="150">
                </el-table-column>
                <el-table-column label="姓名" prop="stuname" align="left" min-width="150">
                </el-table-column>
                <el-table-column label="总分" prop="total" align="left" min-width="150">
                </el-table-column>
                <el-table-column v-for="(item, idx) in examquestionlist" :label="item.questionType==null?'':item.questionType.dictname" align="center" :key="idx">
                    <el-table-column v-for="(itemitem, idxx) in examquestionlist[idx].questions" :label="itemitem.smallno" :key="idxx" align="left">
                        <template slot-scope="score">
                            <span>{{ score.row.partscores[idx][idxx].score }}</span>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>
            <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>

            <!-- Question Score Table For Class End -->
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import SMSUtil from '../../../common/js/util';
    import { queryTermList, queryDictItemList, getSimpleExamList, getStudentPartScoreList, getExamExamTypeList, getExamYearTermList, getExamGradeList, getExamClassList, getExamSubjectList, getExamQuestionScoreList, getExamSubjectScoreList } from '../../../api/api';
     
    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid:'',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                    classid: '',
                    subjectid: ''
                },
                terms: [],
                examtypes: [],
                exams: [],
                grades: [],
                classes: [],
                normalClasses: [],
                specialClasses: [],

                subjects: [],
                scorelist: [],
                listLoading: false,

                total: 0,
                page: 1,
                page_size: 5,

                examquestions: [],
                examquestionlist: [],
                publishStatus: '',
                isfirst: true
            }
        },
        methods: {
            formatClassName(row, col) {
                return SMSUtil.getClassName(row.classInfo, row.classid);
            },
            handleCurrentChange(val) {
                this.page = val;
                this.load();
            },
            pageSizeChanged(val) {
                this.page_size = val;
            },
            load() {
                this.getExamQuestionList();
            },
            loadScore() {
                this.isfirst = false;
                let num = this.examquestions.length;
                let param = {
                    pagination:{
                        numPerPage:this.page_size * num,
                        pageNo:this.page,
                        calTotal:true
                    },
                    conditions: [
                        {
                            fieldName: 'subjectid',
                            fieldValues: [
                                this.filters.subjectid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
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

                this.listLoading = true;
                getStudentPartScoreList(param).then((res)=>{
                    if (res.data.serverResult.resultCode == "200") {
                        let partscoreByStudent = this.composeByClassAndStudent(res.data.pageInfo.list);
                        this.scorelist = [];
                        for (let i=0; i<partscoreByStudent.length; i++) {
                            let partscoreForOneStudent = partscoreByStudent[i];
                            this.scorelist.push(this.getQuestionScoreList(partscoreForOneStudent));
                        }
                        this.total = parseInt(res.data.pageInfo.total / num);
                        this.getStatus();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.scorelist = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.listLoading = false;
                    this.scorelist = [];
                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            getStatus() {
                this.publishStatus = '';
                if (this.filters.examid == '' || this.filters.gradeid == '') return;

                let param = {
                    pagination: {
                        numPerPage:1,
                        pageNo:1,
                        calcTotal:false
                    },
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                this.filters.examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'gradeid',
                            fieldValues: [
                                this.filters.gradeid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                getExamSubjectScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        if (res.data.pageInfo.list.length > 0) {
                            this.publishStatus = res.data.pageInfo.list[0].pubstatus;
                        }
                    }
                });
            },
            onSearch() {
                this.page = 1;
                this.load();
            },
            getExams() {
                this.exams = [];

                let param = {
                    termid: this.filters.termid
                };
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
                            this.filters.examid = this.exams[0].examid;
                        } else {
                            this.filters.examid = '';
                            this.onChangeExam();
                        }
                    } else {
                        this.exams = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.exams = [];
                });
            },
            getGrades() {
                this.grades = [];

                if (this.filters.examid == '') {
                    this.filters.gradeid = '';
                    this.onChangeGrade();
                    return;
                }

                var param = {
                    examid:this.filters.examid
                };
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list;
                        if (this.grades.length > 0) {
                            let set = false;
                            for (var i=0; i<this.grades.length; i++) {
                                if (this.grades[i].dictvalue == this.filters.gradeid) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) this.filters.gradeid = this.grades[0].dictvalue;
                        } else {
                            this.filters.gradeid = '';
                        }
                        this.onChangeGrade();
                    } else {
                        this.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.grades = [];
                });
            },
            getSubjects() {
                this.subjects = [];
                this.filters.subjectid = '';

                if (this.filters.examid == '' || this.filters.gradeid == '') return;

                let param = {};
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                if (this.filters.gradeid != '') {
                    param.gradeid = this.filters.gradeid;
                }
                if (this.filters.classid != '') {
                    let classInfo = this.classes.filter(item => item.classid==this.filters.classid);
                    if (classInfo.length > 0) {
                        param.classid = classInfo[0].classid;
                        param.classtype = classInfo[0].classtype;
                    }
                }
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects = res.data.pageInfo.list;

                        let _this = this;
                        this.$nextTick(function() {
                            SMSUtil.adjustSubjects(_this.subjects);
                        });
                        
                        if (this.subjects.length > 0) {
                            this.filters.subjectid = this.subjects[0].dictvalue;

                            if (this.isfirst) {
                                this.load();
                            }
                        }
                    } else {
                        this.subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subjects = [];
                });
            },
            getClassList() {
                this.classes = [];
                this.normalClasses = [];
                this.specialClasses = [];

                if (this.filters.examid == '' || this.filters.gradeid == '') {
                    this.filters.classid = '';
                    this.onChangeClass();
                    return;
                }

                let param = {
                    examid: this.filters.examid,
                    gradeid: this.filters.gradeid
                };
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.classes = res.data.pageInfo.list;
                        this.normalClasses = this.classes.filter(item=>item.classtype==CLASS_TYPE.NORMAL);
                        this.specialClasses = this.classes.filter(item=>item.classtype==CLASS_TYPE.SPECIAL);

                        if (this.classes.length > 0) {
                            let set = false;
                            for (var i=0; i<this.classes.length; i++) {
                                if (this.classes[i].classid == this.filters.classid) {
                                    set = true;
                                }
                            }
                            if (!set) this.filters.classid = '';
                        } else {
                            this.filters.classid = '';
                        }
                        this.onChangeClass();
                    } else {
                        this.classes = [];
                        this.normalClasses = [];
                        this.specialClasses = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.classes = [];
                    this.normalClasses = [];
                    this.specialClasses = [];
                });
            },
            onChangeExamType() {
                this.getExams();
            },
            onChangeExam() {
                this.isfirst = true;
                this.getGrades();
            },
            onChangeGrade() {
                this.getClassList();
            },
            onChangeClass() {
                this.getSubjects();
            },
            getExamQuestionList() {
                this.examquestions = [];
                this.examquestionlist = [];

                let params = {
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                this.filters.examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'gradeid',
                            fieldValues: [
                                this.filters.gradeid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'subjectid',
                            fieldValues: [
                                this.filters.subjectid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };

                getExamQuestionScoreList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examquestions = res.data.pageInfo.list;
                        this.loadScore();
                        this.getQuestionList(this.examquestions);
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            composeByClassAndStudent(questionscorelist) {
                let result = [];

                while(questionscorelist.length > 0) {
                    let questionscorebystudent = questionscorelist[0];
                    let sameclass = questionscorelist.filter(item => item.classid == questionscorebystudent.classid && item.stuid == questionscorebystudent.stuid);
                    questionscorebystudent.allscores = sameclass;
                    questionscorelist = SMSUtil.removeArrayItems(questionscorelist, sameclass);
                    result.push(questionscorebystudent);
                }

                return result;
            },
            getQuestionList(questionlist) {
                let tempquestionlist = questionlist;
                this.examquestionlist = [];
                while(tempquestionlist.length > 0) {
                    let question = tempquestionlist[0];
                    this.examquestionlist.push(question);
                    let samequestion = tempquestionlist.filter(item => item.questiontypeid == question.questiontypeid);
                    question.questions = samequestion;
                    tempquestionlist = SMSUtil.removeArrayItems(tempquestionlist, samequestion);
                }
            },
            getQuestionScoreList(partscoreForOneStudent) {
                let scorelist = {
                    classid:partscoreForOneStudent.classid,
                    classInfo:partscoreForOneStudent.classInfo,
                    stuno:partscoreForOneStudent.stuno,
                    stuname:partscoreForOneStudent.stuname,
                    total:0,
                    partscores:[]
                };
                for (let i=0; i<this.examquestionlist.length; i++) {
                    scorelist.partscores.push([]);
                    for (let j=0; j<this.examquestionlist[i].questions.length; j++) {
                        scorelist.partscores[i].push({ score:'' });
                    }
                }
                for (let i=0; i<partscoreForOneStudent.allscores.length; i++) {
                    let questionscore = partscoreForOneStudent.allscores[i];
                    let indexObj = this.getIndexOfQuestionScore(questionscore);
                    if (indexObj == null) continue;
                    scorelist.partscores[indexObj.idx1][indexObj.idx2] = questionscore;
                    scorelist.total += parseInt(questionscore.score);
                }

                return scorelist;
            },
            getIndexOfQuestionList(questiontypeid) {
                for (var i=0; i<this.examquestionlist.length; i++) {
                    if (this.examquestionlist[i].questiontypeid == questiontypeid)
                        return i;
                }
                return -1;
            },
            getIndexOfQuestionScore(questionscore) {
                for (let i=0; i<this.examquestionlist.length; i++) {
                    for (let j=0; j<this.examquestionlist[i].questions.length; j++) {
                        if (this.examquestionlist[i].questions[j].smallno == questionscore.smallno)
                            return { idx1:i, idx2:j };
                    }
                }
                return null;
            },
            onSelectFile(e) {
                var selectedFile = e.target.files[0];
                const data = new FormData();
                data.append('file', selectedFile);

                this.listLoading = true;
                this.listLoading = false;
            },
            // filter mixin
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
                    } else {
                        this.terms = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.terms = [];
                });
            },
            checkYearTerm() {
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
                        this.onChangeExamType();
                    } else {
                        this.examtypes = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.examtypes = [];
                });
            },
            onChangeYearTerm() {
                this.getExamTypes();
            }
        },
        created() {
            this.getExamYearTerms();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .line-block {
        display:inline-block;
        margin-left:8px;
    }
</style>