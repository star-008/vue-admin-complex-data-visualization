<template>
    <el-form label-width="90px">
        <div class="sms-filter-panel">
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
                        <el-select size="small" v-model="filters.gradeidname" @change="onChangeGrade">
                            <el-option v-for="(item, idx) in grades" :key="idx" :label="item.dictname" :value="item.dictvalue+':'+item.dictname"></el-option>
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
                <el-col :span="12">
                    <el-form-item label="性别:">
                        <el-select size="small" v-model="filters.sex" class="sms-examfilter">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="男" value="0"></el-option>
                            <el-option label="女" value="1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24" style="position: relative;">
                    <el-checkbox size="small" v-model="total" style="position:absolute;left:20px;top:9px;" @change="onChangeAllTotal"></el-checkbox>
                    <el-form-item label="科目:" class="table-view">
                        <el-checkbox size="small" label="总分" v-model="filters.total" @change="onChangeCheckedSubjects" style="float:left;" :disabled="filters.disableTotal"></el-checkbox>
                        <el-checkbox-group v-model="filters.checkedsubjects" class="inline" @change="onChangeCheckedSubjects">
                            <el-checkbox size="small" v-for="(item, idx) in subjects" :label="item" :key="idx">{{ item.dictname }}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="显示:">
                        <el-checkbox-group v-model="filters.showmodes" class="inline">
                            <el-checkbox size="small" label="0">班排名</el-checkbox>
                            <el-checkbox size="small" label="1">级排名</el-checkbox>
                            <el-checkbox size="small" label="2">等级</el-checkbox>
                        </el-checkbox-group>
                        <el-button size="small" type="search" @click="onSearch" :disabled="filters.examidname=='' || (!filters.total && filters.checkedsubjects.length === 0)" style="margin-left:25px;">查询</el-button>
                        <el-button size="small" @click="onExport" :disabled="filters.examidname=='' || (!filters.total && filters.checkedsubjects.length === 0)" :loading="exporting">导出</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </div>
    </el-form>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { CLASS_TYPE } from '../../../common/js/const';
    import { getSimpleExamList, getExamExamTypeList, getExamYearTermList, getExamGradeList, getExamClassList, getExamSubjectList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid:'',
                    examtypeid: '',
                    examidname: '',
                    gradeidname: '',
                    classids: [ '' ],
                    total: true,
                    checkedsubjects: [],
                    showmodes: [ '0', '1', '2' ],
                    sex: '',
                    disableTotal: false
                },
                url: {
                    termid: this.termid,
                    examid: this.examid,
                    examname: this.examname
                },
                terms: [],
                examtypes: [],
                exams: [],
                grades: [],
                classes: [],
                normalClasses: [],
                specialClasses: [],
                normalSubjects: [],
                subjects: [],

                allclasschecked: true,

                total: true,
                isfirst: true,
                exporting: false
            }
        },
        props: {
            termid: {
                type: String,
                required: false,
                default: ''
            },
            examid: {
                type: String,
                required: false,
                default: ''
            },
            examname: {
                type: String,
                required: false,
                default: ''
            }
        },
        methods: {
            getExamYearTerms() {
                this.filters.termid = '';
                getExamYearTermList({ pubstatus:'2' }).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.terms = res.data.pageInfo.list;
                        if (this.terms != null && this.terms.length > 0) {
                            if (this.url.termid != '') {
                                this.filters.termid = this.url.termid;
                                this.url.termid = '';
                                this.$router.param.termid = '';
                            } else {
                                this.filters.termid = this.terms[0].termId;
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
                            if (this.url.examid != '') {
                                this.filters.examidname = this.url.examid + ':' + this.url.examname;
                                this.url.examid = '';
                                this.$router.param.examid = '';
                            } else {
                                let set = false;
                                for (var i=0; i<this.exams.length; i++) {
                                    let examidname = this.exams[i].examid + ':' + this.exams[i].examname;
                                    if (this.filters.examidname == examidname) {
                                        set = true;
                                        break;
                                    }
                                }
                                if (!set) this.filters.examidname = this.exams[0].examid + ':' + this.exams[0].examname;
                            }
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
                this.filters.classids = [ '' ];

                let param = {
                    pubstatus:'2'
                };
                if (this.filters.examidname != '') {
                    param.examid = this.filters.examidname.split(':')[0];
                }
                if (this.filters.gradeidname != '') {
                    param.gradeid = this.filters.gradeidname.split(':')[0];
                }
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.classes = res.data.pageInfo.list;
                        this.normalClasses = this.classes.filter(item=>item.classtype==CLASS_TYPE.NORMAL);
                        this.specialClasses = this.classes.filter(item=>item.classtype==CLASS_TYPE.SPECIAL);
                        if (this.classes.length > 0) {
                            this.filters.classids = SMSUtil.concat([ '' ], this.classes.map(item=>item.classid));
                        } else {
                            this.onChangeClass();
                        }

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
            getSubjects(normal) {
                this.filters.checkedsubjects = [];

                let param = {
                    pubstatus:'2'
                };
                if (normal) {
                    param.classtype = CLASS_TYPE.NORMAL;
                }
                if (this.filters.examidname != '') {
                    param.examid = this.filters.examidname.split(':')[0];
                }
                if (this.filters.gradeidname != '') {
                    param.gradeid = this.filters.gradeidname.split(':')[0];
                }

                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        if (normal) {
                            this.normalSubjects = res.data.pageInfo.list;
                            this.getSubjects(false);
                        } else {
                            this.subjects = res.data.pageInfo.list;

                            let _this = this;
                            this.$nextTick(function() {
                                SMSUtil.adjustSubjects(_this.subjects);
                            });
                            
                            if (this.subjects.length > 0) {
                                this.filters.total = true;
                                this.filters.checkedsubjects = this.subjects;
                                this.onChangeCheckedSubjects();
                                this.getClassList();
                            }
                        }
                    } else {
                        this.normalSubjects = [];
                        this.subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.normalSubjects = [];
                    this.subjects = [];
                });
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
                this.getSubjects(true);
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
            onChangeAllTotal() {
                if (this.total) {
                    this.filters.total = true;
                    this.filters.checkedsubjects = this.subjects;
                } else {
                    this.filters.total = false;
                    this.filters.checkedsubjects = [];
                }
                this.onChangeCheckedSubjects();
            },
            onChangeCheckedSubjects() {
                if (this.filters.checkedsubjects.length == this.subjects.length && this.filters.total) {
                    this.total = true;
                }
                if (this.filters.checkedsubjects.length == 0 && !this.filters.total) {
                    this.total = false;
                }
                if (this.filters.checkedsubjects.length <= 1 && this.filters.total) {
                    this.filters.total = false;
                }
                if (!this.filters.total && this.filters.checkedsubjects.length < 2)
                    this.filters.disableTotal = true;
                else {
                    this.filters.disableTotal = false;
                }
            },
            exportingDone() {
                this.exporting = false;
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
                this.filters.checkedsubjects.sort(SMSUtil.subjectSort);
                this.$emit(message, this.filters.termid, this.filters.examtypeid, this.filters.examidname.split(':')[0], this.filters.examidname.split(':')[1], this.filters.gradeidname.split(':')[0], this.filters.gradeidname.split(':')[1], this.filters.classids, this.classes, this.filters.sex, this.filters.total, this.normalSubjects, this.filters.checkedsubjects, this.filters.showmodes);
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