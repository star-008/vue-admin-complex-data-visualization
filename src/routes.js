import NotFound from './views/404.vue'
import template from './views/template.vue'
import intermediate from './views/intermediate.vue'
import login from './views/login.vue'
import help from './views/help.vue'
import sso from './views/sso.vue'

import home from './views/home/index.vue'
import createexam from './views/home/createexam.vue'
import editexam from './views/home/editexam.vue'

import scoremng_setting_subjecscore from './views/scoremng/setting/subjectscore.vue'

import scoremng_input_subjectscore from './views/scoremng/input/subjectscore.vue'
import scoremng_input_questionscore from './views/scoremng/input/questionscore.vue'
import scoremng_input_publishscore from './views/scoremng/input/publishscore.vue'

import scoremng_review_propose from './views/scoremng/review/proposal.vue'
import scoremng_review_process from './views/scoremng/review/process.vue'

import scorestat_order_all from './views/scorestat/orderstatistics/all.vue'
import scorestat_order_byperson from './views/scorestat/orderstatistics/byperson.vue'
import scorestat_order_byperson_print from './views/scorestat/orderstatistics/print.vue'

import scorestat_classanalysis_subjectavg from './views/scorestat/classanalysis/subjectavg/index.vue'
import scorestat_classanalysis_subjecttop from './views/scorestat/classanalysis/subjecttop/index.vue'
import scorestat_classanalysis_subjectbalance from './views/scorestat/classanalysis/subjectbalance/index.vue'
import scorestat_classanalysis_subjectline from './views/scorestat/classanalysis/subjectline/index.vue'
import scorestat_classanalysis_subjectscoreline from './views/scorestat/classanalysis/subjectscoreline/index.vue'
import scorestat_classanalysis_subjectorderline from './views/scorestat/classanalysis/subjectorderline/index.vue'
import scorestat_classanalysis_subjectdifficulty from './views/scorestat/classanalysis/subjectdifficulty/index.vue'
import scorestat_classanalysis_subjecttotal from './views/scorestat/classanalysis/subjecttotal/index.vue'
import scorestat_classanalysis_subjectquestionscore from './views/scorestat/classanalysis/subjectquestionscore/index.vue'
import scorestat_classanalysis_questiondifficulty from './views/scorestat/classanalysis/questiondifficulty/index.vue'
import scorestat_classanalysis_subjecttopcompare from './views/scorestat/classanalysis/subjecttopcompare/index.vue'
import scorestat_classanalysis_subjectavgcompare from './views/scorestat/classanalysis/subjectavgcompare/index.vue'

import scorestat_personalanalysis_index from './views/scorestat/personalanalysis/index.vue'
import scorestat_personalanalysis_report from './views/scorestat/personalanalysis/report.vue'

import system_analysisparam from './views/system/analysisparam/index.vue'
import system_analysisparam_detail from './views/system/analysisparam/detail.vue'

import SMSUtil from './common/js/util'

