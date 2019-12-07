<template>
    <div class="template-content">
        <div class="sms-setting-panel-title">
            分数映射等级设置
            <el-radio-group v-model="analysisConfigData.degreetype" class="inline" style="margin-left:30px;font-weight:normal" :disabled="readonly">
                <el-radio size="small" label="3">按年级排名映射</el-radio>
                <el-radio size="small" label="4">按满分比例映射</el-radio>
            </el-radio-group>
        </div>
        <el-tabs v-model="analysisConfigData.degreetype" class="no-header">
            <el-tab-pane label="按年级排名" name="3">
                <div class="sms-setting-panel-desc">
                    说明：设置人数的档次名称，用于分析一定人数内每个班级的达标人数。
                </div>
                <div class="sms-setting-panel-content">
                    <el-row v-for="(item,idx) in orderGradeConfigByOrder" :key="idx">
                        <el-col :span="24">
                            <span class="sms-conf-item" style="text-align:left">
                                <el-checkbox v-model="item.checked" :value="true" :disabled="readonly" @change="onChangeCheck(idx, item, 'byorder')"></el-checkbox>
                            </span>
                            <span class="sms-conf-item">
                                {{ item.dictname }}
                            </span>
                            <span class="sms-conf-item sms-conf-item-big" style="text-align:right">
                                年级排名的：
                            </span>
                            <span class="sms-conf-item">
                                <el-input size="small" v-model.number="item.lowscore" :disabled="readonly || !item.checked" @keyup.enter="onChangeScore(idx, item, 'byorder')" @change.native="onChangeScore(idx, item, 'byorder')"></el-input>
                            </span>
                            %内
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>
            <el-tab-pane label="按班级排名" name="4">
                <div class="sms-setting-panel-desc">
                    说明：按总分数取百分比。
                </div>
                <div class="sms-setting-panel-content">
                    <el-row v-for="(item,idx) in orderGradeConfigByTotal" :key="idx">
                        <el-col :span="24">
                            <span class="sms-conf-item" style="text-align:left">
                                <el-checkbox v-model="item.checked" :value="true" :disabled="readonly" @change="onChangeCheck(idx, item, 'bytotal')"></el-checkbox>
                            </span>
                            <span class="sms-conf-item">
                                {{ item.dictname }}
                            </span>
                            <span class="sms-conf-item">>=</span>
                            <span class="sms-conf-item" style="text-align:right">
                                满分的：
                            </span>
                            <span class="sms-conf-item">
                                <el-input size="small" v-model.number="item.lowscore" :disabled="readonly || !item.checked" @keyup.enter="onChangeScore(idx, item, 'bytotal')" @change.native="onChangeScore(idx, item, 'bytotal')"></el-input>
                            </span>
                            %
                        </el-col>
                    </el-row>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { ORDER_GRADE, ORDER_GRADE_SCORE } from '../../../common/js/const';

    export default {
        data() {
            let analysisConfigData = this.analysisConfig==null?{degreetype:'4'}:this.analysisConfig;
            let orderGradeConfigByOrder = ORDER_GRADE.map(item=>({
                lowscore:item.default,
                checked:true,
                level:item.dictvalue,
                dictname:item.dictname
            }));
            let orderGradeConfigByTotal = ORDER_GRADE_SCORE.map(item=>({
                lowscore:item.default,
                checked:true,
                level:item.dictvalue,
                dictname:item.dictname
            }));
            return {
                orderGradeConfigByOrder:orderGradeConfigByOrder,
                orderGradeConfigByTotal:orderGradeConfigByTotal,
                analysisConfigData:analysisConfigData,
                originDegreeType:analysisConfigData.degreetype,
                originByOrder:JSON.stringify(orderGradeConfigByOrder),
                originByTotal:JSON.stringify(orderGradeConfigByTotal),
            }
        },
        props: {
            dataOrder: Array,
            dataTotal: Array,
            readonly:{
                type:Boolean,
                required:false,
                default:false
            },
            analysisConfig: Object
        },
        watch: {
            dataOrder(val, oldval) {
                this.composeConfigByOrder(val);
            },
            dataTotal(val, oldval) {
                this.composeConfigByTotal(val);
            },
            analysisConfig(val, oldval) {
                if (val == null) {
                    this.analysisConfigData = {
                        degreetype: '4'
                    };
                } else {
                    this.analysisConfigData.degreetype = (val.degreetype!=null&&val.degreetype!='')?val.degreetype:'4';
                }
            }
        },
        methods: {
            isModified() {
                return this.originDegreeType != this.analysisConfigData.degreetype || 
                        this.originByTotal != JSON.stringify(this.orderGradeConfigByTotal || 
                        this.originByOrder != JSON.stringify(this.orderGradeConfigByOrder));
            },
            reset() {
                this.originDegreeType = this.analysisConfigData.degreetype;
                this.originByTotal = JSON.stringify(this.orderGradeConfigByTotal);
                this.originByOrder = JSON.stringify(this.orderGradeConfigByOrder);
            },
            reload() {
                this.analysisConfigData.degreetype = this.originDegreeType;
                this.orderGradeConfigByTotal = JSON.parse(this.originByTotal);
                this.orderGradeConfigByOrder = JSON.parse(this.originByOrder);
            },
            composeConfigByTotal(val) {
                for (var i=0; i<this.orderGradeConfigByTotal.length; i++) {
                    let config = this.orderGradeConfigByTotal[i];
                    let some = val.filter(item => item.level == config.level);
                    if (some.length > 0) {
                        config.checked = true;
                        config.lowscore = some[0].lowscore;
                    } else {
                        config.checked = false;
                        config.lowscore = '';
                    }
                }

                this.setOrigin();
            },
            composeConfigByOrder(val) {
                for (var i=0; i<this.orderGradeConfigByOrder.length; i++) {
                    let config = this.orderGradeConfigByOrder[i];
                    let some = val.filter(item => item.level == config.level);
                    if (some.length > 0) {
                        config.checked = true;
                        config.lowscore = some[0].lowscore;
                    } else {
                        config.checked = false;
                        config.lowscore = '';
                    }
                }

                this.setOrigin();
            },
            setOrigin() {
                for (var i=0; i<this.orderGradeConfigByOrder.length; i++) {
                    let config = this.orderGradeConfigByOrder[i];
                    config.origin = parseInt(config.lowscore);
                }
                for (var i=0; i<this.orderGradeConfigByTotal.length; i++) {
                    let config = this.orderGradeConfigByTotal[i];
                    config.origin = parseInt(config.lowscore);
                }

                this.originDegreeType = this.analysisConfigData.degreetype;
                this.originByTotal = JSON.stringify(this.orderGradeConfigByTotal);
                this.originByOrder = JSON.stringify(this.orderGradeConfigByOrder);
            },
            onChangeScore(index, item, type) {
                item.lowscore = Math.floor(item.lowscore);
                if (isNaN(item.lowscore) || item.lowscore > 100) {
                    item.lowscore = item.origin;
                    return;
                }

                if (type == 'byorder') {
                    for (let i=index-1; i>=0; i--) {
                        let target = this.orderGradeConfigByOrder[i];
                        if (target.checked && target.lowscore>=item.lowscore) {
                            item.lowscore = item.origin;
                            return;
                        }
                    }
                    for (let i=index+1; i<ORDER_GRADE.length; i++) {
                        let target = this.orderGradeConfigByOrder[i];
                        if (target.checked && target.lowscore<=item.lowscore) {
                            item.lowscore = item.origin;
                            return;
                        }
                    }
                    item.origin = item.lowscore;
                } else if (type == 'bytotal') {
                    for (let i=index-1; i>=0; i--) {
                        let target = this.orderGradeConfigByTotal[i];
                        if (target.checked && target.lowscore<=item.lowscore) {
                            item.lowscore = item.origin;
                            return;
                        }
                    }
                    for (let i=index+1; i<ORDER_GRADE_SCORE.length; i++) {
                        let target = this.orderGradeConfigByTotal[i];
                        if (target.checked && target.lowscore>=item.lowscore) {
                            item.lowscore = item.origin;
                            return;
                        }
                    }
                    item.origin = item.lowscore;
                }
            },
            onChangeCheck(index, item, type) {
                if (item.checked) {
                    if (type == 'byorder') {
                        let prevscore = 0;
                        let nextscore = 100;
                        for (let i=index-1; i>=0; i--) {
                            let target = this.orderGradeConfigByOrder[i];
                            if (target.checked) {
                                prevscore = parseInt(target.lowscore);
                                break;
                            }
                        }
                        for (let i=index+1; i<ORDER_GRADE.length; i++) {
                            let target = this.orderGradeConfigByOrder[i];
                            if (target.checked) {
                                nextscore = parseInt(target.lowscore);
                                break;
                            }
                        }
                        if (prevscore < item.origin && item.origin < nextscore) {
                            item.lowscore = item.origin;
                        } else if (nextscore - prevscore < 2) {
                            item.checked = false;
                            return;
                        } else if (prevscore >= item.origin) {
                            item.lowscore = prevscore + 1;
                        } else if (nextscore <= item.origin) {
                            item.lowscore = nextscore - 1;
                        }
                        item.origin = item.lowscore;
                    } else if (type == 'bytotal') {
                        let prevscore = 100;
                        let nextscore = 0;
                        for (let i=index-1; i>=0; i--) {
                            let target = this.orderGradeConfigByTotal[i];
                            if (target.checked) {
                                prevscore = parseInt(target.lowscore);
                                break;
                            }
                        }
                        for (let i=index+1; i<ORDER_GRADE_SCORE.length; i++) {
                            let target = this.orderGradeConfigByTotal[i];
                            if (target.checked) {
                                nextscore = parseInt(target.lowscore);
                                break;
                            }
                        }
                        if (prevscore > item.origin && item.origin > nextscore) {
                            item.lowscore = item.origin;
                        } else if (prevscore - nextscore < 2) {
                            item.checked = false;
                            return;
                        } else if (prevscore <= item.origin) {
                            item.lowscore = prevscore - 1;
                        } else if (nextscore >= item.origin) {
                            item.lowscore = nextscore + 1;
                        }
                        item.origin = item.lowscore;
                    }
                } else {
                    item.lowscore = '';
                }
            }
        },
        created() {
            this.composeConfigByOrder(JSON.parse(JSON.stringify(this.dataOrder)));
            this.composeConfigByOrder(JSON.parse(JSON.stringify(this.dataTotal)));
        }
    }
</script>

<style>
    .el-tabs.customized {
        margin-top:-62px;
    }
    .el-tabs.customized .el-tabs__nav {
        margin-left:200px;
    }
    .el-tabs.customized .el-tabs__header {
        border-bottom:0px;
    }
    .el-tabs.customized .el-tabs__item {
        line-height:55px;
        padding: 0 8px;
    }
    .el-tabs.customized .el-tab-pane {
        margin-top: 6px;
    }
</style>

<style>
    .el-tabs.no-header .el-tabs__header {
        display:none;
    }
</style>