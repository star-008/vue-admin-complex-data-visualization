<template>
    <section>
        <el-form ref="examForm" :model="form" :rules="rule" label-width="150px" size="small">
            <el-row v-if="exam!=null">
                <el-col :span="24">
                    <el-form-item label="学期:" prop="term">
                        <span>{{ SMSUtil.getTermName(exam.term) }}</span>
                    </el-form-item>
                    <el-form-item label="考试类型:" prop="examtypeid">
                        {{ exam.examtype.dictname }}
                    </el-form-item>
                    <el-form-item label="考试名称:" prop="examname">
                        {{ exam.examname }}
                    </el-form-item>
                    <el-form-item label="考试日期:" prop="examperiod">
                        {{ exam.examstartday.split(' ')[0] }} 至 {{ exam.examendday.split(' ')[0] }}
                    </el-form-item>
                    <el-form-item label="考试学段:">
                        {{ exam.schoolsection.dictname }}
                    </el-form-item>
                    <el-form-item label="考试班级和科目:" class="is-required" prop="examsubjectlist">
                        <el-button size="small" type="default" @click="onAddGrade()">添加</el-button>
                        <el-row style="margin-top:10px">
                            <el-checkbox-group v-model="checkedGrades">
                                <el-col style="margin-top:10px" :span="24" v-for="(classsubject,idx) in classsubjects" :key="idx">
                                    <div class="title-panel">
                                        <el-checkbox size="small" :label="classsubject.gradeInfo">{{ classsubject.gradeInfo.dictname }}</el-checkbox>
                                    </div>
                                    <div class="content-panel">
                                        <el-form style="width: calc(100% - 100px); float: left;">
                                            <el-form-item class="not-required" label="常规科目:" v-if="classsubject.subjects.length>0">
                                                <span v-for="(subject,idx) in classsubject.subjects" :key="idx" style="margin-right:20px;display:inline-block;">{{ subject.dictname }}</span>
                                            </el-form-item>
                                            <el-form-item class="not-required" label="考试班级:" v-if="classsubject.normalClasses.length>0">
                                                <span v-for="(classInfo,idx) in classsubject.normalClasses" :key="idx" style="margin-right:20px;display:inline-block;">{{ SMSUtil.getClassName(classInfo) }}</span>
                                            </el-form-item>
                                            <div class="sms-subjectclass-panel" v-for="subjectClass in classsubject.subjectClasses">
                                                <el-form-item class="not-required" label="走班科目:">
                                                    <span v-if="subjectClass.subject!=null">{{ subjectClass.subject.dictname }}</span>
                                                </el-form-item>
                                                <el-form-item class="not-required" label="考试班级:">
                                                    <span v-for="(classInfo,idx) in subjectClass.classes" :key="idx" style="margin-right:20px;display:inline-block;">{{ SMSUtil.getClassName(classInfo) }}</span>
                                                </el-form-item>
                                            </div>
                                        </el-form>
                                        <div class="tool" style="width:85px;float:right">
                                            <span class="sc-main-table-title-func">
                                                <a href="javascript:;" class="sc-main-table-edit" @click="onEditGrade(classsubject.gradeInfo)"></a>
                                                <a href="javascript:;" class="sc-main-table-del" @click="onDeleteGrade(classsubject.gradeInfo)"></a>
                                            </span>
                                        </div>
                                    </div>
                                </el-col>
                            </el-checkbox-group>
                        </el-row>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24" class="sms-footer-op">
                    <el-button size="small" type="primary" @click="onSave()" :loading="addLoading">保存</el-button>
                    <el-button size="small" @click="onCancel()">取消</el-button>
                </el-col>
            </el-row>
        </el-form>

        <!-- Choose Grade Dialog -->

        <el-dialog class="small" title="选择年级" v-model="chooseGradeDlgVisible" width="30%" :close-on-click-modal="false">
            <el-form label-width="100px">
              <el-form-item label="考试年级：" style="margin-bottom:0">
                <el-col :span="24">
                  <el-select v-model="selectedGradeIdx">
                    <el-option :key="idx" v-for="(grade,idx) in grades" :label="grade.dictname" :value="idx"></el-option>
                  </el-select>
                </el-col>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" size="small" @click="doChooseGrade(grades[selectedGradeIdx])">确定</el-button>
            </div>
        </el-dialog>

        <!-- Choose Grade Dialog End -->

        <!-- Class Subject Dialog -->

        <el-dialog title="编辑考试班级和科目" v-model="classSubjectDlgVisible" :close-on-click-modal="false">
            <el-tabs v-model="classType" @tab-click="onClassTypeChange">
                <el-tab-pane label="普通" name="tab_normal">
                    <el-row style="margin-bottom:20px">
                        <el-col :span="24" style="margin-bottom:10px">考试班级</el-col>
                        <el-checkbox size="small" v-model="allNormalClasses" :label="true" @change="onAllNormalClass">全部班级</el-checkbox>
                        <el-checkbox-group v-model="checkedNormalClasses" @change="onChangeNormalClass">
                            <el-col :span="6" v-for="(classInfo,idx) in normalClasses" :key="idx">
                                <el-checkbox size="small" :label="classInfo">{{ SMSUtil.getClassName(classInfo) }}</el-checkbox>
                            </el-col>
                        </el-checkbox-group>
                    </el-row>
                    <el-row>
                        <el-col :span="24" style="margin-bottom:10px">考试科目</el-col>
                        <el-checkbox-group v-model="checkedSubjects">
                            <el-col :span="6" v-for="(subject,idx) in subjects" :key="idx">
                                <el-checkbox size="small" :label="subject">{{ subject.dictname }}</el-checkbox>
                            </el-col>
                        </el-checkbox-group>
                    </el-row>
                </el-tab-pane>
                <el-tab-pane label="走班" name="tab_special">
                    <el-row>
                        <el-col :span="24" style="margin-bottom:10px">考试科目及班级</el-col>
                        <el-col :span="24" v-loading="loadingClass">
                            <el-tree
                                ref="subjectClassTree"
                                size="small"
                                node-key="id"
                                :data="subjectClassTree"
                                :props="treeProps"
                                :default-expand-all="true"
                                :expand-on-click-node="false"
                                :show-checkbox="true"
                                :accordion="false"
                                :highlight-current="true"
                                class="tree-dialog"
                                @check-change="subjectClassChanged">
                            </el-tree>
                        </el-col>
                    </el-row>
                </el-tab-pane>
            </el-tabs>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" :disabled="!classSubjectChosen" @click.native="setClassSubject()">确定</el-button>
                <el-button size="small" @click.native="classSubjectDlgVisible=false">取消</el-button>
            </div>
        </el-dialog>

        <!-- Class Subject Dialog End -->
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../common/js/const';
    import SMSUtil from '../../common/js/util';
    import { queryDictItemList, getExamInfo, joinSearchClasses, queryTeachs, updateExam } from '../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                examid: '',
                exam:null,
                form: {
                },
                rule: {
                    examsubjectlist: [
                        { validator: this.validateClassSubject, trigger: 'blur' }
                    ]
                },
                treeProps: {
                    children:'children',
                    label:'name',
                    id:'id'
                },
                grades:[],
                classsubjects:[],

                subjects:[],
                allNormalClasses:false,
                normalClasses:[],
                subjectClasses:[],
                composedSubjectClasses: [],
                subjectClassTree:[],

                checkedNormalClasses:[],
                checkedSubjectClasses:[],

                selectedGrade:null,
                checkedGrades:[],
                chosenGrades:[],
                checkedSubjects:[],
                classType:'tab_normal',

                addLoading:false,
                loadingSubjects:false,
                loadingClass:false,
                classSubjectDlgVisible:false,

                chooseGradeDlgVisible:false,
                selectedGradeIdx:0
            }
        },
        computed: {
            classSubjectChosen() {
                return (this.checkedSubjects.length > 0 && this.checkedNormalClasses.length > 0) || this.checkedSubjectClasses.length > 0;
            }
        },
        methods: {
            validateClassSubject(rule, value, callback) {
                for (var i=0; i<this.classsubjects.length; i++) {
                    if ((this.classsubjects[i].subjects.length > 0 && this.classsubjects[i].normalClasses.length > 0) || this.classsubjects[i].subjectClasses.length > 0) {
                        callback();
                        return;
                        }
                }
                callback(new Error('请添加考试班级和科目'));
            },
            subjectClassChanged(data, checked, indeterminate) {
                this.checkedSubjectClasses = this.$refs.subjectClassTree.getCheckedNodes().filter(classInfo => classInfo.classId != null);
            },
            getNormalClasses(idx) {
                let normalClasses = this.exam.classSubjectList[idx].examClassList.map(item=>item.classInfo);
                for (var i=0; i<normalClasses.length; i++) {
                    if (normalClasses[i] == null) {
                        this.exam.classSubjectList[idx].examClassList.splice(i, 1);
                        normalClasses.splice(i, 1);
                        i -= 1;
                        continue;
                    }
                    normalClasses[i] = this.getECONormalizedClass(normalClasses[i]);
                }
                return normalClasses;
            },
            getNormalSubjects(idx) {
                return this.exam.classSubjectList[idx].examSubjectList.map(item=>item.subject);
            },
            getSpecialitySubjectClasses(idx) {
                let subjectClasses = [];
                for (let i=0; i<this.exam.classSubjectList[idx].examSpecialityClassList.length; i++) {
                    let item = this.exam.classSubjectList[idx].examSpecialityClassList[i];
                    let classes = [];
                    for (var j=0; j<item.examClassList.length; j++) {
                        classes.push(this.getECONormalizedClass(item.examClassList[j].classInfo, item.examClassList[j].classid, item.examSubject.subject));
                    }
                    subjectClasses.push({
                        subject: item.examSubject.subject,
                        classes: classes
                    });
                }
                return subjectClasses;
            },
            getECONormalizedClass(classInfo, classid, subject) {
                if (classInfo != null) {
                    classInfo.id = classInfo.classid;
                    classInfo.classId = classInfo.classid;
                    classInfo.gradeId = classInfo.gradeid;
                    classInfo.orgId = classInfo.orgid;
                    classInfo.adviserIds = classInfo.adviserids;
                    classInfo.adviserNames = classInfo.advisernames;
                    classInfo.classDescription = classInfo.description;
                    classInfo.extInfo = { BHWLLX:classInfo.bhwllx };
                    classInfo.subject = subject;
                } else {
                    return { id:classid, classId:classid, subject:subject };
                }
                return classInfo;
            },
            getExamInfo() {
                getExamInfo(this.examid).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let exam = res.data.responseEntity;
                        exam.classSubjectList.sort(SMSUtil.examGradeSort);
                        this.exam = exam;
                        this.loadGrade();
                        this.loadSubject();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            composeClassSubjects() {
                this.classsubjects = [];
                for (var i=0; i<this.exam.classSubjectList.length; i++) {
                    let classsubject = {
                        subjects: this.getNormalSubjects(i),
                        normalClasses: this.getNormalClasses(i),
                        subjectClasses: this.getSpecialitySubjectClasses(i)
                    };
                    let gradeInfo = this.grades.filter(item=>item.dictvalue==this.exam.classSubjectList[i].grade.dictvalue);
                    if (gradeInfo.length > 0) {
                        classsubject.gradeInfo = JSON.parse(JSON.stringify(gradeInfo[0]));

                        this.classsubjects.push(classsubject);
                        this.chosenGrades.push(classsubject.gradeInfo);
                        this.checkedGrades.push(classsubject.gradeInfo);
                    }
                }
            },
            loadGrade() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    schoolSection:this.exam.schoolsectionid,
                    dictTypeId:"SCHOOL_SECTION",
                    lang:"zh_CN"
                };
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                        if (this.grades.length > 0) {
                            this.selectedGradeIdx = 0;
                        }
                        this.composeClassSubjects();
                    } else {
                        this.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.grades = [];
                });
            },
            loadSubject() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    schoolSection:this.exam.schoolsectionid,
                    dictTypeId:"SUBJECT",
                    lang:"zh_CN"
                };
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item)).sort(SMSUtil.subjectSort);
                    } else {
                        this.subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subjects = [];
                });
            },
            loadNormalClass(schoolsectionid) {
                this.normalClasses = [];
                this.checkedNormalClasses = [];

                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    grade:this.selectedGrade.dictvalue,
                    orgId:SMSUtil.getUser().orgId,
                    section:schoolsectionid,
                    status:[ '1' ],
                    classType:CLASS_TYPE.NORMAL
                };
                joinSearchClasses(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.normalClasses = res.data.pageInfo.list;
                        
                        if (this.chosenGrades.indexOf(this.selectedGrade) != -1) {
                            this.checkedNormalClasses = this.getCheckedNormalClasses(this.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].normalClasses);
                        }
                        this.onChangeNormalClass();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            },
            loadSubjectClass(schoolsectionid) {
                this.subjectClassTree = [];
                this.composedSubjectClasses = [];
                this.checkedSubjectClasses = [];

                let param = {
                    pageNo:1,
                    numPerPage:1000,
                    termId: this.exam.termid,
                    classStatus: '1',
                    classType: CLASS_TYPE.SPECIAL,
                    classFlag: 0,
                    grade: this.selectedGrade.dictvalue,
                    orgId: SMSUtil.getUser().orgId
                };
                this.loadingClass = true;
                queryTeachs(param, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let teaches = res.data.pageInfo.list;
                        if (teaches.length > 0) {
                            this.subjectClassTree = [{
                                id:this.selectedGrade.dictvalue,
                                name:this.selectedGrade.dictname,
                                children:[]
                            }];

                            for (let i=0; i<teaches.length; i++) {
                                let classInfo = {
                                    id:teaches[i].classId,
                                    adviserIds: teaches[i].userId,
                                    adviserNames: teaches[i].teacherName,
                                    classDescription: null,
                                    classId: teaches[i].classId,
                                    name: teaches[i].className,
                                    orgId: teaches[i].orgId,
                                    status: '1',
                                    bhwllx: null
                                };
                                this.addClassToSubject(classInfo, teaches[i].subjectId, teaches[i].subjectName);
                            }

                            this.subjectClassTree[0].children = this.composedSubjectClasses;

                            if (this.chosenGrades.indexOf(this.selectedGrade) != -1) {
                                this.checkedSubjectClasses = this.getCheckedSubjectClasses(this.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].subjectClasses);
                            } else {
                                this.checkedSubjectClasses = [];
                            }
                        }
                    }
                    this.loadingClass = false;
                }).catch((err) => {
                    console.log(err);
                    this.loadingClass = false;
                });
            },
            addClassToSubject(classInfo, subjectId, subjectName) {
                classInfo.subject = { dictname:subjectName, dictvalue:subjectId };
                for (var i=0; i<this.composedSubjectClasses.length; i++) {
                    let composedSubjectClass = this.composedSubjectClasses[i];
                    if (composedSubjectClass.name == subjectName) {
                        composedSubjectClass.children.push(classInfo);
                        return;
                    }
                }
                this.composedSubjectClasses.push({
                    id: subjectId,
                    name: subjectName,
                    children: [ classInfo ]
                });
            },
            composeSubjectClasses(subjectClasses) {
                let subjects = this.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].subjects;
                subjectClasses = subjectClasses.filter(item=>subjects.map(item=>item.dictname).indexOf(item.subject.dictname)==-1);

                let result = [];
                for (let i=0; i<subjectClasses.length; i++) {
                    let sameones = result.filter(item => item.subject.dictvalue == subjectClasses[i].subject.dictvalue);
                    if (sameones.length == 0) {
                    result.push({
                            subject:subjectClasses[i].subject,
                            classes:[ subjectClasses[i] ]
                    });
                    } else {
                        sameones[0].classes.push(subjectClasses[i]);
                    }
                }
                return result;
            },
            setClassSubject() {
                let selectedGradeIdx = this.chosenGrades.indexOf(this.selectedGrade);
                if (selectedGradeIdx == -1) {
                    let classSubject = { subjects:[], normalClasses:[], subjectClasses:[], gradeInfo:this.selectedGrade };
                    for (var i=0; i<this.chosenGrades.length; i++) {
                        if (parseInt(this.chosenGrades[i].dictvalue) > parseInt(this.selectedGrade.dictvalue)) {
                            selectedGradeIdx = i;
                            break;
                        }
                    }
                    if (selectedGradeIdx == -1) selectedGradeIdx = this.chosenGrades.length;

                    this.classsubjects.splice(selectedGradeIdx, 0, classSubject);
                    this.chosenGrades.splice(selectedGradeIdx, 0, this.selectedGrade);
                    this.checkedGrades.splice(selectedGradeIdx, 0, this.selectedGrade);
                }

                this.checkedSubjects.sort(SMSUtil.subjectSort);
                this.checkedNormalClasses.sort(SMSUtil.classSort);
                this.classsubjects[selectedGradeIdx].subjects = this.checkedNormalClasses.length==0?[]:this.checkedSubjects;
                this.classsubjects[selectedGradeIdx].normalClasses = this.checkedSubjects.length==0?[]:this.checkedNormalClasses;
                this.classsubjects[selectedGradeIdx].subjectClasses = this.composeSubjectClasses(this.checkedSubjectClasses);
                this.classSubjectDlgVisible = false;
            },
            getCheckedSubjects(subjects) {
                let result = [];
                for (var i=0; i<this.subjects.length; i++) {
                    let some = subjects.filter(item => {
                        if (item.dictvalue == this.subjects[i].dictvalue) return true;
                    });
                    if (some.length > 0) {
                        result.push(this.subjects[i]);
                    }
                }
                return result;
            },
            getCheckedNormalClasses(classes) {
                let result = [];
                for (var i=0; i<this.normalClasses.length; i++) {
                    let some = classes.filter(item => {
                        if (item.classId == this.normalClasses[i].classId) return true;
                    });
                    if (some.length > 0) {
                        result.push(this.normalClasses[i]);
                    }
                }
                return result;
            },
            getCheckedSubjectClasses(subjectClasses) {
                let result = [];
                for (var i=0; i<subjectClasses.length; i++) {
                    result = SMSUtil.concat(result, subjectClasses[i].classes);
                }
                return result;
            },
            doChooseGrade(grade) {
                var selectedone = this.chosenGrades.filter(item=>item.dictvalue==grade.dictvalue);
                if (selectedone.length > 0) {
                    this.$message({
                        message: selectedone[0].dictname + '已经添加了。',
                        type: 'error'
                    });
                    return;
                }
                this.selectedGrade = JSON.parse(JSON.stringify(grade));
                this.chooseGradeDlgVisible = false;
                this.onClassAndSubject();
            },
            doDeleteGrade(grade) {
                var sameones = this.chosenGrades.filter(item=>item.dictvalue==grade.dictvalue);
                if (sameones.length > 0) {
                    var index = this.chosenGrades.indexOf(sameones[0]);
                    this.chosenGrades.splice(index, 1);
                    this.classsubjects.splice(index, 1);
                }

                var samechecked = this.checkedGrades.filter(item=>item.dictvalue==grade.dictvalue);
                if (samechecked.length > 0) {
                    var checkedIdx = this.checkedGrades.indexOf(samechecked[0]);
                    this.checkedGrades.splice(checkedIdx, 1);
                }
            },
            onClassTypeChange() {
                if (this.classType == 'tab_special') {
                    let checkedSubjectNames = this.checkedSubjects.map(item=>item.dictname);
                    for (var i=0; i<this.composedSubjectClasses.length; i++) {
                        if (checkedSubjectNames.indexOf(this.composedSubjectClasses[i].name) !=-1) {
                            this.$set(this.composedSubjectClasses[i], 'disabled', true);
                            for (var j=0; j<this.composedSubjectClasses[i].children.length; j++) {
                                this.$set(this.composedSubjectClasses[i].children[j], 'disabled', true);
                            }
                        } else {
                            this.$set(this.composedSubjectClasses[i], 'disabled', false);
                            for (var j=0; j<this.composedSubjectClasses[i].children.length; j++) {
                                this.$set(this.composedSubjectClasses[i].children[j], 'disabled', false);
                            }
                        }
                    }
                    let _this = this;
                    this.$nextTick(function() {
                        _this.$refs.subjectClassTree.setCheckedNodes(_this.checkedSubjectClasses);
                    });
                }
            },
            onAllNormalClass() {
                if (this.allNormalClasses) {
                    this.checkedNormalClasses = this.normalClasses;
                } else {
                    this.checkedNormalClasses = [];
                }
            },
            onChangeNormalClass() {
                if (this.checkedNormalClasses.length == this.normalClasses.length) {
                    this.allNormalClasses = true;
                } else {
                    this.allNormalClasses = false;
                }
            },
            onAddGrade() {
                this.chooseGradeDlgVisible = true;
            },
            onEditGrade(grade) {
                this.selectedGrade = grade;
                this.onClassAndSubject();
            },
            onDeleteGrade(grade) {
                let _this = this;
                _this.$confirm('确认要删除' + grade.dictname + '的班级和科目吗？', '提示', {
                    type: 'info'
                }).then(() => {
                    _this.doDeleteGrade(grade);
                }).catch(() => {
                });
            },
            onClassAndSubject() {
                this.classType = 'tab_normal';
                this.classSubjectDlgVisible = true;
                
                if (this.chosenGrades.indexOf(this.selectedGrade) != -1) {
                    this.checkedSubjects = this.getCheckedSubjects(this.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].subjects);
                } else {
                    this.checkedSubjects = [];
                }
                this.loadNormalClass(this.exam.schoolsectionid);
                this.loadSubjectClass(this.exam.schoolsectionid);
            },
            onSave() {
                this.$refs.examForm.validate((valid) => {
                    if (valid) {
                        let params = {
                            examid: this.exam.examid,
                            examname: this.exam.examname,
                            termid: this.exam.termid,
                            examtypeid: this.examexamtypeid,
                            schoolsectionid: this.exam.schoolsectionid,
                            examstartday: this.exam.examstartday,
                            examendday: this.exam.examendday,
                            schoolid: this.exam.schoolid,
                            classSubjectList: [],
                            base: {
                                gradelist: this.grades,
                                subjectlist: this.subjects
                            }
                        };
                        for (var i=0; i<this.classsubjects.length; i++) {
                            if (this.checkedGrades.filter(item=>item.dictvalue==this.classsubjects[i].gradeInfo.dictvalue).length == 0) continue;

                            let gradeSubjectClassInfo = {
                                gradeid:this.classsubjects[i].gradeInfo.dictvalue,
                                examSubjectList:[],
                                examClassList:[],
                                examSpecialityClassList:[]
                            }
                            let isActive = false;
                            if (this.classsubjects[i].subjects.length != 0 && 
                                this.classsubjects[i].normalClasses.length != 0) {
                                let examSubjectList = [];
                                let examClassList = [];
                                isActive = true;

                                for (var j=0; j<this.classsubjects[i].subjects.length; j++) {
                                    examSubjectList.push({
                                        subjectid: this.classsubjects[i].subjects[j].dictvalue
                                    });
                                }
                                for (var j=0; j<this.classsubjects[i].normalClasses.length; j++) {
                                    examClassList.push({
                                        classid: this.classsubjects[i].normalClasses[j].classId,
                                        classInfo: {
                                            id:this.classsubjects[i].normalClasses[j].classId,
                                            classid:this.classsubjects[i].normalClasses[j].classId,
                                            name:this.classsubjects[i].normalClasses[j].name,
                                            schoolsectionid:this.exam.schoolsectionid,
                                            gradeid:this.classsubjects[i].gradeInfo.dictvalue,
                                            orgid:this.classsubjects[i].normalClasses[j].orgId,
                                            adviserids:this.classsubjects[i].normalClasses[j].adviserIds,
                                            advisernames:this.classsubjects[i].normalClasses[j].adviserNames,
                                            description:this.classsubjects[i].normalClasses[j].classDescription,
                                            status:this.classsubjects[i].normalClasses[j].status,
                                            bhwllx:this.classsubjects[i].normalClasses[j].extInfo?this.classsubjects[i].normalClasses[j].extInfo.BHWLLX:null
                                        }
                                    });
                                }

                                gradeSubjectClassInfo.examSubjectList = examSubjectList;
                                gradeSubjectClassInfo.examClassList = examClassList;
                            }

                            if (this.classsubjects[i].subjectClasses.length != 0) {
                                for (var j=0; j<this.classsubjects[i].subjectClasses.length; j++) {
                                    isActive = true;
                                    let subjectInfo = {
                                        subjectid:this.classsubjects[i].subjectClasses[j].subject.dictvalue
                                    };
                                    let specialSubject = this.subjects.filter(item=>item.dictvalue==subjectInfo.subjectid);
                                    if (specialSubject.length > 0) params.base.subjectlist.push(specialSubject[0]);

                                    let classList = [];
                                    let subjectClasses = this.classsubjects[i].subjectClasses[j].classes;
                                    for (var k=0; k<subjectClasses.length; k++) {
                                        classList.push({
                                            classid: subjectClasses[k].classId,
                                            classInfo: {
                                                id:subjectClasses[k].classId,
                                                classid:subjectClasses[k].classId,
                                                name:subjectClasses[k].name,
                                                schoolsectionid:this.exam.schoolsectionid,
                                                gradeid:this.classsubjects[i].gradeInfo.dictvalue,
                                                orgid:subjectClasses[k].orgId,
                                                adviserids:subjectClasses[k].adviserIds,
                                                advisernames:subjectClasses[k].adviserNames,
                                                description:subjectClasses[k].classDescription,
                                                status:subjectClasses[k].status,
                                                bhwllx:subjectClasses[k].extInfo?subjectClasses[k].extInfo.BHWLLX:null
                                            }
                                        });
                                    }
                                    gradeSubjectClassInfo.examSpecialityClassList.push({
                                        examSubject:subjectInfo,
                                        examClassList:classList
                                    });
                                }
                            }
                            if (isActive)
                                params.classSubjectList.push(gradeSubjectClassInfo);
                        }

                        this.addLoading = true;
                        updateExam(params).then((res) => {
                            if (res.data.serverResult.resultCode == "200") {
                                this.$message({
                                    message: '编辑成功！',
                                    type: 'success'
                                });
                                localStorage.removeItem(this.exam.examid);
                                this.$router.push('/home/' + this.exam.termid);
                            } else {
                                SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                            }
                            this.addLoading = false;
                        }).catch((err) => {
                            console.log(err);
                            this.addLoading = false;
                            this.$message({
                                message: '操作失败',
                                type: 'error'
                            });
                        });
                    }
                });
            },
            onCancel() {
                this.$router.push('/home');
            }
        },
        created() {
            this.examid = this.$route.params.id;
            this.getExamInfo();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .el-input {
        max-width:416px;
    }
    .el-dialog__body {
        padding-top:0px;
    }
    .title-panel {
        width:100px;
        display:inline-block;
        float:left;
    }
    .content-panel {
        width:calc(100% - 150px);
        display:inline-block;
        background-color:#f3f6fb;
        padding:20px 20px;
        line-height: 1.5em;
    }
    .sms-subjectclass-panel {
        border-top: 1px dashed #dddddd;
        margin-top: 10px;
        padding-top: 10px;
    }
    .sms-subjectclass-panel:first-child {
        border-top: 0px;
        margin-top: 0px;
        padding-top: 0px;
    }
</style>

<style>
    .el-form-item.not-required .el-form-item__label {
        color: black;
    }
    .el-form-item.not-required .el-form-item__label:before {
        content:'' !important;
    }
</style>