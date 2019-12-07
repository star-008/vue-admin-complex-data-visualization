<template>
    <section>
        <sms-stat-filter15 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter15>
        <el-row class="sms-content-title">
            <span>{{filters.gradename}}-{{filters.examname}}--班级科目均分排位统计</span>
        </el-row>
        <el-row>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="checkedsubjectId" @change="drawChart" style="width:120px;" v-if="filters.showmode == 0 && displaytype == 1">
                    <el-option label="总分" value="TOTAL" v-if="filters.total"></el-option>
                    <el-option v-for="(item, idx) in filters.subjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                </el-select>
                <el-select size="small" v-model="checkedclassId" @change="drawChart" style="width:100px" v-if="filters.showmode == 1 && displaytype == 1">
                    <el-option v-for="(item, idx) in checkedclasses" :label="SMSUtil.getClassName(item)" :value="item.classid" :key="idx"></el-option>
                </el-select>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:right;">
                <el-radio-group v-model="displaytype" size="small">
                    <el-radio-button label="0">表</el-radio-button>
                    <el-radio-button label="1">图</el-radio-button>
                </el-radio-group>
            </el-col>
        </el-row>
        <el-row v-show="filters.showmode == 0">
            <el-table :data="subjectDatas" border style="width: 100%;" v-show="displaytype == 0" v-loading="listLoading" :span-method="objectSpanMethod">
                <el-table-column label="科目" align="left">                
                    <template slot-scope="data">
                        <span>{{ data.row.subjectid == 'TOTAL'?'总分':data.row.subject.dictname }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="班级" align="left" min-width="120">
                    <template slot-scope="data">
                        <span>{{ data.row.classid == 'TOTAL'?'年级':SMSUtil.getClassName(data.row.classInfo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="totalcount" label="应考人数" align="left">
                </el-table-column>
                <el-table-column prop="applycount" label="实考人数" align="left">
                </el-table-column>
                <el-table-column prop="classInfo.advisernames" label="班主任" align="left">
                </el-table-column>
                <el-table-column prop="teachername" label="任课老师" align="left">
                </el-table-column>
                <el-table-column prop="maxscore" label="最高分" align="left">
                </el-table-column>
                <el-table-column prop="minscore" label="最低分" align="left">
                </el-table-column>
                <el-table-column prop="score" label="平均分" align="left">
                </el-table-column>
                <el-table-column label="差距" align="left">
                    <template slot-scope="data">
                        <span :class="{ 'sc-color-red':parseFloat(data.row.diff)<0 }">{{ data.row.diff }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="rank" label="排名" align="left">
                </el-table-column>
            </el-table>
            <el-col :span="24" v-if="displaytype == 1">
                <div id="subjectChart" class="sms-chart-panel"></div> 
            </el-col>
        </el-row>
        <el-row v-show="filters.showmode == 1">
            <el-table :data="classDatas" border style="width: 100%;" v-if="displaytype == 0" v-loading="listLoading">
                <el-table-column type="index" label="序号" align="left">
                </el-table-column>
                <el-table-column label="班级" align="left">
                    <template slot-scope="data">
                        <span>{{ data.row.classid == 'TOTAL'?'年级':SMSUtil.getClassName(data.row.classInfo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column v-for="(item, idx) in filters.subjects" :key="idx" :label="item.dictname + parseInt(item.score) + '分'" align="left">
                    <template slot-scope="data">
                        <span>{{ data.row.subjects == []?"":data.row.subjects[idx].score }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="'总成绩' + totalTopScore + '分'" align="left">
                    <template slot-scope="data">
                        <span>{{ data.row.subjects == []?"":data.row.subjects[data.row.subjects.length-1].score }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="rank" label="名次" align="left">
                </el-table-column>
            </el-table>
            <el-col :span="24" v-if="displaytype == 1">
                <div id="classChart" class="sms-chart-panel"></div> 
            </el-col>
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import { getSubjectAvgScoreList, getExamSubjectScoreList, exportSubjectAvgScore, exportSubjectAvgScoreByClass, getExamClassList } from '../../../../api/api';
    import echarts from 'echarts';

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
                    total: true,
                    subjects: [],
                    showmode: 0
                },

                datas: [],
                subjectDatas: [],
                classDatas: [],
                listLoading: false,
                displaytype: 0,
                checkedclassId: '',
                checkedsubjectId: 'TOTAL',
                checkedclasses: [],
                totalTopScore: 0
            }
        },
        watch: {
            displaytype: function(val, oldval) {
                if (val == 1) {
                    let _this = this;
                    this.$nextTick(function() {
                        _this.drawChart();
                    });
                }
            }
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode);
                this.getSubjectTopScores();
            },
            onExport(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode) {
                this.doExport(showmode);
            },
            setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode) {
                this.filters.termid = termid;
                this.filters.examtypeid = examtypeid;
                this.filters.examid = examid;
                this.filters.examname = examname;
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.classids = JSON.parse(JSON.stringify(classids));
                this.filters.classes = classes;
                this.filters.total = total;
                this.filters.subjects = subjects;
                this.filters.showmode = showmode;

                this.checkedsubjectId = 'TOTAL';
                this.checkedclassId = '';
                
                if (!this.filters.total && subjects.length > 0)
                    this.checkedsubjectId = subjects[0].dictvalue;
                this.checkedclasses = this.filters.classes.filter(item => this.filters.classids.indexOf(item.classid)!=-1);
                this.checkedclassId = this.checkedclasses[0].classid;
            },
            getSubjectTopScores() {
                if (this.filters.examid == '' || this.filters.gradeid == '') return;

                let param = {
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
                        }
                    ]
                };
                getExamSubjectScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let subjectscores = res.data.pageInfo.list;
                        this.totalTopScore = 0;
                        for (var i=0; i<this.filters.subjects.length; i++) {
                            let subject = this.filters.subjects[i];
                            let scoreofsubject = subjectscores.filter(item => item.subjectid == subject.dictvalue);
                            if (scoreofsubject.length > 0) {
                                subject.score = scoreofsubject[0].score;
                            } else {
                                subject.score = 0;
                            }
                            if (parseInt(subject.score) == -1) continue;
                            this.totalTopScore += parseInt(subject.score);
                        }
                        this.totalTopScore = SMSUtil.formatNumber(this.totalTopScore, 2);

                        this.loadData();
                    }  else {
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
                        subjectids:  this.filters.subjects.map(item => item.dictvalue)
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                }

                param.filter.classids = SMSUtil.concat(this.filters.classids, [ 'TOTAL' ]);

                this.listLoading = true;
                getSubjectAvgScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.total = res.data.pageInfo.total;
                        this.datas = res.data.pageInfo.list;
                        if (this.filters.showmode == 0) {
                            this.getSubjectDatas();
                        } else if (this.filters.showmode == 1) {
                            this.getClassDatas();
                        }
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
            getSubjectDatas() {
              let subjectdatalist = this.datas;
              let subjectDatas = [];
              let totalDatas = [];

              this.subjectDatas = [];
              while (subjectdatalist.length > 0) {
                    let subjectdata = subjectdatalist[0];
                
                    if (subjectdata.subjectid == 'TOTAL') {
                        totalDatas.push(subjectdata);
                        subjectdatalist.splice(0, 1);
                        continue;
                    }

                    let sameones = subjectdatalist.filter(item => item.subjectid == subjectdata.subjectid);
                    if (sameones.length > 1) {
                        let sumofsubject = sameones.filter(item => item.classid == 'TOTAL');
                        sameones = SMSUtil.removeArrayItems(sameones, sumofsubject);
                        sameones = SMSUtil.concat(sameones, sumofsubject);
                        subjectDatas = SMSUtil.concat(subjectDatas, sameones);
                    }

                  subjectdatalist = SMSUtil.removeArrayItems(subjectdatalist, sameones);
              }

              this.subjectDatas = SMSUtil.concat(subjectDatas, totalDatas);
            },
            getClassDatas() {
              let classdatalist = this.datas;

              this.classDatas = [];
              while (classdatalist.length > 0) {
                  let classdata = classdatalist[0];
                  classdata.subjects = [];
                  let sameones = classdatalist.filter(item => item.classid == classdata.classid);
                  for (let i=0; i<this.filters.subjects.length; i++) {
                      let subject = this.filters.subjects[i];
                      let subjectdata = sameones.filter(item => item.subjectid == subject.dictvalue);
                      if (subjectdata.length > 0) {
                          classdata.subjects.push(subjectdata[0]);
                      } else {
                          classdata.subjects.push({});
                      }
                  }
                  let totaldata = sameones.filter(item => item.subjectid == 'TOTAL');
                  if (totaldata.length > 0) {
                      classdata.subjects.push(totaldata[0]);
                  } else {
                      classdata.subjects.push({});
                  }
                  
                  classdatalist = SMSUtil.removeArrayItems(classdatalist, sameones);
                  this.classDatas.push(classdata);
              }

              let classTotalData = this.classDatas.filter(item => item.classid == 'TOTAL');
              this.classDatas = SMSUtil.removeArrayItems(this.classDatas, classTotalData);
              this.classDatas = SMSUtil.concat(this.classDatas, classTotalData);
            },
            doExport(showmode) {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectids: this.filters.subjects.map(item => item.dictvalue),
                        classids: this.filters.classids
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                }

                let exportFunc = null;
                if (showmode == 0) {
                    exportFunc = exportSubjectAvgScore;
                } else if (showmode == 1) {
                    exportFunc = exportSubjectAvgScoreByClass;
                }
                exportFunc(param).then((res) => {
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
                if (this.filters.showmode == 0) {
                    this.drawSubjectChart();
                } else {
                    this.drawClassChart();
                }
            },
            drawSubjectChart() {
                if (this.displaytype == 0) return;

                let subjectChart = echarts.init(document.getElementById('subjectChart'));
                subjectChart.clear();
                let classdata = [];
                let scoredata = [];
                let diffdata = [];
                let sequence = [];
                for (var i=0; i<this.checkedclasses.length; i++) {
                    var sameone = this.subjectDatas.filter(item => item.subjectid == this.checkedsubjectId && item.classid == this.checkedclasses[i].classid);
                    if (sameone.length > 0) {
                        classdata.push(SMSUtil.getClassName(this.checkedclasses[i]));
                        scoredata.push(sameone[0].score);
                        diffdata.push(sameone[0].diff);
                        sequence.push(sameone[0].rank);
                    }
                }
                let avgscore = this.subjectDatas.filter(item => item.subjectid == this.checkedsubjectId && item.classid == "TOTAL")[0].score;
                let scoredata1 = [];
                let scoredata2 = [];
                let scoredata3 = [];
                for (var i = 0; i < scoredata.length; i++) {
                    if (scoredata[i] == -1) {
                        scoredata1.push(-1);
                        scoredata2.push(0);
                        scoredata3.push(0);
                        continue;
                    }
                    if (parseFloat(scoredata[i]) >= parseFloat(avgscore)) {
                        scoredata1.push(SMSUtil.formatNumber(parseFloat(avgscore), 2));
                        scoredata2.push(SMSUtil.formatNumber(parseFloat(scoredata[i]) - parseFloat(avgscore), 2));
                        scoredata3.push(0);
                    } else {
                        scoredata1.push(SMSUtil.formatNumber(parseFloat(scoredata[i]), 2));
                        scoredata2.push(0);
                        scoredata3.push(SMSUtil.formatNumber(parseFloat(avgscore) - parseFloat(scoredata[i]), 2));
                    }
                }

                subjectChart.setOption({
                    title: {
                        text: '',
                        subtext: '',
                        sublink: ''
                    },
                    tooltip : {
                        trigger: 'axis',
                        padding: [5,10,5,10],
                        axisPointer : {
                            type : 'shadow'
                        },
                        formatter: function (params) {
                            let diff = params[1].value;
                            let score = params[0].value;
                            if (score == -1) {
                                diff = '无';
                                score = '无';
                            } else if (diff == 0) {
                                diff = -params[2].value;
                                score = params[0].value;
                            } else {
                                score = SMSUtil.formatNumber((params[0].value + diff), 2);
                            }

                            return '班级 : ' + params[0].name + '<br/>班级分数 : ' + score + '<br/>' + params[0].seriesName + ' : ' + diff;
                        }
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
                        axisLabel: {
                            rotate: -45,
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
                        type : 'category',
                        data: classdata
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
                        type : 'value'
                    },
                    series: [
                        {
                            name:'差距',
                            type:'bar',
                            stack: 'one',
                            barWidth: 40, 
                            itemStyle:{
                                normal:{
                                    color:'rgba(0,0,0,0)'
                                }
                            },
                            data: scoredata1,
                            markLine : {
                                data : [
                                    {type : 'max', name : '年级平均分', itemStyle:{normal:{color:'#997aff'}}},
                                ]
                            }
                        },
                        {
                            name: '班级分数1',
                            type: 'bar',
                            stack: 'one',
                            itemStyle:{
                                normal:{
                                    color:'#43a2ff',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            barWidth: 40,
                            data: scoredata2
                        },
                        {
                            name: '班级分数2',
                            type: 'bar',
                            stack: 'one',
                            itemStyle:{
                                normal:{
                                    color:'#43a2ff',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            barWidth: 40,
                            data: scoredata3
                        }
                    ]
                });
            },
            drawClassChart() {
                if (this.displaytype == 0) return;

                let classChart = echarts.init(document.getElementById('classChart'));
                classChart.clear();

                let cdata = this.classDatas.filter(item => item.classid == this.checkedclassId);
                let gdata = this.classDatas.filter(item => item.classid == "TOTAL");

                let subjectdata = [];
                let classdata = [];
                let gradedata = [];

                let subjects = JSON.parse(JSON.stringify(this.filters.subjects));
                subjects.push({ 'dictvalue':'TOTAL', 'dictname':'总分' });

                if (cdata.length > 0 && gdata.length > 0) {
                    for (var i=0; i<subjects.length; i++) {
                        console.log(cdata[0].subjects);
                        let classdataforsubject = cdata[0].subjects.filter(item => item.subjectid == subjects[i].dictvalue);
                        let gradedataforsubject = gdata[0].subjects.filter(item => item.subjectid == subjects[i].dictvalue);
                        if (classdataforsubject.length > 0 && gradedataforsubject.length > 0) {
                            subjectdata.push(subjects[i].dictname);
                            classdata.push(classdataforsubject[0].score);
                            gradedata.push(gradedataforsubject[0].score);
                        }
                    }
                }

                classChart.setOption({
                    title: {
                        text: '',
                        subtext: ''
                    },
                    legend: {
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data:['班级平均分','年级平均分']
                    },
                    grid:{
                        borderWidth:0,
                        y2: 150
                    },
                    tooltip: {
                        trigger: 'axis',
                        padding: [5,10,5,10],
                        axisPointer: {
                            type: 'shadow'
                        }
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
                        data: subjectdata
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
                            name:'班级平均分',
                            barWidth: 10, 
                            itemStyle:{
                                normal:{
                                    color:'#43a2ff',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            type:'bar',
                            data: classdata
                        },
                        {
                            name:'年级平均分',
                            barWidth: 10, 
                            itemStyle:{
                                normal:{
                                    color:'#2bd3bd',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            type:'bar',
                            data: gradedata
                        }
                    ]
                });
            },
            objectSpanMethod({ row, column, rowIndex, columnIndex }) {
                if (columnIndex == 0) {
                    let subjectData = this.subjectDatas[rowIndex];
                    let sameones = this.subjectDatas.filter(item=>item.subjectid==subjectData.subjectid);
                    if (sameones.length > 0 && sameones.indexOf(subjectData) == 0) {
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
            // http://192.168.12.61:8083/stat/class/subjectavg?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectids=120000000001,120000000002,120000000003,120000000004,120000000005,120000000008&total=1&showmode=0
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
                        this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classid, classes, total, subjects, showmode);
                        this.getSubjectTopScores();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>