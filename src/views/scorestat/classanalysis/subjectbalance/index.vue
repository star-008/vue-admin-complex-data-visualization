<template>
    <section>
        <sms-stat-filter3 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter3>
        <el-row class="sms-content-title">
            <span>{{filters.gradename}}-{{filters.examname}}--班级科目均衡性分析</span>
        </el-row>
        <el-row>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="checkedsubjectId" @change="drawSubjectChart" style="width:120px;" v-if="filters.showmode == 0 && displaytype == 1">
                    <el-option label="总分" value="TOTAL" v-if="filters.total"></el-option>
                    <el-option v-for="(item, idx) in filters.subjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                </el-select>
                <el-select size="small" v-model="checkedclassId" @change="drawClassChart" style="width:100px" v-if="filters.showmode == 1 && displaytype == 1">
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
                <el-table-column prop="passzone.count" label="及格人数" align="left">
                </el-table-column>
                <el-table-column prop="passzone.percent" label="及格率" align="left">
                </el-table-column>
                <el-table-column prop="goodzone.count" label="良好人数" align="left">
                </el-table-column>
                <el-table-column prop="goodzone.percent" label="良好率" align="left">
                </el-table-column>
                <el-table-column prop="lowzone.count" label="低分人数" align="left">
                </el-table-column>
                <el-table-column prop="lowzone.percent" label="低分率" align="left">
                </el-table-column>
                <!--<el-table-column v-for="(item, idx) in scorezones" :key="idx" :label="item.highscore==null?item.lowscore:(item.highscore + '-' + item.lowscore)" align="left">
                    <template slot-scope="data">
                        <span v-if="data.row.scorezones.length > idx">{{ data.row.scorezones[idx].count }}</span>
                    </template>
                </el-table-column>-->
            </el-table>
        </el-row>
        <el-row v-show="displaytype == 1">
            <div id="subjectChart" class="sms-chart-panel" v-show="filters.showmode == 0"></div>
        </el-row>
        <el-row v-for="(item, idx) in classDatas" :key="idx" :data="item" v-show="filters.showmode == 1 && item.subjects.length > 0">
            <el-table :data="item.subjects" border style="width: 100%; margin-bottom: 20px;" v-if="displaytype == 0" v-loading="listLoading">
                <el-table-column :label="(item.classid=='TOTAL'?'年级':SMSUtil.getClassName(item.classInfo)) + '科目均衡性分析'" align="center" label-class-name="sms-wrap-column sms-big-title">
                    <el-table-column label="科目" align="left">
                        <template slot-scope="data">
                            <span>{{ data.row.subjectid == 'TOTAL'?'总分':data.row.subject.dictname }}</span>
                        </template>
                    </el-table-column>              
                    <el-table-column prop="teachername" label="任课老师" align="left">
                    </el-table-column>
                    <el-table-column prop="totalcount" label="应考人数" align="left">
                    </el-table-column>
                    <el-table-column prop="applycount" label="实考人数" align="left">
                    </el-table-column>
                    <el-table-column prop="fullscore" label="满分" align="left">
                    </el-table-column>
                    <el-table-column prop="maxscore" label="最高分" align="left">
                    </el-table-column>
                    <el-table-column prop="minscore" label="最低分" align="left">
                    </el-table-column>
                    <el-table-column prop="score" label="平均分" align="left">
                    </el-table-column>
                    <el-table-column prop="passzone.count" label="及格人数" align="left">
                    </el-table-column>
                    <el-table-column prop="passzone.percent" label="及格率" align="left">
                    </el-table-column>
                    <el-table-column prop="goodzone.count" label="良好人数" align="left">
                    </el-table-column>
                    <el-table-column prop="goodzone.percent" label="良好率" align="left">
                    </el-table-column>
                    <el-table-column prop="lowzone.count" label="低分人数" align="left">
                    </el-table-column>
                    <el-table-column prop="lowzone.percent" label="低分率" align="left">
                    </el-table-column>
                </el-table-column>
            </el-table>
        </el-row>
        <el-row v-show="displaytype == 1">
            <div id="classChart" class="sms-chart-panel" v-show="filters.showmode == 1"></div>
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import { getEqualityStatList, exportExqualityStat, exportExqualityStatByClass, getExamSubjectScoreList, getExamClassList } from '../../../../api/api';
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
                scorezones: [],
                listLoading: false,
                displaytype: 0,
                checkedclassId: '',
                checkedsubjectId: 'TOTAL',
                checkedclasses: []
            }
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects, showmode);
                this.loadData();
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
                        subjectids:  this.filters.subjects.map(item => item.dictvalue)
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                }

                param.filter.classids = SMSUtil.concat(this.filters.classids, [ 'TOTAL' ]);
                
                this.listLoading = true;
                getEqualityStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.total = res.data.pageInfo.total;
                        this.datas = res.data.pageInfo.list;

                        for (var i=0; i<this.datas.length; i++) {
                            let passzones = this.datas[i].passzones.filter(item => item.level == "4");
                            if (passzones.length > 0)
                                this.datas[i].passzone = passzones[0];

                            let goodzones = this.datas[i].passzones.filter(item => item.level == "2");
                            if (goodzones.length > 0)
                                this.datas[i].goodzone = goodzones[0];

                            let lowzones = this.datas[i].passzones.filter(item => item.level == "5");
                            if (lowzones.length > 0)
                                this.datas[i].lowzone = lowzones[0];
                        }

                        if (this.datas.length > 0)
                            this.scorezones = this.datas[0].scorezones;

                        if (this.filters.showmode == 0){
                            this.getSubjectDatas();
                            this.drawSubjectChart();
                        } else if (this.filters.showmode == 1) {
                            this.getClassDatas();
                            this.drawClassChart();
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
                    let sumofsubject = sameones.filter(item => item.classid == 'TOTAL');
                    sameones = SMSUtil.removeArrayItems(sameones, sumofsubject);
                    sameones = SMSUtil.concat(sameones, sumofsubject);
                    subjectDatas = SMSUtil.concat(subjectDatas, sameones);

                    subjectdatalist = SMSUtil.removeArrayItems(subjectdatalist, sameones);
                }

                this.subjectDatas = SMSUtil.concat(subjectDatas, totalDatas);
            },
            getClassDatas() {
                let classdatalist = this.datas;
                let allClassData = null;
                this.classDatas = [];

                while (classdatalist.length > 0) {
                    let sameones = null;
                    let classdata = null;
                    if (allClassData == null) {
                        sameones = classdatalist.filter(item => item.classid == 'TOTAL');
                        if (sameones.length == 0) {
                            allClassData = -1;
                            continue;
                        }
                        classdata = sameones[0];
                        classdata.subjects = [];
                    } else {
                        classdata = classdatalist[0];
                        classdata.subjects = [];
                        sameones = classdatalist.filter(item => item.classid == classdata.classid);
                    }
                    for (let i=0; i<this.filters.subjects.length; i++) {
                        let subject = this.filters.subjects[i];
                        let subjectdata = sameones.filter(item => item.subjectid == subject.dictvalue);
                        if (subjectdata.length > 0) {
                            classdata.subjects.push(subjectdata[0]);
                        }
                    }
                    let totaldata = sameones.filter(item => item.subjectid == 'TOTAL');
                    if (totaldata.length > 0 && (classdata.classid == 'TOTAL' || (classdata.classInfo != null && classdata.classInfo.classtype == '1'))) {
                        classdata.subjects.push(totaldata[0]);
                    }
                  
                    classdatalist = SMSUtil.removeArrayItems(classdatalist, sameones);
                    if (allClassData == null) {
                        allClassData = classdata;
                    } else {
                        this.classDatas.push(classdata);
                    }
                }
                if (allClassData != -1) {
                    this.classDatas.push(allClassData);
                }
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
                if (this.filters.classids.indexOf('TOTAL') == -1) {
                    param.filter.classids.push('TOTAL');
                }

                let exportFunc = null;
                if (showmode == 0) {
                    exportFunc = exportExqualityStat;
                } else if (showmode == 1) {
                    exportFunc = exportExqualityStatByClass;
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
            drawSubjectChart() {
                if (this.displaytype == 0) return;

                let subjectChart = echarts.init(document.getElementById('subjectChart'));
                subjectChart.clear();
                let xAxisdata = this.checkedclasses.map(item => SMSUtil.getClassName(item));
                let sameones = this.subjectDatas.filter(item => item.subjectid == this.checkedsubjectId);
                if (sameones.length == 0) return;

                let passdata = [];
                let gooddata = [];
                let lowdata = [];

                let renderSubjects = JSON.parse(JSON.stringify(this.filters.subjects));
                renderSubjects.push({dictvalue:'TOTAL'});
                for (var i=0; i<this.checkedclasses.length; i++) {
                    let scores = sameones.filter(item=>item.classid==this.checkedclasses[i].classid);
                    if (scores.length == 0) {
                        passdata.push(0);
                        gooddata.push(0);
                        lowdata.push(0);
                    } else {
                        passdata.push(scores[0].passzones[0].percent);
                        gooddata.push(scores[0].passzones[1].percent);
                        lowdata.push(scores[0].passzones[2].percent);
                    }
                }

                let gradepassdata = [];
                let gradegooddata = [];
                let gradelowdata = [];
                let gradedata = sameones.filter(item => item.classid == "TOTAL");
                if (gradedata.length > 0) {
                    gradepassdata.push(gradedata[0].passzones[0].percent);
                    gradegooddata.push(gradedata[0].passzones[1].percent);
                    gradelowdata.push(gradedata[0].passzones[2].percent);
                }                
                for (var i = 0; i < passdata.length; i++) {
                    gradepassdata.push("0");
                    gradegooddata.push("0");
                    gradelowdata.push("0");
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
                            type: 'shadow'
                        },
                        formatter: function (params) {
                            let tooltiptext = "";
                            if (params.length > 0) {
                                tooltiptext += '班级 : ' + params[0].name;
                                if (params.length > 1) {
                                    tooltiptext += '<br/>' + params[1].seriesName + ' : ' + params[1].value;
                                }

                                if (params.length > 3) {
                                    tooltiptext += '<br/>' + params[3].seriesName + ' : ' + params[3].value;
                                }

                                if (params.length > 5) {
                                    tooltiptext += '<br/>' + params[5].seriesName + ' : ' + params[5].value;
                                }
                            }

                            return tooltiptext;
                        }
                    },
                    legend: {
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data:['及格率','良好率','低分率']
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
                            name:'年级及格率',
                            type:'bar',
                            barWidth: 1, 
                            itemStyle:{
                                normal:{
                                    color:'rgba(0,0,0,0)'
                                }
                            },
                            data: gradepassdata,
                            markLine : {
                                data : [
                                    {type : 'max', name : '年级及格率', itemStyle:{normal:{color:'#43a2ff'}}},
                                ]
                            }
                        },
                        {
                            name: '及格率',
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
                            data: passdata
                        },
                        {
                            name:'年级良好率',
                            type:'bar',
                            barWidth: 1, 
                            itemStyle:{
                                normal:{
                                    color:'rgba(0,0,0,0)'
                                }
                            },
                            data: gradegooddata,
                            markLine : {
                                data : [
                                    {type : 'max', name : '年级良好率', itemStyle:{normal:{color:'#2bd3bd'}}},
                                ]
                            }
                        },
                        {
                            name: '良好率',
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
                            data: gooddata
                        },
                        {
                            name:'年级低分率',
                            type:'bar',
                            barWidth: 1, 
                            itemStyle:{
                                normal:{
                                    color:'rgba(0,0,0,0)'
                                }
                            },
                            data: gradelowdata,
                            markLine : {
                                data : [
                                    {type : 'max', name : '年级低分率', itemStyle:{normal:{color:'#96e388'}}},
                                ]
                            }
                        },
                        {
                            name: '低分率',
                            type: 'bar',
                            barWidth: 10,
                            itemStyle:{
                                normal:{
                                    color:'#96e388',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            data: lowdata
                        }
                    ]
                });
            },
            drawClassChart() {
                if (this.displaytype == 0) return;
              
                let classChart = echarts.init(document.getElementById('classChart'));
                classChart.clear();
                let xAxisdata = this.filters.subjects.map(item => item.dictname);
                xAxisdata.push('总分');
                let sameones = this.classDatas.filter(item => item.classid == this.checkedclassId);
                if (sameones.length == 0) return;

                let passdata = [];
                let gooddata = [];
                let lowdata = [];

                let renderSubjects = JSON.parse(JSON.stringify(this.filters.subjects));
                renderSubjects.push({dictvalue:'TOTAL'});
                for (var i=0; i<renderSubjects.length; i++) {
                    let scores = sameones[0].subjects.filter(item=>item.subjectid==renderSubjects[i].dictvalue);
                    if (scores.length == 0) {
                        passdata.push(0);
                        gooddata.push(0);
                        lowdata.push(0);
                    } else {
                        passdata.push(scores[0].passzones[0].percent);
                        gooddata.push(scores[0].passzones[1].percent);
                        lowdata.push(scores[0].passzones[2].percent);
                    }
                }
                
                let checkedclassname = SMSUtil.getClassName(this.checkedclasses.filter(item => item.classid == this.checkedclassId)[0]);
                classChart.setOption({
                    title: {
                        text: '',
                        subtext: ''
                    },
                    legend: {
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data:['及格率','良好率','低分率']
                    },
                    grid:{
                        borderWidth:0
                    },
                    tooltip : {
                        trigger: 'axis',
                        padding: [5,10,5,10],
                        axisPointer:{
                            show: true,
                            type : 'shadow',
                            lineStyle: {
                                type : 'dashed',
                                width : 1
                            }
                        },
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
                    series: [
                        {
                            name: '及格率',
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
                            data: passdata
                        },
                        {
                            name: '良好率',
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
                            data: gooddata
                        },
                        {
                            name: '低分率',
                            type: 'bar',
                            barWidth: 10,
                            itemStyle:{
                                normal:{
                                    color:'#96e388',
                                    barBorderRadius:[2,2,2,2]
                                },
                                emphasis:{
                                }
                            },
                            data: lowdata
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
            // http://192.168.12.61:8083/stat/class/subjectbalance?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectids=120000000001,120000000002,120000000003,120000000004,120000000005,120000000008&total=1&showmode=1
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
                        this.loadData();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        updated: function() {
            if (this.filters.showmode == 0) {
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