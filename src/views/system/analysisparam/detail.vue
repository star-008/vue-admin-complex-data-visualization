<template>
    <section>
        <el-tabs v-model="configType" :lazy="true" @tab-click="onChangeTab(null)">
            <el-tab-pane label="四率、分数段及分段设置" name="param1">
                <el-row style="margin-top:15px;margin-bottom:35px;">
                    <el-form>
                        <el-col :span="24">
                            <el-form-item label="年级:" style="display:inline-block" label-width="100px">
                                <el-radio-group v-model="gradeid" class="line-block">
                                    <el-radio size="small" :key="idx" v-for="(grade,idx) in grades" :label="grade.dictvalue">{{ grade.dictname }}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="班类型:" style="display:inline-block" label-width="100px">
                                <el-radio-group v-model="subjecttype" class="line-block" @change="onChangeSubjectType">
                                    <el-radio size="small" label="1">常规</el-radio>
                                    <el-radio size="small" label="2">选考</el-radio>
                                    <el-radio size="small" label="3" disabled>学考</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="科目及分卷:" style="margin-bottom:0px;display:inline-block" label-width="100px">
                                <el-radio-group v-model="examsubjectvolumeidx" class="line-block" @change="onChangeSubject">
                                    <el-radio size="small" v-model="total" label="-1:0" v-if="subjecttype=='1'">总分</el-radio>
                                    <span v-for="(item, idx) in examsubjectscorelist" :key="idx" style="display:inline-block;">
                                        <el-radio size="small" :label="idx+':0'" :class="{ 'el-radio-nomargin':item.volumes.length>0 }">{{ item.subject.dictname }}</el-radio>
                                        <span v-if="item.volumes.length > 0" class="volume-block">
                                            <el-radio size="small" v-for="(volume, idx1) in item.volumes" :label="idx+':'+volume.dictvalue" :key="idx1">{{ volume.dictname }}</el-radio>
                                        </span>
                                    </span>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-form>
                </el-row>
                <sms-goodnessgrade ref="goodnessgrade" :examsubjectscore="examsubjectscore" :volume="volume" :totalscore="totalscore" :data="goodnessGradeConfig" :readonly="readonly"></sms-goodnessgrade>
                <sms-scoreband ref="scoreband" :examsubjectscore="examsubjectscore" :totalscore="totalscore" :data="scoreBandItems" :readonly="readonly"></sms-scoreband>
                <sms-scoregrade ref="scoregrade" :data="scoreGradeConfig" :readonly="readonly"></sms-scoregrade>
            </el-tab-pane>
            <el-tab-pane label="分数对应的等级设置" name="param2">
                <sms-ordergrade ref="ordergrade" :analysis-config="analysisConfig" :data-order="orderGradeConfigByOrder" :data-total="orderGradeConfigByTotal" :readonly="readonly"></sms-ordergrade>
            </el-tab-pane>
            <el-tab-pane label="其他设置" name="param3">
                <sms-yeartopgrade ref="yeartopgrade" :data="analysisConfig" :readonly="readonly"></sms-yeartopgrade>
                <sms-scoretopgrade ref="scoretopgrade" :data="analysisConfig" :readonly="readonly"></sms-scoretopgrade>
                <sms-othersetting  ref="othersetting" :data="analysisConfig" :readonly="readonly"></sms-othersetting>
            </el-tab-pane>
        </el-tabs>
        <div class="sms-setting-panel-footer" v-if="!readonly">
            <el-button type="primary" @click="onSave" :loading="saveLoading">保存</el-button>
        </div>
    </section>
</template>

