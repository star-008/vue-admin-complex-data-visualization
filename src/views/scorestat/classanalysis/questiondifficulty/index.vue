<template>
    <section>
        <sms-stat-filter9 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter9>
        <el-row class="sms-content-title">
            <span>{{filters.gradename}}{{filters.subjectname}}-小题难度分析</span>
        </el-row>
        <el-row class="sms-content-tool-panel" style="text-align:right;">
            <el-radio-group v-model="displaytype" size="small">
                <el-radio-button label="0">表</el-radio-button>
                <el-radio-button label="1">图</el-radio-button>
            </el-radio-group>
        </el-row>
        <el-table :data="questionDatas" v-loading="listLoading" border v-if="displaytype == 0">
            <el-table-column label="题号" align="left">
                <template slot-scope="question">
                    {{ question.row.questionCategory==null?question.row.questionno:(question.row.questionCategory.dictname + question.row.questionno) }}
                </template>
            </el-table-column>
            <el-table-column prop="smallno" label="小题号" align="left">
            </el-table-column>
            <el-table-column prop="count" label="人数" align="left">
            </el-table-column>
            <el-table-column prop="maxscore" label="最高分" align="left">
            </el-table-column>
            <el-table-column prop="minscore" label="最低分" align="left">
            </el-table-column>
            <el-table-column prop="score" label="平均分" align="left">
            </el-table-column>
            <el-table-column prop="rate" label="得分率" align="left">
            </el-table-column>
            <el-table-column prop="fullscorerate" label="满分率" align="left">
            </el-table-column>
            <el-table-column prop="zeroscorerate" label="零分率" align="left">
            </el-table-column>
            <el-table-column prop="difficulty" label="难度" align="left">
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
    import { getQuestionDifficultyStatList, exportQuestionDifficultyStat } from '../../../../api/api';

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
                displaytype: 0,
                questionDatas: [],
                listLoading: false
            };
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname) {
                this.onSearch(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname);
            },
            onSearch(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname) {
                this.setFilter(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname);
                this.loadDatas();
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
            },
            loadDatas() {
                let param = {
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectid: this.filters.subjectid
                    }
                };

                this.listLoading = true;
                getQuestionDifficultyStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.questionDatas = res.data.pageInfo.list;
                        if (this.displaytype == 1) this.drawChart();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.questionDatas = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.questionDatas = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
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
                        subjectid: this.filters.subjectid
                    }
                };
                exportQuestionDifficultyStat(param).then((res) => {
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
                if (this.displaytype == 0) return;
                
                let chart = echarts.init(document.getElementById('chart'));
                let xAxisdata = [];
                let seriesdata = [];

                xAxisdata = this.questionDatas.map(item => item.smallno);
                seriesdata = this.questionDatas.map(item => parseFloat(item.difficulty));

                chart.setOption({
                    title: {
                        text: '',
                        subtext: ''
                    },
                    tooltip: {
                        trigger: 'axis',
                        padding: [5,10,5,10],
                        axisPointer: {
                            show: true,
                            type : 'shadow',
                            lineStyle: {
                                type : 'dashed',
                                width : 1
                            }
                        }
                    },
                    legend: {
                    },
                    grid:{
                        borderWidth:0
                    },
                    calculable : true,
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
                            name: '难度',
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
            // http://192.168.12.61:8083/stat/class/questiondifficulty?iframe=1&examid=EX0000000010&gradeid=7&gradename=七年级&subjectid=110000000002&subjectname=数学
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
                this.setFilter(termid, examtypeid, examid, gradeid, gradename, subjectid, subjectname);
                this.loadDatas();
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