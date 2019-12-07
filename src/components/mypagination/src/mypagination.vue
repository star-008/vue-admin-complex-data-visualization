<template>
    <div class="sms-pagination" v-if="total > 0">
        <span class="sms-pagination-text">
            显示{{ from }}到{{ to }},共{{ total }}记录
        </span>
        <span class="sms-pagination-control-panel">
            <span class="sms-pagination-control">
                <select v-model="numPerPage" @change="onChangeNumPerPage()">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </span>
            <span class="sms-pagination-control">
                <i class="fa fa-step-backward" :disabled="curPg==1" @click="toPage(0)"></i>
                <i class="fa fa-backward" :disabled="curPg==1" @click="toPage(curPg-1)"></i>
            </span>
            <span class="sms-pagination-control">
                第<input type="text" class="sms-pagination-input" v-model="toPg" @keyup.enter="toPage(toPg)"/>共{{ lastPg }}页
            </span>
            <span class="sms-pagination-control">
                <i class="fa fa-forward" :disabled="curPg==lastPg" @click="toPage(curPg+1)"></i>
                <i class="fa fa-step-forward" :disabled="curPg==lastPg" @click="toPage(lastPg)"></i>
            </span>
            <span class="sms-pagination-control">
                <i class="fa fa-repeat" @click="reload"></i>
            </span>
        </span>
    </div>
</template>

<script>
    export default {
        props: {
            page: {
                type: Number,
                default: 1,
                required: false
            },
            total: {
                type: Number,
                default: 0,
                required: true
            },
            pageSize: {
                type: Number,
                default: 10,
                required: false
            }
          },
          watch: {
            curPg: function (val, oldVal) {
                this.toPg = val;
            },
            page: function(val, oldVal) {
                this.curPg = val;
            }
          },
          data: function () {
            return {
                curPg:1,
                toPg:1,
                numPerPage:this.pageSize
            }
          },
          computed: {
            lastPg() {
                if (this.numPerPage == 0) return 0;
                return Math.ceil(this.total / this.numPerPage);
            },
            pages: function() {
                var startPg = Math.floor((this.curPg-1)/5) * 5 + 1;
                var endPg = Math.min(this.lastPg, Math.floor((this.curPg-1)/5) * 5 + 5);
                var pageNums = [];
                for (var i=startPg; i<=endPg; i++) {
                    pageNums.push(i);
                }
                return pageNums;
            },
            from: function() {
                return (this.curPg - 1) * this.numPerPage + 1;
            },
            to: function() {
                return Math.min(this.curPg * this.numPerPage, this.total);
            }
          },
          methods: {
            toPage: function(pg) {
                if (pg < 1) pg = 1;
                if (pg > this.lastPg) pg = this.lastPg;
                this.curPg = pg;

                this.$emit('current-change', parseInt(this.curPg));
            },
            reload() {
                this.toPage(this.curPg);
            },
            onChangeNumPerPage() {
                this.$emit('pagesize-change', parseInt(this.numPerPage));
                this.reload();
            }
        }
    }
</script>