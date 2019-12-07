<template>
    <section>
        <el-row class="sms-content-panel">
            <el-form label-width="100px" class="sms-filter-panel">
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="学期:">
                            <el-select size="small" v-model="filters.termid" @change="onChangeYearTerm">
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
                            <el-select size="small" v-model="filters.gradeid">
                                <el-option label="全部" value=""></el-option>
                                <el-option v-for="(item, idx) in grades" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-button size="small" type="search" @click="onSearch" id="searchBtn" style="margin-left:20px;width:60px;">查询</el-button>
                    </el-col>
                </el-row>
            </el-form>

            <el-table :data="publishes" v-loading="listLoading" :span-method="objectSpanMethod" border>
                <el-table-column label="年级" prop="grade.dictname" align="left">
                </el-table-column>
                <el-table-column label="科目" prop="subject.dictname" align="left">
                </el-table-column>
                <el-table-column label=" 录入状态                       缺考/未录入/完成" width="180" label-class-name="sms-wrap-column" :resizable="false">
                    <template slot-scope="subjectscore">
                        <a v-if="subjectscore.row.exammissedcount>0" href="javascript:;" class="sc-color-red" @click="onShowStudents(subjectscore.row, 0)">&nbsp;{{ subjectscore.row.exammissedcount }}</a>
                        <span v-if="subjectscore.row.exammissedcount==0" class="sc-color-red" >&nbsp;{{ subjectscore.row.exammissedcount }}</span>
                        /
                        <span class="sms-operation">
                            <a v-if="subjectscore.row.scoreunenteredcount>0" class="sms-operation-anchor" href="javascript:;" @click="onShowStudents(subjectscore.row, 1)">{{ subjectscore.row.scoreunenteredcount!=null?subjectscore.row.scoreunenteredcount:0 }}</a>
                            <span v-if="subjectscore.row.scoreunenteredcount==0 || subjectscore.row.scoreunenteredcount==null">{{ subjectscore.row.scoreunenteredcount!=null?subjectscore.row.scoreunenteredcount:0 }}</span>
                        </span>
                        /
                        <span class="sms-operation">
                            <a v-if="subjectscore.row.scoreenteredcount>0" class="sms-operation-anchor" href="javascript:;" @click="onShowStudents(subjectscore.row, 2)">{{ subjectscore.row.scoreenteredcount!=null?subjectscore.row.scoreenteredcount:0 }}</a>
                            <span v-if="subjectscore.row.scoreenteredcount==0 || subjectscore.row.scoreenteredcount==null">{{ subjectscore.row.scoreenteredcount!=null?subjectscore.row.scoreenteredcount:0 }}</span>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="发布状态" align="left" :formatter="formatStatus">
                </el-table-column>
                <el-table-column label="操作人员" prop="publishername" align="left">
                </el-table-column>
                <el-table-column label="操作时间" prop="pubtime" align="left">
                </el-table-column>
                <el-table-column label="操作" align="left" v-if="filters.examcreatorid==SMSUtil.getUser().userId">
                    <template slot-scope="subjectscore">
                        <a href="javascript:;" @click="onUnpublish(subjectscore.row)"><span v-if="subjectscore.row.pubstatus == '2'" style="color:#186ed9;">撤销</span></a>
                        <a href="javascript:;" @click="onPublish(subjectscore.row)"><span v-if="subjectscore.row.pubstatus != '2'" style="color:#186ed9;">发布</span></a>
                    </template>
                </el-table-column>
            </el-table>
            <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>
        </el-row>

        <!-- Student List Dialog -->

        <el-dialog class="medium" :title="title" v-model="studentListDlgVisible" :close-on-click-modal="false">
            <el-row v-if="curSubjectScore!=null">
                <el-col :span="24" style="center">
                    <div style="width:100%;text-align:center;margin-bottom:18px;">
                        <span style="margin-right:20px">年级：{{ curSubjectScore.grade.dictname }}</span>
                        <span>科目：{{ curSubjectScore.subject.dictname }}</span>
                    </div>
                </el-col>
            </el-row>
            <el-table :data="students" v-loading="studentLoading" height="300">
                <el-table-column label="班级" align="left" :formatter="formatClassName">
                </el-table-column>
                <el-table-column prop="stuno" label="学号" align="left">
                </el-table-column>
                <el-table-column prop="stuname" label="姓名" align="left">
                </el-table-column>
                <el-table-column label="总成绩" align="left">
                    <template slot-scope="student">
                        <span v-if="parseInt(student.row.score) != -1">{{ student.row.score }}</span>
                        <span class="sc-color-red" v-if="parseInt(student.row.score) == -1">缺考</span>
                    </template>
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="studentListDlgVisible=false">确定</el-button>
            </div>
        </el-dialog>

        <!-- Student List Dialog End -->
    </section>
