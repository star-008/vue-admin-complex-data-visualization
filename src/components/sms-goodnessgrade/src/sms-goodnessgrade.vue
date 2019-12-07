<template>
    <div class="template-content">
        <div class="sms-setting-panel-title">四率参数设置</div>
        <div class="sms-setting-panel-desc">
            说明：设置四率的分数，以满分的百分比来设置、用户计算每个科目的四率。
        </div>
        <div class="sc-arg-set-intro">
            <span>
                科目及分卷：{{ subject }}<span v-if="volume!=null">{{ volume.dictname }}</span>
            </span>
            <span>
                满分: {{ score }}
            </span>
        </div>
        <div class="sms-setting-panel-content">
            <el-row v-for="(item,idx) in goodnessGradeConfig" :key="idx">
                <el-col :span="24">
                    <span class="sms-conf-item" style="text-align:left">
                        <el-checkbox v-model="item.config.checked" :value="true" :disabled="readonly" @change="onChangeCheck(idx, item)"></el-checkbox>
                    </span>
                    <span class="sms-conf-item">
                        {{ item.dictname }}
                    </span>
                    <span class="sms-conf-item" v-if="idx<goodnessGradeConfig.length-1">&gt;=</span>
                    <span class="sms-conf-item" v-if="idx==goodnessGradeConfig.length-1">&lt;</span>
                    <span class="sms-conf-item">
                        满分的:
                    </span>
                    <span class="sms-conf-item">
                        <el-input size="small" v-model.number="item.config.lowscore" :disabled="readonly || !item.config.checked"  @keyup.enter="onChangeLowScore(idx, item)" @change.native="onChangeLowScore(idx, item)"></el-input>
                    </span>
                    <span class="sms-conf-item" style="text-align:left">分</span>
                    <span class="sc-arg-set-gray" v-if="item.config.checked">
                        （默认满分的{{ getPercentOf(item.config.lowscore) }}%及以上）
                    </span>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
    import { GOODNESS_GRADE } from '../../../common/js/const';

    export default {
        data() {
            let goodnessGradeConfig = JSON.parse(JSON.stringify(GOODNESS_GRADE));
            for (var i=0; i<goodnessGradeConfig.length; i++) {
                goodnessGradeConfig[i].config = { lowscore:'', checked:false, level:goodnessGradeConfig[i].dictvalue };
            }
            let score = 0;
            let subject = '';
            if (this.examsubjectscore.subject === true) {
                score = this.totalscore;
                subject = '总分';
            }
            return {
                goodnessGradeConfig:goodnessGradeConfig,
                original:JSON.stringify(goodnessGradeConfig),
                score:score,
                subject:subject
            };
        },
        props: {
            data:Array,
            examsubjectscore:Object,
            volume:Object,
            totalscore:Number,
            readonly:{
                type:Boolean,
                required:false,
                default:false
            }
        },
        watch: {
            data(val, oldval) {
                this.composeConfig(val);
            },
            examsubjectscore(val, oldval) {
                if (val.subject === true) {
                    this.score = this.totalscore;
                    this.subject = '总分';
                } else {
                    this.score = parseInt(val.score);
                    this.subject = val.subject.dictname;
                }
            },
            totalscore(val, oldval) {
                if (this.examsubjectscore.subject === true) {
                    this.score = val;
                    this.composeConfig(this.data);
                }
            }
        },
        methods: {
            isModified() {
                return this.original != JSON.stringify(this.goodnessGradeConfig);
            },
            reset() {
                this.original = JSON.stringify(this.goodnessGradeConfig);
            },
            reload() {
                this.goodnessGradeConfig = JSON.parse(this.original);
            },
            getPercentOf(val) {
                if (this.score == 0) return 0;
                return parseInt(val * 100 / this.score);
            },
            composeConfig(val) {
                if (val.length == 0) {
                    this.goodnessGradeConfig[0].config.checked = true;
                    this.goodnessGradeConfig[0].config.lowscore = Math.floor(this.score * 0.9);

                    this.goodnessGradeConfig[1].config.checked = true;
                    this.goodnessGradeConfig[1].config.lowscore = Math.floor(this.score * 0.8);

                    this.goodnessGradeConfig[2].config.checked = true;
                    this.goodnessGradeConfig[2].config.lowscore = Math.floor(this.score * 0.6);

                    this.goodnessGradeConfig[3].config.checked = true;
                    this.goodnessGradeConfig[3].config.lowscore = Math.floor(this.score * 0.4);
                } else {
                    for (var i=0; i<this.goodnessGradeConfig.length; i++) {
                        let some = val.filter(item => item.level == this.goodnessGradeConfig[i].config.level);
                        if (some.length > 0) {
                            this.goodnessGradeConfig[i].config.checked = true;
                            this.goodnessGradeConfig[i].config.lowscore = parseInt(some[0].lowscore);
                        } else {
                            this.goodnessGradeConfig[i].config.checked = false;
                            this.goodnessGradeConfig[i].config.lowscore = '';
                        }
                    }
                }

                for (var i=0; i<this.goodnessGradeConfig.length; i++) {
                    this.goodnessGradeConfig[i].config.origin = this.goodnessGradeConfig[i].config.lowscore;
                }
                this.original = JSON.stringify(this.goodnessGradeConfig);
            },
            onChangeCheck(idx, item) {
                if (item.config.checked) {
                    let prevlowscore = this.score;
                    let nextlowscore = 0;
                    let nextidx = -1;
                    let previdx = -1;
                    for (var i=idx-1; i>=0; i--) {
                        if (this.goodnessGradeConfig[i].config.checked) {
                            prevlowscore = this.goodnessGradeConfig[i].config.lowscore;
                            previdx = i;
                            break;
                        }
                    }
                    for (var i=idx+1; i<4; i++) {
                        if (this.goodnessGradeConfig[i].config.checked) {
                            nextlowscore = this.goodnessGradeConfig[i].config.lowscore;
                            nextidx = i;
                            break;
                        }
                    }

                    if (prevlowscore - nextlowscore < 1) {
                        item.config.checked = false;
                    } else if (item.config.origin >= prevlowscore) {
                        item.config.lowscore = prevlowscore - (idx==3||previdx==-1?0:1);
                    } else if (item.config.origin <= nextlowscore) {
                        item.config.lowscore = nextlowscore + (nextidx==-1?0:1);
                    } else {
                        item.config.lowscore = item.config.origin;
                    }
                } else {
                    item.config.lowscore = '';
                }
            },
            onChangeLowScore(idx, item) {
                item.config.lowscore = Math.floor(item.config.lowscore);

                let prevlowscore = this.score;
                let previndex = -1;
                let nextlowscore = 0;
                let nextindex = -1;
                for (var i=idx-1; i>=0; i--) {
                    if (this.goodnessGradeConfig[i].config.checked) {
                        prevlowscore = this.goodnessGradeConfig[i].config.lowscore;
                        previndex = i;
                        break;
                    }
                }
                for (var i=idx+1; i<4; i++) {
                    if (this.goodnessGradeConfig[i].config.checked) {
                        nextlowscore = this.goodnessGradeConfig[i].config.lowscore;
                        nextindex = i;
                        break;
                    }
                }
                if (isNaN(item.config.lowscore) || (previndex == -1 && item.config.lowscore > prevlowscore) || 
                    (idx == 3 && item.config.lowscore > prevlowscore) || 
                    (idx != 3 && previndex != -1 && item.config.lowscore >= prevlowscore) || 
                    (nextindex != 3 && item.config.lowscore <= nextlowscore) || 
                    (nextindex == 3 && item.config.lowscore < nextlowscore)) {
                    item.config.lowscore = item.config.origin;
                    return;
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