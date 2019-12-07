<template>
    <el-form label-width="90px" class="sms-filter-panel" style="border:0;margin-bottom:0">
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
                    <el-select size="small" v-model="filters.examidname" @change="onChangeExam" class="sms-examfilter">
                        <el-option v-for="(item, idx) in exams" :key="idx" :label="item.examname" :value="item.examid+':'+item.examname"></el-option>
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
                        <el-option-group label="行政班" v-if="normalClasses.length>0">
                            <el-option v-for="(item, idx) in normalClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                        </el-option-group>
                        <el-option-group label="教学班" v-if="specialClasses.length>0">
                            <el-option v-for="(item, idx) in specialClasses" :key="idx" :label="SMSUtil.getClassName(item)" :value="item.classid"></el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="姓名:">
                    <el-select size="small" filterable v-model="filters.studentid" class="sms-examfilter">
                        <el-option v-for="(item, idx) in students" :key="idx" :label="item.name" :value="item.userId"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-form-item label="">
                <el-col :span="18">
                    <el-button size="small" type="search" @click="onSearch" :disabled="filters.studentid==''">查询</el-button>
                </el-col>
            </el-form-item>
        </el-row>
    </el-form>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import SMSUtil from '../../../common/js/util';
    import { getSimpleExamList, getExamExamTypeList, getExamYearTermList, getExamGradeList, getExamClassList, getStudentList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid:'',
                    examidname: '',
                    examtypeid: '',
                    gradeid: '',
                    classid: '',
                    studentid: ''
                },
                terms: [],
                examtypes: [],
                exams: [],
                grades: [],
                classes: [],
                normalClasses: [],
                specialClasses: [],
                students: [],

                isfirst: true
            }
        },
        methods: {
            getExamYearTerms() {
                this.filters.termid = '';
                getExamYearTermList({ pubstatus:'2' }).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.terms = res.data.pageInfo.list;
                        if (this.terms != null && this.terms.length > 0) {
                            this.filters.termid = this.terms[0].termId;
                        }
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
                    termid:this.filters.termid,
                    pubstatus:'2'
                };
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
                                let examidname = this.exams[i].examid + ':' + this.exams[i].examname;
                                if (this.filters.examidname == examidname) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) this.filters.examidname = this.exams[0].examid + ':' + this.exams[0].examname;
                        } else {
                            this.filters.examidname = '';
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
                    examid:this.filters.examidname.split(':')[0],
                    pubstatus:'2'
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
                if (this.filters.examidname != '') {
                    param.examid = this.filters.examidname.split(':')[0];
                }
                if (this.filters.gradeid != '') {
                    param.gradeid = this.filters.gradeid;
                }
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
                                    break;
                                }
                            }
                            if (!set) {
                                if (this.normalClasses.length > 0) {
                                    this.filters.classid = this.normalClasses[0].classid;
                                } else if (this.specialClasses.length > 0) {
                                    this.filters.classid = this.specialClasses[0].classid;
                                }
                            };
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
            getStudents() {
                this.filters.studentid = '';

                let param = {
                    conditions:[]
                };
                if (this.filters.classid != '') {
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
                        if (this.students.length > 0) {
                            this.filters.studentid = this.students[0].userId;
                        }
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
            doFirstLoad() {
                this.$emit('first-load', this.filters.examidname.split(':')[0], this.filters.gradeid, this.filters.studentid);
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
            onSearch() {
                this.$emit('search', this.filters.examidname.split(':')[0], this.filters.gradeid, this.filters.studentid);
            },
            onExport() {
                this.$emit('export', this.filters.examidname.split(':')[0], this.filters.gradeid, this.filters.studentid);
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
