<template>
    <section>
        <sms-stat-filter13 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter13>
        <el-row class="sms-content-title">
            <span>{{filters.gradename}}-{{filters.examname}}--班级科目分段统计</span>
        </el-row>
        <el-row>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="searchtype" style="width:100px" v-if="displaytype == 1">
                    <el-option label="按科目" value="0"></el-option>
                    <el-option label="按班级" value="1"></el-option>
                </el-select>
                <el-select size="small" v-model="checkedsubjectId" @change="drawSubjectChart" style="width:120px;" v-if="displaytype == 1 && searchtype == '0'">
                    <el-option label="总分" value="TOTAL" v-if="filters.total"></el-option>
                    <el-option v-for="(item, idx) in filters.subjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                </el-select>
                <el-select size="small" v-model="checkedclassId" @change="drawClassChart" style="width:100px" v-if="displaytype == 1 && searchtype == '1'">
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
        <el-table :data="subjectDatas" border style="width: 100%;" v-show="displaytype == 0" v-loading="listLoading" :span-method="objectSpanMethod">
            <el-table-column label="科目" align="left" width="100">                
                  <template slot-scope="data">
                        <span>{{ data.row.subjectid == 'TOTAL'?'总分':data.row.subject.dictname }}</span>
                  </template>
              </el-table-column>
            <el-table-column label="班级" align="left" width="120">
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
            <el-table-column v-for="(item, idx) in ScoreGrades" :key="idx" :data="item" :label="item.dictname" align="center">
                <el-table-column label="人数" align="left">
                    <template slot-scope="data">
                        <span>{{ data.row.zones[idx].count }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="占比" align="left">
                    <template slot-scope="data">
                        <span>{{ data.row.zones[idx].percent }}</span>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
        <el-row v-show="displaytype == 1">
            <div id="subjectChart" class="sms-chart-panel" v-show="searchtype == '0'"></div>
            <div id="classChart" class="sms-chart-panel" v-show="searchtype == '1'"></div>
        </el-row>
    </section>
</template>

<script>
    import { SCORE_GRADE, CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import echarts from 'echarts';
    import { getLevelZoneStatList, exportLevelZoneStat, getExamClassList } from '../../../../api/api';

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
                    subjects: []
                },

                datas: [],
                displaytype: 0,
                subjectDatas: [],
                listLoading: false,
                checkedsubjectId: 'TOTAL',
                checkedclassId: '',
                checkedclasses: [],
                searchtype: '0',
                ScoreGrades: SCORE_GRADE
            };
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects);
                this.loadData();
            },
            onExport(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects) {                
                this.doExport();
            },
            setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects) {
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

                this.checkedsubjectId = 'TOTAL';
                this.checkedclassId = '';
                
                if (!this.filters.total && subjects.length > 0)
                    this.checkedsubjectId = subjects[0].dictvalue;
                this.checkedclasses = this.filters.classes.filter(item => this.filters.classids.indexOf(item.classid)!=-1);
                this.checkedclassId = this.checkedclasses[0].classid;
            },
            loadData() {
                this.datas = [];
                if (this.filters.examid == '' || this.filters.gradeid == '') return;

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
                
                this.listLoading = true;
                getLevelZoneStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.total = res.data.pageInfo.total;
                        this.datas = res.data.pageInfo.list;

                        for (var i = 0; i < this.datas.length; i++) {
                            this.datas[i].zones = [];
                            for (var j = 0; j < this.ScoreGrades.length; j++) {
                                let sameones = this.datas[i].levelzones.filter(item => item.level == this.ScoreGrades[j].dictvalue);
                                if (sameones.length > 0)
                                    this.datas[i].zones.push(sameones[0]);
                                else 
                                    this.datas[i].zones.push({});
                            }
                        }
                        this.getSubjectDatas();
                        if (this.displaytype == 1) 
                        {
                            if (this.searchtype == '0') {
                                this.drawSubjectChart();
                            } else {
                                this.drawClassChart();
                            }
                        }
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
                    subjectDatas = SMSUtil.concat(subjectDatas, sameones);

                    subjectdatalist = SMSUtil.removeArrayItems(subjectdatalist, sameones);
                }

                this.subjectDatas = SMSUtil.concat(subjectDatas, totalDatas);
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
                        subjectids:  this.filters.subjects.map(item => item.dictvalue),
                        classids: this.filters.classids
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                }

                exportLevelZoneStat(param).then((res) => {
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
            drawSubjectChart() {
                if (this.displaytype == 0) return;

                let subjectChart = echarts.init(document.getElementById('subjectChart'));
                subjectChart.clear();
                let legenddata = this.ScoreGrades.map(item => item.dictname);
                let xAxisdata = this.checkedclasses.map(item => SMSUtil.getClassName(item));
                let seriesdata = [];
                let sameones = this.subjectDatas.filter(item => item.subjectid == this.checkedsubjectId);
                if (sameones.length == 0) return;

                let colors = ['#43a2ff', '#2bd3bd', '#96e388', '#fecd63', '#ffa286', '#fb6c84'];
                for (var i=0; i<legenddata.length; i++) {
                    let seriesone = {
                        name: legenddata[i],
                        type: 'bar',
                        barWidth: 10,
                        itemStyle:{
                            normal:{
                                color:colors[i%6],
                                barBorderRadius:[2,2,2,2]
                            },
                            emphasis:{
                            }
                        },
                        data: []
                    };
                    for (var j=0; j<xAxisdata.length; j++) {
                        let sameone = sameones.filter(item => SMSUtil.getClassName(item.classInfo) == xAxisdata[j]);
                        if (sameone.length > 0) {
                            if (sameone[0].zones[i].percent == null) {
                                seriesone.data.push("-");
                            } else {
                                seriesone.data.push(sameone[0].zones[i].percent);
                            }                            
                        } else {
                            xAxisdata.splice(j, 1);
                            j--;
                        }
                    }

                    seriesdata.push(seriesone);
                }

                subjectChart.setOption({
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
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data: legenddata
                    },
                    grid:{
                        borderWidth:0,
                        y2: 150
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
                    series: seriesdata
                });
            },
            drawClassChart() {
                if (this.displaytype == 0) return;
                
                let classChart = echarts.init(document.getElementById('classChart'));
                classChart.clear();
                let legenddata = this.ScoreGrades.map(item => item.dictname);
                let xAxisdata = this.filters.subjects.map(item => item.dictname);
                xAxisdata.push('总分');
                let seriesdata = [];

                let sameones = this.subjectDatas.filter(item => item.classid == this.checkedclassId);
                if (sameones.length == 0)
                    return;

                let colors = ['#43a2ff', '#2bd3bd', '#96e388', '#fecd63', '#ffa286', '#fb6c84'];
                for (var i=0; i<legenddata.length; i++) {
                    let seriesone = {
                        name: legenddata[i],
                        type: 'bar',
                        barWidth: 10,
                        stack: 'one',
                        itemStyle:{
                            normal:{
                                color:colors[i%6],
                                barBorderRadius:[2,2,2,2]
                            },
                            emphasis:{
                            }
                        },
                        data: []
                    };
                    for (var j = 0; j < xAxisdata.length; j++) {
                        let sameone = [];
                        if (xAxisdata[j] == '总分') {
                            sameone = sameones.filter(item => item.subjectid == 'TOTAL');
                        } else {
                            sameone = sameones.filter(item => item.subjectid != 'TOTAL' && item.subject.dictname == xAxisdata[j]);
                        }
                        if (sameone.length > 0) {
                            if (sameone[0].zones[i].count == null) {
                                seriesone.data.push("-");
                            } else {
                                seriesone.data.push(sameone[0].zones[i].count);
                            }
                        } else {
                            xAxisdata.splice(j, 1);
                            j--;
                        }
                    }

                    seriesdata.push(seriesone);
                }

                classChart.setOption({
                    title: {
                        text: '',
                        subtext: ''
                    },
                    tooltip: {
                        trigger: 'axis',
                        padding: [5,10,5,10],
                        axisPointer:{
                            show: true,
                            type : 'shadow',
                            lineStyle: {
                                type : 'dashed',
                                width : 1
                            }
                        }
                    },
                    legend: {
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data: legenddata
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
                        data: xAxisdata
                    },
                    yAxis: {
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
                    },
                    series: seriesdata
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
            // http://192.168.12.61:8083/stat/class/subjectscoreline?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectids=120000000001,120000000002,120000000003,120000000004,120000000005,120000000008&total=1
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
                        this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classid, classes, total, subjects);
                        this.loadData();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        updated: function() {
            if (this.searchtype == '0') {
                this.drawSubjectChart();
            } else {
                this.drawClassChart();
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>