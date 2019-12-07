<template>
    <section class="vscroll">
        <sms-stat-filter10 @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter10>
        <el-col :span="24" style="text-align:center; font-size:15pt;">
            <span>{{this.gradename}} - {{ this.firexamtitle }}和{{ this.secexamtitle }} - 班级科目均分排位对比</span>
        </el-col>
        <el-col :span="24" class="sms-content-panel" style="text-align:right;">
            <el-radio-group v-model="displaytype" size="small">
              <el-radio-button label="0">表</el-radio-button>
              <el-radio-button label="1">图</el-radio-button>
            </el-radio-group>
        </el-col>
        <el-col v-if="displaytype == '1'" :span="24" style="text-align:right;">
            <el-select size="small" v-model="checkedsubjectId" @change="onChangeSubject" style="width:165px">
                <el-option label="总分" value="" v-if="totalsubject"></el-option>
                <el-option v-for="(item, idx) in checkedsubjects" :label="item.dictname" :value="item.dictvalue" :key="idx"></el-option>
            </el-select>
        </el-col>
        <el-col :span="24">
            <el-table :data="subjectdata" border style="width: 100%;" v-if="displaytype == 0">
              <el-table-column prop="subject" label="学科" align="center">
              </el-table-column>
              <el-table-column prop="class" label="班级" align="center">
              </el-table-column>
              <el-table-column prop="totalnum" label="应考人数" align="center">
              </el-table-column>
              <el-table-column prop="realnum" label="实考人数" align="center">
              </el-table-column>
              <el-table-column prop="classteacher" label="班主任" align="center">
              </el-table-column>
              <el-table-column prop="subteacher" label="任课老师" align="center">
              </el-table-column>
              <el-table-column label="上学期季考" align="center">
                <el-table-column prop="firhalf.averscore" label="平均分" align="center">
                </el-table-column>
                <el-table-column prop="firhalf.diffscore" label="差距" align="center">
                </el-table-column>
                <el-table-column prop="firhalf.rank" label="排位" align="center">
                </el-table-column>
              </el-table-column>
              <el-table-column label="下学期季考" align="center">
                <el-table-column prop="sechalf.averscore" label="平均分" align="center">
                </el-table-column>
                <el-table-column prop="sechalf.diffscore" label="差距" align="center">
                </el-table-column>
                <el-table-column prop="sechalf.rank" label="排位" align="center">
                </el-table-column>
              </el-table-column>
              <el-table-column label="排位趋势" align="center">
                <template slot-scope="data">
                    <span :class="{ 'color-red':parseInt(data.row.firhalf.rank) < parseInt(data.row.sechalf.rank), 'color-green':parseInt(data.row.firhalf.rank) > parseInt(data.row.sechalf.rank)}">{{ data.row.diff }}</span>
                </template>
              </el-table-column>
            </el-table>
            <el-col :span="24" v-if="displaytype == 1">
                <div id="subjectChart" style="width:100%; height: 400px"></div> 
            </el-col>
        </el-col>
        
    </section>
</template>

<script>
    import {  } from '../../../../api/api';
    import echarts from 'echarts';

    export default {
        data() {
            return {
                displaytype: 0,
                gradename: '',
                checkedsubjectId: '',
                totalsubject: true,
                subjectdata: [],
                firexamtitle: '2017-2018学年上学期季考',
                secexamtitle: '2017-2018学年下学期季考'
            };
        },
        methods: {
            onFirstLoad(gradeid, gradename, classid, examid1, examid2, total, checkedsubjects) {
              this.onSearch(gradeid, gradename, classid, examid1, examid2, total, checkedsubjects);    
            },
            onSearch(gradeid, gradename, classid, examid1, examid2, total, checkedsubjects) {
                this.gradename = gradename;
                this.checkedsubjects = checkedsubjects;
                this.totalsubject = total;
            },
            onExport(grade, classid, examid1, examid2, total, checkedsubjects) {

            },
            loadSubjectdata() {
                this.subjectdata = [
                    {
                      subject: '英文',
                      class: '1学年1班',
                      totalnum: 47,
                      realnum: 47,
                      classteacher: '王兄奔',
                      subteacher:'张谆',
                      firhalf: {
                        averscore: '88.64',
                        diffscore: '0.54',
                        rank: '3'
                      },
                      sechalf: {
                        averscore: '87.72',
                        diffscore: '0.22',
                        rank: '3'
                      },
                      diff: '0'
                    },
                    {
                      subject: '英文',
                      class: '1学年2班',
                      totalnum: 47,
                      realnum: 47,
                      classteacher: '王兄奔',
                      subteacher:'张谆',
                      firhalf: {
                        averscore: '89.21',
                        diffscore: '0.42',
                        rank: '2'
                      },
                      sechalf: {
                        averscore: '89.52',
                        diffscore: '0.23',
                        rank: '1'
                      },
                      diff: '1'
                    },
                    {
                      subject: '英文',
                      class: '1学年3班',
                      totalnum: 47,
                      realnum: 47,
                      classteacher: '王兄奔',
                      subteacher:'张谆',
                      firhalf: {
                        averscore: '87.64',
                        diffscore: '0.46',
                        rank: '4'
                      },
                      sechalf: {
                        averscore: '86.36',
                        diffscore: '0.67',
                        rank: '5'
                      },
                      diff: '-1'
                    },
                    {
                      subject: '英文',
                      class: '1学年4班',
                      totalnum: 47,
                      realnum: 47,
                      classteacher: '王兄奔',
                      subteacher:'张谆',firhalf: {
                        averscore: '88.64',
                        diffscore: '0.54',
                        rank: '3'
                      },
                      sechalf: {
                        averscore: '87.72',
                        diffscore: '0.22',
                        rank: '3'
                      },
                      diff: '0'
                    },
                    {
                      subject: '英文',
                      class: '1学年5班',
                      totalnum: 47,
                      realnum: 47,
                      classteacher: '王兄奔',
                      subteacher:'张谆',
                      firhalf: {
                        averscore: '88.64',
                        diffscore: '0.54',
                        rank: '3'
                      },
                      sechalf: {
                        averscore: '87.72',
                        diffscore: '0.22',
                        rank: '3'
                      },
                      diff: '0'
                    }
                ];
            },            
            drawSubjectChart() {
                if (this.displaytype == 0) return;
                
                let subjectChart = echarts.init(document.getElementById('subjectChart'));
                subjectChart.clear();
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
                        data: [this.firexamtitle, this.secexamtitle]
                    },
                    grid: {
                        left: '1%',
                        right: '2%',
                        bottom: '1%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: ['1年级 1班', '1年级 2班', '1年级 3班', '1年级 4班','1年级 5班']
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, 0.01]
                    },
                    series: [
                        {
                            name: this.firexamtitle,
                            type: 'bar',
                            data: ['100', '100', '98', '98', '98']
                        },
                        {
                            name: this.secexamtitle,
                            type: 'bar',
                            data: ['100', '96', '98', '98', '98']
                        }
                    ]
                });
            },
            onChangeSubject() {

            },
        },
        created() {
            this.loadSubjectdata();
        },
        mounted: function() {
            this.drawSubjectChart();
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