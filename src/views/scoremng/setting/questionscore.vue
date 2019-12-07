<template>
    <section class="vscroll">
        <iframe :src="templateUrl" hidden></iframe>
        <input type="file" id="inputfile" @change="onSelectFile" hidden accept=".xls"></input>
        <el-col :span="24" class="sms-content-panel">
            <el-form label-width="100px">
                <div class="sms-filter-panel">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="学期:">
                                <el-select size="small" v-model="filters.yearterm" @change="onChangeYearTerm">
                                    <el-option :key="idx" :data="item" v-for="(item, idx) in yearterms" 
                                        :label="item.examyear + '-' + (parseInt(item.examyear) + 1) + '学年' + item.examterm.dictname" 
                                        :value="item.examyear + ':' + item.examterm.dictvalue"></el-option>
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
                        <el-col :span="6">
                            <el-form-item label="考试名称:">
                                <el-select size="small" v-model="filters.examid" @change="onChangeExam">
                                    <el-option v-for="(item, idx) in exams" :label="item.examname" :value="item.examid" :key="idx" :data="item"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="年级:">
                                <el-select size="small" v-model="filters.gradeid" @change="onChangeGrade">
                                    <el-option label="全部" value=""></el-option>
                                    <el-option v-for="(item, idx) in grades" :label="item.dictname" :value="item.dictvalue" :key="idx" :data="item"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="科目:">
                                <el-radio-group v-model="filters.subjectid">
                                    <el-radio size="small" v-for="(item, idx) in subjects" :label="item.dictvalue" :key="idx">{{ item.dictname }}</el-radio>
                                </el-radio-group>
                                <el-button size="small" type="primary" v-on:click="search" id="searchBtn" style="margin-left:10px">查询</el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>

            <el-col :span="24" class="sms-batchop-panel">
                <el-button size="small" @click="doImport">导入小题分</el-button>
                <el-button size="small" @click="doDownload">下载模板</el-button>
            </el-col>

            <el-table :data="examquestionscore" v-loading="listLoading" @selection-change="selsChange">
                <el-table-column prop="no" label="题号" align="center"></el-table-column>
                <el-table-column prop="examType" label="题类型" align="center"></el-table-column>
                <el-table-column prop="titleNo" label="小题号" align="center"></el-table-column>
                <el-table-column prop="titleType" label="小题类型" align="center"></el-table-column>
                <el-table-column prop="titleScore" label="满分值" align="center"></el-table-column>
            </el-table>
            <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>

        </el-col>
    </section>    
</template>

