<template>
    <section class="vscroll">
        <sms-stat-filter8 @search="onSearch" @export="onExport" @first-load="onFirstLoad"></sms-stat-filter8>
        <el-col :span="24" style="text-align:center; font-size:15pt; margin-bottom: 20px;">
            <span>{{gradename}}-{{examname}}-科目总体分析</span>
        </el-col>
        <el-table :data="subjectDatas" border style="width: 100%;" v-loading="listLoading">
            <el-table-column prop="subject" label="科目" align="left">
            </el-table-column>
            <el-table-column prop="totalcnt" label="总人数" align="left">
            </el-table-column>
            <el-table-column prop="partincnt" label="参考人数" align="left">
            </el-table-column>
            <el-table-column label="平均分" align="center">
                <el-table-column prop="averscore.total" label="全体" align="left">
                </el-table-column>
                <el-table-column prop="averscore.front" label="前27%" align="left">
                </el-table-column>
                <el-table-column prop="averscore.back" label="后27%" align="left">
                </el-table-column>
            </el-table-column>
            <el-table-column prop="stantarddiff" label="标准差" align="left">
            </el-table-column>
            <el-table-column label="比率" align="center">
                <el-table-column prop="rate.full" label="满分" align="left">
                </el-table-column>
                <el-table-column prop="rate.excellent" label="优秀" align="left">
                </el-table-column>
                <el-table-column prop="rate.good" label="良好" align="left">
                </el-table-column>
                <el-table-column prop="rate.success" label="及格" align="left">
                </el-table-column>
                <el-table-column prop="rate.low" label="低分" align="left">
                </el-table-column>
                <el-table-column prop="rate.overaver" label="超均" align="left">
                </el-table-column>
                <el-table-column prop="rate.inaver" label="比均" align="left">
                </el-table-column>
            </el-table-column>
            <el-table-column prop="diff" label="难度" align="left">
            </el-table-column>
            <el-table-column prop="division" label="区分度" align="left">
            </el-table-column>
        </el-table>
    </section>
</template>

<script>
    import {  } from '../../../../api/api';

    export default {
        data() {
            return {
                filters: {
                    termid:'',
                    examtypeid: '',
                    examid: '',
                    gradeid: '',
                },

                subjectDatas: [],
                listLoading: false,

                examname:'',
                gradename:''
            };
        },
        methods: {
            onFirstLoad(termid, examtypeid, examid, examname, gradeid, gradename) {
                this.onSearch(termid, examtypeid, examid, examname, gradeid, gradename);
            },
            onSearch(termid, examtypeid, examid, examname, gradeid, gradename) {
                this.filters.termid = termid;
                this.filters.examtypeid = examtypeid;
                this.filters.examid = examid;
                this.filters.gradeid = gradeid;
                this.loadData();

                this.examname = examname;
                this.gradename = gradename;
            },
            onExport(termid, examtypeid, examid, gradeid) {

            },
            loadData() {
                this.subjectDatas = [
                    {
                        subject: '语文',
                        totalcnt: '326',
                        partincnt: '325',
                        maxscore: '89.5',
                        minscore: '9.5',
                        averscore: {
                            total: '65.3',
                            front: '78.5',
                            back: '48.8'
                        },
                        stantarddiff: '12.74',
                        rate: {
                            full: '0',
                            excellent: '27.9',
                            good: '41.5',
                            success: '75.6',
                            low: '5.2',
                            overaver: '15.3',
                            inaver: '74.7'

                        },
                        diff: '0.65',
                        division: '0.3'
                    },
                    {
                        subject: '数学',
                        totalcnt: '326',
                        partincnt: '325',
                        maxscore: '89.5',
                        minscore: '9.5',
                        averscore: {
                            total: '65.3',
                            front: '78.5',
                            back: '48.8'
                        },
                        stantarddiff: '12.74',
                        rate: {
                            full: '0',
                            excellent: '27.9',
                            good: '41.5',
                            success: '75.6',
                            low: '5.2',
                            overaver: '15.3',
                            inaver: '74.7'

                        },
                        diff: '0.65',
                        division: '0.3'
                    },
                    {
                        subject: '英文',
                        totalcnt: '326',
                        partincnt: '325',
                        maxscore: '89.5',
                        minscore: '9.5',
                        averscore: {
                            total: '65.3',
                            front: '78.5',
                            back: '48.8'
                        },
                        stantarddiff: '12.74',
                        rate: {
                            full: '0',
                            excellent: '27.9',
                            good: '41.5',
                            success: '75.6',
                            low: '5.2',
                            overaver: '15.3',
                            inaver: '74.7'
                        },
                        diff: '0.65',
                        division: '0.3'
                    },
                    {
                        subject: '物理',
                        totalcnt: '326',
                        partincnt: '325',
                        maxscore: '89.5',
                        minscore: '9.5',
                        averscore: {
                            total: '65.3',
                            front: '78.5',
                            back: '48.8'
                        },
                        stantarddiff: '12.74',
                        rate: {
                            full: '0',
                            excellent: '27.9',
                            good: '41.5',
                            success: '75.6',
                            low: '5.2',
                            overaver: '15.3',
                            inaver: '74.7'
                        },
                        diff: '0.65',
                        division: '0.3'
                    },
                    {
                        subject: '总分',
                        totalcnt: '326',
                        partincnt: '325',
                        maxscore: '89.5',
                        minscore: '9.5',
                        averscore: {
                            total: '65.3',
                            front: '78.5',
                            back: '48.8'
                        },
                        stantarddiff: '12.74',
                        rate: {
                            full: '0',
                            excellent: '27.9',
                            good: '41.5',
                            success: '75.6',
                            low: '5.2',
                            overaver: '15.3',
                            inaver: '74.7'

                        },
                        diff: '0.65',
                        division: '0.3'
                    }
                ];
            }
        },
        created() {
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>