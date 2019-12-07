<template>
    <div class="sms-breadcrumb">
        <span v-for="(step, idx) in breadCrumbSteps" v-bind:data="step" v-bind:key="idx">
            <a :href="step.url">{{ step.title }}</a>
            <span v-if="idx < breadCrumbSteps.length - 1"> &gt; </span>
        </span>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                breadCrumbSteps: this.steps
            }
        },
        props: {
            steps:Array
        },
        watch: {
            steps(val, oldval) {
                this.breadCrumbSteps = val;
            }
        }
    }
</script>
<style scoped lang="scss">
    @import '~scss_vars';

    .sms-breadcrumb {
        margin-bottom: 10px;
    }
    .sms-breadcrumb a {
        text-decoration:none;
        color: #186ed9;
    }
    .sms-breadcrumb a:last-child {
        color:#666666;
        cursor: default;
    }
</style>