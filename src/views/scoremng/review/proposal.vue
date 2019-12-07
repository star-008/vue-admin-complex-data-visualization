<template>
    <section>
        <el-row :span="24" class="sms-content-panel">
            <el-form label-width="90px" class="sms-filter-panel">
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="学期:">
                            <el-select size="small" v-model="filters.termid" @change="onChangeYearTerm(filters)">
                                <el-option label="全部" value=""></el-option>
                                <el-option :key="idx" :data="item" v-for="(item, idx) in terms" 
                                    :label="SMSUtil.getTermName(item)" 
                                    :value="item.termId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="考试类型:">
                            <el-select size="small" v-model="filters.examtypeid" @change="onChangeExamType(filters)">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in examtypes" :label="item.dictname" :value="item.dictvalue" :key="idx" :data="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="考试名称:">
                            <el-select size="small" v-model="filters.examid" @change="onChangeExam(filters)" class="sms-examfilter">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in exams" :label="item.examname" :value="item.examid" :key="idx" :data="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="年级:">
                            <el-select size="small" v-model="filters.gradeid" @change="onChangeGrade(filters)">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in filters.grades" :label="item.dictname" :value="item.dictvalue" :key="idx" :data="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="班级:">
                            <el-select size="small" v-model="filters.classid" @change="onChangeClass(filters)" popper-class="scm-class-dropdown">
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
                            <el-radio-group class="table-view" v-model="filters.subjectid">
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
                        <el-button size="small" type="search" v-on:click="search" id="searchBtn" style="margin-left:20px;width:60px;">查询</el-button>
                    </el-col>
                </el-row>
            </el-form>

            <el-col :span="24" class="sms-batchop-panel">
                <el-button type="primary" size="small" @click="doAdd">新增</el-button>
                <el-button size="small" :disabled="this.sels.length===0" @click="batchRemove">删除</el-button>
            </el-col>

            <el-table :data="proposals" v-loading="listLoading" @selection-change="selsChange" border>
                <el-table-column type="selection" :selectable="getSelectableStatus" width="38" align="center">
                </el-table-column>
                <el-table-column prop="studentSubjectScore.stuno" label="学号" align="left" width="100">
                </el-table-column>
                <el-table-column prop="studentSubjectScore.stuname" label="姓名" align="left" width="100">
                </el-table-column>
                <el-table-column prop="studentSubjectScore.exam.examname" label="考试名称" align="left" width="200">
                </el-table-column>
                <el-table-column label="班级" align="left" :formatter="formatClassName">
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
                        <el-tooltip class="item" effect="dark" :content="proposal.row.appview" placement="left" v-if="proposal.row.appview != null && proposal.row.appview != ''">
                            <span :class="{ 'color-red':proposal.row.status=='5' }">{{ formatStatus(proposal.row.status) }}</span>
                        </el-tooltip>
                        <span :class="{ 'color-red':proposal.row.status=='5' }" v-if="proposal.row.appview == null || proposal.row.appview == ''">{{ formatStatus(proposal.row.status) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="审核日期" align="left" width="150" :formatter="formatApprTime">
                </el-table-column>
                <el-table-column label="审核人" align="left" :formatter="formatApprName">
                </el-table-column>
<!--
                <el-table-column label="操作时间" align="left" width="150" :formatter="formatActionTime">
                </el-table-column>
                <el-table-column prop="approvername" label="操作时" align="left">
                </el-table-column>
-->
            </el-table>
            <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>
        </el-row>
        
        <!-- Propose Dialog Start -->

        <el-dialog title="新增成绩更改申请" v-model="addFormVisible" :close-on-click-modal="false" class="medium">
            <el-form label-width="120px" ref="addForm" :model="addForm" :rules="addFormRule">
                <el-form-item label="考试名称:" required>
                    <el-select size="small" v-model="addForm.examid" @change="onChangeExam(addForm)">
                        <el-option v-for="(item, idx) in allexams" :label="item.examname" :value="item.examid" :key="idx"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="科目:" required>
                    <el-select size="small" v-model="addForm.subjectid" @change="onChangeSubject()">
                        <el-option v-for="(item, idx) in addForm.subjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                    </el-select>         
                </el-form-item>
                <el-form-item label="年级:" required>
                    <el-select size="small" v-model="addForm.gradeid" @change="onChangeGrade(addForm)">
                        <el-option v-for="(item, idx) in addForm.grades" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="班级:" required>
                    <el-select size="small" v-model="addForm.classid" @change="onChangeClass(addForm)" popper-class="scm-class-dropdown">
                        <el-option-group label="行政班" v-if="addForm.normalClasses.length>0">
                            <el-option v-for="(item, idx) in addForm.normalClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                        </el-option-group>
                        <el-option-group label="教学班" v-if="addForm.specialClasses.length>0">
                            <el-option v-for="(item, idx) in addForm.specialClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>
                <el-form-item label="姓名:" required>
                    <el-select size="small" v-model="addForm.studentid" @change="onChangeStudent">
                        <el-option v-for="(item, idx) in addForm.students" :label="item.name" :value="item.userId+':'+item.name" :key="idx"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="原成绩:" v-loading="scoreLoading">
                    <span v-if="parseInt(addForm.score)==-1" class="sc-color-red">缺考</span>
                    <span v-else>{{ SMSUtil.formatNumber(addForm.score, 2) }}</span>
                </el-form-item>
                <el-form-item label="新成绩:" required>
                    <el-input-number size="small" v-model="addForm.newscore" :min="0" style="width:100%"></el-input-number>
                </el-form-item>
                <el-form-item label="更改原因:">
                    <el-input size="small" type="textarea" v-model="addForm.reason"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="addFormVisible = false">取消</el-button>
                <el-button size="small" type="primary" :disabled="addForm.examid==''||addForm.subjectid==''||addForm.gradeid==''||addForm.classid==''||addForm.studentid==''||addForm.score==''" @click.native="addSubmit" :loading="formLoading">确定</el-button>
            </div>
        </el-dialog>

        <!-- Propose Dialog End -->
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import { filter } from '../../../mixins/filter';
    import SMSUtil from '../../../common/js/util';
    import { getUpdateScoreProposalList, requestUpdateScoreProposal, deleteUpdateScoreProposal, getStudentTotalScoreList, getSimpleExamList, getExamYearTermList, getExamExamTypeList, getExamGradeList, getExamClassList, getExamSubjectList, getReviewStudentList } from '../../../api/api';

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
                addForm: {
                    examid: '',
                    gradeid: '',
                    classid: '',
                    studentid: '',
                    subjectid: '',
                    score: '',
                    newscore: '',
                    reason: '',

                    grades: [],
                    classes: [],
                    normalClasses: [],
                    specialClasses: [],
                    students: [],
                    subjects: []
                },
                addFormRule: {
                },

                terms: [],
                examtypes: [],
                exams: [],
                allexams: [],

                proposals: [],
                listLoading: false,
                formLoading: false,
                scoreLoading: false,
                sels: [],
                addFormVisible: false,

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
                if ((row.status=='4' || row.status=='5') && row.apprtime) return row.apprtime;
                return '';
            },
            formatApprName(row, col) {
                if (row.status=='4' || row.status=='5') return row.approvername;
                return '';
            },
            formatActionTime(row, col) {
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
                if (this.filters.termid != '') {
                    param.conditions.push({
                        fieldName: 'termid',
                        fieldValues: [
                            this.filters.termid
                        ],
                        operator: 'EQUAL'
                    });
                }
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
                    checkteacherscope:'1',
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
                        this.onChangeExam(this.filters);
                        this.onChangeExam(this.addForm);
                    } else {
                        this.exams = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.exams = [];
                });
            },
            getAllExams() {
                this.allexams = [];
                this.addForm.examid = '';

                let param = {
                    checkteacherscope:'1',
                    pubstatus:'2'
                };
                getSimpleExamList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.allexams = res.data.pageInfo.list;
                    } else {
                        this.allexams = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.allexams = [];
                });
            },
            getGrades(form) {
                form.grades = [];

                var param = { pubstatus:'2' };
                if (form.examid != '') {
                    param.examid = form.examid;
                }
                if (form == this.addForm) {
                    param.subjectid = form.subjectid;
                    param.checkteacherscope = 1;
                }
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        form.grades = res.data.pageInfo.list.filter(item => item!=null);

                        if (form.grades.length > 0) {
                            if (form == this.filters) {
                                let set = false;
                                for (var i=0; i<form.grades.length; i++) {
                                    if (form.grades[i].dictvalue == form.gradeid) {
                                        set = true;
                                        break;
                                    }
                                }
                                if (!set) form.gradeid = '';
                            } else {
                                form.gradeid = form.grades[0].dictvalue;
                            }
                            this.onChangeGrade(form);
                        }
                    } else {
                        form.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    form.grades = [];
                });
            },
            getClasses(form) {
                form.classes = [];

                let param = { pubstatus:'2' };
                if (form.examid != '') {
                    param.examid = form.examid;
                }
                if (form.gradeid != '') {
                    param.gradeid = form.gradeid;
                }
                if (form == this.addForm) {
                    param.subjectid = form.subjectid;
                    param.checkteacherscope = 1;
                }
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        form.classes = res.data.pageInfo.list;
                        form.normalClasses = form.classes.filter(item => item.classtype==CLASS_TYPE.NORMAL);
                        form.specialClasses = form.classes.filter(item => item.classtype==CLASS_TYPE.SPECIAL);
                        let set = false;
                        for (var i=0; i<form.classes.length; i++) {
                            if (form.classes[i].classid == form.classid) {
                                set = true;
                                break;
                            }
                        }
                        if (!set) {
                            if (form == this.filters) {
                                form.classid = '';
                            } else if (form == this.addForm) {
                                if (form.normalClasses.length > 0) {
                                    form.classid = form.normalClasses[0].classid;
                                } else if (form.specialClasses.length > 0) {
                                    form.classid = form.specialClasses[0].classid;
                                }
                            }
                        }

                        this.onChangeClass(form);
                    } else {
                        form.classes = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    form.classes = [];
                });
            },
            getStudents() {
                this.addForm.students = [];
                this.addForm.studentid = '';

                if (this.addForm.examid == '' || this.addForm.classid == '') return;

                let param = {
                    examid: this.addForm.examid,
                    subjectid: this.addForm.subjectid,
                    classid: this.addForm.classid
                };
                getReviewStudentList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.addForm.students = res.data.pageInfo.list;
                        if (this.addForm.students.length > 0) {
                            this.addForm.studentid = this.addForm.students[0].userId + ':' + this.addForm.students[0].name;
                        } else {
                            this.addForm.studentid = '';
                        }
                    } else {
                        this.addForm.students = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.addForm.students = [];
                });
            },
            getSubjects(form) {
                form.subjects = [];
                form.subjectid = '';

                let param = {
                    pubstatus:'2'
                };
                if (form == this.addForm) {
                    param.checkteacherscope = 1;
                }
                if (form.examid != '') {
                    param.examid = form.examid;
                }
                if (form == this.filters) {
                    if (form.gradeid != '') {
                        param.gradeid = form.gradeid;
                    }
                    if (form.classid != '') {
                        let classInfo = form.classes.filter(item => item.classid==form.classid);
                        if (classInfo.length > 0) {
                            param.classid = classInfo[0].classid;
                            param.classtype = classInfo[0].classtype;
                        }
                    }
                }
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        form.subjects = res.data.pageInfo.list.filter(item => item!=null);

                        if (form == this.filters) {
                            this.$nextTick(function() {
                                SMSUtil.adjustSubjects(form.subjects);
                            });
                        }

                        if (form.subjects.length > 0) {
                            if (form == this.filters) {
                                form.subjectid = '';
                            } else {
                                form.subjectid = form.subjects[0].dictvalue;
                            }                            
                        }
                        if (this.isfirst) {
                            this.loadProposals();
                            this.isfirst = false;
                        }
                    } else {
                        form.subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    form.subjects = [];
                });
            },
            loadScore() {
                if (this.addForm.examid == '') return;
                if (this.addForm.gradeid == '') return;
                if (this.addForm.classid == '') return;
                if (this.addForm.subjectid == '') return;
                if (this.addForm.studentid == '') return;

                let param = {
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                this.addForm.examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'gradeid',
                            fieldValues: [
                                this.addForm.gradeid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'classid',
                            fieldValues: [
                                this.addForm.classid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'subjectid',
                            fieldValues: [
                                this.addForm.subjectid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'stuid',
                            fieldValues: [
                                this.addForm.studentid.split(':')[0]
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };

                this.scoreLoading = true;
                getStudentTotalScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        if (res.data.pageInfo.total == 0) {
                            if (this.addForm.studentid != '') {
                                this.$message({
                                    message: '【' + this.addForm.studentid.split(':')[1] + '】学生有参加考试。',
                                    type: 'info'
                                });
                            }
                            this.addForm.score = '';
                        } else {
                            this.addForm.score = res.data.pageInfo.list[0].score;
                            this.addForm.newscore = this.addForm.score;
                            this.addForm.stusubjectid = res.data.pageInfo.list[0].stusubjectscoreid;
                        }
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.addForm.score = '';
                    }
                    this.scoreLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.addForm.score = '';
                    this.scoreLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            batchRemove() {
                this.$confirm('确认删除更改成绩申请吗？', '提示', {
                    type: 'info'
                }).then(() => {
                    let param = [];
                    for (var i=0; i<this.sels.length; i++) {
                        param.push({
                            stumodifyscoreid: this.sels[i].stumodifyscoreid
                        })
                    }

                    this.listLoading = true;
                    deleteUpdateScoreProposal(param).then((res) => {
                        if (res.data.serverResult.resultCode == "200") {
                            this.$message({
                                message: '删除成功！',
                                type: 'success'
                            });
                            this.loadProposals();
                        } else {
                            this.$message({
                                message: res.data.serverResult.resultMessage,
                                type: 'error'
                            });
                        }
                        this.listLoading = false;                        
                    }).catch((err) => {
                        console.log(err);
                        this.listLoading = false;
                        this.$message({
                            message: '操作失败',
                            type: 'error'
                        });
                    })
                }).catch(() => {
                });
            },
            addSubmit() {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        if (parseFloat(this.addForm.score) == parseFloat(this.addForm.newscore)) {
                            this.$message({
                                message: '新成绩不能跟原成绩一样。',
                                type: 'error'
                            });
                            return;
                        }
                        let param = {
                            stusubjectid: this.addForm.stusubjectid,
                            score: this.addForm.score,
                            modifyscore: this.addForm.newscore,
                            modifyreason: this.addForm.reason
                        };

                        this.formLoading = true;
                        requestUpdateScoreProposal(param).then((res) => {
                            if (res.data.serverResult.resultCode == "200") {
                                this.$message({
                                    message: '申请更改成功！',
                                    type: 'success'
                                });
                                this.addFormVisible = false;
                                this.loadProposals();
                            } else {
                                this.$message({
                                    message: res.data.serverResult.resultMessage,
                                    type: 'error'
                                });
                            }
                            this.formLoading = false;
                        }).catch((err) => {
                            console.log(err);
                            this.formLoading = false;
                            this.$message({
                                message: '操作失败',
                                type: 'error'
                            });
                        });
                    }
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
            getSelectableStatus(row, col) {
                if (row.applicantid != SMSUtil.getUser().userId || (row.status == '4' || row.status == '5' || row.status == '9')) {
                    return false;
                } else {
                    return true;
                }
            },
            onChangeExamType() {
                this.getExams();
            },
            onChangeExam(form) {
                if (form == this.filters) {
                    this.addForm.examid = form.examid;
                    this.getGrades(form);
                } else {
                    this.getSubjects(form);
                }
            },
            onChangeSubject() {
                this.getGrades(this.addForm);
            },
            onChangeGrade(form) {
                this.getClasses(form);
            },
            onChangeClass(form) {
                if (form == this.filters) {
                    this.getSubjects(form);
                } else {
                    this.getStudents();
                }
            },
            onChangeStudent() {
                this.loadScore();
            },
            selsChange(sels) {
                this.sels = sels;
            },
            doAdd() {
                this.addForm.newscore = this.addForm.score;
                this.addForm.reason = '';

                this.addFormVisible = true;
                if (this.allexams.length > 0 && this.addForm.examid == '') {
                    this.addForm.examid = this.allexams[0].examid;
                }
                this.onChangeExam(this.addForm);
            }
        },
        created() {
            this.getAllExams();
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