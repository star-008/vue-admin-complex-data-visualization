<template>
    <el-form label-width="90px">
        <div class="sms-filter-panel">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="学期:">
                        <el-select size="small" v-model="filters.termid" @change="onChangeYearTerm">
                            <el-option label="全部" value=""></el-option>
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
                            <el-option label="全部" value=""></el-option>
                            <el-option v-for="(item, idx) in exams" :key="idx" :label="item.examname" :value="item.examid"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="年级:">
                        <el-select size="small" v-model="filters.gradeid" @change="onChangeGrade">
                            <el-option label="全部" value=""></el-option>
                            <el-option v-for="(item, idx) in grades" :key="idx" :label="item.dictname" :value="item.dictvalue"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="班级:">
                        <el-select size="small" v-model="filters.classid" @change="onChangeClass" popper-class="scm-class-dropdown">
                            <el-option v-for="(item, idx) in normalClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="姓名:">
                        <el-select size="small" v-model="filters.studentids" multiple @change="onChangeStudents" class="sms-examfilter">
                            <el-option label="全部" value=""></el-option>
                            <el-option v-for="(item, idx) in students" :key="idx" :label="item.name" :value="item.userId"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="18">
                    <el-form-item label="">
                        <el-button size="small" type="search" @click="onSearch" :loading="loading" :disabled="filters.studentids.length==0">查询</el-button>
                        <el-button size="small" type="primary" @click="onPrint" :loading="printing" :disabled="loading||filters.studentids.length==0">打印</el-button>
                        <el-button size="small" @click="onExport" :loading="exporting" :disabled="loading||filters.studentids.length==0">导出</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </div>
    </el-form>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import SMSUtil from '../../../common/js/util';
    import { getSimpleExamList, getExamExamTypeList, getExamYearTermList, getExamGradeList, getExamClassList, getStudentList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    termid:'',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                    classid: '',
                    studentids: [],
                    originalstudentids: []
                },
                terms: [],
                examtypes: [],
                exams: [],
                grades: [],
                classes: [],
                normalClasses: [],
                students: [],

                isfirst: true,

                loading: false,
                exporting: false,
                printing: false
            }
        },
        methods: {
            getExamYearTerms() {
                getExamYearTermList({ pubstatus:'2' }).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.terms = res.data.pageInfo.list;
                        this.onChangeYearTerm();
                    } else {
                        this.terms = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.terms = [];
                });
            },
            getExamTypes() {
                this.examtypes = [];

                let params = {
                    pubstatus:'2'
                };
                if (this.filters.termid != '') {
                    params.termid = this.filters.termid;
                }
                getExamExamTypeList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examtypes = res.data.pageInfo.list;
                        if (this.examtypes.length > 0) {
                            let set = false;
                            for (var i=0; i<this.examtypes.length; i++) {
                                if (this.examtypes[i].dictvalue == this.filters.examtypeid) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) this.filters.examtypeid = '';
                        } else {
                            this.filters.examtypeid = '';
                        }
                        this.onChangeExamType();
                    } else {
                        this.examtypes = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.examtypes = [];
                });
            },
            getExams() {
                this.exams = [];
                let param = {
                    termid: this.filters.termid,
                    pubstatus:'2'
                };
                if (this.filters.examtypeid != '') {
                    param.examtypeid = this.filters.examtypeid;
                }
                getSimpleExamList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.exams = res.data.pageInfo.list;
                        if (this.exams.length > 0) {
                            let set = false;
                            for (var i=0; i<this.exams.length; i++) {
                                if (this.exams[i].examid == this.filters.examid) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) this.filters.examid = '';
                        } else {
                            this.filters.examid = '';
                        }
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
                this.grades = [];

                var param = {
                    pubstatus:'2'
                };
                if (this.filters.termid != '') {
                    param.termid = this.filters.termid;
                }
                if (this.filters.examtypeid != '') {
                    param.examtypeid = this.filters.examtypeid;
                }
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list;
                        if (this.grades.length > 0) {
                            let set = false;
                            for (var i=0; i<this.grades.length; i++) {
                                let gradeidname = this.grades[i].dictvalue + ':' + this.grades[i].dictname;
                                if (this.filters.gradeidname == gradeidname) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) this.filters.gradeidname = this.grades[0].dictvalue + ':' + this.grades[0].dictname;
                        } else {
                            this.filters.gradeidname = '';
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
            getClassList() {
                let param = {
                    pubstatus:'2'
                };
                if (this.filters.termid != '') {
                    param.termid = this.filters.termid;
                }
                if (this.filters.examtypeid != '') {
                    param.examtypeid = this.filters.examtypeid;
                }
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                if (this.filters.gradeid != '') {
                    param.gradeid = this.filters.gradeid;
                }
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.classes = res.data.pageInfo.list;
                        this.normalClasses = this.classes.filter(item => item.classtype==CLASS_TYPE.NORMAL);
                        
                        if (this.normalClasses.length > 0) {
                            let set = false;
                            for (var i=0; i<this.normalClasses.length; i++) {
                                if (this.normalClasses[i].classid == this.filters.classid) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) {
                                this.filters.classid = this.normalClasses[0].classid;
                            }
                        } else {
                            this.filters.classid = '';
                        }
                        this.onChangeClass();
                    } else {
                        this.classes = [];
                        this.normalClasses = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.classes = [];
                    this.normalClasses = [];
                });
            },
            getStudents() {
                this.filters.originalstudentids = []; 
                this.filters.studentids = [];

                let param = {
                    conditions:[]
                };
                if (this.classes.length > 0) {
                    param.conditions.push({
                        fieldName: 'classId',
                        fieldValues: [
                            this.filters.classid
                        ],
                        operator: "EQUAL"
                    });
                }
                
                getStudentList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.students = res.data.pageInfo.list;

                        this.filters.originalstudentids = this.students.map(item=>item.userId);
                        this.filters.studentids = this.students.map(item=>item.userId);
                        if (this.isfirst) {
                            this.doFirstLoad();
                            this.isfirst = false;
                        }
                    } else {
                        this.students = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.students = [];
                });
            },
            loadingDone() {
                this.loading = false;
            },
            exportingDone() {
                this.exporting = false;
            },
            printingDone() {
                this.printing = false;
            },
            onChangeYearTerm() {
                this.getExamTypes();
            },
            onChangeExamType() {
                this.getExams();
            },
            onChangeExam() {
                this.getGrades();
            },
            onChangeGrade() {
                this.getClassList();
            },
            onChangeClass() {
                this.getStudents();
            },
            onChangeStudents() {
                if (this.filters.originalstudentids.filter(item=>item=='').length != this.filters.studentids.filter(item=>item=='').length) {
                    if (this.filters.studentids.filter(item=>item=='').length == 0) {
                        this.filters.studentids = [];
                    } else {
                        this.filters.studentids = this.students.map(item=>item.userId);
                    }
                }

                if (this.filters.studentids.length != '' && this.filters.studentids.length == this.students.length) {
                    if (this.filters.studentids.filter(item=>item=='').length == 0) {
                        this.filters.studentids.push('');
                    } else {
                        this.filters.studentids.splice(this.filters.studentids.indexOf(''), 1);
                    }
                }
                
                this.filters.originalstudentids = JSON.parse(JSON.stringify(this.filters.studentids));
            },
            doFirstLoad() {
                this.loading = true;
                this.onAction('first-load');
            },
            onSearch() {
                this.loading = true;
                this.onAction('search');
            },
            onExport() {
                this.exporting = true;
                this.onAction('export');
            },
            onPrint() {
                this.printing = true;
                this.onAction('print');
            },
            onAction(message) {
                this.$emit(message, this.filters.termid, this.filters.examtypeid, this.filters.examid, this.filters.gradeid, this.filters.classid, this.filters.studentids);
            }
        },
        created() {
            this.getExamYearTerms();
        }
    }
</script>

<style scoped>
    .inline {
        display:inline;
    }
</style>