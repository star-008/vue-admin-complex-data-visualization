<template>
    <section>
        <el-form ref="examForm" :model="form" :rules="rule" label-width="150px" size="small">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="学期:" class="is-required">
                        <el-select size="small" v-model="form.termidx" @change="onChangeTerm">
                            <el-option :label="SMSUtil.getTermName(item)" :value="idx" v-for="(item, idx) in terms" :key="idx"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="考试类型:" prop="examtype">
                        <el-select size="small" v-model="form.examtype" @change="onChangeExamType">
                            <el-option :label="item.dictname" :value="item.dictvalue+':'+item.dictname" v-for="(item, idx) in examTypes" :key="idx"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="考试名称:" prop="examname">
                        <el-input size="small" v-model="form.examname" auto-complete="off" :maxlength="64" @keyup.native="checkExamName"></el-input>
                    </el-form-item>
                    <el-form-item label="考试日期:" class="is-required" prop="examperiod">
                        <el-date-picker size="small" type="date" v-model="form.examstartday" @change="onChangeStartDay()" :disabled-date="isStartDisabled"></el-date-picker>
                        &nbsp;至&nbsp;
                        <el-date-picker size="small" type="date" v-model="form.examendday" :disabled-date="isEndDisabled"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="考试学段:" class="is-required">
                        <el-select size="small" v-model="form.schoolsectionididx" @change="onChangeSchoolSection()">
                            <el-option :label="item.dictname" :value="idx" v-for="(item, idx) in schoolSections" :key="idx"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="考试班级和科目:" class="is-required" prop="examsubjectlist">
                        <el-button type="default" @click="onAddGrade()">添加</el-button>
                        <el-row>
                            <el-checkbox-group v-model="checkedGrades">
                                <el-col style="margin-top:10px" :span="24" v-for="(grade,idx) in chosenGrades" :key="idx">
                                    <div class="title-panel">
                                        <el-checkbox size="small" :label="grade">{{ grade.dictname }}</el-checkbox>
                                    </div>
                                    <div class="content-panel">
                                        <el-form style="width: calc(100% - 100px); float: left;">
                                            <el-form-item class="not-required" label="常规科目:" v-if="form.classsubjects[idx].subjects.length>0">
                                                <span v-for="(subject,idx) in form.classsubjects[idx].subjects" :key="idx" style="margin-right:20px;display:inline-block;">{{ subject.dictname }}</span>
                                            </el-form-item>
                                            <el-form-item class="not-required" label="考试班级:" v-if="form.classsubjects[idx].normalClasses.length>0">
                                                <span v-for="(classInfo,idx) in form.classsubjects[idx].normalClasses" :key="idx" style="margin-right:20px;display:inline-block;">{{ SMSUtil.getClassName(classInfo) }}</span>
                                            </el-form-item>
                                            <div class="sms-subjectclass-panel" v-for="subjectClass in form.classsubjects[idx].subjectClasses">
                                                <el-form-item class="not-required" label="走班科目:">
                                                    {{ subjectClass.subject.dictname }}
                                                </el-form-item>
                                                <el-form-item class="not-required" label="考试班级:">
                                                    <span v-for="(classInfo,idx) in subjectClass.classes" :key="idx" style="margin-right:20px;display:inline-block;">{{ SMSUtil.getClassName(classInfo) }}</span>
                                                </el-form-item>
                                            </div>
                                        </el-form>
                                        <div class="tool" style="width:85px;float:right">
                                            <span class="sc-main-table-title-func">
                                                <a href="javascript:;" class="sc-main-table-edit" @click="onEditGrade(grade)"></a>
                                                <a href="javascript:;" class="sc-main-table-del" @click="onDeleteGrade(grade)"></a>
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
                    <el-button type="primary" @click="onSave()" :loading="addLoading">保存</el-button>
                    <el-button @click="onCancel()">取消</el-button>
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
              <el-button type="primary" @click="doChooseGrade(grades[selectedGradeIdx])">确定</el-button>
            </div>
        </el-dialog>

        <!-- Choose Grade Dialog End -->

        <!-- Class Subject Dialog -->

        <el-dialog title="添加考试班级和科目" v-model="classSubjectDlgVisible" :close-on-click-modal="false">
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
                <el-button type="primary" :disabled="!classSubjectChosen" @click.native="setClassSubject()">确定</el-button>
                <el-button @click.native="classSubjectDlgVisible=false">取消</el-button>
            </div>
        </el-dialog>

        <!-- Class Subject Dialog End -->
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../common/js/const';
    import SMSUtil from '../../common/js/util';
    import { queryTermList, queryDictItemList, joinSearchClasses, queryTeachs, addExam } from '../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                form:{
                    termidx:0,
                    termid:'',
                    examtype:'',
                    examname:'',
                    examstartday:'',
                    examendday:'',
                    originsectionididx:0,
                    schoolsectionididx:0,
                    classsubjects:[]
                },
                rule: {
                    examtype: [
                        { required: true, message: '请输入考试类型', trigger: 'blur' }
                    ],
                    examname: [
                        { required: true, message: '请输入考试名称', trigger: 'blur' }
                    ],
                    examperiod: [
                        { validator: this.validatePeriod, trigger: 'blur' }
                    ],
                    examsubjectlist: [
                        { validator: this.validateClassSubject, trigger: 'blur' }
                    ]
                },
                treeProps: {
                    children:'children',
                    label:'name',
                    id:'id'
                },
                examTypes:[],
                terms:[],
                schoolSections:[],
                grades:[],
                subjects:[],

                allNormalClasses:false,
                normalClasses:[],
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
            checkExamName() {
                this.form.examname = SMSUtil.examname(this.form.examname);
            },
            validatePeriod(rule, value, callback) {
                if (this.form.examstartday == '' || this.form.examstartday == null || 
                    this.form.examendday == '' || this.form.examendday == null) {
                    callback(new Error('请选择考试日期'));
                    return;
                }

                let term = this.terms[this.form.termidx];
                let termstartday = new Date(term.startDate);
                let termendday = new Date(term.endDate);
                let startday = this.form.examstartday;
                let endday = this.form.examendday;
                
                let examtype = this.form.examtype.split(':')[1];
                if (examtype == '期末考试' || examtype == '期中考试') {
                    if (startday.getTime() < termstartday.getTime() || 
                        endday.getTime() > termendday.getTime()) {
                        callback(new Error('当前学期没有包含选择的时间'));
                        return;
                    }
                }

                if ((endday - startday) > 24 * 3600 * 4 * 1000) { // 5 days
                    callback(new Error('超过了考试时间'));
                    return;
                }

                callback();
            },
            validateClassSubject(rule, value, callback) {
                if (this.checkedGrades.length > 0) {
                    callback();
                } else {
                    callback(new Error('请添加考试班级和科目'));
                }
            },
            subjectClassChanged(data, checked, indeterminate) {
                this.checkedSubjectClasses = this.$refs.subjectClassTree.getCheckedNodes().filter(classInfo=>classInfo.classId!=null);
            },
            loadTerms() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    orgId: SMSUtil.getUser().orgId
                };
                
                this.terms = [];
                queryTermList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.terms = res.data.pageInfo.list;
                        if (this.terms != null && this.terms.length > 0) {
                            this.form.termidx = 0;
                            this.onChangeTerm();
                        }
                    } else {
                        this.terms = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.terms = [];
                });
            },
            loadExamTypes() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"EVALUATIONTYP",
                    lang:"zh_CN"
                };

                this.examTypes = [];
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examTypes = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                        if (this.examTypes.length > 0) {
                            let defaultType = this.examTypes.filter(item => item.dictname == '期末考试');
                            if (defaultType.length > 0) {
                                this.form.examtype = defaultType[0].dictvalue+':'+defaultType[0].dictname;
                            } else {
                                this.form.examtype = this.examTypes[0].dictvalue+':'+this.examTypes[0].dictname;
                            }
                        }
                    } else {
                        this.examTypes = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.examTypes = [];
                });
            },
            loadSchoolSection() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"SCHOOL_SECTION",
                    lang:"zh_CN"
                };
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.schoolSections = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                        this.form.originsectionididx = 0;
                        this.form.schoolsectionididx = 0;
                        this.didChangeSchoolSection();
                    } else {
                        this.schoolSections = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.schoolSections = [];
                });
            },
            loadGrade() {
                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"SCHOOL_SECTION",
                    lang:"zh_CN"
                };
                if (this.schoolSections.length > this.form.schoolsectionididx) {
                    params.schoolSection = this.schoolSections[this.form.schoolsectionididx].dictvalue;
                }
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                        if (this.grades.length > 0) {
                            this.selectedGradeIdx = 0;
                        }
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
                    dictTypeId:"SUBJECT",
                    lang:"zh_CN"
                };
                if (this.schoolSections.length > this.form.schoolsectionididx) {
                    params.schoolSection = this.schoolSections[this.form.schoolsectionididx].dictvalue;
                }
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
                            this.checkedNormalClasses = this.getCheckedNormalClasses(this.form.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].normalClasses);
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

                let term = this.terms[this.form.termidx];
                let param = {
                    pageNo:1,
                    numPerPage:1000,
                    termId: term.termId,
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
                                this.checkedSubjectClasses = this.getCheckedSubjectClasses(this.form.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].subjectClasses);
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
                let subjects = this.form.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].subjects;
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
            setDefaultName() {
                if (this.terms.length == 0 || this.form.termidx > this.terms.length - 1) return '';
                let examtype = this.form.examtype.split(':')[1];
                let term = this.terms[this.form.termidx];
                this.form.termid = term.termId;
                this.form.examname = SMSUtil.getTermName(term) + (examtype?examtype:'');
            },
            setDefaultPeriod() {
                let term = this.terms[this.form.termidx];
                this.form.examstartday = new Date(term.startDate);
                let enddatets = Math.min(new Date(term.endDate).getTime(), this.form.examstartday.getTime() + 4 * 24 * 3600 * 1000);
                this.form.examendday = new Date();
                this.form.examendday.setTime(enddatets);
            },
            setClassSubject() {
                let selectedGradeIdx = this.chosenGrades.indexOf(this.selectedGrade);
                if (selectedGradeIdx == -1) {
                    let classSubject = { subjects:[], normalClasses:[], subjectClasses:[] };
                    for (var i=0; i<this.chosenGrades.length; i++) {
                        if (parseInt(this.chosenGrades[i].dictvalue) > parseInt(this.selectedGrade.dictvalue)) {
                            selectedGradeIdx = i;
                            break;
                        }
                    }
                    if (selectedGradeIdx == -1) selectedGradeIdx = this.chosenGrades.length;

                    this.form.classsubjects.splice(selectedGradeIdx, 0, classSubject);
                    this.chosenGrades.splice(selectedGradeIdx, 0, this.selectedGrade);
                    this.checkedGrades.splice(selectedGradeIdx, 0, this.selectedGrade);
                }

                this.checkedSubjects.sort(SMSUtil.subjectSort);
                this.checkedNormalClasses.sort(SMSUtil.classSort);
                this.form.classsubjects[selectedGradeIdx].subjects = this.checkedNormalClasses.length==0?[]:this.checkedSubjects;
                this.form.classsubjects[selectedGradeIdx].normalClasses = this.checkedSubjects.length==0?[]:this.checkedNormalClasses;
                this.form.classsubjects[selectedGradeIdx].subjectClasses = this.composeSubjectClasses(this.checkedSubjectClasses);
                this.classSubjectDlgVisible = false;
            },
            didChangeSchoolSection() {
                this.form.originsectionididx = this.form.schoolsectionididx;
                this.form.classsubjects = [];
                this.chosenGrades = [];
                this.checkedGrades = [];

                this.loadGrade();
                this.loadSubject();
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
            isStartDisabled(startday) {
                let term = this.terms[this.form.termidx];
                let examstart = new Date(term.startDate);
                let examend = new Date(term.endDate);

                if (startday.getTime() < examstart.getTime() - 24 * 3600 * 1000 || startday.getTime() > examend.getTime()) return true;
                return false;
            },
            isEndDisabled(endday) {
                if (endday - this.form.examstartday > 4 * 24 * 3600 * 1000) return true;
                if (endday - this.form.examstartday < 0) return true;
                return false;
            },
            doAddExam() {
                let term = this.terms[this.form.termidx];
                let params = {
                    examname: this.form.examname,
                    termid: term.termId,
                    examtypeid: this.form.examtype.split(':')[0],
                    schoolsectionid: this.schoolSections[this.form.schoolsectionididx].dictvalue,
                    examstartday: SMSUtil.formatDate.format(new Date(this.form.examstartday), 'yyyy-MM-dd hh:mm:ss'),
                    examendday: SMSUtil.formatDate.format(new Date(this.form.examendday), 'yyyy-MM-dd hh:mm:ss'),
                    schoolid: SMSUtil.getUser().school.orgId,
                    classSubjectList: [],
                    base: {
                        termlist: this.terms,
                        schoolsectionlist: this.schoolSections,
                        gradelist: this.chosenGrades,
                        subjectlist: this.subjects,
                        typelist: this.examTypes
                    }
                };

                for (var i=0; i<this.form.classsubjects.length; i++) {
                    if (this.checkedGrades.filter(item=>item.dictvalue==this.chosenGrades[i].dictvalue).length == 0) continue;

                    let gradeSubjectClassInfo = {
                        gradeid:this.chosenGrades[i].dictvalue,
                        examSubjectList:[],
                        examClassList:[],
                        examSpecialityClassList:[]
                    }
                    let isActive = false;
                    if (this.form.classsubjects[i].subjects.length != 0 && 
                        this.form.classsubjects[i].normalClasses.length != 0) {
                        isActive = true;
                        let examSubjectList = [];
                        for (var j=0; j<this.form.classsubjects[i].subjects.length; j++) {
                            examSubjectList.push({
                                subjectid: this.form.classsubjects[i].subjects[j].dictvalue
                            });
                        }
                        for (var j=0; j<this.form.classsubjects[i].normalClasses.length; j++) {
                            let classInfo = this.getClassInfo(this.chosenGrades[i].dictvalue, this.form.classsubjects[i].normalClasses[j]);
                            gradeSubjectClassInfo.examClassList.push(classInfo);
                        }
                        gradeSubjectClassInfo.examSubjectList = examSubjectList;
                    }

                    if (this.form.classsubjects[i].subjectClasses.length != 0) {
                        for (var j=0; j<this.form.classsubjects[i].subjectClasses.length; j++) {
                            isActive = true;
                            let subjectInfo = {
                                subjectid:this.form.classsubjects[i].subjectClasses[j].subject.dictvalue
                            };
                            let specialSubject = this.subjects.filter(item=>item.dictvalue==subjectInfo.subjectid);
                            if (specialSubject.length > 0) params.base.subjectlist.push(specialSubject[0]);

                            let classList = [];
                            let subjectClasses = this.form.classsubjects[i].subjectClasses[j].classes;
                            for (var k=0; k<subjectClasses.length; k++) {
                                let classInfo = this.getClassInfo(this.chosenGrades[i].dictvalue, subjectClasses[k]);
                                classList.push(classInfo);
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
                addExam(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '创建成功！',
                            type: 'success'
                        });
                        this.$router.push('/home/' + this.form.termid);
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
            },
            getClassInfo(gradeid, classInfo) {
                return {
                    classid: classInfo.classId,
                    classInfo: {
                        id:classInfo.classId,
                        classid:classInfo.classId,
                        name:classInfo.name,
                        schoolsectionid:this.schoolSections[this.form.schoolsectionididx].dictvalue,
                        gradeid:gradeid,
                        orgid:classInfo.orgId,
                        adviserids:classInfo.adviserIds,
                        advisernames:classInfo.adviserNames,
                        description:classInfo.classDescription,
                        status:classInfo.status,
                        bhwllx:classInfo.extInfo?classInfo.extInfo.BHWLLX:null
                    }
                }
            },
            doDeleteGrade(grade) {
                var index = this.chosenGrades.indexOf(grade);
                this.chosenGrades.splice(index, 1);
                this.form.classsubjects.splice(index, 1);

                var checkedIdx = this.checkedGrades.indexOf(grade);
                if (checkedIdx != -1) {
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
            onChangeSchoolSection() {
                if (this.form.schoolsectionididx == this.form.originsectionididx) return;

                if (this.form.classsubjects.length == 0) {
                    this.didChangeSchoolSection();
                    return;
                }

                let _this = this;
                _this.$confirm('修改考试学段。确认要删除选择的考试班级和科目吗？', '提示', {
                    type: 'info'
                }).then(() => {
                    _this.didChangeSchoolSection();
                }).catch(() => {
                    this.form.schoolsectionididx = this.form.originsectionididx;
                });
            },
            onChangeStartDay() {
                this.form.examendday = new Date();
                this.form.examendday.setTime(this.form.examstartday.getTime() + 4 * 24 * 3600 * 1000);
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
                    this.checkedSubjects = this.getCheckedSubjects(this.form.classsubjects[this.chosenGrades.indexOf(this.selectedGrade)].subjects);
                } else {
                    this.checkedSubjects = [];
                }
                this.loadNormalClass(this.schoolSections[this.form.schoolsectionididx].dictvalue);
                this.loadSubjectClass(this.schoolSections[this.form.schoolsectionididx].dictvalue);
            },
            onChangeTerm() {
                this.setDefaultName();
                this.setDefaultPeriod();
            },
            onChangeExamType() {
                this.setDefaultName();
            },
            onSave() {
                this.$refs.examForm.validate((valid) => {
                    if (valid) {
                        this.doAddExam();
                    }
                });
            },
            onCancel() {
                this.$router.push('/home');
            }
        },
        created() {
            this.loadTerms();
            this.loadExamTypes();
            this.loadSchoolSection();
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