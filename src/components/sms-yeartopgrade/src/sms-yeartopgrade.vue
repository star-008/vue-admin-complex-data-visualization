<template>
    <div class="template-content">
        <div class="sms-setting-panel-title">年级若干名档次设置</div>
        <div class="sms-setting-panel-content">
            <el-form label-width="100px" size="small">
                <el-form-item label="年级前若干名:">
                    <el-tag
                        :key="item"
                        v-for="item in beforeOfYear"
                        :closable="!readonly"
                        :disable-transitions="false"
                        @close="deleteInBeforeOfYear(item)">
                        {{ item }}
                    </el-tag>
                    <el-input
                        type="number"
                        class="input-new-tag"
                        v-if="inputBYVisible"
                        v-model.number="inputBY"
                        ref="saveBYTagInput"
                        size="small"
                        @keyup.enter.native.prevent="confirmBY"
                        @blur="confirmBY"></el-input>
                    <span class="sms-operation" v-if="!readonly">
                        <a class="sms-operation-anchor" href="javascript:;" @click="showBYInput">添加</a>
                    </span>
                </el-form-item>
                <el-form-item label="年级后若干名:" style="margin-bottom:0px;">
                    <el-tag
                        :key="item"
                        v-for="item in afterOfYear"
                        :closable="!readonly"
                        :disable-transitions="false"
                        @close="deleteInAfterOfYear(item)">
                        {{ item }}
                    </el-tag>
                    <el-input
                        type="number"
                        class="input-new-tag"
                        v-if="inputAYVisible"
                        v-model.number="inputAY"
                        ref="saveAYTagInput"
                        size="small"
                        @keyup.enter.native.prevent="confirmAY"
                        @blur="confirmAY"></el-input>
                    <span class="sms-operation" v-if="!readonly">
                        <a class="sms-operation-anchor" href="javascript:;" @click="showAYInput">添加</a>
                    </span>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    import { BEFORE_OF_YEAR, AFTER_OF_YEAR } from '../../../common/js/const';

    export default {
        data() {
            return {
                inputBYVisible:false,
                inputBY:'',
                beforeOfYear:[],
                inputAYVisible:false,
                inputAY:'',
                afterOfYear:[],
                originBefore:'',
                originAfter:''
            }
        },
        props: {
            data:Object,
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
                return this.originBefore != JSON.stringify(this.beforeOfYear) || this.originAfter != JSON.stringify(this.afterOfYear);
            },
            reset() {
                this.originBefore = JSON.stringify(this.beforeOfYear);
                this.originAfter = JSON.stringify(this.afterOfYear);
            },
            reload() {
                this.beforeOfYear = JSON.parse(this.originBefore);
                this.afterOfYear = JSON.parse(this.originAfter);
            },
            composeConfig(val) {
                if (val == null || val.gradetopcount=='' || val.gradelastcount=='') {
                    this.beforeOfYear = BEFORE_OF_YEAR;
                    this.afterOfYear = AFTER_OF_YEAR;
                } else {
                    this.beforeOfYear = val.gradetopcount.split(",");
                    this.afterOfYear = val.gradelastcount.split(",");
                }
                this.originBefore = JSON.stringify(this.beforeOfYear);
                this.originAfter = JSON.stringify(this.afterOfYear);
            },
            deleteInBeforeOfYear(item) {
                let index = this.beforeOfYear.indexOf(item);
                this.beforeOfYear.splice(index, 1);
            },
            showBYInput() {
                this.inputBYVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveBYTagInput.$refs.input.focus();
                });
            },
            confirmBY() {
                let inputBY = this.inputBY;

                if (parseInt(inputBY) < 1) {
                    this.inputBY = "";
                    return;
                }

                if (inputBY) {
                    let sameone = this.beforeOfYear.filter(item=>item==inputBY);
                    if (sameone.length == 0) {
                        this.beforeOfYear.push(inputBY);
                        this.beforeOfYear.sort(SMSUtil.numberSort)
                    }
                }
                this.inputBYVisible = false;
                this.inputBY = '';
            },
            deleteInAfterOfYear(item) {
                let index = this.afterOfYear.indexOf(item);
                this.afterOfYear.splice(index, 1);
            },
            showAYInput() {
                this.inputAYVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveAYTagInput.$refs.input.focus();
                });
            },
            confirmAY() {
                let inputAY = this.inputAY;

                if (parseInt(inputAY) < 1) {
                    this.inputAY = "";
                    return;
                }

                if (inputAY) {
                    let sameone = this.afterOfYear.filter(item=>item==inputAY);
                    if (sameone.length == 0) {
                        this.afterOfYear.push(inputAY);
                        this.afterOfYear.sort(SMSUtil.numberSort)
                    }
                }
                this.inputAYVisible = false;
                this.inputAY = '';
            }
        },
        created() {
            this.composeConfig(this.data);
        }
    }
</script>

<style scoped>
    .el-tag {
        background-color:#eff2f4;
        color:black;
        line-height: 30px;
        height: 30px;
        padding: 0px 10px;
        margin-right: 10px;
        min-width: 64px;
    }
    .input-new-tag {
        width: 70px;
        vertical-align: bottom;
    }
</style>

<style>
    .el-tag .el-icon-close {
        color:#bfcbd9;
    }
</style>