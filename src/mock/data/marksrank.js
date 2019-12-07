import Mock from 'mockjs';

const MarksRanks = [
	{
		studentno: '2018360001',
		examno: '2018352165',
		stuname: '张娜让',
		class: '1学年1班',
		scorediff: {
			year: '2017',
			firsthalf: '85',
			secondhalf: '80',
			diff: '-5'
		},
		classrank: {
			year: '2017',
			firsthalf: '2',
			secondhalf: '5',
			diff: '-3'
		},
		graderank: {
			year: '2017',
			firsthalf: '10',
			secondhalf: '16',
			diff: '-6'
		}
	},
	{
		studentno: '2018360002',
		examno: '2018352166',
		stuname: '叶文',
		class: '1学年2班',
		scorediff: {
			year: '2017',
			firsthalf: '81',
			secondhalf: '83',
			diff: '2'
		},
		classrank: {
			year: '2017',
			firsthalf: '4',
			secondhalf: '1',
			diff: '3'
		},
		graderank: {
			year: '2017',
			firsthalf: '13',
			secondhalf: '11',
			diff: '2'
		}
	},
	{
		studentno: '2018360003',
		examno: '2018352167',
		stuname: '金山遭',
		class: '1学年2班',
		scorediff: {
			year: '2017',
			firsthalf: '83',
			secondhalf: '81',
			diff: '-2'
		},
		classrank: {
			year: '2017',
			firsthalf: '3',
			secondhalf: '6',
			diff: '-3'
		},
		graderank: {
			year: '2017',
			firsthalf: '10',
			secondhalf: '16',
			diff: '-6'
		}
	},
	{
		studentno: '2018360004',
		examno: '2018352168',
		stuname: '住宇',
		class: '1学年3班',
		scorediff: {
			year: '2017',
			firsthalf: '80',
			secondhalf: '81',
			diff: '1'
		},
		classrank: {
			year: '2017',
			firsthalf: '5',
			secondhalf: '1',
			diff: '4'
		},
		graderank: {
			year: '2017',
			firsthalf: '10',
			secondhalf: '16',
			diff: '-6'
		}
	},
	{
		studentno: '2018360005',
		examno: '2018352169',
		stuname: '李霞',
		class: '1学年5班',
		scorediff: {
			year: '2017',
			firsthalf: '85',
			secondhalf: '85',
			diff: '0'
		},
		classrank: {
			year: '2017',
			firsthalf: '2',
			secondhalf: '2',
			diff: '0'
		},
		graderank: {
			year: '2017',
			firsthalf: '7',
			secondhalf: '7',
			diff: '0'
		}
	}
];

export { MarksRanks };