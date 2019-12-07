<template>
    <section>
        <input type="file" ref="importfile" accept=".xls,.xlsx" hidden @change="onFileChosen"></input>
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
                                <el-option label="全部行政班" value=""></el-option>
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
                        <el-form-item label="科目:" class="table-view">
                            <el-checkbox size="small" label="" v-model="subjectAll" @change="onSubjectAllChange" v-if="this.subjects.length>1" style="float:left;">全部</el-checkbox>
                            <el-checkbox-group v-model="checkedSubjects" class="inline">
                                <el-checkbox size="small" v-for="(item, idx) in subjects" :label="item" :key="idx">{{ item.dictname }}</el-checkbox>
                            </el-checkbox-group>
                            <el-button size="small" type="search" @click="onSearch" :disabled="checkedSubjects.length === 0">查询</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <el-col :span="24" class="sms-batchop-panel" v-if="publishStatus!='2'">
                <el-button size="small" @click="onDownloadTemplate" :disabled="filters.examid == '' || checkedSubjects.length === 0 || publishStatus == ''" v-if="filters.examcreatorid==SMSUtil.getUser().userId">下载模板</el-button>
                <el-button size="small" @click="onImport" :disabled="filters.examid == '' || checkedSubjects.length === 0 || publishStatus == ''" :loading="importLoading"  v-if="filters.examcreatorid==SMSUtil.getUser().userId">导入成绩</el-button>
            </el-col>

            <div class="sc-main-info-title" v-if="publishStatus=='2'">
                <span class="sc-main-info-title-span">
                    发布状态：<span class="sc-main-info-status">已发布</span>
                </span>
            </div>
            
            <!-- Full Score Table For Class -->
            
            <el-table :data="subjectscorelist" v-loading="listLoading" border>
                <el-table-column label="班级名称" align="left" :formatter="formatClassName" min-width="150">
                </el-table-column>
                <el-table-column label="学号" prop="stuno" align="left">
                </el-table-column>
                <el-table-column label="姓名" prop="stuname" align="left">
                </el-table-column>
                <el-table-column :label="subject.dictname" align="left" v-for="(subject,idx) in searchSubjects" :key="idx" min-width="110">
                    <template slot-scope="fullscore">
                        <el-input type="number" style="width:calc(100% - 2px)" v-show="fullscore.row.subjects[idx].editing==1" 
                            v-model="fullscore.row.subjects[idx].score" :min="0" @blur="updateSubjectScore(fullscore.row.subjects[idx])" @keyup.enter.native.prevent="updateSubjectScore(fullscore.row.subjects[idx])">
                        </el-input>
                        <span v-show="fullscore.row.subjects[idx].editing==0" @dblclick="switchToEdit(fullscore.row.subjects[idx], fullscore.$index, idx)" style="display:inline-block;width:100%;cursor:pointer;" class="sms-operation">
                            <span style="display:inline-block;width:50px" class="sc-color-orange" v-if="(fullscore.row.subjects[idx].score==null||fullscore.row.subjects[idx].score=='')&&fullscore.row.subjects[idx].status=='1'">未录入</span>
                            <span style="display:inline-block;width:50px" v-if="((fullscore.row.subjects[idx].score!=null&&fullscore.row.subjects[idx].score!='')||fullscore.row.subjects[idx].status!='1')&&parseInt(fullscore.row.subjects[idx].score)!=-1">{{ fullscore.row.subjects[idx].score }}</span>
                            <span style="display:inline-block;width:50px" class="sc-color-red" v-if="((fullscore.row.subjects[idx].score!=null&&fullscore.row.subjects[idx].score!='')||fullscore.row.subjects[idx].status!='1')&&parseInt(fullscore.row.subjects[idx].score) == -1">缺考</span>
                            <a class="sms-operation-anchor" href="javascript:;" @click="goDetail(filters.termid, fullscore.row.exam.examid, fullscore.row.classid, subject.dictname, subject.dictvalue, fullscore.row.stuname, fullscore.row.stuid)" v-if="((fullscore.row.subjects[idx].score!=null&&fullscore.row.subjects[idx].score!='')||fullscore.row.subjects[idx].status!='1')&&parseInt(fullscore.row.subjects[idx].score)!=-1&&fullscore.row.subjects[idx].status=='2'">小题分</a>
                        </span>
                    </template>
                </el-table-column>
            </el-table>
            <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>

            <!-- Full Score Table For Class End -->

            <!-- Partscore Dialog -->

            <el-dialog :title="'查看小题分' + '--' + studentName + '（' + questionSubject + '）'" v-model="partscoreDialogVisible" :close-on-click-modal="true">
                <el-table :data="partscores" v-loading="questionScoreLoading" height="322" v-if="partscoreDialogVisible">
                    <el-table-column prop="volumeid" label="分卷名称" align="left" :formatter="formatVolume">
                    </el-table-column>
                    <el-table-column prop="bigno" label="大题编号" align="left" :formatter="formatBigNo">
                    </el-table-column>
                    <el-table-column prop="questionno" label="试题编号" align="left">
                    </el-table-column>
                    <el-table-column prop="questionCategory.dictname" label="试题类型" align="left">
                    </el-table-column>
                    <el-table-column prop="smallno" label="小题编号" align="left">
                    </el-table-column>
                    <el-table-column prop="questionType.dictname" label="题型" align="left">
                    </el-table-column>
                    <el-table-column prop="score" label="分值" align="left">
                    </el-table-column>
                </el-table>
                <div slot="footer" class="dialog-footer">
                    <el-button @click.native="partscoreDialogVisible=false">关闭</el-button>
                </div>
            </el-dialog>

            <!-- Partscore Dialog End -->
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE, EXAM_QUESTION_VOLUME } from '../../../common/js/const';
    import { filter } from '../../../mixins/filter';
    import SMSUtil from '../../../common/js/util';
    import { queryTermList, queryDictItemList, getSimpleExamList, getStudentTotalScoreList, getExamSubjectScoreList, getExamExamTypeList, getExamYearTermList, getExamGradeList, getExamClassList, getExamSubjectList, setStudentTotalScore, importQuestionScore, getStudentPartScoreList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid:'',
                    examtypeid: '',
                    examid: '',
                    exam: null,
                    gradeid: '',
                    classid: '',
                    examcreatorid: ''
                },
                url: {
                    termid: '',
                    examid: ''
                },
                terms: [],
                examtypes: [],
                exams: [],
                grades: [],
                classes: [],
                normalClasses: [],
                specialClasses: [],

                subjects: [],
                subjectAll: '',
                checkedSubjects: [],
                searchSubjects: [],

                subjectscorelist: [],
                partscores: [],
                listLoading: false,
                partscoreDialogVisible: false,
                questionScoreLoading: false,
                editable:false,

                questionSubject: '',
                studentName: '',

                importLoading:false,
                importfile: null,

                total: 0,
                page: 1,
                page_size: 10,

                publishStatus: '',
                isfirst: true,
                isimport: false,
                originalscore: 0
            }
        },
        methods: {
            formatVolume(row, col) {
                for (var i=0; i<EXAM_QUESTION_VOLUME.length; i++) {
                    if (EXAM_QUESTION_VOLUME[i].dictvalue == row.volumeid) {
                        return EXAM_QUESTION_VOLUME[i].dictname;
                    }
                }
                return '';
            },
            formatBigNo(row, col) {
                if (row.bigno == '') return '----';
                return row.bigno;
            },
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
            goDetail(termid, examid, classid, subjectname, subjectid, stuname, stuid) {
                this.partscoreDialogVisible = true;
                this.questionSubject = subjectname;
                this.studentName = stuname;

                let param = {
                    pagination:{
                        numPerPage:65536,
                        pageNo:1
                    },
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'classid',
                            fieldValues: [
                                classid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'subjectid',
                            fieldValues: [
                                subjectid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'stuid',
                            fieldValues: [
                                stuid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };

                this.questionScoreLoading = true;
                getStudentPartScoreList(param).then((res)=>{
                    if (res.data.serverResult.resultCode == "200") {
                        this.partscores = res.data.pageInfo.list;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.partscores = [];
                    }
                    this.questionScoreLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.questionScoreLoading = false;
                    this.partscores = [];
                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            load() {
                this.searchSubjects = this.checkedSubjects;
                this.searchSubjects.sort(SMSUtil.subjectSort);

                let num = this.searchSubjects.length;

                let param = {
                    pagination:{
                        numPerPage:this.page_size * num,
                        pageNo:this.page,
                        calTotal:true
                    },
                    conditions: [
                        {
                            fieldName: 'subjectid',
                            fieldValues: this.searchSubjects.map(item=>item.dictvalue),
                            operator: 'IN'
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
                        fieldName: 'pt.gradeid',
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
                } else {
                    param.conditions.push({
                        fieldName: 'classtype',
                        fieldValues: [
                            CLASS_TYPE.NORMAL
                        ],
                        operator: 'EQUAL'
                    });
                }

                this.listLoading = true;
                this.subjectscorelist = [];

                getStudentTotalScoreList(param).then((res)=>{
                    if (res.data.serverResult.resultCode == "200") {
                        let tempsubjectscores = res.data.pageInfo.list;

                        while(tempsubjectscores.length > 0) {
                            let subjectscore = tempsubjectscores[0];
                            subjectscore.subjects = [];
                            for (var i=0; i<num; i++) {
                                subjectscore.subjects.push({
                                    editing: 0,
                                    score:'',
                                    status:0
                                });
                            }
                            
                            let sameclass = tempsubjectscores.filter(item => item.classid == subjectscore.classid && item.stuid == subjectscore.stuid);
                            for (var i=0; i<sameclass.length; i++) {
                                let index = this.getIndexOfSubject(sameclass[i].subjectid);
                                if (index == -1) continue;
                                subjectscore.subjects[index] = sameclass[i];
                                this.$set(subjectscore.subjects[index], 'editing', 0);
                            }

                            tempsubjectscores = SMSUtil.removeArrayItems(tempsubjectscores, sameclass);
                            this.subjectscorelist.push(subjectscore);
                        }

                        this.total = parseInt(res.data.pageInfo.total / num);
                        this.getStatus();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.subjectscorelist = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.listLoading = false;
                    this.subjectscorelist = [];
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
            switchToEdit(subjectscore, rowindex, colindex) {
                if (this.publishStatus == '2') return;
                if (subjectscore.status == '2') return;
                if (this.filters.exam.creatorid != SMSUtil.getUser().userId) return;

                subjectscore.editing = 1;
                this.originalscore = subjectscore.score;
                let _this = this;
                this.$nextTick(function() {
                    $($($('table tr')[rowindex+1]).find('td input[type=number]')[colindex]).focus();
                });
            },
            onImport() {
                this.$refs.importfile.value = "";
                this.$refs.importfile.click();
            },
            updateSubjectScore(subjectscore) {
                if (subjectscore.score == this.originalscore) {
                    subjectscore.editing = 0;
                    return;
                }

                let params = [
                    {
                        stusubjectscoreid: subjectscore.stusubjectscoreid,
                        score: subjectscore.score
                    }
                ];

                setStudentTotalScore(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '保存成功！',
                            type: 'success'
                        });
                        subjectscore.editing = 0;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        subjectscore.editing = 0;
                        subjectscore.score = this.originalscore;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                    subjectscore.editing = 0;
                    subjectscore.score = this.originalscore;
                });
            },
            onFileChosen() {
                if (this.$refs.importfile.files.length == 0) return;
                this.importfile = this.$refs.importfile.files[0];
                if (!this.importfile.name.endsWith(".xls") && 
                    !this.importfile.name.endsWith(".xlsx")) {
                    this.importfile = null;
                    this.$message({
                        message: '只能上传xls,xlsx文件。',
                        type: 'error'
                    });
                }

                this.doImport('0');
            },
            doImport(force) {
                const param = new FormData();
                param.append('file', this.importfile);
                param.append('force', force);

                this.importLoading = true;
                importQuestionScore(this.filters.examid, param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '导入成功',
                            type:  'success'
                        });
                        this.isimport = true;
                        this.filters.gradeid = res.data.responseEntity.gradeid;
                        if (res.data.responseEntity.classtype == '1') {
                            if (this.filters.classid == '') this.onChangeClass();
                            else this.filters.classid = '';
                        } else {
                            if (this.filters.classid == res.data.responseEntity.classid) this.onChangeClass();
                            else this.filters.classid = res.data.responseEntity.classid;
                        }
                    } else if (res.data.serverResult.resultCode == "-1409") {
                        let _this = this;
                        this.$confirm('是否覆盖现有数据？', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.doImport('1');
                        }).catch(() => {
                        });
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.importLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.importLoading = false;
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            onDownloadTemplate() {
                SMSUtil.download(OPENAPI_SERVER + 'student-part-score/export/' + this.filters.examid);
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
                            if (this.url.examid != '') {
                                this.filters.examid = this.url.examid;
                                this.url.examid = '';
                                this.$router.param.examid = '';
                            } else {
                                for (var i=0; i<this.exams.length; i++) {
                                    if (this.exams[i].examid == this.filters.examid) return;
                                }
                                this.filters.examid = this.exams[0].examid;
                            }
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

                        var exams = this.exams.filter(item=>item.examid==this.filters.examid);
                        if (exams.length == 0) this.filters.examcreatorid = '';
                        else this.filters.examcreatorid = exams[0].creatorid;                        
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
                this.checkedSubjects = [];

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
                } else {
                    param.classtype = CLASS_TYPE.NORMAL;
                }
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects = res.data.pageInfo.list;

                        let _this = this;
                        this.$nextTick(function() {
                            SMSUtil.adjustSubjects(_this.subjects);
                        });

                        if (this.subjects.length > 0) {
                            if (this.isimport) {
                                this.checkedSubjects = this.subjects;
                            } else {
                                this.checkedSubjects = [ this.subjects[0] ];
                            }

                            if (this.isfirst || this.isimport) {
                                this.load();
                                this.isfirst = false;
                                this.isimport = false;
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
                            if (!set) {
                                if (this.normalClasses.length > 0)
                                    this.filters.classid = '';
                                else
                                    this.filters.classid = this.specialClasses[0].classid;
                            }
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
                let exams = this.exams.filter(item=>item.examid==this.filters.examid);
                this.filters.exam = exams.length>0?exams[0]:null;
                this.getGrades();
            },
            onChangeGrade() {
                this.getClassList();
            },
            onChangeClass() {
                this.getSubjects();
            },
            onSubjectAllChange() {
                if (this.subjectAll) {
                    this.checkedSubjects = this.subjects;
                } else {
                    this.checkedSubjects = [];
                }
            },
            getIndexOfSubject(subjectid) {
                for (var i=0; i<this.searchSubjects.length; i++) {
                    if (this.searchSubjects[i].dictvalue == subjectid) return i;
                }
                return -1;
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
                            if (this.url.termid != '') {
                                this.filters.termid = this.url.termid;
                                this.url.termid = '';
                                this.$router.param.termid = '';
                            } else {
                                this.checkYearTerm();
                            }
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
        watch: {
            checkedSubjects(val, oldval) {
                let checkedCount = this.checkedSubjects.length;
                if (checkedCount == this.subjects.length)
                    this.subjectAll = true;
                else
                    this.subjectAll = false;
            }
        },
        created() {
            if (this.$router.param != null) {
                this.url.termid = this.$router.param.termid;
                this.url.examid = this.$router.param.examid;
            }

            this.getExamYearTerms();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>