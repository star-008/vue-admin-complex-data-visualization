<template>
    <section>
        <sms-stat-filter11 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter11>
        <el-row v-if="filters.examid1!=''&&filters.examid2!=''">
            <el-col :span="24" class="sms-content-title">
                <span>班级学生成绩排位对比</span>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select v-model="chartclassid" size="small" @change="getStudents" v-if="displaytype == '1'">
                    <el-option v-for="(item, idx) in filters.classes" :label="SMSUtil.getClassName(item)" :value="item.classid" :key="idx"></el-option>
                </el-select>
                <el-select v-model="chartstuid" size="small" @change="onChangeStudent" v-if="displaytype == '1'">
                    <el-option v-for="(item, idx) in students" :label="item.stuname" :value="item.stuid" :key="idx"></el-option>
                </el-select>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:right;">
                <el-radio-group v-model="displaytype" size="small">
                  <el-radio-button label="0">表</el-radio-button>
                  <el-radio-button label="1">图</el-radio-button>
                </el-radio-group>
            </el-col>
            <el-col :span="24" v-if="displaytype == '0'">
                <el-table :data="stats" v-loading="listLoading" border >
                    <el-table-column prop="stuno" label="学号" align="left">
                    </el-table-column>
                    <el-table-column prop="stuname" label="姓名" align="left">
                    </el-table-column>
                    <el-table-column label="班级" align="left" :formatter="formatClassName" min-width="120">
                    </el-table-column>
                    <el-table-column label="分数" align="center">
                        <el-table-column :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                            <template slot-scope="stat">
                                <span class="sc-color-red" v-if="stat.row.stats[0].realscore1 == '-1'">缺考</span>
                                <span v-else>{{stat.row.stats[0].score1}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                            <template slot-scope="stat">
                                <span class="sc-color-red" v-if="stat.row.stats[0].realscore2 == '-1'">缺考</span>
                                <span v-else>{{stat.row.stats[0].score2}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="分差" align="left">
                            <template slot-scope="stat">
                                <span v-if="stat.row.stats[1].score1 == 0 || stat.row.stats[1].score2 == 0">&nbsp;</span>
                                <span :class="{ 'sc-color-red':parseFloat(stat.row.stats[0].diff)<0 }" v-else>{{stat.row.stats[0].diff}}</span>
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="班排名" align="center">
                        <el-table-column :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                            <template slot-scope="stat">
                                <span v-if="stat.row.stats[1].score1 == 0">&nbsp;</span>
                                <span v-else>{{stat.row.stats[1].score1}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                            <template slot-scope="stat">
                                <span v-if="stat.row.stats[1].score2 == 0">&nbsp;</span>
                                <span>{{stat.row.stats[1].score2}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="分差" align="left">
                            <template slot-scope="stat">
                                <span v-if="stat.row.stats[1].score1 == 0 || stat.row.stats[1].score2 == 0">&nbsp;</span>
                                <span :class="{ 'sc-color-red':parseFloat(stat.row.stats[1].diff)<0 }" v-else>{{stat.row.stats[1].diff}}</span>
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="级排名" align="center">
                        <el-table-column :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                            <template slot-scope="stat">
                                <span v-if="stat.row.stats[2].score1 == 0">&nbsp;</span>
                                <span v-else>{{stat.row.stats[2].score1}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                            <template slot-scope="stat">
                                <span v-if="stat.row.stats[2].score2 == 0">&nbsp;</span>
                                <span v-else>{{stat.row.stats[2].score2}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="分差" align="left">
                            <template slot-scope="stat">
                                <span v-if="stat.row.stats[2].score1 == 0 || stat.row.stats[2].score2 == 0">&nbsp;</span>
                                <span :class="{ 'sc-color-red':parseFloat(stat.row.stats[2].diff)<0 }" v-else>{{stat.row.stats[2].diff}}</span>
                            </template>
                        </el-table-column>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8" v-show="displaytype == '1'">
                <div id="scorechart" class="sms-chart-panel"></div>
            </el-col>
            <el-col :span="8" v-show="displaytype == '1'">
                <div id="classchart" class="sms-chart-panel"></div>
            </el-col>
            <el-col :span="8" v-show="displaytype == '1'">
                <div id="gradechart" class="sms-chart-panel"></div>
            </el-col>
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import { iframe } from '../../../mixins/iframe';
    import SMSUtil from '../../../common/js/util';
    import echarts from 'echarts';
    import { getExamClassList, getScoreRankStat, exportScoreRankStatForCompare } from '../../../api/api';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    gradeid: '',
                    gradename:'',
                    classid: '',
                    classes: [],
                    examid1: '',
                    examname1:'',
                    examid2: '',
                    examname2:'',
                    subjectid: ''
                },

                displaytype: '0',
                stats: [],
                listLoading: false,

                scorechart: null,
                classchart: null,
                gradechart: null,

                students: [],
                chartclassid: '',
                chartstuid: '',
                chartexam1: '',
                chartexam2: '',

                scoreranklist: []
            };
        },
        methods: {
            formatClassName(row, col) {
                if (row.classInfo != null && row.classInfo.name.indexOf('(') != -1)
                    row.classInfo.name = row.classInfo.name.substring(0, row.classInfo.name.indexOf('('));
                return SMSUtil.getClassName(row.classInfo);
            },
            onFirstLoad(gradeid, gradename, classid, classes, examid1, examname1, examid2, examname2, subjectid) {      
            },
            onSearch(gradeid, gradename, classid, classes, examid1, examname1, examid2, examname2, subjectid) {
                this.setFilter(gradeid, gradename, classid, classes, examid1, examname1, examid2, examname2, subjectid);
                this.getStats();
            },
            onExport(gradeid, gradename, classid, classes, examid1, examname1, examid2, examname2, subjectid) {
                this.doExport();
            },
            setFilter(gradeid, gradename, classid, classes, examid1, examname1, examid2, examname2, subjectid) {
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.classid = classid;
                this.filters.classes = JSON.parse(JSON.stringify(classes));
                this.filters.examid1 = examid1;
                this.filters.examname1 = examname1; 
                this.filters.examid2 = examid2;
                this.filters.examname2 = examname2;
                this.filters.subjectid = subjectid;
            },
            onChangeStudent() {
                this.getChartData(this.scoreranklist);
            },
            getStats() {
                if (this.filters.examid1 == '' || this.filters.examid2 == '') return;
                
                let param = {
                    pagination:{
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter: {
                        examids: [this.filters.examid1, this.filters.examid2],
                        gradeid: this.filters.gradeid,
                        subjectid: this.filters.subjectid
                    }
                };

                if (this.filters.classid == '') {
                    param.filter.classtype = CLASS_TYPE.NORMAL;
                } else {
                    param.filter.classid = this.filters.classid;
                }

                this.listLoading = true;
                this.stats = [];
                this.scoreranklist = [];
                getScoreRankStat(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.scoreranklist = res.data.pageInfo.list
                        this.composeClasses();
                        this.stats = this.composeStat(this.scoreranklist);
                        this.getStudents();
                        this.getChartData(this.scoreranklist);
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
            getChartData(templist) {
                let chartdata = JSON.parse(JSON.stringify(templist));
                let subjectofperson = chartdata.filter(item => item.classid == this.chartclassid && item.stuid == this.chartstuid);
                this.chartexam1 = subjectofperson.filter(item => item.examid == this.filters.examid1)[0];
                this.chartexam2 = subjectofperson.filter(item => item.examid == this.filters.examid2)[0];

                this.drawChart();
            },
            getStudents() {
                this.students = [];
                for(var i=0; i<this.stats.length; i++) {
                    if (this.stats[i].classid == this.chartclassid) {
                        this.students.push({
                            stuid:this.stats[i].stuid,
                            stuname:this.stats[i].stuname
                        });
                    }
                }

                if (this.students.length > 0)
                    this.chartstuid = this.students[0].stuid;

                this.getChartData(this.scoreranklist);
            },
            composeClasses() {
                for (var i=0; i<this.filters.classes.length; i++) {
                    let classid = this.filters.classes[i].classid;
                    let data = this.scoreranklist.filter(item => item.classid == classid);
                    if (data.length == 0) {
                        this.filters.classes.splice(i, 1);
                        i-= 1;
                        continue;
                    }
                }

                if (this.filters.classes.length > 0) {
                    this.chartclassid = this.filters.classes[0].classid;
                }
            },
            composeStat(templist) {
                let statlist = JSON.parse(JSON.stringify(templist));
                let result = [];
                while(statlist.length > 0) {
                    let oneperson = statlist[0];
                    let subjectofperson = statlist.filter(item => item.classid == oneperson.classid && item.stuid == oneperson.stuid);

                    oneperson.stats = [];

                    let exam1 = subjectofperson.filter(item => item.examid == this.filters.examid1)[0];
                    let exam2 = subjectofperson.filter(item => item.examid == this.filters.examid2)[0];

                    if (exam1 != null && exam2 != null) {
                        oneperson.stats.push({
                            score1:exam1.score,
                            realscore1:exam1.realscore,
                            score2:exam2.score,
                            realscore2:exam2.realscore,
                            diff:parseFloat(exam1.score)-parseFloat(exam2.score)
                        });
                        oneperson.stats.push({
                            score1:exam1.sturankinclass,
                            score2:exam2.sturankinclass,
                            diff:parseFloat(exam1.sturankinclass)-parseFloat(exam2.sturankinclass)
                        });
                        oneperson.stats.push({
                            score1:exam1.sturankingrade,
                            score2:exam2.sturankingrade,
                            diff:parseFloat(exam1.sturankingrade)-parseFloat(exam2.sturankingrade)
                        });

                        result.push(oneperson);
                    }
                    statlist = SMSUtil.removeArrayItems(statlist, subjectofperson);
                }

                return result;
            },
            doExport() {
                let param = {
                    pagination:{
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter: {
                        examids: [this.filters.examid1, this.filters.examid2],
                        gradeid: this.filters.gradeid,
                        subjectid: this.filters.subjectid
                    }
                };

                if (this.filters.classid == '') {
                    param.filter.classtype = CLASS_TYPE.NORMAL;
                } else {
                    param.filter.classid = this.filters.classid;
                }

                exportScoreRankStatForCompare(param).then((res) => {
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
                if (this.displaytype == '0') return;
                if (this.chartexam1 == null || this.chartexam2 == null) return;

                this.scorechart = echarts.init(document.getElementById('scorechart'));
                this.classchart = echarts.init(document.getElementById('classchart'));
                this.gradechart = echarts.init(document.getElementById('gradechart'));
                this.scorechart.setOption({
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
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data: [this.chartexam1.examname, this.chartexam2.examname]
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
                        data: ['分数']
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
                        type: 'value',
                        boundaryGap: [0, 0.01]
                    },
                    series: [
                        {
                            name: this.chartexam1.examname,
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
                            data: [this.chartexam1.score]
                        },
                        {
                            name: this.chartexam2.examname,
                            type: 'bar',
                            barWidth: 10,
                            itemStyle:{
                                normal:{
                                    color:'#2bd3bd',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            data: [this.chartexam2.score]
                            
                        }
                    ]
                });
                this.classchart.setOption({
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
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data: [this.chartexam1.examname, this.chartexam2.examname]
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
                        data: ['班排名']
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
                            name: this.chartexam1.examname,
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
                            data: [this.chartexam1.sturankinclass]
                        },
                        {
                            name: this.chartexam2.examname,
                            type: 'bar',
                            barWidth: 10,
                            itemStyle:{
                                normal:{
                                    color:'#2bd3bd',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            data: [this.chartexam2.sturankinclass]
                        }
                    ]
                });
                this.gradechart.setOption({
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
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data: [this.chartexam1.examname, this.chartexam2.examname]
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
                        data: ['级排名']
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
                        type: 'value',
                        boundaryGap: [0, 0.01]
                    },
                    series: [
                        {
                            name: this.chartexam1.examname,
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
                            data: [this.chartexam1.sturankingrade]
                        },
                        {
                            name: this.chartexam2.examname,
                            type: 'bar',
                            barWidth: 10,
                            itemStyle:{
                                normal:{
                                    color:'#2bd3bd',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            data: [this.chartexam2.sturankingrade]
                        }
                    ]
                });
            },
            // http://192.168.12.61:8083/stat/personal?iframe=1&compareexamid1=EX0000000018&compareexamname1=Test1&compareexamid2=EX0000000019&compareexamname2=Test2&gradeid=1&gradename=一年级&subjectid=100000000003
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
                let param = {
                    pubstatus:'2'
                };
                if (gradeid != '') {
                    param.gradeid = gradeid;
                }
                getExamClassList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let classes = res.data.pageInfo.list;
                        this.setFilter(gradeid, gradename, classid, classes, compareexamid1, compareexamname1, compareexamid2, compareexamname2, subjectid);
                        this.getStats();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        created() {
        },
        updated() {
            this.drawChart();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .color-red {
        color: red;
    }
</style>