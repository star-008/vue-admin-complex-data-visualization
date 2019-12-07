<template>
    <section>
        <sms-stat-filter4 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter4>
        <el-row :span="24" class="sms-content-title">
            <span>{{filters.gradename}}-{{filters.examname}}--班级科目年级前若干名统计</span>
        </el-row>
        <el-row>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="checkedsubjectid" @change="onChangeCheckedSubject" style="width:120px;" v-if="displaytype == 1">
                    <el-option label="总分" value="TOTAL" v-if="filters.totalmode"></el-option>
                    <el-option v-for="(item, idx) in filters.checkedsubjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                </el-select>
                <el-select size="small" v-model="fronttype" @change="onChangeFronttype" style="width: 95px;" v-if="displaytype == 1">
                    <el-option v-for="(item, idx) in frontarray" :key="idx" :label="item.name" :value="item.value"></el-option>
                </el-select>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align: right;">
                <el-radio-group v-model="displaytype" size="small" @change="onChangeDisplaytype">
                    <el-radio-button label="0">表</el-radio-button>
                    <el-radio-button label="1">图</el-radio-button>
                </el-radio-group>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="classdata" border style="width: 100%" v-show="displaytype == 0" v-loading="listLoading" :span-method="objectSpanMethod">
                <el-table-column label="班级名称" align="left" :formatter="formatClassName" :min-width="150">
                </el-table-column>
                <el-table-column label="类别" align="left" :formatter="formatStatTypeName" :min-width="150">
                </el-table-column>
                <el-table-column v-for="(item, idx) in filters.checkedsubjects" :label="item.dictname" :key="idx" align="left">
                    <template slot-scope="data">
                        {{ data.row.subjects[idx] }}
                    </template>
                </el-table-column>
                <el-table-column label="总分" v-if="filters.totalmode" align="left">
                    <template slot-scope="data">
                        {{ data.row.subjects[filters.checkedsubjects.length] }}
                    </template>
                </el-table-column>
            </el-table>
            <el-col :span="24" v-show="displaytype == 1">
                <div id="classChart" class="sms-chart-panel"></div> 
            </el-col>
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import echarts from 'echarts';
    import { getAnalysisConfig, getStudentTopCountStatList, exportStudentTopCountStat, getExamClassList } from '../../../../api/api';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    termid: '',
                    examtypeid:'',
                    examid: '',
                    examname: '',
                    gradeid: '',
                    gradename: '',
                    classids: [],
                    totalmode: true,
                    checkedsubjects: [],
                    classes:[]
                },
                displaytype: 0,
                fronttype: '',
                classChart: null,
                frontarray: [],
                checkedsubjectid:'TOTAL',
                checkedsubjectids:[],

                studentcountstatlist: [],
                studentcountstatbyclass: [],

                listLoading: false,
                classdata: [],
                chartxAxisdata: [],
                chartseriesdata: []
            };
        },
        methods: {
            formatClassName(row, col) {
                return SMSUtil.getClassName(row.classInfo);
            },
            objectSpanMethod({row, column, rowIndex, columnIndex}) {
                if (columnIndex == 0) {
                    let classInfo = this.classdata[rowIndex];
                    let sameones = this.classdata.filter(item=>item.classid==classInfo.classid);
                    if (sameones.length > 0 && sameones.indexOf(classInfo) == 0) {
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
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, classids, classes, total, subjects);
                this.load();
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
                this.filters.checkedsubjects = subjects;
                this.filters.totalmode = total;
            },
            load() {
                this.getCheckedSubjectIds();
                this.getAnalysisConfigList();
                this.getStudentCountStatList();
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
                        classids: this.filters.classids,
                        subjectids: this.checkedsubjectids
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids = SMSUtil.concat(param.filter.subjectids, ['TOTAL'])
                }

                exportStudentTopCountStat(param).then((res) => {
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
                if (row.statType == 'average') return '班平均分';
                if (row.statType == 'gradeorder') return '班平均分年级排名';
                if (row.statType == 'gradeavg') return '年级平均分';
                if (row.statType == 'top') return '年级前' + row.statLevel + '名人数';
                if (row.statType == 'last') return '年级后' + row.statLevel + '名人数';
                return '';
            },
            getStudentCountStatList() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter:{
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectids: SMSUtil.concat(this.checkedsubjectids, ['TOTAL']),
                        classids: this.filters.classids
                    }
                };

                this.studentcountstatlist = [];
                this.studentcountstatbyclass = [];
                this.classdata = [];
                this.listLoading = true;
                getStudentTopCountStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.studentcountstatlist = res.data.pageInfo.list;
                        this.studentcountstatbyclass = this.getStudentCountStatByClass(this.studentcountstatlist);
                        this.classdata = this.getStudentCountStatBySubject(this.studentcountstatbyclass);
                        this.getChartData();
                    } else {
                        this.classdata = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.classdata = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            getStudentCountStatByClass(studentcountlist) {
                let templist = JSON.parse(JSON.stringify(studentcountlist));
                let result = [];

                while(templist.length > 0) {
                    let studentcountstat = templist[0];
                    let sameclass = templist.filter(item => item.classid == studentcountstat.classid);
                    result.push(sameclass);
                    templist = SMSUtil.removeArrayItems(templist, sameclass);
                }
                return result;
            },
            getStudentCountStatBySubject(countstatlistbyclass) {
                let result = [];

                for (var i=0; i<countstatlistbyclass.length; i++) {
                    let classdata = countstatlistbyclass[i];
                    if (classdata.length == 0) continue;

                    let resultforoneclass = [];
                    resultforoneclass.push({
                        classid: classdata[0].classid,
                        classInfo: classdata[0].classInfo,
                        statType: 'average',
                        subjects: []
                    });
                    resultforoneclass.push({
                        classid: classdata[0].classid,
                        classInfo: classdata[0].classInfo,
                        statType: 'gradeorder',
                        subjects: []
                    });
                    resultforoneclass.push({
                        classid: classdata[0].classid,
                        classInfo: classdata[0].classInfo,
                        statType: 'gradeavg',
                        subjects: []
                    });

                    for (var j=0; j<classdata[0].counts.length; j++) {
                        let stattypename = '';
                        resultforoneclass.push({
                            classid: classdata[0].classid,
                            classInfo: classdata[0].classInfo,
                            statType: classdata[0].counts[j].type,
                            statLevel: classdata[0].counts[j].level,
                            subjects: []
                        });
                    }

                    for (let j=0; j<this.filters.checkedsubjects.length; j++) {
                        let subject = this.filters.checkedsubjects[j];
                        this.fillResultForSubject(classdata, resultforoneclass, subject.dictvalue);
                    }
                    if (this.filters.totalmode) {
                        this.fillResultForSubject(classdata, resultforoneclass, 'TOTAL');
                    }

                    result = SMSUtil.concat(result, resultforoneclass);
                }

                return result;
            },
            fillResultForSubject(classdata, resultforoneclass, subjectid) {
                let sameone = classdata.filter(item => item.subjectid == subjectid);
                if (sameone.length == 0) {
                    for (var k=0; k<resultforoneclass.length; k++) {
                        resultforoneclass[k].subjects.push('');
                    }
                } else {
                    resultforoneclass[0].subjects.push(sameone[0].score);
                    resultforoneclass[1].subjects.push(sameone[0].rank);
                    resultforoneclass[2].subjects.push(sameone[0].avgscore);

                    for (var k=3; k<resultforoneclass.length; k++) {
                        let countval = sameone[0].counts.filter(item => item.type == resultforoneclass[k].statType && item.level == resultforoneclass[k].statLevel);
                        if (countval.length == 0) {
                            resultforoneclass[k].subjects.push('');
                        } else {
                            resultforoneclass[k].subjects.push(countval[0].value);
                        }
                    }
                }
            },
            getCheckedSubjectIds() {
                this.checkedsubjectids = [];

                if (this.filters.checkedsubjects.length > 0) {
                    this.checkedsubjectids = this.filters.checkedsubjects.map(item => item.dictvalue);

                    if (!this.filters.totalmode)
                        this.checkedsubjectid = this.checkedsubjectids[0];
                    else
                        this.checkedsubjectid = 'TOTAL';
                }
            },
            getAnalysisConfigList() {
                let param = {
                    conditions:[
                        {
                            fieldName: 'examid',
                            fieldValues: [this.filters.examid],
                            operator: 'EQUAL'   
                        }
                    ]
                };

                this.frontarray = [];
                this.fronttype = '';

                getAnalysisConfig(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let analysislist = res.data.pageInfo.list;
                        let tempfrontarray = [];
                        if (analysislist.length > 0)
                            tempfrontarray = analysislist[0].gradetopcount.split(',');
                        else
                            this.frontarray = [];

                        if (tempfrontarray.length > 0)
                            this.joinSting(tempfrontarray);
                        else
                            this.frontarray = [];
                    } else {
                        this.frontarray = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.frontarray = [];
                });
            },
            joinSting(tempfrontarray) {
                for (var i=0; i<tempfrontarray.length; i++) {
                    let front = { value:'', name:'' };
                    front.value = tempfrontarray[i];
                    front.name = '前'+tempfrontarray[i]+'名';
                    this.frontarray.push(front);
                }
                this.fronttype = this.frontarray[0].value;
            },
            onChangeCheckedSubject() {
                this.getChartData();
            },
            onChangeFronttype() {
                this.getChartData();
            },
            onChangeDisplaytype() {
                this.getChartData();
            },
            getChartData() {
                this.chartxAxisdata = [];
                this.chartseriesdata = [];

                let templist = [];
                let frontcounts = [];

                if (this.displaytype == 1) {
                    templist = this.studentcountstatlist.filter(item => item.subjectid == this.checkedsubjectid);

                    this.chartxAxisdata = templist.map(item => SMSUtil.getClassName(item.classInfo));
                    for (var i=0; i<templist.length; i++) {
                        frontcounts = SMSUtil.concat(frontcounts, templist[i].counts);
                    }

                    let frontlist = frontcounts.filter(item => item.type == 'top' && item.level == this.fronttype);
                    this.chartseriesdata = frontlist.map(item => item.value);
                }
                this.drawClassChart();
            },
            drawClassChart() {
                if (this.displaytype == 0) return;
                
                let _this = this;
                this.$nextTick(function() {
                    _this.classChart = echarts.init(document.getElementById('classChart'));
                    _this.classChart.setOption({
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
                            type: 'category',
                            data: _this.chartxAxisdata
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
                        series: [{
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
                            data: _this.chartseriesdata
                        }]
                    });
                });
            },
            // http://192.168.12.61:8083/stat/class/subjecttop?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectids=120000000001,120000000002,120000000003,120000000004,120000000005,120000000008&total=1
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
                        this.load();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        updated: function() {
            this.drawClassChart();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';
</style>
