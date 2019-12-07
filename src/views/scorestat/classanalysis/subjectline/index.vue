<template>
    <section>
        <sms-stat-filter5 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter5>
        <el-row class="sms-content-title">
            <span>{{filters.gradename}}-{{filters.examname}}--{{filters.subjectname}}分数段分析</span>
        </el-row>
        <el-row>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="selectedclassid" @change="onClassChange" style="width:120px" v-if="displaytype == 1">
                    <el-option v-for="(item, idx) in filters.classes" :label="SMSUtil.getClassName(item)" :value="item.classid" :key="idx"></el-option>
                </el-select>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:right;">
                <el-radio-group v-model="displaytype" size="small">
                    <el-radio-button label="0">表</el-radio-button>
                    <el-radio-button label="1">图</el-radio-button>
                </el-radio-group>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="simpleclassdata" border style="width: 100%;" v-loading="listLoading" v-show="filters.showmode == 0 && displaytype == 0">
                <el-table-column label="分数段" align="left" :formatter="formatStatTypeName" min-width="100">
                </el-table-column>
                <el-table-column :key="idx" v-for="(item, idx) in classnames" :label="item" align="center">
                    <el-table-column label="本段" align="left">
                        <template slot-scope="data">
                            <span>{{ data.row.classes[idx].count }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="累计" align="left">
                        <template slot-scope="data">
                            <span>{{ data.row.classes[idx].accumcount }}</span>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>
            <el-table :data="standardclassdata" border style="width: 100%;" v-loading="listLoading" v-show="filters.showmode == 1 && displaytype == 0" :span-method="objectSpanMethod">
                <el-table-column label="分数段" align="left" :formatter="formatStatTypeName" prop="score" min-width="100">
                </el-table-column>
                <el-table-column prop="rank" label="名次" align="left">
                </el-table-column>
                <el-table-column :key="idx" v-for="(item, idx) in standardclassnames" :label="SMSUtil.getClassName(item)" align="center">
                    <el-table-column label="本段" align="left">
                        <template slot-scope="data">
                            <span>{{ data.row.classes[idx].count }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="名称" align="left" width="200">
                        <template slot-scope="data">
                            <span>{{ data.row.classes[idx].name }}</span>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column prop="count" label="小计" align="left">
                </el-table-column>
                <el-table-column prop="accumcount" label="累计" align="left">
                </el-table-column>
            </el-table>
        </el-row>
        <el-row v-show="displaytype == 1">
            <div id="classChart" class="sms-chart-panel" v-loading="chartLoading"></div> 
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import echarts from 'echarts';
    import { getScoreZoneStatList, exportScoreZoneStat, getExamClassList } from '../../../../api/api';

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
                    subjectname: '',
                    showmode: 0
                },
                displaytype: 0,
                listLoading: false,
                simpleclassdata: [],
                standardclassdata: [],
                standardclassnames: [],
                classnames: [],
                allclassdata: [],

                selectedclassid: '',
                chartLoading: false,
                classChart: null,
                chartxAxisdata: [],
                chartseriesdata: []
            };
        },
        methods: {
            objectSpanMethod({row, column, rowIndex, columnIndex}) {
                var standardclassdata = this.standardclassdata[rowIndex];
                let columnCount = this.standardclassnames.length * 2 + 4;
                if ((rowIndex < this.standardclassdata.length - 5) && (columnIndex % 2 == 0 || columnIndex == columnCount - 1)) {
                    let sameones = this.standardclassdata.filter(item=>item.highscore==standardclassdata.highscore && item.lowscore==standardclassdata.lowscore);
                    if (sameones.length > 0 && sameones.indexOf(standardclassdata) == 0) {
                        return {
                            rowspan: sameones.length,
                            colspan: 1
                        };
                    } else {
                        return {
                            rowspan: 0,
                            colspan: 1
                        }
                    }
                }
                return {
                    rowspan: 1,
                    colspan: 1
                };
            },
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname, showmode) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname, showmode);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname, showmode) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname, showmode);
                this.load();
            },
            onExport(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname, showmode) {
                this.doExport();
            },
            setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, subjectid, subjectname, showmode) {
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
                this.filters.showmode = showmode;
            },
            load() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter:{
                        examid:this.filters.examid,
                        gradeid:this.filters.gradeid,
                        subjectid:this.filters.subjectid,
                        classids: this.filters.classids
                    }
                };

                if (this.filters.classids.indexOf('TOTAL') == -1) {
                    param.filter.classids.push('TOTAL');
                }

                this.simpleclassdata = [];
                this.standardclassdata = [];
                this.listLoading = true;
                getScoreZoneStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let scorezonelist = res.data.pageInfo.list;

                        if (scorezonelist.length > 0) {
                            this.allclassdata = scorezonelist;
                            this.selectedclassid = this.filters.classids[0];

                            if (this.filters.showmode == 0) {
                                this.getClassnames(scorezonelist);
                                this.simpleclassdata = this.getScoreZoneListByClass(scorezonelist);
                            } else {
                                this.getStandardClassnames(scorezonelist);
                                this.standardclassdata = this.getStandardScoreZoneList(scorezonelist);
                            }
                            this.getChartScoreZoneList();
                        } else {
                            this.simpleclassdata = [];
                            this.allclassdata = [];
                        }
                    } else {
                        this.simpleclassdata = [];
                        this.allclassdata = [];
                        
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                      message: '加载失败！',
                      type: 'error'
                    });
                    this.simpleclassdata = [];
                    this.listLoading = false;
                });
            },
            doExport() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter:{
                        examid:this.filters.examid,
                        gradeid:this.filters.gradeid,
                        subjectid:this.filters.subjectid,
                        issimplemode:this.filters.showmode==0
                    }
                };

                param.filter.classids = SMSUtil.concat(this.filters.classids, [ 'TOTAL' ]);

                exportScoreZoneStat(param).then((res) => {
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
            formatStatTypeName(row, col) {
                if (row.statType == '') {
                    return row.highscore+' - ' +row.lowscore;
                } else {
                    if (row.statType == 'classperson') return '人数';
                    if (row.statType == 'gradetop') return '最高分';
                    if (row.statType == 'gradelast') return '最低分';
                    if (row.statType == 'gradeavg') return '平均分';
                    if (row.statType == 'gradediff') return '标准差';
                }
                return '';
            },
            getClassnames(scorezonelist) {
                this.classnames = [];
                for (var i=0; i < scorezonelist.length; i++) {
                    if (scorezonelist[i].classid == 'TOTAL')
                        this.classnames.push('全体');
                    else
                        this.classnames.push(SMSUtil.getClassName(scorezonelist[i].classInfo));
                }
            },
            getStandardClassnames(scorezonelist) {
                this.standardclassnames = [];
                for (var i=0; i < scorezonelist.length; i++) {
                    if (scorezonelist[i].classid != 'TOTAL')
                        this.standardclassnames.push(scorezonelist[i].classInfo);
                }
            },
            getStandardScoreZoneList(standardscorezonelist) {
                let result = [];
                let totalScoreZone = standardscorezonelist.filter(item => item.classid == 'TOTAL')[0].scorezone;
                let scorezonelength = standardscorezonelist[0].scorezone.length;
                let scorezoneperson =  [];
                let onescorezonelist = [];

                ///////////////////// set field
                let scorezoneclasses = [];
                for (var k=0; k<standardscorezonelist.length; k++)
                    scorezoneclasses.push({
                        classid:standardscorezonelist[k].classid,
                        count:'0',
                        name:''
                    });

                for (var i=0; i<totalScoreZone.length; i++) {
                    onescorezonelist = [];
                    for (var j=0; j<totalScoreZone[i].studentInfo.length; j++) {
                        for (var k=0; k<standardscorezonelist.length; k++) {
                            scorezoneclasses[k].name = '';
                            scorezoneclasses[k].count = '0';
                        }

                        for (var k=0; k<standardscorezonelist.length; k++) {
                            if (totalScoreZone[i].studentInfo[j].classId == scorezoneclasses[k].classid)
                                scorezoneclasses[k].name = totalScoreZone[i].studentInfo[j].studentName + ':' + totalScoreZone[i].studentInfo[j].rankInClass;
                            scorezoneclasses[k].count = standardscorezonelist[k].scorezone[i].count;
                        }

                        onescorezonelist.push({
                            highscore:totalScoreZone[i].highscore,
                            lowscore:totalScoreZone[i].lowscore,
                            rank:totalScoreZone[i].studentInfo[j].rankInGrade,
                            count:totalScoreZone[i].count,
                            accumcount:totalScoreZone[i].accumcount,
                            statType:'',
                            classes:JSON.parse(JSON.stringify(scorezoneclasses))
                        });
                    }
                    result = SMSUtil.concat(result, onescorezonelist);
                }

                result.push({
                    statType:'classperson',
                    count:standardscorezonelist[standardscorezonelist.length-1].count,
                    classes:[]
                });
                result.push({
                    statType:'gradetop',
                    count:standardscorezonelist[standardscorezonelist.length-1].maxscore,
                    classes:[]
                });
                result.push({
                    statType:'gradelast',
                    count:standardscorezonelist[standardscorezonelist.length-1].minscore,
                    classes:[]
                });
                result.push({
                    statType:'gradeavg',
                    count:standardscorezonelist[standardscorezonelist.length-1].avgscore,
                    classes:[]
                });
                result.push({
                    statType:'gradediff',
                    count:standardscorezonelist[standardscorezonelist.length-1].diff,
                    classes:[]
                });

                for (var i=0; i<standardscorezonelist.length; i++) {

                    result[result.length - 5].classes.push({
                        classid:standardscorezonelist[i].classid,
                        count:standardscorezonelist[i].count
                    });
                    result[result.length - 4].classes.push({
                        classid:standardscorezonelist[i].classid,
                        count:standardscorezonelist[i].maxscore
                    });
                    result[result.length - 3].classes.push({
                        classid:standardscorezonelist[i].classid,
                        count:standardscorezonelist[i].minscore
                    });
                    result[result.length - 2].classes.push({
                        classid:standardscorezonelist[i].classid,
                        count:standardscorezonelist[i].avgscore
                    });
                    result[result.length - 1].classes.push({
                        classid:standardscorezonelist[i].classid,
                        count:standardscorezonelist[i].diff
                    });
                }
                return result;
            },
            getScoreZoneListByClass(simplescorezonelist) {
                let result = [];
                let scorezones = simplescorezonelist[0].scorezone;
                for (var i=0; i < scorezones.length; i++) {
                    result.push({
                        lowscore:scorezones[i].lowscore,
                        highscore:scorezones[i].highscore,
                        statType:'',
                        classes:[]
                    });
                }
                result.push({
                    statType:'classperson',
                    classes:[]
                });
                result.push({
                    statType:'gradetop',
                    classes:[]
                });
                result.push({
                    statType:'gradelast',
                    classes:[]
                });
                result.push({
                    statType:'gradeavg',
                    classes:[]
                });
                result.push({
                    statType:'gradediff',
                    classes:[]
                });

                for (var i=0; i < simplescorezonelist.length; i++) {
                    let scorezonelength = simplescorezonelist[i].scorezone.length;
                    for (var j=0; j < scorezonelength; j++) {
                        result[j].classes.push({
                            classid:simplescorezonelist[i].classid,
                            count:simplescorezonelist[i].scorezone[j].count,
                            accumcount:simplescorezonelist[i].scorezone[j].accumcount
                        });
                    }
                    result[scorezonelength].classes.push({
                        classid:simplescorezonelist[i].classid,
                        count:simplescorezonelist[i].count
                    });
                    result[scorezonelength+1].classes.push({
                        classid:simplescorezonelist[i].classid,
                        count:simplescorezonelist[i].maxscore
                    });
                    result[scorezonelength+2].classes.push({
                        classid:simplescorezonelist[i].classid,
                        count:simplescorezonelist[i].minscore
                    });
                    result[scorezonelength+3].classes.push({
                        classid:simplescorezonelist[i].classid,
                        count:simplescorezonelist[i].avgscore
                    });
                    result[scorezonelength+4].classes.push({
                        classid:simplescorezonelist[i].classid,
                        count:simplescorezonelist[i].diff
                    });
                }
                return result;
            },
            getChartScoreZoneList() {
                this.chartxAxisdata = [];
                this.chartseriesdata =[];

                let chartallclassdata = this.getScoreZoneListByClass(this.allclassdata);
                for (var i=0; i<chartallclassdata.length-5; i++) {
                    this.chartxAxisdata.push('['+chartallclassdata[i].highscore+','+chartallclassdata[i].lowscore+')');
                    let oneclassdata = chartallclassdata[i].classes.filter(item => item.classid == this.selectedclassid);
                    if (oneclassdata.length > 0)
                        this.chartseriesdata.push(oneclassdata[0].count);
                }
                this.drawclassChart();
            },
            onClassChange() {
                this.getChartScoreZoneList();
            },
            drawclassChart() {
                if (this.displaytype == 0) return;
                
                this.classChart = echarts.init(document.getElementById('classChart'));
                this.classChart.setOption({
                    title: {
                        text: '',
                        subtext: ''
                    },
                    tooltip: {
                        trigger: 'axis',
                        padding: [5,10,5,10],
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    grid:{
                        borderWidth:0
                    },
                    xAxis: {
                        axisTick: {
                            show: false
                        },
                        axisLine:{
                            lineStyle:{
                                color: '#cad3df',
                                width: 1,
                                type: 'solid'
                            }
                        },
                        axisLabel:{
                            textStyle:{
                                color: '#000'
                            }
                        },
                        splitLine:{
                            show:false,
                            lineStyle:{
                                color: ['#f00'],
                                width: 1,
                                type: 'solid'
                            }
                    　　},
                        type: 'category',
                        data: this.chartxAxisdata
                    },
                    yAxis: {
                        axisTick: {
                            show: false
                        },
                        axisLine:{
                            lineStyle:{
                                color: '#cad3df',
                                width: 1,
                                type: 'solid'
                            }
                        },
                        axisLabel:{
                            textStyle:{
                                color: '#000'
                            }
                        },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color: ['#f2f4f7'],
                                width: 1,
                                type: 'solid'
                            }
                    　　},
                        type: 'value'
                    },
                    series: [
                        {
                            name: '人数',
                            type: 'bar',
                            barWidth: 10, 
                            itemStyle:{
                                normal:{
                                    color:'#43a2ff',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            data: this.chartseriesdata
                        }
                    ]
                });
            },
            // http://192.168.12.61:8083/stat/class/subjectline?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectid=120000000001&subjectname=语文&total=1&showmode=1
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
                        this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classid, classes, subjectid, subjectname, showmode);
                        this.load();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        updated: function() {
          this.drawclassChart();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>