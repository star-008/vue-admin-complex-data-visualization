<template>
    <section>
        <el-form label-width="100px">
            <el-row class="sms-filter-panel">
                <el-col :span="6">
                    <el-form-item label="学期:">
                        <el-select size="small" v-model="filters.termid" @change="onChangeYearTerm">
                            <el-option label="全部" value=""></el-option>
                            <el-option :label="SMSUtil.getTermName(item)" :value="item.termId" v-for="(item, idx) in terms" :key="idx"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="考试类型:">
                        <el-select size="small" v-model="filters.examtypeid" @change="onChangeExamType">
                            <el-option label="全部" value=""></el-option>
                            <el-option :label="item.dictname" :value="item.dictvalue" v-for="(item, idx) in examtypes" :key="idx"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="考试名称:">
                        <el-select size="small" v-model="filters.examid" filterable class="sms-examfilter" style="width:calc(100% - 94px);float:left;">
                            <el-option label="全部" value=""></el-option>
                            <el-option v-for="(item, idx) in filterexams" :label="item.examname" :value="item.examid" :key="idx" :data="item"></el-option>
                        </el-select>
                        <el-button size="small" type="search" v-on:click="search" id="searchBtn" style="margin-left:20px;width:60px">查询</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-table :data="exams" v-loading="listLoading" border>
            <el-table-column prop="examtype.dictname" label="考试类型" align="left">
            </el-table-column>
            <el-table-column prop="creatorname" label="管理员" align="left">
            </el-table-column>
            <el-table-column prop="examname" label="考试名称" align="left">
            </el-table-column>
            <el-table-column label="状态" align="left" :formatter="formatStatus">
            </el-table-column>
            <el-table-column label="发布时间" align="left" :formatter="formatLastmodifyTime">
            </el-table-column>
            <el-table-column label="操作" align="left">
                <template slot-scope="exam">
                    <div class="sms-operation">
                        <a :href="'system/analysisparam/edit/' + exam.row.examid + '/' + exam.row.examname" class="sms-operation-anchor" v-if="parseInt(exam.row.status)<2 && exam.row.creatorid==SMSUtil.getUser().userId">分析参数设置</a>
                        <a :href="'system/analysisparam/' + exam.row.examid + '/' + exam.row.examname" class="sms-operation-anchor">预览</a>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>
    </section>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { queryTermList, queryDictItemList, searchExam, getExamYearTermList, getExamExamTypeList, getSimpleExamList } from '../../../api/api';

    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                filters:{
                    termid:'',
                    examtypeid:'',
                    examid:''
                },
                terms:[],
                examtypes:[],
                filterexams: [],
                exams:[],
                listLoading:false,

                page:1,
                page_size:10,
                total:0,

                isfirst:true
            }
        },
        methods: {
            formatStatus(row, col) {
                if (row.status == '3') return '已发布'
                return '未发布';
            },
            formatLastmodifyTime(row, col) {
                if (row.status == '3')
                    return row.lastmodifytime;
                return '';
            },
            getExamYearTermList() {
                this.filters.termid = '';

                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    orgId: SMSUtil.getUser().orgId
                };
                this.terms = [];
                queryTermList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.terms = res.data.pageInfo.list;
                        this.onChangeYearTerm();
                        if (this.isfirst) {
                            this.load();
                        }
                    } else {
                        this.terms = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.terms = [];
                });
            },
            getExamTypes() {
                this.examtypes = [];
                this.filters.examtypeid = '';

                let params = {
                    pageNo:1,
                    numPerPage:1000,
                    dictTypeId:"EVALUATIONTYP",
                    lang:"zh_CN"
                };

                this.examtypes = [];
                queryDictItemList(params, this.$message).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examtypes = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                    } else {
                        this.examtypes = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.examtypes = [];
                });
            },
            getExams() {
                this.filterexams = [];
                let param = {};
                if (this.filters.termid != '') {
                    param.termid = this.filters.termid;
                }
                if (this.filters.examtypeid != '') {
                    param.examtypeid = this.filters.examtypeid;
                }
                getSimpleExamList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.filterexams = res.data.pageInfo.list;
                        if (this.filterexams.length > 0) {
                            let set = false;
                            for (var i=0; i<this.filterexams.length; i++) {
                                if (this.filterexams[i].examid == this.filters.examid) {
                                    set = true;
                                    break;
                                }
                            }
                            if (!set) this.filters.examid = '';
                        } else {
                            this.filters.examid = '';
                        }
                    } else {
                        this.filterexams = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.filterexams = [];
                });
            },
            search() {
                this.page = 1;
                this.load();
            },
            load() {
                this.listLoading = true;
                var params = {
                    pagination:{
                        numPerPage:this.page_size,
                        pageNo:this.page,
                        calTotal:true
                    },
                    conditions: [
                    ]
                };
                if (this.filters.termid != '') {
                    params.conditions.push({
                        fieldName: 'termid',
                        fieldValues: [
                            this.filters.termid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examtypeid != '') {
                    params.conditions.push({
                        fieldName: 'examtypeid',
                        fieldValues: [
                            this.filters.examtypeid
                        ],
                        operator: 'EQUAL'
                    });
                }
                if (this.filters.examid != '') {
                    params.conditions.push({
                        fieldName: 'examid',
                        fieldValues: [
                            this.filters.examid
                        ],
                        operator: 'EQUAL'
                    });
                }

                searchExam(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.exams = res.data.pageInfo.list;
                        this.total = res.data.pageInfo.total;
                    } else {
                        this.exams = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.exams = [];
                    this.listLoading = false;
                });
            },
            handleCurrentChange(val) {
                this.page = val;
                this.load();
            },
            pageSizeChanged(val) {
                this.page_size = val;
            },
            onChangeYearTerm() {
                this.getExams();
            },
            onChangeExamType() {
                this.getExams();
            }
        },
        created() {
            this.getExamYearTermList();
            this.getExamTypes();
            this.load();
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

</style>