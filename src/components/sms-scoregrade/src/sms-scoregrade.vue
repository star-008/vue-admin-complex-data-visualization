<template>
    <div class="template-content">
        <div class="sms-setting-panel-title">分段设置</div>
        <div class="sms-setting-panel-desc">
            说明：给每个分段设置分数范围，按满分的百分比来设置，计算这个分数段内的人数和比列，可勾选显示分段。
        </div>
        <div class="sms-setting-panel-content">
            <el-row>
                <el-col :span="24">
                    <span class="sms-conf-item sms-bold"></span>
                    <span class="sms-conf-item sms-conf-item-big sms-bold">分段名称</span>
                    <span class="sms-conf-item sms-conf-item-big sms-bold">判断规则</span>
                    <span class="sms-conf-item sms-conf-item-big sms-bold">下限</span>
                    <span class="sms-conf-item"></span>
                </el-col>
            </el-row>
            <el-row v-for="(item,idx) in scoreGradeConfig" :key="idx">
                <el-col :span="24">
                    <span class="sms-conf-item" style="text-align:left">
                        <el-checkbox v-model="item.config.checked" :value="true" :disabled="readonly" @change="onChangeCheck(idx, item)"></el-checkbox>
                    </span>
                    <span class="sms-conf-item sms-conf-item-big">
                        {{ item.dictname }}
                    </span>
                    <span class="sms-conf-item sms-conf-item-big">
                        <span v-if="item.config.checked">{{ '[ ' + item.config.lowscore + ',' + item.config.highscore + (idx==0?' ]':' )') }}</span>
                    </span>
                    <span class="sms-conf-item sms-conf-item-big">
                        <el-input size="small" v-model.number="item.config.lowscore" :disabled="readonly || !item.config.checked" @keyup.enter="onChangeLowScore(idx, item)" @change.native="onChangeLowScore(idx, item)"></el-input>
                    </span>
                    <span class="sc-arg-set-gray" v-if="item.config.checked&&idx==0">
                        （默认满分的{{ item.config.lowscore }}%及以上）
                    </span>
                    <span class="sc-arg-set-gray" v-if="item.config.checked&&idx>0">
                        （默认满分的{{ item.config.highscore }}%-{{ item.config.lowscore }}%及以上）
                    </span>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
    import { SCORE_GRADE } from '../../../common/js/const';

    export default {
        data() {
            let scoreGradeConfig = JSON.parse(JSON.stringify(SCORE_GRADE));
            for (var i=0; i<scoreGradeConfig.length; i++) {
                scoreGradeConfig[i].config = { lowscore:'', highscore:'', checked:false, level:scoreGradeConfig[i].dictvalue };
            }
            return {
                scoreGradeConfig:scoreGradeConfig,
                original:JSON.stringify(scoreGradeConfig)
            };
        },
        props: {
            data:Array,
            readonly:{
                type:Boolean,
                required:false,
                default:false
            }
        },
        watch: {
            data(val, oldval) {
                this.composeConfig(val);
            }
        },
        methods: {
            isModified() {
                return this.original != JSON.stringify(this.scoreGradeConfig);
            },
            reset() {
                this.original = JSON.stringify(this.scoreGradeConfig);
            },
            reload() {
                this.scoreGradeConfig = JSON.parse(this.original);
            },
            composeConfig(val) {
                if (val.length == 0) {
                    this.scoreGradeConfig[0].config.checked = true;
                    this.scoreGradeConfig[0].config.lowscore = 90;
                    this.scoreGradeConfig[0].config.highscore = 100;

                    this.scoreGradeConfig[1].config.checked = true;
                    this.scoreGradeConfig[1].config.lowscore = 75;
                    this.scoreGradeConfig[1].config.highscore = 90;

                    this.scoreGradeConfig[2].config.checked = true;
                    this.scoreGradeConfig[2].config.lowscore = 60;
                    this.scoreGradeConfig[2].config.highscore = 75;

                    this.scoreGradeConfig[3].config.checked = true;
                    this.scoreGradeConfig[3].config.lowscore = 40;
                    this.scoreGradeConfig[3].config.highscore = 60;

                    this.scoreGradeConfig[4].config.checked = true;
                    this.scoreGradeConfig[4].config.lowscore = 20;
                    this.scoreGradeConfig[4].config.highscore = 40;

                    this.scoreGradeConfig[5].config.checked = true;
                    this.scoreGradeConfig[5].config.lowscore = 0;
                    this.scoreGradeConfig[5].config.highscore = 20;
                } else {
                    for (var i=0; i<this.scoreGradeConfig.length; i++) {
                        let some = val.filter(item => item.level == this.scoreGradeConfig[i].dictvalue);
                        if (some.length > 0) {
                            this.scoreGradeConfig[i].config.checked = true;
                            this.scoreGradeConfig[i].config.lowscore = parseInt(some[0].lowscore);
                            this.scoreGradeConfig[i].config.highscore = some[0].highscore?parseInt(some[0].highscore):100;
                        } else {
                            this.scoreGradeConfig[i].config.checked = false;
                            this.scoreGradeConfig[i].config.lowscore = '';
                            this.scoreGradeConfig[i].config.highscore = '';
                        }
                    }
                }

                for (var i=0; i<this.scoreGradeConfig.length; i++) {
                    this.scoreGradeConfig[i].config.origin = this.scoreGradeConfig[i].config.lowscore;
                }

                this.original = JSON.stringify(this.scoreGradeConfig);
            },
            onChangeCheck(idx, item) {
                if (item.config.checked) {
                    item.config.lowscore = 0;
                    item.config.origin = 0;
                    item.config.highscore = 100;
                    for (var i=idx+1; i<6; i++) {
                        if (this.scoreGradeConfig[i].config.checked) {
                            item.config.lowscore = this.scoreGradeConfig[i].config.highscore;
                            item.config.origin = item.config.lowscore;
                            break;
                        }
                    }
                    for (var i=idx-1; i>0; i--) {
                        if (this.scoreGradeConfig[i].config.checked) {
                            item.config.highscore = this.scoreGradeConfig[i].config.lowscore;
                            break;
                        }
                    }
                } else {
                    for (var i=idx+1; i<6; i++) {
                        if (this.scoreGradeConfig[i].config.checked) {
                            this.scoreGradeConfig[i].config.highscore = item.config.lowscore;
                            break;
                        }
                    }
                    for (var i=idx-1; i>0; i--) {
                        if (this.scoreGradeConfig[i].config.checked) {
                            this.scoreGradeConfig[i].config.lowscore = item.config.lowscore;
                            this.scoreGradeConfig[i].config.origin = this.scoreGradeConfig[i].config.lowscore;
                            break;
                        }
                    }
                    item.config.lowscore = '';
                    item.config.origin = '';
                    item.config.highscore = '';
                }
            },
            onChangeLowScore(idx, item) {
                item.config.lowscore = Math.floor(item.config.lowscore);

                let next = null;
                for (var i=idx + 1; i<6; i++) {
                    if (this.scoreGradeConfig[i].config.checked) {
                        next = this.scoreGradeConfig[i];
                        break;
                    }
                }

                if (isNaN(item.config.lowscore) || item.config.lowscore < 0 || item.config.lowscore > item.config.highscore) {
                    item.config.lowscore = item.config.origin;
                } else if (next != null) {
                    if (item.config.lowscore < next.config.lowscore) {
                        item.config.lowscore = item.config.origin;
                    } else {
                        next.config.highscore = item.config.lowscore;
                    }
                }

                item.config.origin = item.config.lowscore;
            }
        },
        created() {
            this.composeConfig(this.data);
        }
    }
</script>

<style scoped>
    .sms-conf-item {
        display:inline-block;
        width:60px;
        text-align:center;
    }
    .sms-conf-item-big {
        width:100px;
    }
    .sms-setting-panel-content .el-row {
        margin-bottom:20px;
    }
    .sms-setting-panel-content .el-row:last-child {
        margin-bottom:0px;
    }
</style>