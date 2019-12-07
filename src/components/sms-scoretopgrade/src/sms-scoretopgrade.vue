<template>
    <div class="template-content">
        <div class="sms-setting-panel-title">分数段档次设置</div>
        <div class="sms-setting-panel-content">
            <el-form label-width="115px" size="small">
                <el-form-item label="单科分数段档次:">
                    <el-select size="small" class="sms-conf-item sms-conf-item-big" v-model="scoredivisionbysubject" :disabled="readonly">
                        <el-option label="5" value="5"></el-option>
                        <el-option label="10" value="10"></el-option>
                        <el-option label="15" value="15"></el-option>
                        <el-option label="20" value="20"></el-option>
                    </el-select>
                    分
                </el-form-item>
                <el-form-item label="总分分数段档次:" style="margin-bottom:0px;">
                    <el-select size="small" class="sms-conf-item sms-conf-item-big" v-model="scoredivisionbytotal" :disabled="readonly">
                        <el-option label="10" value="10"></el-option>
                        <el-option label="20" value="20"></el-option>
                        <el-option label="30" value="30"></el-option>
                        <el-option label="50" value="50"></el-option>
                        <el-option label="80" value="80"></el-option>
                        <el-option label="100" value="100"></el-option>
                    </el-select> 分
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    import {  } from '../../../api/api';

    export default {
        data() {
            return {
                scoredivisionbysubject:'5',
                scoredivisionbytotal:'20',
                origindivisionbysubject:'5',
                origindivisionbytotal:'20'
            }
        },
        props: {
            data: Object,
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
                return this.origindivisionbysubject != this.scoredivisionbysubject || this.origindivisionbytotal != this.scoredivisionbytotal;
            },
            reset() {
                this.origindivisionbysubject = this.scoredivisionbysubject;
                this.origindivisionbytotal = this.scoredivisionbytotal;
            },
            reload() {
                this.scoredivisionbysubject = this.origindivisionbysubject;
                this.scoredivisionbytotal = this.origindivisionbytotal;
            },
            composeConfig(val) {
                if (val != null) {
                    this.scoredivisionbysubject = val.scoredivisionbysubject;
                    this.scoredivisionbytotal = val.scoredivisionbytotal;
                }
                this.origindivisionbysubject = this.scoredivisionbysubject;
                this.origindivisionbytotal = this.scoredivisionbytotal;
            }
        },
        created() {
            this.composeConfig(this.data);
        }
    }
</script>