<template>
    <div class="template-content">
        <div class="sms-setting-panel-title">分数段设置</div>
        <div class="sms-setting-panel-content">
            <el-form >
                <el-row>
                    <el-col :span="24">
                        <el-form-item label-width="140px" label="分数段方式和名称：" class="inline-block">
                            <el-input size="small" v-model="scoreBandConfig.configname" style="width:170px" :disabled="readonly"></el-input>
                            <span class="sc-arg-set-gray">（默认{{ bandstep }}分一个段）</span>
                        </el-form-item>
                        <el-form-item label-width="120px" label="分数段区间：" class="inline-block" v-if="!readonly">
                            <el-input size="small" v-model.number="bandstepmanual" style="width:60px" @change.native="onChangeBandStepManual"></el-input>
                            <span style="display:inline;color:#48576a;font-size:14px;margin-top: 1px;float: right;margin-left: 10px;">{{ this.score }}分</span>
                        </el-form-item>
                        <el-form-item label-width="80px" label="间隔：" class="inline-block" v-if="!readonly">
                            <el-select size="small" v-model.number="bandstep" style="width:80px" @change="onChangeBandStep" v-if="total">
                                <el-option :value="10" label="10分">10分</el-option>
                                <el-option :value="20" label="20分">20分</el-option>
                                <el-option :value="30" label="30分">30分</el-option>
                                <el-option :value="50" label="50分">50分</el-option>
                                <el-option :value="80" label="80分">80分</el-option>
                                <el-option :value="100" label="100分">100分</el-option>
                            </el-select>
                            <el-select size="small" v-model.number="bandstep" style="width:80px" @change="onChangeBandStep" v-if="!total">
                                <el-option :value="5" label="5分">5分</el-option>
                                <el-option :value="10" label="10分">10分</el-option>
                                <el-option :value="15" label="15分">15分</el-option>
                                <el-option :value="20" label="20分">20分</el-option>
                            </el-select>
                            <el-button size="small" @click="generateScoreBand" style="float:right;margin-top:5px;margin-left: 10px">生成</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <el-row>
                <el-col :span="24">
                    <span class="sms-conf-item sms-bold" style="text-align:left">序号</span>
                    <span class="sms-conf-item sms-conf-item-big sms-bold">分数段名称</span>
                    <span class="sms-conf-item sms-conf-item-big sms-bold">判断规则</span>
                    <span class="sms-conf-item sms-conf-item-big sms-bold">下限</span>
                </el-col>
            </el-row>
            <el-row v-for="(item,idx) in scoreBandConfig.items" :key="idx">
                <el-col :span="24">
                    <span class="sms-conf-item" style="text-align:left">
                        <div class="sms-setting-number">{{ idx + 1 }}</div>
                    </span>
                    <span class="sms-conf-item sms-conf-item-big">
                        <el-input size="small" v-model="item.itemname" :disabled="readonly"></el-input>
                    </span>
                    <span class="sms-conf-item sms-conf-item-big">
                        {{ '[ ' + item.lowscore + ',' + item.highscore + (idx==0?' ]':' )') }}
                    </span>
                    <span class="sms-conf-item sms-conf-item-big">
                        <el-input size="small" v-model.number="item.lowscore" style="width:60px" @change.native="onChangeBandLowscore(item)" :disabled="readonly"></el-input>
                    </span>
                    <span class="sms-conf-item sms-conf-item-big sms-operation" v-if="!readonly && idx==scoreBandConfig.items.length-1">
                        <a class="sms-operation-anchor" href="javascript:;" @click="deleteScoreBand(item)">删除</a>
                    </span>
                </el-col>
            </el-row>
            <el-button @click="addScoreBand" icon="plus" style="color:#186ed9;border-color:#186ed9;" v-if="!readonly">添加分段</el-button>
        </div>
    </div>
</template>

