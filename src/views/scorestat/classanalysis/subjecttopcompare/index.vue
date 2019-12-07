<template>
    <section>
        <sms-stat-filter14 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter14>
        <el-row v-if="filters.examid1!=''&&filters.examid2!=''">
            <el-col :span="24" class="sms-content-title">
                <span>{{filters.gradename}}-班级科目前若干名人数对比</span>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel" style="text-align:left;">
                <el-select size="small" v-model="chartSubjectId" @change="onChangeChartSubject" style="width:120px;float:left;" v-if="displaytype == '1'">
                    <el-option label="总分" value="TOTAL" v-if="filters.total"></el-option>
                    <el-option v-for="(item, idx) in filters.subjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
                </el-select>
                <div style="margin-left:10px;display:inline-block;">
                    前 <el-input type="number" size="small" v-model="topn" style="width: 65px;" @blur="onChangeTopN"></el-input> 名
                    <el-button size="small" type="table-op" @click="loadData" style="margin-left: 10px;">确定</el-button>
                </div>
            </el-col>
            <el-col :span="12" class="sms-content-tool-panel">
                <el-radio-group v-model="displaytype" size="small" style="float:right;margin-left:5px">
                    <el-radio-button label="0">表</el-radio-button>
                    <el-radio-button label="1">图</el-radio-button>
                </el-radio-group>
            </el-col>
            <el-col :span="24">
                <el-table :data="subjectDatas" border style="width: 100%;" v-show="displaytype == '0'" v-loading="listLoading" :span-method="objectSpanMethod">
                    <el-table-column label="学科" align="left">
                        <template slot-scope="data">
                            {{ data.row.subjectid=='TOTAL'?'总分':data.row.subject.dictname }}
                        </template>
                    </el-table-column>
                    <el-table-column label="班级" align="left" :formatter="formatClassName" min-width="120">
                    </el-table-column>
                    <el-table-column prop="totalcount" label="应考人数" align="left">
                    </el-table-column>
                    <el-table-column prop="applycount" label="实考人数" align="left">
                    </el-table-column>
                    <el-table-column prop="classInfo.advisernames" label="班主任" align="left">
                    </el-table-column>
                    <el-table-column prop="teachername" label="任课老师" align="left">
                    </el-table-column>
                    <el-table-column prop="topcount1" :label="filters.examname1" class-name="column-break" align="left" min-width="120">
                    </el-table-column>
                    <el-table-column prop="topcount2" :label="filters.examname2" class-name="column-break" align="left" min-width="120">
                    </el-table-column>
                    <el-table-column label="趋势" align="left">
                        <template slot-scope="data">
                            <span v-if="data.row.diff > 0" style="color: green;">{{data.row.diff}}</span>
                            <span v-if="data.row.diff == 0">{{data.row.diff}}</span>
                            <span v-if="data.row.diff < 0" style="color: red;">{{data.row.diff}}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <el-col :span="24" v-if="displaytype == '1'">
                    <div id="subjectChart" class="sms-chart-panel"></div> 
                </el-col>
            </el-col>
        </el-row>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../../common/js/const';
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import echarts from 'echarts';
    import { getExamClassList, getStudentTopCountStatList, exportStudentTopCountStatForCompare } from '../../../../api/api';

    export default {
        mixins: [ iframe ],
        data() {
            return {
                SMSUtil: SMSUtil,
                filters: {
                    examid1: '',
                    examname1: '',
                    examid2: '',
                    examname2: '',
                    gradeid: '',
                    gradename: '',
                    classids: [],
                    classes: [],
                    subjects: [],
                    total: true,
                },
                displaytype: '0',
                topn: '20',
                chartSubjectId: 'TOTAL',
                checkedclasses: [],
                subjectDatas: [],
                listLoading: false
            };
        },
        methods: {
            formatClassName(row, col) {
                return SMSUtil.getClassName(row.classInfo);
            },
            onFirstLoad(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, subjects) {
                this.onSearch(gradeid, gradename, classids, examid1, examname1, examid2, examname2, total, subjects);
            },
            onSearch(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, subjects) {
                this.setFilter(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, subjects);
                this.loadData();
            },
            onExport(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, subjects) {
                this.doExport();
            },
            setFilter(gradeid, gradename, classids, classes, examid1, examname1, examid2, examname2, total, subjects) {
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.classids = JSON.parse(JSON.stringify(classids));
                this.filters.classes = classes;
                this.filters.examid1 = examid1;
                this.filters.examname1 = examname1;
                this.filters.examid2 = examid2;
                this.filters.examname2 = examname2;
                this.filters.total = total;
                this.filters.subjects = subjects;

                this.checkedclasses = this.filters.classes.filter(item => this.filters.classids.indexOf(item.classid)!=-1);
            },
            loadData() {
                if (this.filters.examid1 == '' || this.filters.examid2 == '') return;

                this.subjectDatas = [];
                
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter:{
                        gradeid: this.filters.gradeid,
                        examids: [ this.filters.examid1, this.filters.examid2 ],
                        subjectids: this.filters.subjects.map(item=>item.dictvalue),
                        topLevelCountList: [ this.topn ],
                        classids: SMSUtil.concat(this.filters.classids, [ 'TOTAL' ])
                    }
                };
                this.chartSubjectId = param.filter.subjectids[0];
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                    this.chartSubjectId = 'TOTAL';
                }

                this.listLoading = true;
                getStudentTopCountStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let allData = res.data.pageInfo.list;
                        let subjectDatas = this.composeSubjectData(allData);
                        this.subjectDatas = this.sortBySubject(subjectDatas);

                        if (this.displaytype == '1') {
                            this.drawSubjectChart();
                        }
                    } else {
                        this.subjectDatas = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.subjectDatas = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            composeSubjectData(allData) {
                let subjectDatas = [];

                while (allData.length > 0) {
                    let subjectClassData = allData[0];
                    let sameone = allData.filter(item=>item.subjectid==subjectClassData.subjectid && item.classid==subjectClassData.classid);
                    subjectClassData.topcount1 = 0;
                    subjectClassData.topcount2 = 0;
                    for (var i=0; i<sameone.length; i++) {
                        if (sameone[i].examid == this.filters.examid1) {
                            subjectClassData.topcount1 = sameone[i].counts[0].value;
                        } else if (sameone[i].examid == this.filters.examid2) {
                            subjectClassData.topcount2 = sameone[i].counts[0].value;
                        }
                    }
                    subjectClassData.diff = subjectClassData.topcount2 - subjectClassData.topcount1;
                    subjectDatas.push(subjectClassData);
                    allData = SMSUtil.removeArrayItems(allData, sameone);
                }

                return subjectDatas;
            },
            sortBySubject(subjectDatas) {
                let result = [];

                while (subjectDatas.length > 0) {
                    let data = subjectDatas[0];
                    let sameone = subjectDatas.filter(item=>item.subjectid==data.subjectid);
                    result = SMSUtil.concat(result, sameone);
                    subjectDatas = SMSUtil.removeArrayItems(subjectDatas, sameone);
                }
                let totalOne = result.filter(item=>item.subjectid=='TOTAL');
                result = SMSUtil.removeArrayItems(result, totalOne);
                result = SMSUtil.concat(result, totalOne);

                return result;
            },
            doExport() {
                let param = {
                    pagination: {
                        pageNo: 1,
                        numPerPage: 65536
                    },
                    filter:{
                        gradeid: this.filters.gradeid,
                        examids: [ this.filters.examid1, this.filters.examid2 ],
                        subjectids: this.filters.subjects.map(item=>item.dictvalue),
                        topLevelCountList: [ this.topn ],
                        classids: SMSUtil.concat(this.filters.classids, [ 'TOTAL' ])
                    }
                };
                this.chartSubjectId = param.filter.subjectids[0];
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                    this.chartSubjectId = 'TOTAL';
                }

                exportStudentTopCountStatForCompare(param).then((res) => {
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
                if (this.displaytype == '0') return;
                
                let classes = JSON.parse(JSON.stringify(this.checkedclasses));
                let exam1Scores = [];
                let exam2Scores = [];
                for (let i=0; i<classes.length; i++) {
                    let examscoreOfClass = this.subjectDatas.filter(item=>item.subjectid==this.chartSubjectId && item.classid==classes[i].classid);

                    if (examscoreOfClass.length == 0) {
                        classes.splice(i, 1);
                        i-= 1;
                    } else {
                        exam1Scores.push(parseInt(examscoreOfClass[0].topcount1));
                        exam2Scores.push(parseInt(examscoreOfClass[0].topcount2));
                    }
                }
                let angle = 0;
                if (classes.length > 6) angle = -45;

                let subjectChart = echarts.init(document.getElementById('subjectChart'));
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
                        borderWidth:0,
                        y2: 150,
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
                            rotate: angle,
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
                        data: classes.map(item=>SMSUtil.getClassName(item))
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
                            data: exam1Scores
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
                            data: exam2Scores
                        }
                    ]
                });
            },
            onChangeTopN() {
                if (isNaN(parseInt(this.topn))) this.topn = '20';
                else if (parseInt(this.topn) < 1) this.topn = '20';
            },
            onChangeChartSubject() {
                this.drawSubjectChart();
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
            // http://192.168.12.61:8083/stat/class/subjecttopcompare?iframe=1&accredit_code=354842CB769A4E486E6282554053FEFA&token=3d293968ba41da54a119fffb3b79f082&access_token=3d293968ba41da54a119fffb3b79f082&compareexamid1=EX0000000018&compareexamname1=Test1&compareexamid2=EX0000000019&compareexamname2=Test2&gradeid=1&gradename=%E4%B8%80%E5%B9%B4%E7%BA%A7&subjectids=100000000003&total=1
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

</style>