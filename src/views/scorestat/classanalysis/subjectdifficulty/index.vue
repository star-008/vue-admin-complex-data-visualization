<template>
    <section>
        <sms-stat-filter7 ref="filter" @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter7>
        <el-row style="margin-bottom:20px;" v-for="(subjectData, index) in subjectDatas" :key="index">            
            <el-col :span="24" style="text-align:center; font-size:15pt; margin-bottom: 20px; margin-top: 40px;" v-if="subjectData.data.length > 0">
                <span>{{filters.gradename}}-{{filters.examname}}--{{ subjectData.data[0].subjectid=='TOTAL'?'总分':subjectData.data[0].subject.dictname }}难度分析</span>
            </el-col>            
            <el-table :data="subjectData.data" border v-loading="listLoading" v-if="subjectData.data.length > 0">
                <el-table-column label="班级" align="left" min-width="120">
                    <template slot-scope="classData">
                        {{ classData.row.classid=='TOTAL'?'年级':SMSUtil.getClassName(classData.row.classInfo) }}
                    </template>
                </el-table-column>
                <el-table-column prop="totalcount" label="总人数" align="left">
                </el-table-column>
                <el-table-column prop="applycount" label="参考人数" align="left">
                </el-table-column>
                <el-table-column prop="maxscore" label="最高分" align="left">
                </el-table-column>
                <el-table-column prop="minscore" label="最低分" align="left">
                </el-table-column>
                <el-table-column label="平均分" align="center">
                    <el-table-column prop="score" label="全体" align="left">
                    </el-table-column>
                    <el-table-column prop="topnscore" label="前27%" align="left">
                    </el-table-column>
                    <el-table-column prop="lastnscore" label="后27%" align="left">
                    </el-table-column>
                </el-table-column>
                <el-table-column prop="diff" label="标准差" align="left">
                </el-table-column>
                <el-table-column label="比率" align="center">
                    <el-table-column prop="fullscorepercent" label="满分" align="left">
                    </el-table-column>
                    <el-table-column label="优秀" align="left">
                        <template slot-scope="classData">
                            {{ classData.row.passzones[0].percent }}
                        </template>
                    </el-table-column>
                    <el-table-column label="良好" align="left">
                        <template slot-scope="classData">
                            {{ classData.row.passzones[1].percent }}
                        </template>
                    </el-table-column>
                    <el-table-column label="及格" align="left">
                        <template slot-scope="classData">
                            {{ classData.row.passzones[2].percent }}
                        </template>
                    </el-table-column>
                    <el-table-column label="低分" align="left">
                        <template slot-scope="classData">
                            {{ classData.row.passzones[3].percent }}
                        </template>
                    </el-table-column>
                    <el-table-column label="超均" align="left">
                        <template slot-scope="data">
                            <span :class="{ 'sc-color-red':parseFloat(data.row.avgscorepercentdiff) < 0}">
                                {{ data.row.avgscorepercentdiff }}
                            </span>
                        </template>
                    </el-table-column>                
                    <el-table-column prop="avgscorepercent" label="比均" align="left">
                    </el-table-column>
                </el-table-column>
                <el-table-column prop="difficulty" label="难度" align="left">
                </el-table-column>
            </el-table>
        </el-row>
    </section>
</template>

<script>
    import { iframe } from '../../../../mixins/iframe';
    import SMSUtil from '../../../../common/js/util';
    import { getSubjectDifficultyStatList, exportSubjectDifficultyStat } from '../../../../api/api';

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
                    total: false,
                    subjects: []
                },

                subjectDatas: [],
                listLoading: false,
            };
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename, total, subjects) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename, total, subjects);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename, total, subjects) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, total, subjects);
                this.loadData();
            },
            onExport(termid, examtypeid, examid, examname, gradeid, gradename, total, subjects) {
                this.doExport();
            },
            setFilter(termid, examtypeid, examid, examname, gradeid, gradename, total, subjects) {
                this.filters.termid = termid;
                this.filters.examtypeid = examtypeid;
                this.filters.examid = examid;
                this.filters.examname = examname;
                this.filters.gradeid = gradeid;
                this.filters.gradename = gradename;
                this.filters.total = total;
                this.filters.subjects = subjects;
            },
            loadData() {
                this.subjectDatas = [];

                let param = {
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectids: this.filters.subjects.map(item=>item.dictvalue)
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.push('TOTAL');
                }

                this.listLoading = true;
                getSubjectDifficultyStatList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let datas = res.data.pageInfo.list;
                        let classDatas = datas.filter(item=>item.classid == 'TOTAL');
                        for (let i=0; i<classDatas.length; i++) {
                            classDatas[i].avgscorepercentdiff = '';
                            classDatas[i].avgscorepercent = '';
                        }
                        if (this.filters.total) {
                            this.subjectDatas.push({ data: datas.filter(item=>item.subjectid=='TOTAL') });
                        }
                        for (let i=0; i<this.filters.subjects.length; i++) {
                            this.subjectDatas.push({ data: datas.filter(item=>item.subjectid==this.filters.subjects[i].dictvalue) });
                        }
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.subjectDatas = [];
                    }
                    this.listLoading = false;
                    this.$refs.filter.loadingDone();
                }).catch((err) => {
                    console.log(err);
                    this.subjectDatas = [];
                    this.listLoading = false;
                    this.$refs.filter.loadingDone();

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            doExport() {
                let param = {
                    filter: {
                        examid: this.filters.examid,
                        gradeid: this.filters.gradeid,
                        subjectids: this.filters.subjects.map(item=>item.dictvalue)
                    }
                };
                if (this.filters.total) {
                    param.filter.subjectids.splice(0, 0, 'TOTAL');
                }
                exportSubjectDifficultyStat(param).then((res) => {
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
            // http://192.168.12.61:8083/stat/class/subjectdifficulty?iframe=1&examid=EX0000000002&examname=2018-2019学年上学期高一10月月考&gradeid=10&gradename=高一&subjectids=120000000001,120000000002,120000000003,120000000004,120000000005,120000000008&total=1
            iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
                this.setFilter(termid, examtypeid, examid, examname, gradeid, gradename, total, subjects);
                this.loadData();
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>