<script>
    import { getExamQuestionScoreList, setExamQuestionScore, getExamYearTermList, getExamExamTypeList, searchExam, getExamGradeList, getExamSubjectList } from '../../../api/api';

    export default {
        data() {
            return {
                filters: {
                    yearterm: '',
                    examyear: '',
                    examtermid: '',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                    subjectid: ''
                },
                /////////// Filters Data ///////////
                yearterms: [],                
                examtypes: [],
                exams: [],
                grades: [],
                subjects: [],
                /////////// Filters Data End ///////

                examquestionscore: [],
                listLoading: false,
                sels: [],
                editable: false,
                importFormVisible: false,
                templateUrl: '',

                /////////// Pagination ///////////
                total: 0,
                page: 1,
                page_size: 10,
                /////////// Pagination End ////////

                isfirst: true
            }
        },
        methods: {
            search() {
                this.loadExamQuestionScore();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.loadExamQuestionScore();
            },
            pageSizeChanged(val) {
                this.page_size = val;
            },
            loadExamQuestionScore() {
                let param = {
                    pagination:{
                        numPerPage:this.page_size,
                        pageNo:this.page,
                        calTotal:true
                    },
                    conditions: [
                        {
                            fieldName: 'exam.examid',
                            fieldValues: [
                                this.filters.examid
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
                if (this.filters.gradeid != '') {
                    param.conditions.push({
                        fieldName: 'gradeid',
                        fieldValues: [
                            this.filters.gradeid
                        ],
                        operator: 'EQUAL'
                    });
                }
                this.listLoading = true;
                getExamQuestionScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.total = res.data.pageInfo.total;
                        this.examquestionscore = res.data.pageInfo.list;
                    } else {
                        this.$message({
                            message: res.data.serverResult.resultMessage,
                            type: 'error'
                        });
                        this.total = 0;
                        this.examquestionscore = [];
                    }
                    this.listLoading = false;
                }).catch(() => {
                    this.total = 0;
                    this.examquestionscore = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败!',
                        type: 'error'
                    });
                });
            },
            getExamYearTerms() {
                getExamYearTermList({}).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.yearterms = res.data.pageInfo.list;
                        if (this.yearterms.length > 0) {
                            this.filters.yearterm = this.yearterms[0].examyear + ':' + this.yearterms[0].examterm.dictvalue;
                        }
                        this.onChangeYearTerm();
                    } else {
                        this.yearterms = [];
                    }
                }).catch(() => {
                    this.yearterms = [];
                });
            },
            getExamTypes() {
                this.examtypes = [];
                this.filters.examtypeid = '';
                let params = {
                    examyear:this.filters.examyear,
                    examtermid:this.filters.examtermid
                };
                getExamExamTypeList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examtypes = res.data.pageInfo.list;
                        this.onChangeExamType();
                    } else {
                        this.examtypes = [];
                    }
                }).catch(() => {
                    this.examtypes = [];
                });
            },
            getExams() {
                this.exams = [];
                this.filters.examid = '';
                let param = {
                    conditions: [
                        {
                            fieldName: 'examyear',
                            fieldValues: [
                                this.filters.examyear
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                if (this.filters.examtermid != '') {
                    param.conditions.push({
                        fieldName: 'examtermid',
                        fieldValues: [
                            this.filters.examtermid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examtypeid != '') {
                    param.conditions.push({
                        fieldName: 'examtypeid',
                        fieldValues: [
                            this.filters.examtypeid
                        ],
                        operator: 'EQUAL'
                    });
                }
                searchExam(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.exams = res.data.pageInfo.list;
                        if (this.exams.length > 0) {
                            this.filters.examid = this.exams[0].examid;
                        }
                        this.onChangeExam();
                    } else {
                        this.exams = [];
                    }
                }).catch(() => {
                    this.exams = [];
                });
            },
            getGrades() {
                this.filters.gradeid = '';
                this.grades = [];

                var param = {
                    examid:this.filters.examid
                };
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list.filter(item => {
                            if (item == null) return false;
                            return true;
                        });
                        this.onChangeGrade();
                    } else {
                        this.grades = [];
                    }
                }).catch(() => {
                    this.grades = [];
                });
            },
            getSubjects() {
                this.filters.subjectid = '';

                let param = {
                    examid:this.filters.examid,
                    gradeid:this.filters.gradeid
                };
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects = res.data.pageInfo.list.filter(item => {
                            if (item == null) return false;
                            return true;
                        });
                        if (this.subjects.length > 0) {
                            this.filters.subjectid = this.subjects[0].dictvalue;
                            if (this.isfirst) {
                                this.loadExamQuestionScore();
                                this.isfirst = false;
                            }
                        }
                    } else {
                        this.subjects = [];
                    }
                }).catch(() => {
                    this.subjects = [];
                });
            },
            onChangeYearTerm() {
                if (this.filters.yearterm == '') {
                    this.filters.examyear = '';
                    this.filters.examtermid ='';
                } else {
                    this.filters.examyear = this.filters.yearterm.split(":")[0];
                    this.filters.examtermid = this.filters.yearterm.split(":")[1];
                }
                this.getExamTypes();
            },
            onChangeExamType() {
                this.getExams();
            },
            onChangeExam() {
                this.getGrades();
            },
            onChangeGrade() {       
                this.getSubjects();
            },
            selsChange(sels) {
                this.sels = sels;
            },
            doDownload() {
                this.templateUrl = "downloadurl";                
            },
            doImport() {
                document.getElementById("inputfile").click();
            },
            onSelectFile(e) {
                var selectedFile = e.target.files[0];
                const data = new FormData();
                data.append('file', selectedFile);
                data.append('type', 1);

                this.listLoading = true;
                /*uploadResourceBatch(data).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let resources = res.data.pageInfo.list;
                        this.total = res.data.pageInfo.total;
                        for (var i=0; i<resources.length; i++) {
                            resources[i].remarks = JSON.parse(resources[i].remarks);
                        }
                        this.resources = resources;
                    } else {
                        this.$message({
                            message: res.data.serverResult.resultMessage,
                            type: 'error'
                        });
                        this.resources = [];
                        this.total = 0;
                    }
                    this.listLoading = false;
                }).catch((res) => {
                    this.listLoading = false;
                    this.resources = [];
                    this.total = 0;

                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });*/

                this.listLoading = false; 
            }
        },
        created() {
            this.getExamYearTerms();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .el-select {
        width: 100%;
    }
    .line-block {
        display:inline-block;
        margin-left:10px;
    }
</style>