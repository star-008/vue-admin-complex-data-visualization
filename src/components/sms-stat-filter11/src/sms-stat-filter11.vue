<template>
    <el-form label-width="90px" class="sms-filter-panel">
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
        <div style="width:78px;padding-right:12px;text-align:right;font-weight:bold">前成绩:</div>
        <el-row>
            <el-col :span="6">
                <el-form-item label="学期:">
                    <el-select size="small" v-model="filters.subfilter[0].termid" @change="onChangeYearTerm(0)">
                        <el-option :label="SMSUtil.getTermName(item)" :value="item.termId" v-for="(item, idx) in terms" :key="idx"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="考试类型:">
                    <el-select size="small" v-model="filters.subfilter[0].examtypeid" @change="onChangeExamType(0)">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="(item, idx) in subdata[0].examtypes" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option> 
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="考试名称:">
                    <el-select size="small" v-model="filters.subfilter[0].examidname" @change="onChangeExam(0)" class="sms-examfilter">
                        <el-option v-for="(item, idx) in subdata[0].exams" :key="idx" :label="item.examname" :value="item.examid+':'+item.examname"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <div style="width:78px;padding-right:12px;text-align:right;font-weight:bold">现成绩:</div>
        <el-row>
            <el-col :span="6">
                <el-form-item label="学期:">
                    <el-select size="small" v-model="filters.subfilter[1].termid" @change="onChangeYearTerm(1)">
                        <el-option :label="SMSUtil.getTermName(item)" :value="item.termId" v-for="(item, idx) in terms" :key="idx"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="考试类型:">
                    <el-select size="small" v-model="filters.subfilter[1].examtypeid" @change="onChangeExamType(1)">
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="(item, idx) in subdata[1].examtypes" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option> 
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="考试名称:">
                    <el-select size="small" v-model="filters.subfilter[1].examidname" @change="onChangeExam(1)" class="sms-examfilter">
                        <el-option v-for="(item, idx) in subdata[1].exams" :key="idx" :label="item.examname" :value="item.examid+':'+item.examname"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-form-item label="科目:">
                    <el-radio-group v-model="filters.subjectid" class="inline table-view">
                        <el-radio size="small" v-for="(item, idx) in intersectSubjects" :label="item.dictvalue" :key="idx">{{ item.dictname }}</el-radio>
                    </el-radio-group>
                    <el-button size="small" type="search" @click="onSearch" :disabled="!isSearchable()">查询</el-button>
                    <el-button size="small" @click="onExport" :loading="exporting" :disabled="!isSearchable()">导出</el-button>
                </el-form-item>
            </el-col>
        </el-row>
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
                    gradeidname: '',
                    classid: '',
                    subfilter: [
                        {
                            termid: '',
                            examtypeid: '',
                            examidname: '',
                            lastexamidname: ''
                        },
                        {
                            termid: '',
                            examtypeid: '',
                            examidname: '',
                            lastexamidname: ''
                        }
                    ],
                    subjectid: ''
                },
                grades: [],
                classes: [],
                normalClasses: [],
                specialClasses: [],
                terms: [],
                subdata: [
                    {
                        examtypes: [],
                        exams: [],
                        subjects: []
                    },
                    {
                        examtypes: [],
                        exams: [],
                        subjects: []
                    }
                ],

                isfirst: true,
                exporting: false
            }
        },
        computed: {
            intersectSubjects() {
                let result = [];

                for (var i=0; i<this.subdata[0].subjects.length; i++) {
                    let subject = this.subdata[0].subjects[i];
                    let sameone = this.subdata[1].subjects.filter(item=>item.dictvalue == subject.dictvalue);
                    if (sameone.length > 0) result.push(subject);
                }
                if (result.length > 0) {
                    this.filters.subjectid = result[0].dictvalue;
                } else {
                    this.filters.subjectid = '';
                }

                this.$nextTick(function() {
                    SMSUtil.adjustSubjects(result);
                });

                return result;
            }
        },
        methods: {
            isSearchable() {
                return !(this.filters.subjectid == '' || this.filters.subfilter[0].examidname == '' || this.filters.subfilter[1].examidname == '');
            },
            getGrades() {
                this.filters.gradeidname = '';
                this.grades = [];

                getExamGradeList({ pubstatus:'2' }).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list;
                        if (this.grades.length > 0) {
                            this.filters.gradeidname = this.grades[0].dictvalue + ':' + this.grades[0].dictname;
                        } else {
                            this.onChangeGrade();
                        }
                    } else {
                        this.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.grades = [];
                });
            },
            getClassList() {
                this.filters.classid = '';

                let param = {
                    pubstatus:'2'
                };
                if (this.filters.gradeidname != '') {
                    param.gradeid = this.filters.gradeidname.split(':')[0];
                }
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.classes = res.data.pageInfo.list;
                        this.normalClasses = this.classes.filter(item=>item.classtype==CLASS_TYPE.NORMAL);
                        this.specialClasses = this.classes.filter(item=>item.classtype==CLASS_TYPE.SPECIAL);
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
            getExamYearTerms() {
                this.terms = [];

                let param = {
                    pubstatus:'2'
                };
                if (this.filters.gradeidname != '') {
                    param.gradeid = this.filters.gradeidname.split(':')[0];
                }
                if (this.filters.classid == '') {
                    param.classtype = CLASS_TYPE.NORMAL;
                } else {
                    let classes = this.classes.filter(item => item.classid == this.filters.classid);
                    if (classes.length > 0) {
                        param.classtype = classes[0].classtype;
                        param.classid = classes[0].classid;
                    }
                }
                getExamYearTermList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.terms = res.data.pageInfo.list;
                        if (this.terms != null && this.terms.length > 0) {
                            let set1 = false;
                            let set2 = false;
                            for (var i=0; i<this.terms.length; i++) {
                                if (this.terms[i].termId == this.filters.subfilter[0].termid) set1 = true;
                                if (this.terms[i].termId == this.filters.subfilter[1].termid) set2 = true;
                                if (set1 && set2) break;
                            }
                            if (!set1) {
                                this.filters.subfilter[0].termid = this.terms[0].termId;
                            } else {
                                this.onChangeYearTerm(0);
                            }
                            if (!set2) {
                                this.filters.subfilter[1].termid = this.terms[0].termId;
                            } else {
                                this.onChangeYearTerm(1);
                            }
                        } else {
                            this.filters.subfilter[0].termid = '';
                            this.filters.subfilter[1].termid = '';

                            this.onChangeYearTerm(0);
                            this.onChangeYearTerm(1);
                        }
                    } else {
                        this.terms = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.terms = [];
                });
            },
            getExamTypes(index) {
                this.subdata[index].examtypes = [];

                let param = {
                    pubstatus:'2'
                };
                if (this.filters.gradeidname != '') {
                    param.gradeid = this.filters.gradeidname.split(':')[0];
                }
                if (this.filters.classid == '') {
                    param.classtype = CLASS_TYPE.NORMAL;
                } else {
                    let classes = this.classes.filter(item => item.classid == this.filters.classid);
                    if (classes.length > 0) {
                        param.classtype = classes[0].classtype;
                        param.classid = classes[0].classid;
                    }
                }
                if (this.filters.subfilter[index].termid != '') {
                    param.termid = this.filters.subfilter[index].termid;
                }
                getExamExamTypeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subdata[index].examtypes = res.data.pageInfo.list;
                        if (this.subdata[index].examtypes.length > 0) {
                            let set = false;
                            for (var i=0; i<this.subdata[index].examtypes.length; i++) {
                                if (this.subdata[index].examtypes[i].dictvalue == this.filters.subfilter[index].examtypeid) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) {
                                if (this.filters.subfilter[index].examtypeid == '') {
                                    this.onChangeExamType(index);
                                } else {
                                    this.filters.subfilter[index].examtypeid = '';
                                }
                            } else {
                                this.onChangeExamType(index);
                            }
                        } else {
                            this.filters.subfilter[index].examtypeid = '';
                            this.onChangeExamType(index);
                        }
                    } else {
                        this.subdata[index].examtypes = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subdata[index].examtypes = [];
                });
            },
            getExams(index) {
                this.subdata[index].exams = [];

                let param = {
                    gradeid: this.filters.gradeidname.split(':')[0],
                    termid: this.filters.subfilter[index].termid,
                    pubstatus:'2'
                };
                if (this.filters.subfilter[index].examtypeid != '') {
                    param.examtypeid = this.filters.subfilter[index].examtypeid;
                }
                if (this.filters.classid == '') {
                    param.classtype = CLASS_TYPE.NORMAL;
                } else {
                    param.classid = this.filters.classid;
                }
                getSimpleExamList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subdata[index].exams = res.data.pageInfo.list;
                        var set = false;
                        var examidname = '';
                        for (var i=0; i<this.subdata[index].exams.length; i++) {
                            examidname = this.subdata[index].exams[i].examid + ':' + this.subdata[index].exams[i].examname;
                            if (examidname == this.filters.subfilter[index].examidname) {
                                set = true;
                                break;
                            }
                        }
                        if (!set) {
                            if (this.subdata[index].exams.length > 0) {
                                var examidname = this.subdata[index].exams[0].examid + ':' + this.subdata[index].exams[0].examname;
                                if (examidname == this.filters.subfilter[(index + 1) % 2].examidname) {
                                    examidname = '';
                                    if (this.subdata[index].exams.length > 1) {
                                        examidname = this.subdata[index].exams[1].examid + ':' + this.subdata[index].exams[1].examname;
                                    }
                                }
                            }
                        }
                        this.filters.subfilter[index].examidname = examidname;
                        this.onChangeExam(index);

                        this.filters.subfilter[index].lastexamidname = examidname;
                    } else {
                        this.subdata[index].exams = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subdata[index].exams = [];
                });
            },
            getSubjects(index) {
                if (this.filters.subfilter[index].examidname == '') {
                    this.subdata[index].subjects = [];
                    return;
                }

                let param = {
                    pubstatus:'2',
                    examid:this.filters.subfilter[index].examidname.split(':')[0]
                };
                if (this.filters.gradeidname != '') {
                    param.gradeid = this.filters.gradeidname.split(':')[0];
                }
                if (this.filters.classid == '') {
                    param.classtype = CLASS_TYPE.NORMAL;
                } else {
                    let classes = this.classes.filter(item => item.classid == this.filters.classid);
                    if (classes.length > 0) {
                        param.classtype = classes[0].classtype;
                        param.classid = classes[0].classid;
                    }
                }
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subdata[index].subjects = res.data.pageInfo.list;
                        if (this.subdata[index].subjects == null) this.subdata[index].subjects = [];

                        if (this.isfirst) {
                            if (this.isSearchable()) {
                                this.onFirstLoad();
                                this.isfirst = false;
                            }
                        }
                    } else {
                        this.subdata[index].subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subdata[index].subjects = [];
                });
            },
            exportingDone() {
                this.exporting = false;
            },
            onChangeGrade() {
                this.getClassList();
            },
            onChangeClass() {
                this.getExamYearTerms();
            },
            onChangeYearTerm(index) {
                this.getExamTypes(index);
            },
            onChangeExamType(index) {
                this.getExams(index);
            },
            onChangeExam(index) {
                if (this.filters.subfilter[index].examidname != '') {
                    if (this.filters.subfilter[index].examidname == this.filters.subfilter[(index + 1) % 2].examidname) {
                        this.filters.subfilter[index].examidname = this.filters.subfilter[index].lastexamidname;
                        return;
                    }
                }
                this.filters.subfilter[index].lastexamidname = this.filters.subfilter[index].examidname;
                this.getSubjects(index);
            },
            onFirstLoad() {
                this.onSearch();
            },
            onSearch() {
                if (this.filters.subfilter[0].examidname == this.filters.subfilter[1].examidname) {
                    this.$message({
                        message: '不能对比同一个考试！',
                        type: 'info'
                    });
                    return;
                }
                this.onAction('search');
            },
            onExport() {
                this.exporting = true;
                this.onAction('export');
            },
            onAction(message) {
                this.$emit(message, this.filters.gradeidname.split(':')[0], this.filters.gradeidname.split(':')[1], this.filters.classid, this.classes, this.filters.subfilter[0].examidname.split(':')[0], this.filters.subfilter[0].examidname.split(':')[1], this.filters.subfilter[1].examidname.split(':')[0], this.filters.subfilter[1].examidname.split(':')[1], this.filters.subjectid);
            }
        },
        created() {
            this.getGrades();
        }
    }
</script>

<style scoped>
    .inline {
        display:inline;
    }
</style>