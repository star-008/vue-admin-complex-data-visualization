<template>
    <section>
        <sms-stat-filter10 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter10>
        <el-row v-if="filters.examid1!=''&&filters.examid2!=''">
            <el-col :span="24" class="sms-content-title">
                <span>{{this.filters.gradename}} - {{ this.filters.examname1 }}和{{ this.filters.examname2 }} - 班级科目均衡性对比</span>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="checkedsubjectId" @change="drawSubjectChart" style="width:165px" v-if="displaytype == '1'">
                    <el-option v-for="(item, idx) in filters.subjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                </el-select>
                <el-select size="small" v-model="showmode" @change="drawSubjectChart" style="width:165px" v-if="displaytype == '1'">
                    <el-option label="及格率" value="1"></el-option>
                    <el-option label="良好率" value="2"></el-option>
                    <el-option label="低分率" value="3"></el-option>
                </el-select>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:right;">
                <el-radio-group v-model="displaytype" size="small">
                    <el-radio-button label="0">表</el-radio-button>
                    <el-radio-button label="1">图</el-radio-button>
                </el-radio-group>
            </el-col>
            <el-table :data="subjectDatas" border style="width: 100%;" v-show="displaytype == 0" v-loading="listLoading" :span-method="objectSpanMethod">
                <el-table-column label="科目" align="left">
                    <template slot-scope="data">
                        <span>{{ data.row.subjectid=='TOTAL'?'总分':data.row.subject.dictname }}</span>
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
                <el-table-column label="及格人数" align="center">
                    <el-table-column prop="firstexam.passzone.count" :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                    </el-table-column>
                    <el-table-column prop="secondexam.passzone.count" :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                    </el-table-column>
                </el-table-column>
                <el-table-column label="及格率" align="center">
                    <el-table-column :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                        <template slot-scope="data">
                            <span>{{ SMSUtil.formatNumber(data.row.firstexam.passzone.percent, 2) }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                        <template slot-scope="data">
                            <span>{{ SMSUtil.formatNumber(data.row.secondexam.passzone.percent, 2) }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="趋势" align="left" class-name="column-break">
                        <template slot-scope="data">
                            <span :class="{ 'color-red':parseFloat(data.row.firstexam.passzone.percent) > parseFloat(data.row.secondexam.passzone.percent), 
                                            'color-green':parseFloat(data.row.firstexam.passzone.percent) < parseFloat(data.row.secondexam.passzone.percent)}">
                                {{ SMSUtil.formatNumber(parseFloat(data.row.secondexam.passzone.percent) - parseFloat(data.row.firstexam.passzone.percent), 2) }}%
                            </span>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column label="良好人数" align="center">
                    <el-table-column prop="firstexam.goodzone.count" :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                    </el-table-column>
                    <el-table-column prop="secondexam.goodzone.count" :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                    </el-table-column>
                </el-table-column>
                <el-table-column label="良好率" align="center">
                    <el-table-column :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                        <template slot-scope="data">
                            <span>{{ SMSUtil.formatNumber(data.row.firstexam.goodzone.percent, 2) }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                        <template slot-scope="data">
                            <span>{{ SMSUtil.formatNumber(data.row.secondexam.goodzone.percent, 2) }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="趋势" align="left" class-name="column-break">
                        <template slot-scope="data">
                            <span :class="{ 'color-red':parseFloat(data.row.firstexam.goodzone.percent) > parseFloat(data.row.secondexam.goodzone.percent), 
                                            'color-green':parseFloat(data.row.firstexam.goodzone.percent) < parseFloat(data.row.secondexam.goodzone.percent)}">
                                {{ SMSUtil.formatNumber(parseFloat(data.row.secondexam.goodzone.percent) - parseFloat(data.row.firstexam.goodzone.percent), 2) }}%
                            </span>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column label="低分人数" align="center">
                    <el-table-column prop="firstexam.lowzone.count" :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                    </el-table-column>
                    <el-table-column prop="secondexam.lowzone.count" :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                    </el-table-column>
                </el-table-column>
                <el-table-column label="低分率" align="center">
                    <el-table-column :label="filters.examname1" align="left" class-name="column-break" min-width="120">
                        <template slot-scope="data">
                            <span>{{ SMSUtil.formatNumber(data.row.firstexam.lowzone.percent, 2) }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="filters.examname2" align="left" class-name="column-break" min-width="120">
                        <template slot-scope="data">
                            <span>{{ SMSUtil.formatNumber(data.row.secondexam.lowzone.percent, 2) }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="趋势" align="left" class-name="column-break">
                        <template slot-scope="data">
                            <span :class="{ 'color-red':parseFloat(data.row.firstexam.lowzone.percent) > parseFloat(data.row.secondexam.lowzone.percent), 
                                            'color-green':parseFloat(data.row.firstexam.lowzone.percent) < parseFloat(data.row.secondexam.lowzone.percent)}">
                                {{ SMSUtil.formatNumber(parseFloat(data.row.secondexam.lowzone.percent) - parseFloat(data.row.firstexam.lowzone.percent), 2) }}%
                            </span>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>
            <el-col :span="24" v-if="displaytype == 1">
                <div id="subjectChart" class="sms-chart-panel"></div> 
            </el-col>
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import { getExamClassList, getEqualityStatList, exportExqualityStatForCompare } from '../../../../api/api';
    import echarts from 'echarts';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    gradeid: '',
                    gradename: '',
                    classids: [],
                    classes: '',
                    examid1: '',
                    examname1: '',
                    examid2: '',
                    examname2: '',
                    total: true,
                    subjects: []
                },

                displaytype: 0,
                showmode: '1',
                checkedsubjectId: '',
                checkedclasses: [],
                datas: [],
                subjectDatas: [],
                listLoading: false
            };
        },
        methods: {
            onFirstLoad(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, checkedsubjects) {
                this.onSearch(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, checkedsubjects);
            },
            onSearch(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, checkedsubjects) {
                this.setFilter(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, checkedsubjects);
                this.loadData();
            },
            onExport(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, checkedsubjects) {
                this.doExport();
            },
            setFilter(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, checkedsubjects) {
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.classids = JSON.parse(JSON.stringify(classids));
                this.filters.classes = classes;
                this.filters.examid1 = examid1;
                this.filters.examname1 = examname1;
                this.filters.examid2 = examid2;
                this.filters.examname2 = examname2;
                this.filters.total = total;
                this.filters.subjects = checkedsubjects;
                this.checkedsubjectId = '';

                this.checkedclasses = this.filters.classes.filter(item => this.filters.classids.indexOf(item.classid)!=-1);

                if (checkedsubjects.length > 0) {
                    this.checkedsubjectId = checkedsubjects[0].dictvalue;
                }
            },
            loadData() {
                if (this.filters.examid1 == '' || this.filters.examid2 == '') return;

                this.datas = [];

                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter: {
                        gradeid: this.filters.gradeid,
                        examids: [ this.filters.examid1, this.filters.examid2 ],
                        subjectids: this.filters.subjects.map(item => item.dictvalue),
                        classids: SMSUtil.concat(this.filters.classids, [ 'TOTAL' ])
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                }

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

                        this.subjectDatas = this.getSubjectDatas();
                        this.drawSubjectChart();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.total = 0;
                        this.datas = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
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

                this.subjectDatas = [];
                while (subjectdatalist.length > 0) {
                    let subjectdata = subjectdatalist[0];
                    let sameones = [];
                    let samesubjectones = subjectdatalist.filter(item => item.subjectid == subjectdata.subjectid);
                    subjectdatalist = SMSUtil.removeArrayItems(subjectdatalist, samesubjectones);
                    while (samesubjectones.length > 0) {
                        let samesubjectone = samesubjectones[0];
                        let sameclassones = samesubjectones.filter(item => item.classid == samesubjectone.classid);
                        samesubjectones = SMSUtil.removeArrayItems(samesubjectones, sameclassones);
                        if (sameclassones.length == 2) {
                            let sameone = sameclassones[0];
                            if (sameone.examid == this.filters.examid1) {
                                sameone.firstexam = sameclassones[0];
                                sameone.secondexam = sameclassones[1];
                            } else {
                                sameone.firstexam = sameclassones[1];
                                sameone.secondexam = sameclassones[0];
                            }

                            sameones.push(sameone);
                        } else if (sameclassones.length == 1) {
                            let sameone = sameclassones[0];
                            if (sameone.examid == this.filters.examid1) {
                                sameone.firstexam = sameclassones[0];
                                sameone.secondexam = {
                                    passzone: {
                                        count: "0",
                                        percent: "0"
                                    },
                                    goodzone: {
                                        count: "0",
                                        percent: "0"
                                    },
                                    lowzone: {
                                        count: "0",
                                        percent: "0"
                                    },
                                };
                            } else {
                                sameone.firstexam = {
                                    passzone: {
                                        count: "0",
                                        percent: "0"
                                    },
                                    goodzone: {
                                        count: "0",
                                        percent: "0"
                                    },
                                    lowzone: {
                                        count: "0",
                                        percent: "0"
                                    },
                                };
                                sameone.secondexam = sameclassones[0];
                            }

                            sameones.push(sameone);
                        }
                    }
                    let totalOne = sameones.filter(item=>item.classid=='TOTAL');
                    sameones = SMSUtil.removeArrayItems(sameones, totalOne);
                    sameones = SMSUtil.concat(sameones, totalOne);
                    subjectDatas = SMSUtil.concat(subjectDatas, sameones);
                }
                return subjectDatas;
            },
            doExport() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter: {
                        gradeid: this.filters.gradeid,
                        examids: [ this.filters.examid1, this.filters.examid2 ],
                        subjectids: this.filters.subjects.map(item => item.dictvalue),
                        classids: SMSUtil.concat(this.filters.classids, [ 'TOTAL' ])
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                }

                exportExqualityStatForCompare(param).then((res) => {
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
                if (this.displaytype == 0 || this.subjectDatas.length == 0) return;
                
                let subjectChart = echarts.init(document.getElementById('subjectChart'));
                subjectChart.clear();
                let classes = JSON.parse(JSON.stringify(this.checkedclasses));
                let xAxisdata = classes.map(item => SMSUtil.getClassName(item));
                let firstseriesdata = [];
                let secondseriesdata = [];
                let sameones = this.subjectDatas.filter(item => item.subjectid == this.checkedsubjectId);
                for (var i=0; i<classes.length; i++) {
                    let sameone = sameones.filter(item => item.classid == classes[i].classid)[0];
                    if (sameone == undefined) {
                        classes.splice(i, 1);
                        xAxisdata.splice(i, 1);
                        i-= 1;
                        continue;
                    }
                    if (this.showmode == "1") {
                        firstseriesdata.push(sameone.firstexam.passzone.percent);
                        secondseriesdata.push(sameone.secondexam.passzone.percent);
                    } else if (this.showmode == "2") {
                        firstseriesdata.push(sameone.firstexam.goodzone.percent);
                        secondseriesdata.push(sameone.secondexam.goodzone.percent);
                    } else if (this.showmode == "3") {
                        firstseriesdata.push(sameone.firstexam.lowzone.percent);
                        secondseriesdata.push(sameone.secondexam.lowzone.percent);
                    }
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
                        }
                    },
                    legend: {
                        itemWidth: 20,
                        itemHeight: 4,
                        itemGap: 20,
                        data: [this.filters.examname1, this.filters.examname2]
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
                        type: 'value',
                    },
                    series: [
                        {
                            name: this.filters.examname1,
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
                            data: firstseriesdata
                        },
                        {
                            name: this.filters.examname2,
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
                            data: secondseriesdata
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
            // http://192.168.12.61:8083/stat/class/subjectavgcompare?iframe=1&compareexamid1=EX0000000018&compareexamname1=Test1&compareexamid2=EX0000000019&compareexamname2=Test2&gradeid=1&gradename=一年级&subjectids=100000000003&total=1
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
                        this.setFilter(gradeid, gradename, classid, classes, compareexamid1, compareexamname1, compareexamid2, compareexamname2, total, subjects);
                        this.loadData();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        updated: function() {
            this.drawSubjectChart();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .color-red {
        color: red;
    }
    .color-green {
        color: green;
    }
</style>