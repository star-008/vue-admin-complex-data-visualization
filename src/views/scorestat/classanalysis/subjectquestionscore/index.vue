<template>
    <section>
        <sms-stat-filter9 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter9>
        <el-row class="sms-content-title">
            <span>{{filters.gradename}}-{{filters.subjectname}}-班级小题得分率分析</span>
        </el-row>
        <el-row>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="classid" @change="drawChart" style="width:165px" v-if="displaytype == '1'">
                    <el-option label="年级" value="TOTAL"></el-option>
                    <el-option v-for="(item, idx) in statDatas.filter(item=>item.classid!='TOTAL')" :label="SMSUtil.getClassName(item.classInfo)" :value="item.classid" :key="idx"></el-option>
                </el-select>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:right;">
                <el-radio-group v-model="displaytype" size="small">
                    <el-radio-button label="0">表</el-radio-button>
                    <el-radio-button label="1">图</el-radio-button>
                </el-radio-group>
            </el-col>
        </el-row>
        <el-table :data="statDatas" border style="width: 100%;" v-loading="listLoading" v-if="displaytype == 0">
            <el-table-column label="班级" align="left" min-width="120">
                <template slot-scope="data">
                    <span>{{ data.row.classid == 'TOTAL'?'年级':SMSUtil.getClassName(data.row.classInfo) }}</span>
                </template>                
            </el-table-column>
            <el-table-column :label="idx%2==0?item.questionType.dictname+item.smallno:(item.questionType.dictname+item.smallno+'%')" align="left" 
                v-for="(item, idx) in examParts" :key="idx" v-if="examParts.length > 0" min-width="100">
                <template slot-scope="data">
                    <span v-if="data.row.questions.length > idx">{{ idx%2==0?data.row.questions[idx].score:data.row.questions[idx].percent }}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-row v-if="displaytype == 1">
            <div id="chart" class="sms-chart-panel"></div> 
        </el-row>
    </section>
</template>

<script>
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import echarts from 'echarts';
    import { getPartRateStatList, exportPartRateStat, getExamQuestionScoreList } from '../../../../api/api';

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
                    gradename: '',
                    subjectid: '',
                    subjectname: ''
                },
                examParts: [],
                datas: [],
                statDatas: [],
                displaytype: 0,
                listLoading: false,
                classid: 'TOTAL'
            };
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname) {
                this.onSearch(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname);
            },
            onSearch(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname) {
                this.setFilter(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname);
                this.loadExamPart();
            },
            onExport(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname) {
                this.doExport();
            },
            setFilter(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname) {
                this.filters.termid = termid;
                this.filters.examtypeid = examtypeid;
                this.filters.examid = examid;
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.subjectid = subjectid;
                this.filters.subjectname = subjectname;
                this.classid = 'TOTAL';
            },
            loadExamPart() {
                this.examParts = [];
                let params = {
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                this.filters.examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'gradeid',
                            fieldValues: [
                                this.filters.gradeid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'subjectid',
                            fieldValues: [
                                this.filters.subjectid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };

                getExamQuestionScoreList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let examParts = res.data.pageInfo.list;                        
                        for (var i=0; i<examParts.length; i++) {
                            this.examParts.push(examParts[i]);
                            this.examParts.push(examParts[i]);
                        }

                        if (this.examParts.length > 0)
                            this.loadData();
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
            loadData() {
                this.datas = [];

                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectid:  this.filters.subjectid
                    }
                };
                
                this.listLoading = true;
                getPartRateStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.total = res.data.pageInfo.total;
                        this.datas = res.data.pageInfo.list;
                        this.statDatas = this.getStatDatas();
                        this.drawChart();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.total = 0;
                        this.datas = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.total = 0;
                    this.datas = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            getStatDatas() {
                let statDatas = [];
                let statdatalist = this.datas;
                while (statdatalist.length > 0) {
                    let statdata = statdatalist[0];
                    statdata.questions = [];
                    let sameones = statdatalist.filter(item => item.classid == statdata.classid);
                    for (let i=0; i<this.examParts.length; i++) {
                        let samepartones = sameones.filter(item => item.smallno == this.examParts[i].smallno);
                        if (samepartones.length > 0)
                            statdata.questions.push(samepartones[0]);
                        else
                            statdata.questions.push({socre: "", percent: ""});
                    }
                    statdatalist = SMSUtil.removeArrayItems(statdatalist, sameones);
                    statDatas.push(statdata);
                }
                let totalDatas = statDatas.filter(item => item.classid == 'TOTAL');
                statDatas = SMSUtil.removeArrayItems(statDatas, totalDatas);
                statDatas = SMSUtil.concat(statDatas, totalDatas);

                return statDatas;
            },
            doExport() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectid:  this.filters.subjectid
                    }
                };
                exportPartRateStat(param).then((res) => {
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
            drawChart() {
                if (this.displaytype == 0 || this.statDatas.length == 0) return;
                
                let chart = echarts.init(document.getElementById('chart'));
                let examParts = [];
                let xAxisdata = [];
                let seriesdata = [];
                let sameones = [];
                if (this.classid == '')
                    sameones = this.statDatas.filter(item => item.classid == null);
                else
                    sameones = this.statDatas.filter(item => item.classid == this.classid);

                if (sameones.length == 0)
                    return;

                for (var i=0; i<this.examParts.length; i+=2) {
                    examParts.push(this.examParts[i]);
                    seriesdata.push(sameones[0].questions[i].percent);
                }

                xAxisdata = examParts.map(item => (item.questionType?item.questionType.dictname:'') + item.smallno);

                chart.setOption({
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
                    legend: {
                    },
                    grid:{
                        borderWidth:0,
                        y2: 150
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
                        splitLine:{
                            show:false,
                            lineStyle:{
                                color: ['#f00'],
                                width: 1,
                                type: 'solid'
                            }
                        },
                        type: 'category',
                        data: xAxisdata,
                        axisLabel: {
                            rotate: -45,
                            textStyle:{
                                color: '#000'
                            }
                        }
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
                            name: '得分率',
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
                            data: seriesdata
                        }
                    ]
                });
            },
            // http://192.168.12.61:8083/stat/class/subjectquestionscore?iframe=1&examid=EX0000000010&gradeid=7&gradename=七年级&subjectid=110000000002&subjectname=数学
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
                this.setFilter(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname);
                this.loadExamPart();
            }
        },
        updated: function() {
            this.drawChart();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>