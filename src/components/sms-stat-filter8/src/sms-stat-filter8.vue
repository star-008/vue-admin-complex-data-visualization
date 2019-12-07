<template>
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
        </el-row>
        <el-row>
            <el-col :span="18">
                <el-button size="small" type="search" @click="onSearch" style="margin-left:25px;">查询</el-button>
                <el-button size="small" @click="onExport" >导出</el-button>
            </el-col>
        </el-row>
    </el-form>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { getSimpleExamList, getExamExamTypeList, getExamYearTermList, getExamGradeList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid:'',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                    examname:'',
                    gradename:''
                },
                terms: [],
                examtypes: [],
                exams: [],
                grades: [],

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
                this.filters.examtypeid = '';

                let params = {
                    termid: this.filters.termid,
                    pubstatus:'2'
                };
                getExamExamTypeList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examtypes = res.data.pageInfo.list;
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
                this.filters.examid = '';
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
                            this.filters.examid = this.exams[0].examid;
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
                this.filters.gradeid = '';
                this.grades = [];

                var param = {
                    examid:this.filters.examid,
                    pubstatus:'2'
                };
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list;
                        if (this.grades.length > 0) {
                            this.filters.gradeid = this.grades[0].dictvalue;
                        }
                        if (this.isfirst) {
                            this.filters.examname = this.exams[this.getIndexOfExam(this.filters.examid)].examname;
                            this.filters.gradename = this.grades[this.getIndexOfGrade(this.filters.gradeid)].dictname;
                            this.doFirstLoad();
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
            getIndexOfExam(examid) {
                for (var i=0; i<this.exams.length; i++) 
                    if (this.exams[i].examid == this.filters.examid)
                        return i;
            },
            getIndexOfGrade(gradeid) {
                for (var i=0; i<this.grades.length; i++)
                    if (this.grades[i].dictvalue == this.filters.gradeid)
                        return i;
            },
            doFirstLoad() {
                this.$emit('first-load', this.filters.termid, this.filters.examtypeid, this.filters.examid, this.filters.examname, this.filters.gradeid, this.filters.gradename);
            },
            onChangeYearTerm() {
                this.getExamTypes();
            },
            onChangeExamType() {
                this.getExams();
            },
            onChangeExam() {
                this.filters.examname = this.exams[this.getIndexOfExam(this.filters.examid)].examname;
                this.getGrades();
            },
            onChangeGrade() {
                this.filters.gradename = this.grades[this.getIndexOfGrade(this.filters.gradeid)].dictname;
            },
            onSearch() {
                this.$emit('search', this.filters.termid, this.filters.examtypeid, this.filters.examid, this.filters.examname, this.filters.gradeid, this.filters.gradename);
            },
            onExport() {
                this.$emit('export', this.filters.termid, this.filters.examtypeid, this.filters.examid, this.filters.gradeid);
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