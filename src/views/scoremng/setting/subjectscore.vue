<template>
    <section>
        <el-row class="sms-content-panel">
            <el-form label-width="100px">
                <div class="sms-filter-panel">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="学期:">
                                <el-select size="small" v-model="filters.termid" @change="onChangeYearTerm">
                                    <el-option :key="idx" v-for="(item, idx) in terms" 
                                        :label="SMSUtil.getTermName(item)" 
                                        :value="item.termId"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="考试类型:">
                                <el-select size="small" v-model="filters.examtypeid" @change="onChangeExamType">
                                    <el-option label="全部" value=""></el-option>
                                    <el-option v-for="(item, idx) in examtypes" :label="item.dictname" :value="item.dictvalue" :key="idx" :data="item"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="考试名称:">
                                <el-select size="small" v-model="filters.examid" class="sms-examfilter" filterable @change="search">
                                    <el-option v-for="(item, idx) in exams" :label="item.examname" :value="item.examid" :key="idx" :data="item"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>

            <el-col :span="24" class="sms-batchop-panel">
                <el-button size="small" @click="onDownloadTemplate" :disabled="filters.examid == '' || this.publishStatus == '2'" v-if="filters.examcreatorid==SMSUtil.getUser().userId">下载模板</el-button>
                <el-button size="small" @click="onImportPartScore" :disabled="filters.examid == '' || this.publishStatus == '2'" v-if="filters.examcreatorid==SMSUtil.getUser().userId">导入</el-button>
            </el-col>

            <el-table ref="examsubjectscore" :data="examsubjectscore" v-loading="listLoading" border>
                <el-table-column prop="grade.dictname" label="年级" align="left">
                </el-table-column>
                <el-table-column prop="subject.dictname" label="科目" align="left">
                </el-table-column>
                <el-table-column label="科目满分值" align="left">
                    <template slot-scope="subjectscore">
                        <el-input type="number" ref="subjectscoreedit" v-show="subjectscore.row.editing==1" v-model="subjectscore.row.score" :min="0" :max="100" style="width:calc(100% - 2px);" @blur="updateSubjectScore(subjectscore.row, '2', false)" @keyup.enter.native.prevent="updateSubjectScore(subjectscore.row, '2', false)"></el-input>
                        <div v-show="subjectscore.row.editing==0" @dblclick="switchToEdit(subjectscore.row, subjectscore.$index)">
                            <el-tooltip class="item" effect="dark" :content="getMessage(subjectscore.row.score)" placement="left" v-if="getMessage(subjectscore.row.score)!=''">
                                <span class="sc-color-red">{{ subjectscore.row.score }}</span>
                            </el-tooltip>
                            <span v-if="getMessage(subjectscore.row.score)==''">{{ subjectscore.row.score }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="是否小题分析" align="left">
                    <template slot-scope="subjectscore">
                        <el-switch size="small" :value="examsubjectscore[subjectscore.$index].rules!='0'" on-text="是" off-text="否" @change="changeQuestionImportStatus(subjectscore.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column prop="volumes" label="分卷" align="left">
                </el-table-column>
                <el-table-column prop="questioncount" label="小题数量" align="left" :formatter="formatQuestionCount">
                </el-table-column>
                <el-table-column label="操作(小题分项)" align="left">
                    <template slot-scope="subjectscore">
                        <span class="sms-operation">
                            <a class="sms-operation-anchor" href="javascript:;" @click="onShowPartScore(subjectscore.row)" v-if="subjectscore.row.status=='1'">查看</a>
                        </span>
                    </template>
                </el-table-column>
            </el-table>
            <my-pagination @current-change="handleCurrentChange" @pagesize-change="pageSizeChanged" :page="page" :page-size="page_size" :total="total"></my-pagination>
        </el-row>

        <!-- Export/Import Dialog -->

        <el-dialog title="导入小题分项" v-model="exportImportDialogVisible" :close-on-click-modal="false" class="small">
            <el-form>
                <el-form-item style="margin-bottom:0px">
                    <ul>
                        <li class="sc-open-import-li">
                            <a href="javascript:;" class="sc-open-import-href" @click="onChooseFile">点击上传</a>
                            <input type="file" ref="importfile" accept=".xls,.xlsx" style="display:none" @change="onFileChosen" />
                            <span>只能上传xls,xlsx文件</span>
                        </li>
                        <li class="sc-open-import-li" v-if="importfile!=null">
                            <span class="sc-open-import-span">
                                <span class="sc-open-import-status">
                                    {{ importfile.name }}
                                </span>
                            </span>
                        </li>
                    </ul>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" :disabled="importfile==null" @click.native="doImport" :loading="importLoading">提交</el-button>
                <el-button @click.native="exportImportDialogVisible=false">取消</el-button>
            </div>
        </el-dialog>

        <!-- Export/Import Dialog End -->

        <!-- Partscore Dialog -->

        <el-dialog :title="'查看小题分项--' + curSubjectScore.subject.dictname + '/满分：' + curSubjectScore.importscore" v-model="partscoreDialogVisible" :close-on-click-modal="false">
            <span class="warning" v-if="curSubjectScore.importscore < 80">* 总分小题 80。</span>
            <span class="warning" v-if="curSubjectScore.importscore > 200">* 总分高于 200。</span>
            <span class="warning" v-if="curSubjectScore.importscore % 10 != 0">* 个位数如果不为 0。</span>
            <el-table :data="curSubjectScore.partscore" v-loading="partscoreLoading" height="322" v-if="partscoreDialogVisible">
                <el-table-column prop="volume.dictname" label="分卷名称" align="left">
                </el-table-column>
                <el-table-column prop="bigno" label="大题编号" align="left" :formatter="formatBigNo">
                </el-table-column>
                <el-table-column prop="questionno" label="试题编号" align="left">
                </el-table-column>
                <el-table-column prop="questionCategory.dictname" label="试题类型" align="left">
                </el-table-column>
                <el-table-column prop="smallno" label="小题编号" align="left">
                </el-table-column>
                <el-table-column prop="questionType.dictname" label="题型" align="left">
                </el-table-column>
                <el-table-column prop="score" label="满分值" align="left">
                </el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click.native="savePartscore(curSubjectScore)" :loading="saveLoading" v-if="curSubjectScore.imported">保存</el-button>
                <el-button @click.native="partscoreDialogVisible=false">关闭</el-button>
            </div>
        </el-dialog>

        <!-- Partscore Dialog End -->

    </section>
</template>

<script>
    import { filter } from '../../../mixins/filter';
    import SMSUtil from '../../../common/js/util';
    import { getExamSubjectScoreList, setExamSubjectScore, setExamQuestionScore, getExamYearTermList, getExamExamTypeList, getSimpleExamList, getExamGradeList, getExamSubjectList, importExamQuestionScore, getExamQuestionScoreList, exportExamQuestionScore } from '../../../api/api';

    export default {
        mixins: [ filter ],
        data() {
            return {
                SMSUtil:SMSUtil,
                filters: {
                    termid: '',
                    examtypeid: '',
                    examid: '',
                    examcreatorid: ''
                },

                /////////// Filters Data ///////////
                terms: [],                
                examtypes: [],
                exams: [],
                /////////// Filters Data End ///////
                
                importfile: null,
                publishStatus: '',
                exportImportDialogVisible: false,
                partscoreDialogVisible: false,
                examsubjectscore: [],
                listLoading: false,
                partscoreLoading: false,
                importLoading: false,
                saveLoading: false,
                curSubjectScore: { subject:{dictname:''}, score:'', imported:false },
                originalscore: 0,

                /////////// Pagination ///////////
                total: 0,
                page: 1,
                page_size: 10,
                /////////// Pagination End ////////

                isfirst: true
            }
        },
        methods: {
            formatQuestionCount(row, col) {
                if (row.questioncount == 0) return '';
                return row.questioncount;
            },
            formatBigNo(row, col) {
                if (row.bigno == '') return '----';
                return row.bigno;
            },
            getMessage(score) {
                let message = "";
                if (score < 80) {
                    message = "总分小题 80。";
                } else if (score > 200) {
                    message = "总分高于 200。";
                }
                if (score % 10 != 0) {
                    message += "个位数如果不为 0。";
                }
                return message;
            },
            search() {
                this.page = 1;
                this.getStatus();
                this.loadExamSubjectScore();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.loadExamSubjectScore();
            },
            pageSizeChanged(val) {
                this.page_size = val;
            },
            getStatus() {
                if (this.filters.examid == '') return;

                let param = {
                    pagination: {
                        numPerPage:1,
                        pageNo:1,
                        calcTotal:false
                    },
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                this.filters.examid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                getExamSubjectScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        if (res.data.pageInfo.list.length > 0) {
                            this.publishStatus = res.data.pageInfo.list[0].pubstatus;
                        }
                    }
                });
            },
            changeQuestionImportStatus(subjectscore) {
                if (this.filters.examcreatorid != SMSUtil.getUser().userId) {
                    this.$message({
                        message: '不能操作其他管理员的考试。',
                        type: 'info'
                    });
                    return;
                } else  if (this.publishStatus == '2') {
                    this.$message({
                        message: '已经发布了。',
                        type: 'info'
                    });
                    return;
                }

                let enable = subjectscore.rules!='0'?'0':'1';

                let params = {
                    examsubjectscoreid:subjectscore.examsubjectscoreid,
                    rules:enable
                };
                setExamSubjectScore(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                        subjectscore.rules = enable;
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        subjectscore.rules = (enable=='1'?'0':'1');
                    }
                }).catch((err) => {
                    console.log(err);
                    subjectscore.rules = (enable=='1'?'0':'1');
                    this.$message({
                        message: '操作失败！',
                        type: 'error'
                    });
                })
            },
            loadExamSubjectScore() {
                let param = {
                    pagination:{
                        numPerPage:this.page_size,
                        pageNo:this.page,
                        calTotal:true
                    },
                    conditions: [
                        {
                            fieldName: 'pt.examid',
                            fieldValues: [
                                this.filters.examid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                this.listLoading = true;
                getExamSubjectScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.total = res.data.pageInfo.total;
                        this.examsubjectscore = res.data.pageInfo.list;
                        for (var i=0; i<this.examsubjectscore.length; i++) {
                            this.$set(this.examsubjectscore[i], 'editing', 0);
                        }

                        var exams = this.exams.filter(item=>item.examid==this.filters.examid);
                        if (exams.length == 0) this.filters.examcreatorid = '';
                        else this.filters.examcreatorid = exams[0].creatorid;    

                        this.checkForInitial();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.total = 0;
                        this.examsubjectscore = [];
                    }
                    this.listLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.total = 0;
                    this.examsubjectscore = [];
                    this.listLoading = false;

                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            getExams() {
                this.exams = [];
                this.filters.examid = '';

                let param = {
                    termid: this.filters.termid
                };
                if (this.filters.examtypeid != '') {
                    param.examtypeid = this.filters.examtypeid;
                }
                
                getSimpleExamList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.exams = res.data.pageInfo.list;
                        if (this.exams.length > 0) {
                            if (this.url.examid != '') {
                                this.filters.examid = this.url.examid;
                                this.url.examid = '';
                                this.$router.param.examid = '';
                            } else {
                                this.filters.examid = this.exams[0].examid;
                            }
                        }
                        if (this.isfirst) {
                            this.loadExamSubjectScore();
                            this.isfirst = false;
                        }
                    } else {
                        this.exams = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.exams = [];
                });
            },
            updateSubjectScore(subjectscore, status, needReload) {
                if (subjectscore.score == this.originalscore) {
                    subjectscore.editing = 0;
                    return;
                }

                let params = {
                    examid:this.filters.examid,
                    examsubjectscoreid:subjectscore.examsubjectscoreid,
                    score:subjectscore.score,
                    status:status
                };
                setExamSubjectScore(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '保存成功！',
                            type: 'success'
                        });
                        subjectscore.editing = 0;
                        if (needReload) {
                            this.partscoreDialogVisible = false;
                            this.loadExamSubjectScore();
                        }
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        subjectscore.editing = 0;
                        subjectscore.score = this.originalscore;
                    }
                }).catch((err) => {
                    console.log(err);
                    subjectscore.editing = 0;
                    subjectscore.score = this.originalscore;
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            checkForInitial() {
                window._this = null;
                window._examid = null;

                let exams = this.exams.filter(item=>item.examid==this.filters.examid);
                if (exams.length == 0 || 
                    exams[0].creatorid != SMSUtil.getUser().userId) return;

                let isSetForExam = localStorage.getItem(this.filters.examid);
                if (!isSetForExam) {
                    for (var i=0; i<this.examsubjectscore.length; i++) {
                        if (this.examsubjectscore[i].status == '0') {
                            window._this = this;
                            window._examid = this.filters.examid;
                            return;
                        }
                    }
                    localStorage.setItem(this.filters.examid, '1');
                }
            },
            doSavePartscore(subjectscore, params, needReload, callback) {
                this.saveLoading = true;
                setExamQuestionScore(subjectscore.examsubjectscoreid, params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        if (!callback) {
                            this.$message({
                                message: '保存成功！',
                                type: 'success'
                            });
                        }
                        subjectscore.status = '1';
                        subjectscore.score = subjectscore.importscore;
                        subjectscore.imported = false;

                        if (needReload) {
                            this.partscoreDialogVisible = false;
                            this.loadExamSubjectScore();
                        }
                        if (callback) callback();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.saveLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.saveLoading = false;
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            savePartscore(subjectscore) {
                if (subjectscore.partscore && subjectscore.partscore.length > 0) {
                    let params = [];
                    for (var i=0; i<subjectscore.partscore.length; i++) {
                        let partscore = {
                            volumeid:subjectscore.partscore[i].volumeid,
                            bigno:subjectscore.partscore[i].bigno,
                            questionno:subjectscore.partscore[i].questionno,
                            questioncategoryid:subjectscore.partscore[i].questioncategoryid,
                            smallno:subjectscore.partscore[i].smallno,
                            questiontypeid:subjectscore.partscore[i].questiontypeid,
                            score:subjectscore.partscore[i].score
                        };
                        params.push(partscore);
                    }
                    this.doSavePartscore(subjectscore, params, true, null);
                } else {
                    let _this = this;
                    if (parseFloat(subjectscore.score) != parseFloat(subjectscore.volumes)) {
                        _this.$confirm('当前科目总分：' + SMSUtil.formatNumber(subjectscore.volumes, 2) + '分。 是否要替换成：' + SMSUtil.formatNumber(subjectscore.score, 2) + '分。', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.doSavePartscore(subjectscore, [], false, function() {
                                _this.updateSubjectScore(subjectscore, '2', true);
                            });
                        }).catch(() => {
                        });
                    } else {
                        _this.doSavePartscore(subjectscore, [], false, function() {
                            _this.updateSubjectScore(subjectscore, '2', true);
                        });
                    }
                }
            },
            switchToEdit(subjectscore, index) {
                if (subjectscore.pubstatus == '2') {
                    this.$message({
                        message: '已经发布了。',
                        type: 'info'
                    });
                    return;
                }
                if (subjectscore.status == '1') {
                    this.$message({
                        message: '已经导入小题分析了。',
                        type: 'info'
                    });
                    return;
                }
                let examInfos = this.exams.filter(item=>item.examid==this.filters.examid);
                if (examInfos.length == 0) return;
                if (examInfos[0].creatorid != SMSUtil.getUser().userId) {
                    this.$message({
                        message: '不能操作其他管理员的考试。',
                        type: 'info'
                    });
                    return;
                }
                subjectscore.editing = 1;
                this.originalscore = subjectscore.score;
                let _this = this;
                this.$nextTick(function() {
                    $($('table tr td input[type=number]')[index]).focus();
                });
            },
            onChangeExamType() {
                this.getExams();
            },
            onImportPartScore(subjectscore) {
                if (this.publishStatus == '2') {
                    this.$message({
                        message: '已经发布了。',
                        type: 'info'
                    });
                    return;
                }

                this.importfile = null;
                $(this.$refs.importfile).val('');
                this.exportImportDialogVisible = true;
            },
            onChooseFile() {
                this.$refs.importfile.value = "";
                this.$refs.importfile.click();
            },
            onFileChosen() {
                if (this.$refs.importfile.files.length == 0) return;
                this.importfile = this.$refs.importfile.files[0];
                if (!this.importfile.name.endsWith(".xls") && 
                    !this.importfile.name.endsWith(".xlsx")) {
                    this.importfile = null;
                    this.$message({
                        message: '只能上传xls,xlsx文件。',
                        type: 'error'
                    });
                }
            },
            onDownloadTemplate() {
                if (this.publishStatus == '2') {
                    this.$message({
                        message: '已经发布了。',
                        type: 'info'
                    });
                    return;
                }

                let param = {
                    filter: {
                        examid: this.filters.examid
                    }
                };
                exportExamQuestionScore(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        SMSUtil.download(res.data.responseEntity);
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '导出失败！',
                        type: 'error'
                    });
                });
            },
            doImport() {
                const param = new FormData();
                param.append('file', this.importfile);

                this.importLoading = true;
                importExamQuestionScore(this.filters.examid, param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '导入成功',
                            type: 'success'
                        });
                        this.curSubjectScore = res.data.responseEntity;
                        this.curSubjectScore.partscore = res.data.pageInfo.list;
                        this.curSubjectScore.imported = true;
                        this.exportImportDialogVisible = false;
                        window.setTimeout(this.onShowPartScore, 300, this.curSubjectScore);
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.importLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.importLoading = false;
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            },
            onShowPartScore(subjectscore) {
                this.curSubjectScore = subjectscore;
                this.partscoreDialogVisible = true;

                if (!subjectscore.imported) {
                    this.curSubjectScore.importscore = this.curSubjectScore.score;
                    this.curSubjectScore.partscore = [];
                    let params = {
                        conditions: [
                            {
                                fieldName: 'examsubjectid',
                                fieldValues: [
                                    this.curSubjectScore.examsubjectscoreid
                                ],
                                operator: 'EQUAL'
                            }
                        ]
                    };
                    this.partscoreLoading = true;
                    getExamQuestionScoreList(params).then((res) => {
                        if (res.data.serverResult.resultCode == "200") {
                            this.curSubjectScore.partscore = res.data.pageInfo.list;
                        } else {
                            this.$message({
                                message: res.data.serverResult.resultMessage,
                                type: 'error'
                            });
                        }
                        this.partscoreLoading = false;
                    }).catch((err) => {
                        console.log(err);
                        this.partscoreLoading = false;
                        this.$message({
                            message: '加载失败！',
                            type: 'error'
                        });
                    });
                } else {
                    this.curSubjectScore.importscore = subjectscore.score;
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .el-select {
        width: 100%;
    }
    .line-block {
        display:inline-block;
        margin-left:10px;
    }
    .el-upload__tip {
        margin-left: 5px;
    }
    .warning {
        color: red;
        font-style: italic;
        margin-bottom: 10px;
        display:inline-block;
    }
</style>