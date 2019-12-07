<template>
    <section class="vscroll">
       <div class="sms-setting-panel-content">
            <el-form label-width="90px">
                <div v-for="(schoolsection,idx) in schoolsections" :key="idx">
                    <el-row class="dot-line" v-for="(grade,idx) in schoolsection.grades" :key="idx">
                        <el-col :span="24">
                            <el-form-item :label="grade.dictname + '：'">
                                <el-tag :key="idx" v-for="(item, idx) in grade.subjects" closable :disable-transitions="false" @close="deleteInSubjects(grade, item)">
                                    {{ item.dictname }}
                                </el-tag>
                                <el-select size="small" class="input-new-tag" v-model="grade.inputBy" @change="onSubjectChange(grade)" v-if="grade.selectByVisible">
                                    <el-option :key="idx" v-for="(item, idx) in subjectOfGrade(grade)" :label="item.dictname" :value="item">
                                    </el-option>
                                </el-select>
                                <span class="sms-operation">
                                    <a class="sms-operation-anchor" href="javascript:;" @click="showByInput(grade)">添加</a>
                                </span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>
       </div>
    </section>
</template>

<script>
    import SMSUtil from '../../common/js/util';
    import { getSchoolSectionList, getGradeList, getSubjectList, getSysGradeSubjectList, addSysGradeSubject, deleteSysGradeSubject } from '../../api/api';

    export default {
        data() {
            return {
                schoolsections:[],
                subjects:[]
            }
        },
        methods: {
            loadSchoolSection() {
                this.subjects = [];
                getSchoolSectionList({}).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let schoolsections = res.data.pageInfo.list;
                        for (let i=0; i<schoolsections.length; i++) {
                            schoolsections[i].grades = [];
                            this.subjects.push([]);
                        }
                        this.schoolsections = schoolsections;
                        for (var i=0; i<this.schoolsections.length; i++) {
                            this.loadSubject(i);
                            this.loadGrade(i);
                        }
                    } else {
                        this.schoolsections = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.schoolsections = [];
                });
            },
            loadSubject(index) {
                let schoolsection = this.schoolsections[index];
                let params = {
                    schoolsectionid:schoolsection.dictvalue
                };
                getSubjectList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects[index] = res.data.pageInfo.list;
                    } else {
                        this.subjects[index] = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subjects[index] = [];
                });
            },
            loadGrade(index) {
                let schoolsection = this.schoolsections[index];
                let params = {
                    schoolsectionid:schoolsection.dictvalue
                };
                getGradeList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let grades = res.data.pageInfo.list;
                        for (var i=0; i<grades.length; i++) {
                            grades[i].schoolsection = schoolsection;
                            grades[i].selectByVisible = false;
                            grades[i].inputBy = null;
                        }
                        schoolsection.grades = grades;
                        this.loadDefaultSubjects(grades);
                    } else {
                        schoolsection.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    schoolsection.grades = [];
                });
            },
            subjectOfGrade(grade) {
                let index = this.schoolsections.indexOf(grade.schoolsection);
                if (index == -1) return [];
                let subjects = this.subjects[index].filter(subject => {
                    if (grade.subjects.indexOf(subject) == -1) return true;
                    return false;
                });

                return subjects;
            },
            loadDefaultSubjects(grades) {
                let params = {
                    conditions:[
                        {
                            fieldName: "gradeid",
                            fieldValues: grades.map(item=>item.dictvalue),
                            "operator": "IN"
                        }
                    ]
                };
                getSysGradeSubjectList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        for (var i=0; i<grades.length; i++) {
                            this.$set(grades[i], 'subjects', res.data.pageInfo.list.filter(item=>item.gradeid==grades[i].dictvalue).map(item=>item.subject).filter(item=>item!=null));
                        }
                    }
                }).catch((err) => {
                    console.log(err);
                });
            },
            deleteInSubjects(grade, item) {
                let params = {
                    gradeid: grade.dictvalue,
                    subjectid: item.dictvalue
                };
                deleteSysGradeSubject(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let index = grade.subjects.indexOf(item);
                        grade.subjects.splice(index, 1);

                        this.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: res.data.serverResult.resultMessage,
                            type: 'error'
                        });
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            showByInput(grade) {
                grade.selectByVisible = true;
            },
            onSubjectChange(grade) {
                let param = {
                    gradeid: grade.dictvalue,
                    subjectid: grade.inputBy.dictvalue
                };
                addSysGradeSubject(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let inputBy = grade.inputBy;
                        if (inputBy) {
                            grade.subjects.push(inputBy);
                        }
                        grade.selectByVisible = false;
                        grade.inputBy = null;

                        this.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: res.data.serverResult.resultMessage,
                            type: 'error'
                        });
                    }
                
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                })
            }
        },
        created() {
            this.loadSchoolSection();
        }
    }
</script>

<style scoped>
    .el-tag {
        background-color:#eff2f4;
        color:black;
        line-height: 30px;
        height: 30px;
        padding: 0px 10px;
        margin-right: 10px;
    }
    .input-new-tag {
        width: 70px;
        vertical-align: bottom;
    }
</style>

<style>
    .el-tag .el-icon-close {
        color:#bfcbd9;
    }
</style>
<style scoped lang="scss">
    @import '~scss_vars';

    .dot-line {
        border-bottom: 1px dashed #ccc;
    }
</style>