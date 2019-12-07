import Mock from 'mockjs';

const AllStats = [
    {
        studentno: '2011360114',
        examno: '20110511',
        studentname: '张正午',
        class: '六年级 （5) 班',
        subjectScores: {
            score: '82.5',
            classRank: '4',
            gradeRank: '14',
            rank: 'A+'
        },
        totalScores: {
            score: '273.5',
            classRank: '1',
            gradeRank: '1',
            rank: 'A+'
        }
    },
    {
        studentno: '2011360115',
        examno: '20110512',
        studentname: '刘飞',
        class: '六年级 （6) 班',
        subjectScores: {
            score: '87.5',
            classRank: '3',
            gradeRank: '8',
            rank: 'A+'
        },
        totalScores: {
            score: '281.5',
            classRank: '1',
            gradeRank: '1',
            rank: 'A+'
        }
    },
    {
        studentno: '2011360116',
        examno: '20110513',
        studentname: '白好英',
        class: '六年级 （7) 班',
        subjectScores: {
            score: '65.5',
            classRank: '7',
            gradeRank: '24',
            rank: 'B+'
        },
        totalScores: {
            score: '225.5',
            classRank: '3',
            gradeRank: '3',
            rank: 'B+'
        }
    },
    {
        studentno: '2011360117',
        examno: '20110514',
        studentname: '李近坟',
        class: '六年级 （8) 班',
        subjectScores: {
            score: '76.5',
            classRank: '3',
            gradeRank: '16',
            rank: 'A+'
        },
        totalScores: {
            score: '243.5',
            classRank: '2',
            gradeRank: '2',
            rank: 'B+'
        }
    },
    {
        studentno: '2011360118',
        examno: '20110515',
        studentname: '叶文',
        class: '六年级 （9) 班',
        subjectScores: {
            score: '78.5',
            classRank: '2',
            gradeRank: '11',
            rank: 'A+'
        },
        totalScores: {
            score: '267.5',
            classRank: '1',
            gradeRank: '1',
            rank: 'A+'
        }
    }
];

const PersonStats = [
    {
        title: '易嘎呈(2018360247)个人成绩册',
        scores: [
            {
                examname: '2016学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2017学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '75'
                    },
                    {
                        dictname: '数学',
                        score: '80'
                    },
                    {
                        dictname: '英文',
                        score: '90'
                    },
                    {
                        dictname: '化学',
                        score: '90.5'
                    },
                    {
                        dictname: '物理',
                        score: '80'
                    }

                ],
                totalScore: '467.5'
            },
            {
                examname: '2018学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2019学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2020学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            }
        ]
    },
    {
        title: '李近坟(2018360247)个人成绩册',
        scores: [
            {
                examname: '2016学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2017学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2018学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2019学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2020学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            }
        ]
    },
    {
        title: '怕革(2018360247)个人成绩册',
        scores: [
            {
                examname: '2018学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2019学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2020学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2021学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            },
            {
                examname: '2022学年上学期 期末考试',
                subjectScores: [
                    {
                        dictname: '语文',
                        score: '90'
                    },
                    {
                        dictname: '数学',
                        score: '95'
                    },
                    {
                        dictname: '英文',
                        score: '85'
                    },
                    {
                        dictname: '化学',
                        score: '89.5'
                    },
                    {
                        dictname: '物理',
                        score: '90'
                    }

                ],
                totalScore: '485.5'
            }
        ]
    }
];

export { AllStats, PersonStats };