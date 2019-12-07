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
                <el-col :span="6">
                    <el-form-item label="班级:">
                        <el-select size="small" v-model="filters.classids" @change="onChangeClass" multiple popper-class="scm-class-dropdown">
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
                        <el-radio-group v-model="filters.subjectid" class="inline table-view">
                            <el-radio size="small" v-for="(item, idx) in subjects" :label="item.dictvalue" :key="idx">{{ item.dictname }}</el-radio>
                        </el-radio-group>
                        <div class="inlineb">
                            <el-button size="small" type="search" @click="onSearch">查询</el-button>
                            <el-button size="small" @click="onExport" :loading="exporting">导出</el-button>
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
        </div>
    </el-form>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import SMSUtil from '../../../common/js/util';
    import { getSimpleExamList, getExamExamTypeList, getExamYearTermList, getExamGradeList, getExamClassList, getExamSubjectList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid:'',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                    classids: [ '' ],
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

                allclasschecked: true,

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
                                if (this.filters.gradeid == this.grades[i].dictvalue) {
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
            getClassList() {
                let param = {
                    pubstatus:'2'
                };
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
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
                            this.filters.classids = SMSUtil.concat([ '' ], this.classes.map(item=>item.classid));
                        }
                        this.onChangeClass();

                        if (this.isfirst) {
                            this.onFirstLoad();
                            this.isfirst = false;
                        }
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
            getSubjects() {
                this.filters.subjectid = '';
                this.subjects = [];

                let param = {
                    pubstatus:'2'
                };
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                if (this.filters.gradeid != '') {
                    param.gradeid = this.filters.gradeid;
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
                        }

                        this.getClassList();
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
            onChangeClass() {
                if (this.allclasschecked && this.filters.classids.filter(item=>item=='').length == 0) {
                    this.filters.classids = [];
                    this.allclasschecked = false;
                } else if (!this.allclasschecked && this.filters.classids.filter(item=>item=='').length > 0) {
                    this.filters.classids = SMSUtil.concat([ '' ], this.classes.map(item=>item.classid));
                    this.allclasschecked = true;
                } else if (!this.allclasschecked && this.filters.classids.length == this.classes.length) {
                    this.filters.classids.splice(0, 0, '');
                } else if (this.allclasschecked && this.filters.classids.length < this.classes.length + 1) {
                    this.filters.classids.splice(0, 1);
                    this.allclasschecked = false;
                }
            },
            onFirstLoad() {
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
                this.filters.classids.sort(SMSUtil.classIdSort);

                let subjectname = '';
                let subject = this.subjects.filter(item => item.dictvalue == this.filters.subjectid);
                if (subject.length > 0) subjectname = subject[0].dictname;
                
                let examname = '';
                let exams = this.exams.filter(item => item.examid == this.filters.examid);
                if (exams.length > 0) examname = exams[0].examname;

                let gradename = '';
                let grades = this.grades.filter(item => item.dictvalue == this.filters.gradeid);
                if (grades.length > 0) gradename = grades[0].dictname;

                this.$emit(message, this.filters.termid, this.filters.examtypeid, this.filters.examid, examname, this.filters.gradeid, gradename, this.filters.classids.filter(item=>item!=''), this.classes, this.filters.subjectid, subjectname);
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