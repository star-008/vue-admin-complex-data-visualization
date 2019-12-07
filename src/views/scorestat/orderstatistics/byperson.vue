<template>
    <section>
        <sms-stat-filter2 ref="filter" @search="onSearch" @export="onExport" @print="onPrint" @first-load="onFirstLoad"></sms-stat-filter2>
        <el-row class="sms-table-seperator" v-for="(studentexams, index) in totalscorebyexam" :key="index" v-if="studentexams.length>0">
            <el-table :data="studentexams" v-loading="listLoading" border>
                <el-table-column :label="getStudentLabel(studentexams[0])" align="center" label-class-name="sms-wrap-column sms-big-title">
                    <el-table-column label="考试名称" align="left" width="220">
                        <template slot-scope="exam">
                            {{exam.row.exam.examname}}
                        </template>
                    </el-table-column>
                    <el-table-column v-for="(item, idx) in studentexams[0].studentsubjects" :label="item.dictname" :key="idx" align="left">
                        <template slot-scope="exam">
                            <span v-if="exam.row.subjectscores[idx]!=null">
                                <span class="sc-color-red" v-if="SMSUtil.formatNumber(exam.row.subjectscores[idx].score, 2)=='-1'">缺考</span>
                                <span v-else>{{ SMSUtil.formatNumber(exam.row.subjectscores[idx].score, 2) }}</span>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="totalscore" label="总分" align="left">
                    </el-table-column>
                </el-table-column>
            </el-table>
        </el-row>
        <iframe ref="print_iframe" id="print_iframe" src="orderstatistics/byperson/print" style="display:none"></iframe>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import { iframe } from '../../../mixins/iframe';
    import SMSUtil from '../../../common/js/util';
    import { getStudentTotalScoreList, getExamSubjectList, exportPersonalExamTotalScore } from '../../../api/api';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    termid: '',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                    classid: '',
                    studentids: []
                },

                totalscorebystudent: [],
                totalscorebyexam:[],
                totalscorebyexamofpage:[],
                subjects:[],

                stats: [],
                listLoading: false,
                printing: false
            }
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, gradeid, classid, studentids) {
                this.onSearch(termid, examtypeid, examid, gradeid, classid, studentids);
            },
            onSearch(termid, examtypeid, examid, gradeid, classid, studentids) {
                this.setFilter(termid, examtypeid, examid, gradeid, classid, studentids);
                this.formatValues();
            },
            onExport(termid, examtypeid, examid, gradeid, classid, studentids) {
                this.doExport();
            },
            onPrint(termid, examtypeid, examid, gradeid, classid, studentids) {
                this.printing = true;
                this.doPrint();
            },
            setFilter(termid, examtypeid, examid, gradeid, classid, studentids) {
                this.filters.termid = termid;
                this.filters.examtypeid = examtypeid;
                this.filters.examid = examid;
                this.filters.gradeid = gradeid;
                this.filters.classid = classid;
                this.filters.studentids = studentids;
            },
            doPrint() {
                localStorage.setItem('sms-stat-orderbyperson', JSON.stringify(this.totalscorebyexam));
                this.$refs.print_iframe.contentWindow.location.reload();
            },
            formatValues() {
                this.getSubjects();
            },
            getStudentLabel(studentexam) {
                if (studentexam.stuno != '' && studentexam.stuno != null)
                    return studentexam.stuname + '  (' + studentexam.stuno + ')  个人成绩册';
                return studentexam.stuname + '  个人成绩册';
            },
            getSubjects() {
                let param = {
                    pubstatus: '2'
                };
                if (this.filters.gradeid != '') {
                    param.gradeid = this.filters.gradeid;
                }
                if (this.filters.termid != '') {
                    param.termid = this.filters.termid;
                }
                if (this.filters.examid != '') {
                    param.examid = this.filters.examid;
                }
                getExamSubjectList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.subjects = res.data.pageInfo.list;
                        this.gettotalscorelist();
                    } else {
                        this.subjects = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.subjects = [];
                });
            },
            gettotalscorelist() {
                this.getstudenttotalscorelistby();
            },
            getstudenttotalscorelistby() {
                let param = {
                    pagination:{
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    conditions: [
                        {
                            fieldName: 'eg.pubstatus',
                            fieldValues: [
                                '2',
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                if (this.filters.termid != '') {
                    param.conditions.push({
                        fieldName: 'termid',
                        fieldValues: [
                            this.filters.termid,
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examtypeid != '') {
                    param.conditions.push({
                        fieldName: 'examtypeid',
                        fieldValues: [
                            this.filters.examtypeid,
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examid != '') {
                    param.conditions.push({
                        fieldName: 'pt.examid',
                        fieldValues: [
                            this.filters.examid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.studentids.length > 0 ) {
                    param.conditions.push({
                        fieldName: 'stuid',
                        fieldValues: this.filters.studentids,
                        operator: 'IN'
                    });
                }

                this.listLoading = true;
                this.totalscorebystudent = [];
                getStudentTotalScoreList(param).then((res) => {
                   if (res.data.serverResult.resultCode == "200") {
                        let totalscorelist = res.data.pageInfo.list;
                        this.gettotalscorebystudent(totalscorelist);
                        this.gettotalscorebysubject();
                    } else {
                       this.$message({
                           message: res.data.serverResult.resultMessage,
                           type:'error'
                       });
                       this.totalscorebystudent = [];
                    }
                    this.listLoading = false;
                    this.$refs.filter.loadingDone();
                }).catch((err) => {
                    console.log(err);
                    this.totalscorebystudent = [];
                    this.listLoading = false;
                    this.$refs.filter.loadingDone();
                });
            },
            gettotalscorebystudent(totalscorelist) {
                let templist = JSON.parse(JSON.stringify(totalscorelist));
                while (templist.length > 0) {
                    let onestudent = templist[0];
                    let samestudent = templist.filter(item => item.stuid==onestudent.stuid);
                    this.totalscorebystudent.push(samestudent);
                    templist = SMSUtil.removeArrayItems(templist, samestudent);
                }
            },
            gettotalscorebysubject() {
                this.totalscorebyexam = [];

                for (var i=0; i<this.totalscorebystudent.length; i++) {
                    let temptotalscorebyexam = this.gettotalscorebyexam(this.totalscorebystudent[i]);
                    if (temptotalscorebyexam.length > 0) {
                        this.totalscorebyexam.push(temptotalscorebyexam);
                    }
                }
            },
            gettotalscorebyexam(subjectscoresforstudent) {
                let templist = JSON.parse(JSON.stringify(subjectscoresforstudent));
                let result = [];
                let allsubjectids = [];

                while(templist.length > 0) {
                    let oneexam = JSON.parse(JSON.stringify(templist[0]));
                    
                    oneexam.subjectscores = [];
                    oneexam.totalscore = 0;
                    for (var i=0; i<allsubjectids.length; i++) {
                        oneexam.subjectscores.push({
                            subjectid:'',
                            subject:{},
                            score:''
                        });
                    }

                    let sameexam = templist.filter(item => item.examid == oneexam.examid);
                    for (var i=0; i<sameexam.length; i++) {
                        let index = allsubjectids.indexOf(sameexam[i].subjectid);
                        if (index == -1) {
                            allsubjectids.push(sameexam[i].subjectid);

                            oneexam.subjectscores.push({
                                subjectid:sameexam[i].subjectid,
                                subject:JSON.parse(JSON.stringify(sameexam[i].subject)),
                                score:sameexam[i].score
                            });

                            for (var j=0; j<result.length; j++) {
                                result[j].subjectscores.push({
                                    subjectid:sameexam[i].subjectid,
                                    subject:JSON.parse(JSON.stringify(sameexam[i].subject)),
                                    score:''
                                });
                            }
                        } else {
                            oneexam.subjectscores[index].subjectid = sameexam[i].subjectid;
                            oneexam.subjectscores[index].subject = sameexam[i].subject;
                            oneexam.subjectscores[index].score = sameexam[i].score;
                        }

                        if (sameexam[i].score != null && sameexam[i].score != '' && parseInt(sameexam[i].score) != -1) {
                            oneexam.totalscore += parseInt(sameexam[i].score);
                        }
                    }
                    templist = SMSUtil.removeArrayItems(templist, sameexam);

                    result.push(oneexam);
                }

                if (result.length > 0) {
                    for (var i=0; i<this.subjects.length; i++) {
                        let index = allsubjectids.indexOf(this.subjects[i].dictvalue);
                        if (index != -1) {
                            allsubjectids[index] = this.subjects[i];
                        }
                    }
                    result[0].studentsubjects = allsubjectids;
                }
                return result;
            },
            doExport() {
                let param = {
                    pagination:{
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    conditions: [
                        {
                            fieldName: 'eg.pubstatus',
                            fieldValues: [
                                '2',
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                if (this.filters.termid != '') {
                    param.conditions.push({
                        fieldName: 'termid',
                        fieldValues: [
                            this.filters.termid,
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examtypeid != '') {
                    param.conditions.push({
                        fieldName: 'examtypeid',
                        fieldValues: [
                            this.filters.examtypeid,
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examid != '') {
                    param.conditions.push({
                        fieldName: 'pt.examid',
                        fieldValues: [
                            this.filters.examid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.studentids.length > 0 ) {
                    param.conditions.push({
                        fieldName: 'stuid',
                        fieldValues: this.filters.studentids,
                        operator: 'IN'
                    });
                }
                
                exportPersonalExamTotalScore(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        SMSUtil.download(res.data.responseEntity);
                    } else {
                       this.$message({
                           message: res.data.serverResult.resultMessage,
                           type:'error'
                       });
                    }
                    this.$refs.filter.exportingDone();
                }).catch((err) => {
                    console.log(err);
                    this.$refs.filter.exportingDone();

                    this.$message({
                        message: '导出失败！',
                        type: 'error'
                    });
                });
            },
            // http://192.168.12.61:8083/stat/order/personal?iframe=1&classid=CJTWBS115031&studentids=CJTWBS13194439bba
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentids, sex, total, subjectid, subjectname, subjects, showmodes, showmode) {
                this.setFilter(termid, examtypeid, examid, gradeid, classid, studentids);
                this.formatValues();
            }
        },
        mounted() {
            let _this = this;
            $('#print_iframe').on('load', function() {
                if (_this.printing) {
                    _this.printing = false;
                    _this.$refs.filter.printingDone();
                    _this.$refs.print_iframe.contentWindow.print();
                }
            });
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>