<script>
    import { SCORE_GRADE } from '../../../common/js/const';

    export default {
        data() {
            let score = 0;
            let total = true;
            let bandstep = 5;
            if (this.examsubjectscore.subject === true) {
                score = this.totalscore;
                total = true;
                bandstep = 20;
            } else {
                total = false;
                bandstep = 5;
            }
            return {
                bandstep:bandstep,
                bandstepmanual:'',
                scoreBandConfig: {
                    configname:'',
                    items:[]
                },
                original: '',
                score: score,
                total: true,
            }
        },
        props: {
            data:Array,
            examsubjectscore:Object,
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
                    this.total = true;
                    this.bandstep = 20;
                } else {
                    this.score = parseInt(val.score);
                    this.total = false;
                    this.bandstep = 5;
                }
            },
            totalscore(val, oldval) {
                if (this.examsubjectscore.subject === true) {
                    this.score = val;
                }
            }
        },
        methods: {
            isModified() {
                return this.original != JSON.stringify(this.scoreBandConfig);
            },
            reset() {
                this.original = JSON.stringify(this.scoreBandConfig);
            },
            reload() {
                this.scoreBandConfig = JSON.parse(this.original);
            },
            generateScoreBand() {
                let bandstep = this.bandstep;
                if (this.bandstepmanual !== '') {
                    bandstep = this.bandstepmanual;
                }
                this.scoreBandConfig.configname = '满分' + this.score + '分，间隔' + bandstep + '分';
                let scoreBands = [];
                let stepcount = Math.ceil(this.score / bandstep);
                for (var i=0; i<stepcount; i++) {
                    let high = this.score - bandstep * i;
                    let low = Math.max(0, this.score - bandstep * (i + 1));
                    scoreBands.push({
                        itemname: low + ' - ' + high,
                        highscore: high,
                        lowscore: low,
                        origin: low,
                        level: i + 1
                    });
                }
                this.scoreBandConfig.items = scoreBands;
            },
            composeConfig(val) {
                if (val.length > 0) {
                    this.scoreBandConfig.configname = val[0].configname;
                    this.scoreBandConfig.items = val.map(item=>({
                        itemname: item.itemname,
                        highscore: parseInt(item.highscore),
                        lowscore: parseInt(item.lowscore),
                        origin: parseInt(item.lowscore),
                        level: parseInt(item.level)
                    }));
                    for (var i=0; i<this.scoreBandConfig.items.length; i++) {
                        this.scoreBandConfig.items[i].origin = this.scoreBandConfig.items[i].lowscore;
                    }
                } else {
                    this.scoreBandConfig.configname = '';
                    this.scoreBandConfig.items = [];
                    this.generateScoreBand();
                }
                this.original = JSON.stringify(this.scoreBandConfig);
            },
            addScoreBand() {
                let high, low;
                let bandstep = this.bandstep;
                if (this.bandstepmanual !== '') {
                    bandstep = this.bandstepmanual;
                }

                if (this.scoreBandConfig.items.length == 0) {
                    high = this.score;
                    low = Math.max(0, this.score - bandstep);
                } else {
                    let lastBand = this.scoreBandConfig.items[this.scoreBandConfig.items.length - 1];
                    if (lastBand.lowscore == 0) return;
                    high = lastBand.lowscore;
                    low = Math.max(0, lastBand.lowscore - bandstep);
                }

                this.scoreBandConfig.items.push({
                    itemname: low + ' - ' + high,
                    highscore: high,
                    lowscore: low,
                    origin: low,
                    level: this.scoreBandConfig.items.length + 1
                });
            },
            deleteScoreBand(scoreBand) {
                let index = this.scoreBandConfig.items.indexOf(scoreBand);
                this.scoreBandConfig.items.splice(index, 1);
            },
            onChangeBandStep() {
                this.bandstepmanual = '';
            },
            onChangeBandStepManual() {
                if (this.bandstepmanual === '') return;
                this.bandstepmanual = Math.max(Math.min(this.bandstepmanual, this.score), 1);
            },
            onChangeBandLowscore(item) {
                item.lowscore = parseInt(item.lowscore);

                let index = this.scoreBandConfig.items.indexOf(item);
                let next = index < this.scoreBandConfig.items.length-1?this.scoreBandConfig.items[index + 1]:null;

                if (isNaN(item.lowscore) || item.lowscore < 0 || item.lowscore > item.highscore) {
                    item.lowscore = item.origin;
                } else if (next != null) {
                    if (item.lowscore < next.lowscore) {
                        item.lowscore = item.origin;
                    } else {
                        next.highscore = item.lowscore;
                    }
                }
                item.origin = item.lowscore;
                item.itemname = item.lowscore + ' - ' + item.highscore;
                if (next != null)
                    next.itemname = next.lowscore + ' - ' + next.highscore;
            }
        },
        created() {
            this.composeConfig(this.data);
        }
    }
</script>

<style scoped>
    .inline-block {
        display:inline-block;
    }
</style>