let routes = [
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    },
    {
        path: '/login',
        component: login,
        name: '',
        hidden: true
    },
    {
        path: '/sso',
        component: sso,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: template,
        name: '',
        hidden: true,
        children: [
            {
                path: '/help',
                component: help,
                name: '帮助中心'
            }
        ]
    },
    {
        path: '/orderstatistics/byperson/print',
        component: scorestat_order_byperson_print,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: template,
        name: '',
        iconCls: 'sms-icon sms-icon-home',
        leaf: true,
        children: [
            {
                path: '/home',
                component: home,
                name: '首页'
            },
            {
                path: '/home/:termid',
                component: home,
                name: '首页'
            }
        ]
    },
    {
        path: '/home',
        meta: {
            breadcrumb: true,
            path: SMSUtil.getContext() + 'home'
        },
        component: template,
        name: '首页',
        hidden: true,
        children: [
            {
                path: '/exam/create',
                component: createexam,
                name: '新建考试',
                meta: {
                    breadcrumb: true,
                    path: 'javascript:;'
                }
            },
            {
                path: '/exam/:id',
                component: editexam,
                name: '编辑考试',
                meta: {
                    breadcrumb: true,
                    path: 'javascript:;'
                }
            }
        ]
    },
    {
        path: '/score',
        component: template,
        name: '成绩管理',
        iconCls: 'sms-icon sms-icon-mng',
        hidden: !SMSUtil.isManager() && !SMSUtil.isTeacher(),
        children: [
            {
                path: '/score/setting',
                component: intermediate,
                name: '基础设置',
                hidden: !SMSUtil.isManager(),
                children: [
                    {
                        path: '/score/setting/subjectscore',
                        component: scoremng_setting_subjecscore,
                        name: '试卷信息'
                    }
                ]
            },
            {
                path: '/score/input',
                component: intermediate,
                name: '成绩录入',
                hidden: !SMSUtil.isManager(),
                children: [
                    {
                        path: '/score/input/subjectscore',
                        component: scoremng_input_subjectscore,
                        name: '录入成绩'
                    },
                    {
                        path: '/score/input/questionscore',
                        component: scoremng_input_questionscore,
                        name: '查看小题分'
                    },
                    {
                        path: '/score/input/publishscore',
                        component: scoremng_input_publishscore,
                        name: '发布管理'
                    }
                ]
            },
            {
                path: '/score/review',
                component: intermediate,
                name: '成绩维护',
                children: [
                    {
                        path: '/score/review/propose',
                        component: scoremng_review_propose,
                        name: '申请更改成绩'
                    },
                    {
                        path: '/score/review/process',
                        component: scoremng_review_process,
                        name: '审批更改申请',
                        hidden: !SMSUtil.isManager()
                    }
                ]
            }
        ]
    },
    {
        path: '/stat',
        component: template,
        name: '成绩分析',
        iconCls: 'sms-icon sms-icon-stat',
        children: [
            {
                path: '/stat/order',
                component: intermediate,
                name: '查询统计排名',
                children: [
                    {
                        path: '/stat/order/all',
                        component: scorestat_order_all,
                        name: '成绩统计排名'
                    },
                    {
                        path: '/stat/order/personal',
                        component: scorestat_order_byperson,
                        name: '学生个人成绩册'
                    }
                ]
            },
            {
                path: '/stat/class',
                component: intermediate,
                name: '班级分析对比',
                children: [
                    {
                        path: '/stat/class/subjectavg',
                        component: scorestat_classanalysis_subjectavg,
                        name: '班级科目均分排位统计'
                    },
                    {
                        path: '/stat/class/subjecttop',
                        component: scorestat_classanalysis_subjecttop,
                        name: '班级科目前若干名统计'
                    },
                    {
                        path: '/stat/class/subjectbalance',
                        component: scorestat_classanalysis_subjectbalance,
                        name: '班级科目均衡性分析'
                    },
                    {
                        path: '/stat/class/subjectline',
                        component: scorestat_classanalysis_subjectline,
                        name: '班级科目分数段统计'
                    },
                    {
                        path: '/stat/class/subjectscoreline',
                        component: scorestat_classanalysis_subjectscoreline,
                        name: '班级科目分段统计'
                    },
                    {
                        path: '/stat/class/subjectorderline',
                        component: scorestat_classanalysis_subjectorderline,
                        name: '班级单科名次段统计'
                    },
                    {
                        path: '/stat/class/subjectdifficulty',
                        component: scorestat_classanalysis_subjectdifficulty,
                        name: '班级科目难度分析'
                    },
                    {
                        path: '/stat/class/subjecttotal',
                        component: scorestat_classanalysis_subjecttotal,
                        name: '学科总体分析',
                        hidden: true
                    },
                    {
                        path: '/stat/class/subjectquestionscore',
                        component: scorestat_classanalysis_subjectquestionscore,
                        name: '班级小题得分率分析'
                    },
                    {
                        path: '/stat/class/questiondifficulty',
                        component: scorestat_classanalysis_questiondifficulty,
                        name: '小题难度分析'
                    },
                    {
                        path: '/stat/class/subjectavgcompare',
                        component: scorestat_classanalysis_subjectavgcompare,
                        name: '班级科目均衡性对比'
                    },
                    {
                        path: '/stat/class/subjecttopcompare',
                        component: scorestat_classanalysis_subjecttopcompare,
                        name: '班级科目前若干名对比'
                    }
                ]
            },
            {
                path: '/stat/personal',
                component: intermediate,
                name: '学生个人分析',
                children: [
                    {
                        path: '/stat/personal',
                        component: scorestat_personalanalysis_index,
                        name: '学生成绩排位对比'
                    },
                    {
                        path: '/stat/personal/report',
                        component: scorestat_personalanalysis_report,
                        name: '学生成绩报告'
                    }
                ]
            }
        ]
    },
    {
        path: '/system',
        component: template,
        name: '系统设置',
        iconCls: 'sms-icon sms-icon-setting',
        hidden: !SMSUtil.isManager(),
        children: [
            {
                path: '/system/analysisparam',
                component: system_analysisparam,
                name: '分析参数',
                leaf: true
            },
            {
                path: '/system/analysisparam/:id/:name',
                component: system_analysisparam_detail,
                name: '分析参数预览',
                hidden: true,
                meta: {
                    breadcrumb: true,
                    path: SMSUtil.getContext() + 'system/analysisparam'
                }
            },
            {
                path: '/system/analysisparam/edit/:id/:name',
                component: system_analysisparam_detail,
                name: '分析参数设置',
                hidden: true,
                meta: {
                    breadcrumb: true,
                    path: SMSUtil.getContext() + 'system/analysisparam'
                }
            }
        ]
    }
];

export default routes;