<script>
    import { CLASS_TYPE } from '../../../common/js/const';
    import SMSUtil from '../../../common/js/util';
    import { getExamGradeList, getExamSubjectScoreList, getAnalysisConfig, getAnalysisScoreLevelConfig, setAnalysisConfig, setAnalysisScoreLevelConfig } from '../../../api/api';

    export default {
        data() {
            let examsubjecttotal = { subject:true };
            return {
                configType:'param1',
                originConfigType:'param1',
                grades:[],
                gradeid:'',
                subjecttype:'1',
                originsubjecttype:'1',
                examsubjectscorelist:[],
                examsubjectvolumeidx:'-1:0',
                examsubjecttotal:examsubjecttotal,
                examsubjectscore:examsubjecttotal,
                volume:null,
                total:true,
                totalscore:0,

                examid:'',
                readonly:false,
                goodnessGradeConfig:[],
                scoreBandItems:[],
                scoreGradeConfig:[],
                orderGradeConfigByOrder:[],
                orderGradeConfigByTotal:[],
                analysisConfig:null,

                saveLoading:false
            }
        },
        methods: {
            loadExamGrade() {
                this.gradeid = '';
                this.subjecttype = '1';

                let param = {
                    examid:this.examid
                };
                getExamGradeList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.grades = res.data.pageInfo.list;
                        if (this.grades.length > 0) {
                            this.gradeid = this.grades[0].dictvalue;
                            this.onChangeSubjectType();
                        }
                    } else {
                        this.grades = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.grades = [];
                });
            },
            loadExamSubjectScoreList() {
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
                                this.examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'gradeid',
                            fieldValues: [
                                this.gradeid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'classtype',
                            fieldValues: [
                                this.subjecttype=='1'?'1':'2'
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                getExamSubjectScoreList(param).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.examsubjectscorelist = res.data.pageInfo.list;
                        this.totalscore = 0;
                        for (var i=0; i<this.examsubjectscorelist.length; i++) {
                            let volumes = this.examsubjectscorelist[i].volumes;
                            this.examsubjectscorelist[i].volumes = [];
                            if (volumes != null) {
                                var volumearr = volumes.split(", ");
                                for (var j=0; j<volumearr.length; j++) {
                                    if (volumearr[j] == '') continue;
                                    var volumeobj = SMSUtil.getVolume(volumearr[j]);
                                    this.examsubjectscorelist[i].volumes.push(volumeobj);
                                }
                            }
                            this.totalscore += parseInt(this.examsubjectscorelist[i].score);
                        }
                        if (this.subjecttype == '1') {
                            this.examsubjectvolumeidx = '-1:0';
                        } else if (this.examsubjectscorelist.length > 0) {
                            this.examsubjectvolumeidx = '0:0';
                        }
                        this.onChangeSubject();
                    } else {
                        this.examsubjectscorelist = [];
                    }
                }).catch((err) => {
                    console.log(err);
                    this.examsubjectscorelist = [];
                });
            },
            loadAnalysisConfig() {
                let params = {
                    conditions: [
                        {
                            fieldName: 'examid',
                            fieldValues: [
                                this.examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'gradeid',
                            fieldValues: [
                                this.gradeid
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                getAnalysisConfig(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        if (res.data.pageInfo.total == 0) {
                            this.analysisConfig = null;
                        } else {
                            this.analysisConfig = res.data.pageInfo.list[0];
                        }
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            loadAnalsysScoreLevelConfig(type, gradeid, volume) {
                let params = {
                    conditions: [
                        {
                            fieldName: 'examid',
                            fieldValues: [
                                this.examid
                            ],
                            operator: 'EQUAL'
                        },
                        {
                            fieldName: 'type',
                            fieldValues: [
                                type
                            ],
                            operator: 'EQUAL'
                        }
                    ]
                };
                if (gradeid != '') {
                    params.conditions.push(
                        {
                            fieldName: 'gradeid',
                            fieldValues: [
                                gradeid
                            ],
                            operator: 'EQUAL'
                        }
                    );
                    params.conditions.push(
                        {
                            fieldName: 'subjectid',
                            fieldValues: [
                                this.examsubjectscore.subject===true?'TOTAL':this.examsubjectscore.subject.dictvalue
                            ],
                            operator: 'EQUAL'
                        }
                    );
                }
                if (volume == null) {
                    params.conditions.push(
                        {
                            fieldName: 'volumeid',
                            fieldValues: [
                                '0'
                            ],
                            operator: 'EQUAL'
                        }
                    );
                } else {
                    params.conditions.push(
                        {
                            fieldName: 'volumeid',
                            fieldValues: [
                                volume.dictvalue
                            ],
                            operator: 'EQUAL'
                        }
                    );
                }
                getAnalysisScoreLevelConfig(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let config = res.data.pageInfo.list;
                        this.fillConfig(type, config);
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.fillConfig(type, []);
                    }
                }).catch((err) => {
                    console.log(err);
                    this.fillConfig(type, []);
                    this.$message({
                        message: '加载失败！',
                        type: 'error'
                    });
                });
            },
            fillConfig(type, config) {
                if (type == "0") {
                    this.goodnessGradeConfig = config;
                } else if (type == "1") {
                    this.scoreBandItems = config;
                } else if (type == "2") {
                    this.scoreGradeConfig = config;
                } else if (type == "3") {
                    this.orderGradeConfigByOrder = config;
                } else if (type == "4") {
                    this.orderGradeConfigByTotal = config;
                }
            },
            setAnalysisConfig() {
                let params = {
                    examid:this.examid,
                    scoredivisionbysubject:this.$refs.scoretopgrade.scoredivisionbysubject,
                    scoredivisionbytotal:this.$refs.scoretopgrade.scoredivisionbytotal,
                    gradetopcount:this.$refs.yeartopgrade.beforeOfYear.join(","),
                    gradelastcount:this.$refs.yeartopgrade.afterOfYear.join(","),
                    parellelsumenabled:this.$refs.othersetting.parellelsumenabled,
                    mobileviewmode:this.$refs.othersetting.mobileviewmode,
                    missedexamincluded:this.$refs.othersetting.missedexamincluded
                }
                this.saveLoading = true;
                setAnalysisConfig(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.saveLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                    this.saveLoading = false;
                });
            },
            setClassAnalysisConfig() {
                let params = [];
                let goodnessGradeConfig = this.$refs.goodnessgrade.goodnessGradeConfig.filter(item => item.config.checked);
                let subjectid = this.examsubjectscore.subject===true?'TOTAL':this.examsubjectscore.subject.dictvalue;
                let volumeid = this.volume==null?'0':this.volume.dictvalue;

                for (var i=0; i<goodnessGradeConfig.length; i++) {
                    params.push({
                        examid: this.examid,
                        gradeid: this.gradeid,
                        subjectid: subjectid,
                        volumeid: volumeid,
                        subjecttype: this.subjecttype,
                        lowscore: goodnessGradeConfig[i].config.lowscore,
                        highscore: '',
                        level: goodnessGradeConfig[i].config.level,
                        type: "0"
                    });
                }
                for (var i=0; i<this.$refs.scoreband.scoreBandConfig.items.length; i++) {
                    params.push({
                        examid: this.examid,
                        gradeid: this.gradeid,
                        subjectid: subjectid,
                        volumeid: volumeid,
                        subjecttype: this.subjecttype,
                        configname: this.$refs.scoreband.scoreBandConfig.configname,
                        lowscore: this.$refs.scoreband.scoreBandConfig.items[i].lowscore,
                        highscore: this.$refs.scoreband.scoreBandConfig.items[i].highscore,
                        level: this.$refs.scoreband.scoreBandConfig.items[i].level,
                        itemname: this.$refs.scoreband.scoreBandConfig.items[i].itemname,
                        type: "1"
                    });
                }
                for (var i=0; i<this.$refs.scoregrade.scoreGradeConfig.length; i++) {
                    if (this.$refs.scoregrade.scoreGradeConfig[i].config.checked == false) continue;

                    params.push({
                        examid: this.examid,
                        gradeid: this.gradeid,
                        subjecttype: this.originsubjecttype,
                        subjectid: subjectid,
                        volumeid: volumeid,
                        lowscore: this.$refs.scoregrade.scoreGradeConfig[i].config.lowscore,
                        highscore: i==0?null:this.$refs.scoregrade.scoreGradeConfig[i].config.highscore,
                        level: this.$refs.scoregrade.scoreGradeConfig[i].config.level,
                        type: "2"
                    });
                }

                this.saveLoading = true;
                setAnalysisScoreLevelConfig(this.examid, this.gradeid, this.subjecttype, subjectid, volumeid, params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.saveLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                    this.saveLoading = false;
                });
            },
            setOrderAnalysisConfig() {
                let params = {
                    examid:this.examid,
                    degreetype:this.$refs.ordergrade.analysisConfigData.degreetype
                }

                this.saveLoading = true;
                setAnalysisConfig(params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.setOrderAnalysisConfigComplete();
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                        this.saveLoading = false;
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                    this.saveLoading = false;
                });
            },
            setOrderAnalysisConfigComplete() {
                let params = [];
                for (var i=0; i<this.$refs.ordergrade.orderGradeConfigByOrder.length; i++) {
                    if (this.$refs.ordergrade.orderGradeConfigByOrder[i].checked == false) continue;

                    params.push({
                        examid: this.examid,
                        gradeid: 0, // dummy value
                        subjecttype: 0, // dummy value
                        subjectid: 0, // dummy value
                        volumeid: 0, // dummy value
                        lowscore: this.$refs.ordergrade.orderGradeConfigByOrder[i].lowscore,
                        highscore: this.$refs.ordergrade.orderGradeConfigByOrder[i].highscore,
                        level: this.$refs.ordergrade.orderGradeConfigByOrder[i].level,
                        type: "3"
                    });
                }
                for (var i=0; i<this.$refs.ordergrade.orderGradeConfigByTotal.length; i++) {
                    if (this.$refs.ordergrade.orderGradeConfigByTotal[i].checked == false) continue;

                    params.push({
                        examid: this.examid,
                        gradeid: 0, // dummy value
                        subjecttype: 0, // dummy value
                        subjectid: 0, // dummy value
                        volumeid: 0, // dummy value
                        lowscore: this.$refs.ordergrade.orderGradeConfigByTotal[i].lowscore,
                        highscore: this.$refs.ordergrade.orderGradeConfigByTotal[i].highscore,
                        level: this.$refs.ordergrade.orderGradeConfigByTotal[i].level,
                        type: "4"
                    });
                }
                setAnalysisScoreLevelConfig(this.examid, 0, 0, 0, 0, params).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        this.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                    } else {
                        SMSUtil.showMessage(res.data.serverResult.resultCode, res.data.serverResult.resultMessage, this.$message);
                    }
                    this.saveLoading = false;
                }).catch((err) => {
                    console.log(err);
                    this.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                    this.saveLoading = false;
                });
            },
            doChangeSubject() {
                var parts = this.examsubjectvolumeidx.split(':');
                if (parseInt(parts[0]) == -1) {
                    this.examsubjectscore = this.examsubjecttotal;
                } else {
                    this.examsubjectscore = this.examsubjectscorelist[parseInt(parts[0])];
                }
                this.originsubjecttype = this.subjecttype;
                this.volume = SMSUtil.getVolumeByValue(parts[1]);
                this.loadAnalsysScoreLevelConfig('0', this.gradeid, this.volume);
                this.loadAnalsysScoreLevelConfig('1', this.gradeid, this.volume);
                this.loadAnalsysScoreLevelConfig('2', this.gradeid, this.volume);
            },
            onChangeSubjectType() {
                this.onChangeTab(this.loadExamSubjectScoreList);
            },
            onChangeSubject() {
                this.onChangeTab(this.doChangeSubject);
            },
            onChangeTab(callback) {
                if (this.readonly) {
                    if (callback != null) callback();
                    return;
                }

                let _this = this;
                if (this.originConfigType == 'param1') {
                    if (this.$refs.goodnessgrade.isModified() || 
                        this.$refs.scoreband.isModified() ||
                        this.$refs.scoregrade.isModified()) {
                        _this.$confirm('要将修改的设置保存吗？', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.setClassAnalysisConfig();
                            _this.$refs.goodnessgrade.reset();
                            _this.$refs.scoreband.reset();
                            _this.$refs.scoregrade.reset();
                            if (callback != null) callback();
                        }).catch(() => {
                            _this.$refs.goodnessgrade.reload();
                            _this.$refs.scoreband.reload();
                            _this.$refs.scoregrade.reload();
                            if (callback != null) callback();
                        });
                    } else {
                        if (callback != null) callback();
                    }
                } else if (this.originConfigType == 'param2') {
                    if (this.$refs.ordergrade.isModified()) {
                        _this.$confirm('要将修改的设置保存吗？', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.setOrderAnalysisConfig();
                            _this.$refs.ordergrade.reset();
                            if (callback != null) callback();
                        }).catch(() => {
                            _this.$refs.ordergrade.reload();
                            if (callback != null) callback();
                        });
                    } else {
                        if (callback != null) callback();
                    }
                } else if (this.originConfigType == 'param3') {
                    if (this.$refs.yeartopgrade.isModified() || 
                        this.$refs.scoretopgrade.isModified() || 
                        this.$refs.othersetting.isModified()) {
                        _this.$confirm('要将修改的设置保存吗？', '提示', {
                            type: 'info'
                        }).then(() => {
                            _this.setAnalysisConfig();
                            _this.$refs.yeartopgrade.reset();
                            _this.$refs.scoretopgrade.reset();
                            _this.$refs.othersetting.reset();
                            if (callback != null) callback();
                        }).catch(() => {
                            _this.$refs.yeartopgrade.reload();
                            _this.$refs.scoretopgrade.reload();
                            _this.$refs.othersetting.reload();
                            if (callback != null) callback();
                        });
                    } else {
                        if (callback != null) callback();
                    }
                }
                this.originConfigType = this.configType;
            },
            onSave() {
                if (this.configType == 'param1') {
                    this.setClassAnalysisConfig();
                } else if (this.configType == 'param2') {
                    this.setOrderAnalysisConfig();
                } else if (this.configType == 'param3') {
                    this.setAnalysisConfig();
                }
            }
        },
        created() {
            this.readonly = this.$route.path.indexOf('edit')==-1;

            this.examid = this.$route.params.id;
            this.loadExamGrade();
            
            this.loadAnalysisConfig();
            this.loadAnalsysScoreLevelConfig('3', '', null);
            this.loadAnalsysScoreLevelConfig('4', '', null);
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .el-radio-nomargin {
        margin-right:0px !important;
    }
    span.volume-block {
        display:inline-block;
    }
    span.volume-block::before {
        content:"(";
        font-size: 14px;
        padding: 0px 5px;
        color: #1f2d3d;
        font-family:"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif;
        float:left;
        line-height:35px;
    }
    span.volume-block::after {
        content:")";
        font-size: 14px;
        padding: 0px 5px;
        margin-right: 20px;
        color: #1f2d3d;
        float:right;
        line-height:35px;
    }
    span.volume-block .el-radio:last-child {
        margin-right: 0px !important;
    }
</style>