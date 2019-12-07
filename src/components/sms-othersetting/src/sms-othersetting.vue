<template>
    <div class="template-content">
        <div class="sms-setting-panel-title">分数并列及排名显示设置</div>
        <div class="sms-setting-panel-content">
            <el-form label-width="130px" size="small">
                <el-form-item label="是否计算并列分数:">
                    <el-radio-group size="small" v-model="parellelsumenabled" :disabled="readonly">
                        <el-radio label="1">是</el-radio>
                        <el-radio label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <el-form label-width="200px" size="small">
                <el-form-item label="学生手机端历次成绩排名方式:">
                    <el-radio-group size="small" v-model="mobileviewmode" :disabled="readonly">
                        <el-radio label="0">年级排名</el-radio>
                        <el-radio label="1">班级排名</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <el-form label-width="130px" size="small" style="margin-bottom:0px;">
                <el-form-item label="缺考是否参与排名:">
                    <el-radio-group size="small" v-model="missedexamincluded" :disabled="readonly">
                        <el-radio label="1">是</el-radio>
                        <el-radio label="0">否</el-radio>
                    </el-radio-group>
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
                parellelsumenabled:'0',
                mobileviewmode:'1',
                missedexamincluded:'0',

                originParellelsumenabled:'0',
                originMobileviewmode:'1',
                originMissedexamincluded:'0'
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
                return this.originParellelsumenabled != this.parellelsumenabled || 
                        this.originMobileviewmode != this.mobileviewmode || 
                        this.originMissedexamincluded != this.missedexamincluded;
            },
            reset() {
                this.originParellelsumenabled = this.parellelsumenabled;
                this.originMobileviewmode = this.mobileviewmode;
                this.originMissedexamincluded = this.missedexamincluded;
            },
            reload() {
                this.parellelsumenabled = this.originParellelsumenabled;
                this.mobileviewmode = this.originMobileviewmode;
                this.missedexamincluded = this.originMissedexamincluded;
            },
            composeConfig(val) {
                if (val != null) {
                    this.parellelsumenabled = val.parellelsumenabled;
                    this.mobileviewmode = val.mobileviewmode;
                    this.missedexamincluded = val.missedexamincluded;

                    this.originParellelsumenabled = this.parellelsumenabled;
                    this.originMobileviewmode = this.mobileviewmode;
                    this.originMissedexamincluded = this.missedexamincluded;
                }
            }
        },
        created() {
            this.composeConfig(this.data);
        }
    }
</script>