</template>

<script>
    import { filter } from '../../../mixins/filter';
    import SMSUtil from '../../../common/js/util';
    import { getPubStatusList, publishExamSubjectScore, unPublishExamSubjectScore, getExamMissedStudentList, getEnteredStudentList, getUnenteredStudentList, getSimpleExamList, getExamExamTypeList, getExamYearTermList,getExamGradeList,getExamSubjectList } from '../../../api/api';

    export default {
        mixins: [ filter ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    termid: '',
                    examtypeid: '',
                    examid: '',
                    examcreatorid: '',
                    gradeid: ''
                },
                /////////// Filters Data ///////////
                terms: [],                
                examtypes: [],
                exams: [],
                grades: [],
                /////////// Filters Data End ///////

                publishes: [],
                listLoading: false,

                page: 1,
                page_size: 10,
                total: 0,

                //////////// Student List Dialog ////////////
                studentListDlgVisible: false,
                curSubjectScore: null,
                studentListScope: 0, // 0 - 缺考, 1 - 未录, 2 - 已录
                students: [],
                studentLoading: false,
                title:'',
                //////////// Student List Dialog End ////////

                isfirst: true
            }
        },
        methods: {
            formatClassName(row, col) {
                return SMSUtil.getClassName(row.classInfo, row.classid);
            },
            objectSpanMethod({ row, column, rowIndex, columnIndex }) {
                if (columnIndex == 0 || columnIndex == 3 || columnIndex == 4 || columnIndex == 5 || columnIndex == 6) {
                    let grade = this.publishes[rowIndex];
                    let sameones = this.publishes.filter(item=>item.gradeid==grade.gradeid);
                    if (sameones.length > 0 && sameones.indexOf(grade) == 0) {
                        return {
                            rowspan: sameones.length,
                            colspan: 1
                        };
                    } else {
                        return {
                            rowspan: 0,
                            colspan: 1
                        }
                    }
                }
                return {
                    rowspan: 1,
                    colspan: 1
                };
            },
            formatStatus(row, col) {
                if (row.pubstatus == '2') {
                    return '已发布';
                } else if (row.pubstatus == '1') {
                    return '已撤销';
                }
                return '未发布';
            },
            handleCurrentChange(val) {
                this.page = val;
                this.loadPublishList();
            },
            pageSizeChanged(val) {
                this.page_size = val;
            },
            loadPublishList() {
                let param = {
                    pagination:{
                        numPerPage:this.page_size,
                        pageNo:this.page,
                        calTotal:true
                    },
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                this.filters.examid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                if (this.filters.gradeid != '') {
                    param.conditions.push({
                        fieldName: 'pt.gradeid',
                        fieldValues: [
                            this.filters.gradeid
                        ],
                        operator: 'EQUAL'
                    });
                }

                this.listLoading = true;
                getPubStatusList(param).then((res)=>{
                    if (res.data.serverResult.resultCode == "200") {
                        var exams = this.exams.filter(item=>item.examid==this.filters.examid);
                        if (exams.length == 0) this.filters.examcreatorid = '';
                        else this.filters.examcreatorid = exams[0].creatorid;

                        this.publishes = res.data.pageInfo.list;
                        this.total = res.data.pageInfo.total;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.total = 0;
                        this.publishes = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.total = 0;
                    this.listLoading = false;
                    this.publishes = [];

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            onSearch() {
                this.page = 1;
                this.loadPublishList();
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
                    return;
                }

                var param = {
                    examid:this.filters.examid
                };
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list.filter(item => item != null);

                        let set = false;
                        for (var i=0; i<this.grades.length; i++) {
                            if (this.grades[i].dictvalue == this.filters.gradeid) {
                                set = true;
                                break;
                            }
                        }
                        if (!set) this.filters.gradeid = '';
                        
                        if (this.isfirst) {
                            this.loadPublishList();
                            this.isfirst = false;
                        }
                    } else {
                        this.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.grades = [];
                });
            },
            loadStudentList() {
                let param = {
                    examid: this.curSubjectScore.examid,
                    gradeid: this.curSubjectScore.gradeid,
                    subjectid: this.curSubjectScore.subjectid
                };

                if (this.studentListScope == 0) {
                    this.students = [];
                    this.title = '查看缺考情况';

                    this.studentLoading = true;
                    getExamMissedStudentList(param).then((res) => {
                        if (res.data.serverResult.resultCode == "200") {
                            this.students = res.data.pageInfo.list;
                        } else {
                            this.$message({
                                message: res.data.serverResult.resultMessage,
                                type: 'error'
                            });
                            this.students = [];
                        }
                        this.studentLoading = false;
                    }).catch((err) => {
                        console.log(err);
                        this.studentLoading = false;
                        this.students = [];

                        this.$message({
                            message: '加载失败！',
                            type: 'error'
                        });
                    });
                } else if (this.studentListScope == 1) {
                    this.students = [];
                    this.title = '未录入';

                    this.studentLoading = true;
                    getUnenteredStudentList(param).then((res) => {
                        if (res.data.serverResult.resultCode == "200") {
                            this.students = res.data.pageInfo.list;
                        } else {
                            this.$message({
                                message: res.data.serverResult.resultMessage,
                                type: 'error'
                            });
                            this.students = [];
                        }
                        this.studentLoading = false;
                    }).catch((err) => {
                        console.log(err);
                        this.studentLoading = false;
                        this.students = [];

                        this.$message({
                            message: '加载失败！',
                            type: 'error'
                        });
                    });
                } else if (this.studentListScope == 2) {
                    this.students = [];
                    this.title = '已录入';

                    this.studentLoading = true;
                    getEnteredStudentList(param).then((res) => {
                        if (res.data.serverResult.resultCode == "200") {
                            this.students = res.data.pageInfo.list;
                        } else {
                            this.$message({
                                message: res.data.serverResult.resultMessage,
                                type: 'error'
                            });
                            this.students = [];
                        }
                        this.studentLoading = false;
                    }).catch((err) => {
                        console.log(err);
                        this.studentLoading = false;
                        this.students = [];

                        this.$message({
                            message: '加载失败！',
                            type: 'error'
                        });
                    });
                }
            },
            doPublish(subjectscore, isforce) {
                let param = {
                    examid:subjectscore.examid,
                    gradeid:subjectscore.gradeid,
                    force:isforce
                };
                let _this = this;
                publishExamSubjectScore(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '发布成功！',
                            type: 'success'
                        });
                        this.loadPublishList();
                    } else if (res.data.serverResult.resultCode == "-1207") { // Default Setting
                        _this.$confirm('您还未完成系统设置，是否采用默认设置进行发布? 发布成绩成功后，将不能对系统设置进行修改，是否继续发布？', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.doPublish(subjectscore, '2');
                        }).catch(() => {
                        });
                    } else if (res.data.serverResult.resultCode == "-1204") { // UnEntered Passing
                        _this.$confirm('成绩编辑没有完善，是否继续发布？', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.doPublish(subjectscore, '1');
                        }).catch(() => {
                        });
                    } else if (res.data.serverResult.resultCode == "-1202") { // Empty Score
                        _this.$confirm('您有未录入完成的成绩，是否强制采用0分进行发布？', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.doPublish(subjectscore, '1');
                        }).catch(() => {
                        });
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '发布失败',
                        type: 'error'
                    });
                });
            },
            doUnpublish(subjectscore) {
                let param = {
                    examid:subjectscore.examid,
                    gradeid:subjectscore.gradeid
                };
                unPublishExamSubjectScore(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '撤销成功！',
                            type: 'success'
                        });
                        this.loadPublishList();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '撤销失败',
                        type: 'error'
                    });
                });
            },
            onChangeExamType() {
                this.getExams();
            },
            onChangeExam() {
                this.isfirst = true;
                this.getGrades();
            },
            onPublish(subjectscore) {
                this.doPublish(subjectscore, 0);
            },
            onUnpublish(subjectscore) {
                let _this = this;
                this.$confirm('确认撤销吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    _this.doUnpublish(subjectscore);
                }).catch(() => {
                });
            },
            onShowStudents(subjectscore, type) {
                this.curSubjectScore = subjectscore;
                this.studentListScope = type;
                this.studentListDlgVisible = true;
                this.loadStudentList();
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .el-select {
        width: 100%;
    }
</style>