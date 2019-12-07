<template>
    <section class="print">
        <div class="page-break" v-for="(studentexams, index) in totalscorebyexam" :key="index" v-if="studentexams.length>0">
            <div style="margin-bottom:20px; width: 100%;">
                <table style="width:100%" border>
                    <tr class="center sms-big-title">
                        <th :colspan="studentexams[0].studentsubjects.length + 2">
                            <span class="cell">{{ getStudentLabel(studentexams[0]) }}</span>
                        </th>
                    </tr>
                    <tr class="left">
                        <th style="width:10000px;"><span class="cell">考试名称</span></th>
                        <th v-for="(item, idx) in studentexams[0].studentsubjects" :key="idx" align="left" style="width: 60px">
                            <span class="cell">{{ item.dictname }}</span>
                        </th>
                        <th><span class="cell">总分</span></th>
                    </tr>
                    <tr v-for="(exam, idx) in studentexams" :key="idx" class="left">
                        <td><span class="cell">{{exam.exam.examname}}</span></td>
                        <td v-for="(item, idx) in studentexams[0].studentsubjects" :key="idx">
                            <span class="cell" v-if="exam.subjectscores[idx]!=null">
                                <span class="sc-color-red" v-if="SMSUtil.formatNumber(exam.subjectscores[idx].score, 2)=='-1'">缺考</span>
                                <span v-else>{{ SMSUtil.formatNumber(exam.subjectscores[idx].score, 2) }}</span>
                            </span>
                        </td>
                        <td><span class="cell">{{exam.totalscore}}</span></td>
                    </tr>
                </table>
            </div>
        </div>
    </section>
</template>

<script>
    import SMSUtil from '../../../common/js/util';
    export default {
        data() {
            return {
                SMSUtil:SMSUtil,
                totalscorebyexam:[]
            }
        },
        methods: {
            getStudentLabel(studentexam) {
                if (studentexam.stuno != '' && studentexam.stuno != null)
                    return studentexam.stuname + '  (' + studentexam.stuno + ')  个人成绩册';
                return studentexam.stuname + '  个人成绩册';
            }
        },
        created() {
            let totalscorebyexam = localStorage.getItem('sms-stat-orderbyperson');
            this.totalscorebyexam = totalscorebyexam == null ? [] : JSON.parse(totalscorebyexam);
        }
    }
</script>

<style scoped lang="scss">
    @import '~scss_vars';

    section {
        font-family: 'Arial';
        background-color: white;
        padding: 30px 50px;
        min-width: 8.5in;
        min-height: 11in;
        max-width: 8.5in;
        max-height: 11in;
        margin: 0px;
    }
    .print table {
        border: 1px solid #a9b8c5;
        color: black;
    }
    .print table th {
        font-weight: bold;
        background-color: #edf2f7;
    }
    .print table .cell {
        white-space: normal;
        word-break: break-all;
        line-height: 24px;
        padding: 10px 10px 10px 5px;
        display: inline-block;
        width: 100%;
    }
    .print table tr.left .cell {
        text-align: left;
    }
    .print table tr.center .cell {
        text-align: center;
    }
    .print .sms-big-title {
        font-size: 16px;
    }
</style>