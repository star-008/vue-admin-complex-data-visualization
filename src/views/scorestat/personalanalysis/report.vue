<template>
    <div>
        <section style="padding-bottom:0">
            <sms-stat-filter12 @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter12>
        </section>
        <section style="padding-top:0">
            <el-row>
                <el-col :span="24" class="sms-main-cover-title">
                    <span class="sms-main-cover-title-span">成绩单</span>
                    <span style="font-size:10pt">班级参考人数:<span class="sc-color-orange">{{ this.countInClass }}</span>; 年级参考人数:<span class="sc-color-orange">{{ this.countInGrade }}</span></span>
                </el-col>
                <el-col :span="24">
                    <el-table :data="indiviDatas" border style="width: 100%;" v-loading="listLoading">
                        <el-table-column label="科目" align="left" min-width="100" class-name="sms-cell-header">
                            <template slot-scope="data">
                                <span style="font-weight:bold">{{ data.row.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-for="(item, idx) in datas" :key="idx" :label="item.subjectid=='TOTAL'?'总分':item.subject.dictname" align="left">
                            <template slot-scope="data">
                                <span class="sc-color-red" v-if="parseInt(data.row.scores[idx])==-1">缺考</span>
                                <span v-else>{{ data.row.scores[idx] }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </section>
        <section style="padding-top:0">
            <el-row>
                <el-col :span="24" class="sms-main-cover-title">
                    <span class="sms-main-cover-title-span">科目优劣势对比</span>
                </el-col>
                <el-col :span="24" style="font-size:10pt;">
                    <span style="margin-left: 10px">总分：{{ this.totalScore }}</span>
                    <span style="margin-left: 50px">优势科目：<span style="color:#56b625;font-weight:bold" :style="this.advantageSubjectNames.length==0 ? 'font-style:italic;' : ''">{{ this.getNames(this.advantageSubjectNames) }}</span></span>
                    <span style="margin-left: 50px">劣势科目：<span style="color:#ff2929;font-weight:bold" :style="this.inferiorSubjectNames.length==0 ? 'font-style:italic;' : ''">{{ this.getNames(this.inferiorSubjectNames) }}</span></span>
                </el-col>
                <el-col :span="24">
                    <div id="roundChart" class="sms-chart-panel"></div>
                </el-col>
            </el-row>
        </section>
        <section style="padding-top:0">
            <el-row>
                <el-col :span="24" class="sms-main-cover-title">
                    <span class="sms-main-cover-title-span">历次考试年级排名趋势</span>
                </el-col>
                <el-col :span="24">
                    <div id="lineChart" class="sms-chart-panel"></div> 
                </el-col>
            </el-row>
        </section>
    </div>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { iframe } from '../../../mixins/iframe';
    import { getStudentStatList, getAnalysisScoreLevelConfig } from '../../../api/api';
    import echarts from 'echarts';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    examid: '',
                    gradeid: '',
                    studentid: ''
                },

                showDatas: ['科目满分', '你的成绩', '标准分', '班级最高分', '年级最高分', '班级平均分', '年级平均分', '班级排名', '年级排名', '等级'],
                listLoading: false,
                datas:[],
                indiviDatas: [],
                tillNowDatas: [],
                countInClass: '',
                countInGrade: '',
                totalScore: '',
                advantageSubjectNames: [],
                inferiorSubjectNames: []
            }
        },
        methods: {
            onFirstLoad(examid, gradeid, studentid) {
                this.onSearch(examid, gradeid, studentid);
            },
            onSearch(examid, gradeid, studentid) {
                this.setFilter(examid, gradeid, studentid);
                this.loadSubjectIndividualList();
            },
            onExport(examid, gradeid, studentid) {
            },
            setFilter(examid, gradeid, studentid) {
                this.filters.examid = examid;
                this.filters.gradeid = gradeid;
                this.filters.studentid = studentid;
            },
            loadSubjectIndividualList() {
                this.datas = [];
                this.indiviDatas = [];
                this.tillNowDatas = [];
                this.countInClass = '';
                this.countInGrade = '';
                this.totalScore = '';
                this.advantageSubjectNames = [];
                this.inferiorSubjectNames = [];

                let params = {
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        stuid: this.filters.studentid
                    }
                };

                if (this.filters.studentid == '') return;

                this.listLoading = true;
                getStudentStatList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.datas = res.data.pageInfo.list;
                        let totalData = this.datas.filter(item=>item.subjectid=='TOTAL')[0];
                        let idx = this.datas.indexOf(totalData);
                        this.datas.splice(idx, 1);
                        this.datas.push(totalData);

                        if (this.datas.length > 0) {
                            this.countInClass = this.datas[0].stucountinclass;
                            this.countInGrade = this.datas[0].stucountingrade;

                            this.loadTillNowList();

                            this.indiviDatas = this.getIndiviDatas();
                            if (this.indiviDatas.length > 0) {
                                this.totalScore = Math.max(0, this.indiviDatas[1].scores[this.indiviDatas[1].scores.length - 1]);
                                this.getSubjectNames();
                                this.drawRoundChart();
                            }
                        }
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.datas = [];
                        this.indiviDatas = [];
                    }

                    this.listLoading = false;
                }).catch((err) => {
                  console.log(err);
                  this.datas = [];
                  this.indiviDatas = [];
                  this.listLoading = false;
                });
            },
            loadTillNowList() {
                let params = {
                    filter: {
                        gradeid: this.filters.gradeid,
                        stuid: this.filters.studentid
                    }
                };

                getStudentStatList(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.tillNowDatas = res.data.pageInfo.list;
                        if (this.tillNowDatas.length > 0) {
                            this.drawLineChart();
                        }
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.tillNowDatas = [];
                    }            
                }).catch((err) => {
                  console.log(err);
                  this.tillNowDatas = [];
                });
            },
            getIndiviDatas() {
                let individatas = [];
                for(var i=0; i<this.showDatas.length; i++) {
                    let individata = {
                        name:this.showDatas[i],
                        scores:[]
                    };
                    var presented = 0;
                    for(var j=0; j<this.datas.length; j++) {
                        switch(this.showDatas[i]) {
                            case "科目满分":
                                individata.scores.push(this.datas[j].fullscore);
                                break;
                            case "你的成绩":
                                if (this.datas[j].applycount == 0) individata.scores.push(-1);
                                else individata.scores.push(this.datas[j].score);
                                break;
                            case "标准分":
                                individata.scores.push(this.datas[j].standardscore);
                                break;
                            case "班级最高分":
                                individata.scores.push(this.datas[j].classmaxscore);
                                break;
                            case "年级最高分":
                                individata.scores.push(this.datas[j].grademaxscore);
                                break;
                            case "班级平均分":
                                individata.scores.push(this.datas[j].classavgscore);
                                break;
                            case "年级平均分":
                                individata.scores.push(this.datas[j].gradeavgscore);
                                break;
                            case "班级排名":
                                if (this.datas[j].sturankinclass == 0) individata.scores.push('');
                                else if (j == this.datas.length - 1 && presented == 0) individata.scores.push('');
                                else {
                                    individata.scores.push(this.datas[j].sturankinclass);
                                    presented++;
                                }
                                break;
                            case "年级排名":
                                if (this.datas[j].sturankingrade == 0) individata.scores.push('');
                                else if (j == this.datas.length - 1 && presented == 0) individata.scores.push('');
                                else {
                                    individata.scores.push(this.datas[j].sturankingrade);
                                    presented++;
                                }
                                break;
                            case "等级":
                                individata.scores.push(this.datas[j].degree);
                                break;
                        }
                    }
                    individatas.push(individata);
                }
                return individatas;
            },
            getSubjectNames() {
                let params = {
                    conditions: [
                        {
                            fieldName: 'examid',
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
                            fieldName: 'type',
                            fieldValues: [
                                "0"
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };

                getAnalysisScoreLevelConfig(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let config = res.data.pageInfo.list;
                        let subjectdata = this.datas.filter(item => item.subjectid != 'TOTAL');
                        for (var i = 0; i < subjectdata.length; i++) {
                            let samesubjectdata = config.filter(item => item.subjectid == subjectdata[i].subjectid);
                            let advantagedata = samesubjectdata.filter(item => item.level == '2')[0];
                            let inferiordata = samesubjectdata.filter(item => item.level == '5')[0];
                            if (parseInt(subjectdata[i].score) >= parseInt(advantagedata.lowscore)) {
                                this.advantageSubjectNames.push(subjectdata[i].subject.dictname);
                            } else if(parseInt(subjectdata[i].score) < parseInt(inferiordata.lowscore)) {
                                this.inferiorSubjectNames.push(subjectdata[i].subject.dictname);
                            }
                        }
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
            drawRoundChart() {
                let roundChart = echarts.init(document.getElementById('roundChart'));
                roundChart.clear();
                let subjectnames = this.datas.filter(item=>item.subjectid!='TOTAL').map(item=>item.subject.dictname);
                let fullscores = this.datas.filter(item=>item.subjectid!='TOTAL').map(item =>item.fullscore);
                let polardata = [];
                for (var i=0; i<subjectnames.length; i++) {
                    polardata.push({
                        text: subjectnames[i],
                        axisLabel:{
                            textStyle:{
                                color: '#000'
                            }
                        },
                        max: fullscores[i]
                    });
                }
                let seriesdata = this.indiviDatas[1].scores;
                for (var i=0; i<seriesdata.length; i++) {
                    if (i != seriesdata.length - 1)
                        seriesdata[i] = Math.min(seriesdata[i], fullscores[i]);
                }

                roundChart.setOption({
                    title : {
                        text: '',
                        subtext: ''
                    },                    
                    tooltip: {
                        trigger: 'axis',
                        padding: [15,20,15,20]
                    },
                    legend: {
                        show:false,
                        x : 'center',
                        data:['科目']
                    },
                    toolbox: {
                        show : false,
                        feature : {
                            mark : {show: true},
                            dataView : {show: true, readOnly: true},
                            restore : {show: true},
                            saveAsImage : {show: true}
                        }
                    },
                    calculable : true,
                    type: 'circle',
                    polar : [
                        {
                            indicator : polardata,
                            radius : 130,
                            type: 'circle',
                            splitArea : {
                                show : false,
                                areaStyle : {
                                    color: '#fff',
                                },
                            },
                            splitLine : {
                                show : true,
                                lineStyle : {
                                    width : 1,
                                    color : '#ced6e1'
                                }
                            }
                        }
                    ],
                    series : [
                        {
                            name: '科目分数',
                            type: 'radar',
                            itemStyle: {
                                normal: {
                                    areaStyle: {
                                        type: 'default',
                                        color:'#d9ecff'
                                    }
                                }
                            },
                            data : [
                                {
                                    value : seriesdata,
                                    name : '分数',
                                    itemStyle: {
                                        normal: {
                                            color: '#43a2ff'
                                        },
                                    }
                                }
                            ]
                        }
                    ]
                });
            },
            drawLineChart() {
                let lineChart = echarts.init(document.getElementById('lineChart'));
                lineChart.clear();
                let subjects = this.datas.filter(item => item.subjectid != 'TOTAL');                
                let subjectnames = subjects.map(item => item.subject.dictname);
                let seriesdata = [];
                let xAxisdata = [];
                let tillnowdatalist = this.tillNowDatas;
                let examdatas = [];
                let lastrank = [];
                for (var i=0; i<subjects.length; i++) {
                    lastrank.push(0);
                }

                let totaldata = tillnowdatalist.filter(item => item.subjectid == 'TOTAL');
                tillnowdatalist = SMSUtil.removeArrayItems(tillnowdatalist, totaldata);
                
                while(tillnowdatalist.length > 0) {
                    let lastone = tillnowdatalist[tillnowdatalist.length-1];
                    lastone.subjects = [];
                    let examsubjects = tillnowdatalist.filter(item => item.examid == lastone.examid);
                    for (var i=0; i<subjects.length; i++) {
                        let subjectscore = examsubjects.filter(item => item.subjectid == subjects[i].subjectid);
                        if (subjectscore.length > 0) {
                            lastone.subjects.push(subjectscore[0]);
                            lastrank[i] = subjectscore[0].sturankingrade;
                        } else {
                            lastone.subjects.push({ sturankingrade: lastrank[i] });
                        }
                    }

                    examdatas.push(lastone);
                    tillnowdatalist = SMSUtil.removeArrayItems(tillnowdatalist, examsubjects);
                }

                xAxisdata = examdatas.map(item => item.examname);
                for (var i=0; i<subjectnames.length; i++) {
                    let seriesone = {
                        name: subjectnames[i],
                        type: 'line',
                        // symbol: 'circle',
                        data: []
                    };
                    for (var j = 0; j < examdatas.length; j++) {
                        seriesone.data.push(examdatas[j].subjects[i].sturankingrade);
                    }

                    seriesdata.push(seriesone);
                }

                lineChart.setOption({
                    title: {
                        text: ''
                    },
                    tooltip: {
                        trigger: 'axis',
                        padding: [5,10,5,10]
                    },
                    legend: {
                        data: subjectnames
                    },
                    calculable : true,
                    grid:{
                        borderWidth:0
                    },
                    xAxis: {
                        boundaryGap : false,
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
                        data: xAxisdata
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
                        inverse: true,
                        type: 'value'
                    },
                    series: seriesdata
                });
            },
            getNames(array) {
                let str = '';
                if (array.length > 0) {
                    str = array[0];
                    for (var i = 1; i < array.length; i++) {
                        str += " " + array[i];
                    }
                } else {
                    str = '无';
                }

                return str;
            },
            // http://192.168.12.61:8083/stat/personal/report?iframe=1&examid=EX0000000008&gradeid=10&studentid=E000027200000001285
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
                this.setFilter(examid, gradeid, studentid);
                this.loadSubjectIndividualList();
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>