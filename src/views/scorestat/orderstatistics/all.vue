<template>
    <section>
        <sms-stat-filter1 ref="filter" :termid="url.termid" :examid="url.examid" :examname="url.examname" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter1>
        <el-row class="sms-content-title" style="margin-bottom:10px;">
            <span>{{ filters.gradename }}-{{filters.examname}}-成绩统计排名</span>
        </el-row>

        <el-table :data="stats" v-loading="listLoading" max-height="420" border>
            <el-table-column prop="stuno" label="学号" align="left">
            </el-table-column>
            <el-table-column prop="stuname" label="姓名" align="left">
            </el-table-column>
            <el-table-column label="性别" align="left" :formatter="formatSex">
            </el-table-column>
            <el-table-column label="班级" align="left" :formatter="formatClassName">
            </el-table-column>
            <el-table-column v-for="(item, idx) in filters.subjects" :label="item.dictname" :key="idx" align="center">
                <el-table-column label="分数" align="left">
                    <template slot-scope="stat">
                        <span class="sc-color-red" v-if="stat.row.subjects[idx].realscore == '-1'">缺考</span>
                        <span v-else>{{ stat.row.subjects[idx].score }}</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="showmodes.showClass" label="班排名" align="left">
                    <template slot-scope="stat">
                        <span class="sc-color-red" v-if="stat.row.subjects[idx].sturankinclass == 0">&nbsp;</span>
                        <span v-else>{{ stat.row.subjects[idx].sturankinclass }}</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="showmodes.showGrade" label="级排名" align="left">
                    <template slot-scope="stat">
                        <span class="sc-color-red" v-if="stat.row.subjects[idx].sturankingrade == 0">&nbsp;</span>
                        <span v-else>{{ stat.row.subjects[idx].sturankingrade }}</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="showmodes.showLevel" label="等级" align="left">
                    <template slot-scope="stat">
                        {{ stat.row.subjects[idx].degree }}
                    </template>
                </el-table-column>
            </el-table-column>

            <el-table-column label="常规总成绩" align="center" v-if="filters.total && filters.hasNormalSubject">
                <el-table-column prop="total.score" label="分数" align="left">
                </el-table-column>
                <el-table-column v-if="showmodes.showClass" prop="total.sturankinclass" label="班排名" align="left">
                </el-table-column>
                <el-table-column v-if="showmodes.showGrade" prop="total.sturankingrade" label="级排名" align="left">
                </el-table-column>
                <el-table-column v-if="showmodes.showLevel" prop="total.degree" label="等级" align="left">
                </el-table-column>
            </el-table-column>

            <el-table-column label="总成绩" align="center" v-if="filters.total && filters.hasSpecialSubject">
                <el-table-column prop="alltotal.score" label="总分" align="left">
                </el-table-column>
                <el-table-column v-if="showmodes.showClass" prop="alltotal.sturankinclass" label="班排名" align="left">
                </el-table-column>
                <el-table-column v-if="showmodes.showGrade" prop="alltotal.sturankingrade" label="级排名" align="left">
                </el-table-column>
                <el-table-column v-if="showmodes.showLevel" prop="alltotal.degree" label="等级" align="left">
                </el-table-column>
                <el-table-column label="所选科目" align="left" width="100">
                    <template slot-scope="stat">
                        {{ stat.row.specialSubjects.map(item=>item.dictname.substring(0,1)).join('') }}
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import { iframe } from '../../../mixins/iframe';
    import SMSUtil from '../../../common/js/util';
    import { getScoreRankStat, exportScoreRankStat } from '../../../api/api';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                CLASS_TYPE: CLASS_TYPE,
                filters: {
                    examid: '',
                    gradeid: '',
                    classids: [],
                    sex: '',
                    total: true,
                    normalSubjects: [],
                    subjects: [],
                    showmodes: [],
                    examname:'',
                    gradename:'',
                    hasNormalSubject:true,
                    hasSpecialSubject:true
                },
                classes: [],
                url: {
                    termid: '',
                    examid: '',
                    examname: ''
                },
                showmodes: {
                    showClass: true,
                    showGrade: true,
                    showLevel: true,
                },
                stats: [],
                listLoading: false
            }
        },
        methods: {
            formatClassName(row, col) {
                if (row.classInfo != null && row.classInfo.name.indexOf('(') != -1)
                    row.classInfo.name = row.classInfo.name.substring(0, row.classInfo.name.indexOf('('));
                return SMSUtil.getClassName(row.classInfo);
            },
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, sex, total, normalSubjects, subjects, showmodes) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, sex, total, normalSubjects, subjects, showmodes);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, sex, total, normalSubjects, subjects, showmodes) {
                this.setFilter(examid, examname, gradeid, gradename, classids, classes, sex, total, normalSubjects, subjects, showmodes);
                this.page = 1;
                this.getStats();
            },
            onExport(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, sex, total, normalSubjects, subjects, showmodes) {
                this.doExport();
            },
            setFilter(examid, examname, gradeid, gradename, classids, classes, sex, total, normalSubjects, subjects, showmodes) {
                this.filters.examid = examid;
                this.filters.examname = examname;
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.classids = classids;
                this.classes = classes;
                this.filters.sex = sex;
                this.filters.total = total;
                this.filters.normalSubjects = normalSubjects;
                this.filters.subjects = subjects;
                this.filters.showmodes = showmodes;

                /****** confirm hasNormal&SpecialSubject *************/
                let subjectids = this.filters.subjects.map(item => item.dictvalue);

                this.filters.hasNormalSubject = false;
                this.filters.hasSpecialSubject = false;
                let normalSubjectIds = this.filters.normalSubjects.map(item => item.dictvalue);
                let normalSubjectCount = 0;
                for (var i=0; i<subjectids.length; i++) {
                    if (normalSubjectIds.filter(item=>item==subjectids[i]).length > 0) {
                        this.filters.hasNormalSubject = true;
                        normalSubjectCount += 1;
                    }
                }
                if (subjectids.length == normalSubjectCount) {
                    this.filters.hasSpecialSubject = false;
                } else {
                    this.filters.hasSpecialSubject = true;
                }
                /**********************************************************************/

                this.showmodes.showClass = false;
                this.showmodes.showGrade = false;
                this.showmodes.showLevel = false;

                for (var i=0; i<this.filters.showmodes.length; i++) {
                    if (this.filters.showmodes[i] == "0") {
                        this.showmodes.showClass = true;
                    } else if (this.filters.showmodes[i] == "1") {
                        this.showmodes.showGrade = true;
                    } else if (this.filters.showmodes[i] == "2") {
                        this.showmodes.showLevel = true;
                    }
                }
            },
            formatSex(row, col) {
                if (row.sex == '0') return '男';
                return '女';
            },
            getStats() {
                let subjectids = this.filters.subjects.map(item => item.dictvalue);

                let param = {
                    pagination:{
                        numPerPage:65536,
                        pageNo:1
                    },
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectids: subjectids
                    }
                };
                if (this.filters.classids.filter(item=>item=='').length > 0) {
                } else {
                    param.filter.classids = this.filters.classids;
                }

                if (this.filters.sex != '') {
                    param.filter.sex = this.filters.sex;
                }

                if (this.filters.total && this.filters.hasNormalSubject) {
                    param.filter.subjectids.push('TOTAL');
                }

                if (this.filters.total && this.filters.hasSpecialSubject) {
                    param.filter.subjectids.push('ALL_TOTAL');
                }

                this.listLoading = true;
                this.stats = [];
                getScoreRankStat(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.stats = this.composeStat(res.data.pageInfo.list);
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.stats = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.stats = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            composeStat(statList) {
                let result = [];

                let normalSubjectIds = this.filters.normalSubjects.map(item => item.dictvalue);
                while (statList.length > 0) {
                    let onePerson = statList[0];
                    let subjectOfPerson = statList.filter(item => item.stuid==onePerson.stuid);
                    onePerson.subjects = [];
                    onePerson.specialSubjects = [];
                    for (let i=0; i<this.filters.subjects.length; i++) {
                        let subject = this.filters.subjects[i];
                        let subjectStat = subjectOfPerson.filter(item => item.subjectid==subject.dictvalue);
                        if (subjectStat.length == 0) {
                            onePerson.subjects.push({ score:'', sturankinclass:'', sturankingrade:'', degree:'' });
                        } else {
                            if (normalSubjectIds.filter(item=>item==subject.dictvalue).length == 0) {
                                onePerson.specialSubjects.push(subject);
                            }
                            onePerson.subjects.push(subjectStat[0]);
                        }
                    }

                    let totalStat = subjectOfPerson.filter(item => item.subjectid == 'TOTAL');
                    if (totalStat.length == 0) {
                        onePerson.total = { score:'', sturankinclass:'', sturankingrade:'', degree:'' };
                    } else {
                        onePerson.total = totalStat[0];
                    }

                    let allTotalStat = subjectOfPerson.filter(item => item.subjectid == 'ALL_TOTAL');
                    if (allTotalStat.length == 0) {
                        onePerson.alltotal = { score:'', sturankinclass:'', sturankingrade:'', degree:'' };
                    } else {
                        onePerson.alltotal = allTotalStat[0];
                    }

                    statList = SMSUtil.removeArrayItems(statList, subjectOfPerson);
                    result.push(onePerson);
                }
                
                return result;
            },
            doExport() {
                let subjectids = this.filters.subjects.map(item => item.dictvalue);

                let param = {
                    pagination:{
                        numPerPage:65536,
                        pageNo:1
                    },
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectids: subjectids,
                        showmode: (this.showmodes.showLevel?4:0) + (this.showmodes.showGrade?2:0) + (this.showmodes.showClass?1:0)
                    }
                };
                if (this.filters.classids.filter(item=>item=='').length > 0) {
                } else {
                    param.filter.classids = this.filters.classids;
                }

                if (this.filters.sex != '') {
                    param.filter.sex = this.filters.sex;
                }

                if (this.filters.total && this.filters.hasNormalSubject) {
                    param.filter.subjectids.push('TOTAL');
                }

                if (this.filters.total && this.filters.hasSpecialSubject) {
                    param.filter.subjectids.push('ALL_TOTAL');
                }

                exportScoreRankStat(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        SMSUtil.download(res.data.responseEntity);
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
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
            // http://192.168.12.61:8083/stat/order/all?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectids=120000000001&total=1&subjectids=120000000001&showmodes=0,1,2
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
                this.setFilter(examid, examname, gradeid, gradename, classid, classes, sex, total, subjects, showmodes);
                this.getStats();
            }
        },
        created() {
            if (this.$router.param != null) {
                this.url.termid = this.$router.param.termid;
                this.url.examid = this.$router.param.examid;
                this.url.examname = this.$router.param.examname;
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>