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
                    <el-select size="small" v-model="filters.gradeidname" @change="onChangeGrade">
                        <el-option v-for="(item, idx) in grades" :key="idx" :label="item.dictname" :value="item.dictvalue+':'+item.dictname"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="科目:">
                    <el-radio-group v-model="filters.subjectidname" class="inline table-view">
                        <el-radio size="small" v-for="(item, idx) in subjects" :label="item.dictvalue+':'+item.dictname" :key="idx">{{ item.dictname }}</el-radio>
                    </el-radio-group>
                    <div class="inlineb">
                        <el-button size="small" type="search" @click="onSearch" :disabled="filters.subjectidname==''">查询</el-button>
                        <el-button size="small" @click="onExport" :loading="exporting">导出</el-button>
                    </div>
                </el-form-item>
            </el-col>
        </el-row>
    </el-form>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { getSimpleExamList, getExamExamTypeList, getExamYearTermList, getExamGradeList, getExamSubjectList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid:'',
                    examtypeid: '',
                    examid: '',
                    gradeidname: '',
                    subjectidname: ''
                },
                terms: [],
                examtypes: [],
                exams: [],
                grades: [],
                subjects: [],

                isfirst: true,
                exporting: false
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
                                if (this.exams[i].examid == this.filters.examid) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) this.filters.examid = this.exams[0].examid;
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
                    examid:this.filters.examid,
                    pubstatus:'2'
                };
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
            getSubjects() {
                this.subjectidname = '';

                let param = {
                    pubstatus:'2'
                };
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                if (this.filters.gradeidname != '') {
                    param.gradeid = this.filters.gradeidname.split(':')[0];
                }
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects = res.data.pageInfo.list;

                        let _this = this;
                        this.$nextTick(function() {
                            SMSUtil.adjustSubjects(_this.subjects);
                        });
                        
                        if (this.subjects.length > 0) {
                            this.filters.subjectidname = this.subjects[0].dictvalue + ':' + this.subjects[0].dictname;
                        }
                        if (this.isfirst) {
                            this.doFirstLoad();
                            this.isfirst = false;
                        }
                    } else {
                        this.subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subjects = [];
                });
            },
            exportingDone() {
                this.exporting = false;
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
                this.getSubjects();
            },
            doFirstLoad() {
                this.onAction('first-load');
            },
            onSearch() {
                this.onAction('search');
            },
            onExport() {
                this.exporting = true;
                this.onAction('export');
            },
            onAction(message) {
                this.$emit(message, this.filters.termid, this.filters.examtypeid, this.filters.examid, this.filters.gradeidname.split(':')[0], this.filters.gradeidname.split(':')[1], this.filters.subjectidname.split(':')[0], this.filters.subjectidname.split(':')[1]);
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