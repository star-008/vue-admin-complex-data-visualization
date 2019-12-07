<template>
    <section>
        <sms-stat-filter6 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter6>
        <el-row style="text-align:center; font-size:15pt; margin-bottom: 20px;">
            <span>{{filters.gradename}}-{{filters.examname}}-班级单科名次段统计</span>
        </el-row>            
        <el-table :data="classdata" border style="width: 100%;" v-loading="listLoading">
            <el-table-column label="名次段" align="left" :formatter="formatStatTypeName">
            </el-table-column>
            <el-table-column :key="idx" v-for="(item, idx) in classnames" :label="item" align="left">
                <template slot-scope="data">
                    <span>{{ data.row.classes[idx].count }}</span>
                </template>
            </el-table-column>
        </el-table>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import { getRankZoneStatList, exportRankZoneStat, getExamClassList } from '../../../../api/api';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    termid: '',
                    examtypeid: '',
                    examid: '',
                    examname: '',
                    gradeid: '',
                    gradename: '',
                    classids: [],
                    classes: [],
                    subjectid: '',
                    subjectname: ''
                },

                listLoading: false,
                classnames:[],
                classdata:[]
            };
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname);
                this.load();
            },
            onExport(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname) {
                this.doExport();
            },
            setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname) {
                this.filters.termid = termid;
                this.filters.examtypeid = examtypeid;
                this.filters.examid = examid;
                this.filters.examname = examname;
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.classids = JSON.parse(JSON.stringify(classids));
                this.filters.classes = classes;
                this.filters.subjectid = subjectid;
                this.filters.subjectname = subjectname;
            },
            load() {
                this.getRankZoneList();
            },
            doExport() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter:{
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectid:this.filters.subjectid,
                        classids: this.filters.classids
                    }
                };

                exportRankZoneStat(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                      SMSUtil.download(res.data.responseEntity);
                    } else {
                      this.$message({
                        message: res.data.serverResult.resultMessage,
                        type: 'error'
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
            formatStatTypeName(row, col) {
                if (row.level != '') {
                    let highscore = '';

                    if (row.highscore == null)
                        highscore = '*';
                    else
                        highscore = row.highscore;
                    return '['+highscore+','+row.lowscore+']';
                } else {
                    if (row.statType == 'classperson') return '人数';
                    if (row.statType == 'gradetop') return '最高分';
                    if (row.statType == 'gradelast') return '最低分';
                    if (row.statType == 'gradeavg') return '平均分';
                    if (row.statType == 'gradediff') return '标准差';
                }
              return '';
            },
            getClassnames(rankzonelist) {
                this.classnames = [];
                for (var i=0; i < rankzonelist.length; i++) {
                    this.classnames.push(SMSUtil.getClassName(rankzonelist[i].classInfo));
                }
            },
            getRankZoneList() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter:{
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectid:this.filters.subjectid,
                        classids: this.filters.classids
                    }
                };

                this.classdata = [];
                this.listLoading = true;
                getRankZoneStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let rankzonelist = res.data.pageInfo.list;
                        if (rankzonelist.length > 0){
                            this.getClassnames(rankzonelist);
                            this.classdata = this.getRankZoneListByClass(rankzonelist);
                        }
                        else
                            this.classdata = [];
                    } else {
                        this.classdata = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                      message: '加载失败！',
                      type: 'error'
                    });
                    this.rankzonelist = [];
                    this.listLoading = false;
                });
            },
            getRankZoneListByClass(rankzonelist) {
                let result = [];
                let rankzones = rankzonelist[0].rankzones;

                for (var i=0; i < rankzones.length; i++) {
                    result.push({
                        lowscore:rankzones[i].lowscore,
                        highscore:rankzones[i].highscore,
                        level:rankzones[i].level,
                        classes:[]
                    });
                }
                result.push({
                    level:'',
                    statType:'classperson',
                    classes:[]
                });
                result.push({
                    level:'',
                    statType:'gradetop',
                    classes:[]
                });
                result.push({
                    level:'',
                    statType:'gradelast',
                    classes:[]
                });
                result.push({
                    level:'',
                    statType:'gradeavg',
                    classes:[]
                });
                result.push({
                    level:'',
                    statType:'gradediff',
                    classes:[]
                });

                for (var i=0; i < rankzonelist.length; i++) {
                    let rankzonelength = rankzonelist[i].rankzones.length;
                    for (var j=0; j < rankzonelength; j++){
                        result[j].classes.push({
                            classid:rankzonelist[i].classid,
                            count: rankzonelist[i].rankzones[j].count
                        });
                    }
                    result[rankzonelength].classes.push({
                        classid:rankzonelist[i].classid,
                        count:rankzonelist[i].totalcount
                    });
                    result[rankzonelength+1].classes.push({
                        classid:rankzonelist[i].classid,
                        count:rankzonelist[i].maxscore
                    });
                    result[rankzonelength+2].classes.push({
                        classid:rankzonelist[i].classid,
                        count:rankzonelist[i].minscore
                    });
                    result[rankzonelength+3].classes.push({
                        classid:rankzonelist[i].classid,
                        count:rankzonelist[i].score
                    });
                    result[rankzonelength+4].classes.push({
                        classid:rankzonelist[i].classid,
                        count:rankzonelist[i].diff
                    });
                }
                return result;
            },
            // http://192.168.12.61:8083/stat/class/subjectorderline?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectid=120000000001&subjectname=语文&total=1
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
                let param = {
                    pubstatus:'2'
                };
                if (examid != '') {
                    param.examid = examid;
                }
                if (gradeid != '') {
                    param.gradeid = gradeid;
                }
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let classes = res.data.pageInfo.list;
                        this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classid, classes, subjectid, subjectname);
                        this.load();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        created() {
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>