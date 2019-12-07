const SCORE_GRADE = [
	{
		"dictname":"A分段",
		"dictvalue":"1"
	},
	{
		"dictname":"B分段",
		"dictvalue":"2"
	},
	{
		"dictname":"C分段",
		"dictvalue":"3"
	},
	{
		"dictname":"D分段",
		"dictvalue":"4"
	},
	{
		"dictname":"E分段",
		"dictvalue":"5"
	},
	{
		"dictname":"F分段",
		"dictvalue":"6"
	}
];

const ORDER_GRADE = [
	{
		"dictname":"A+",
		"dictvalue":"1",
		"default":5
	},
	{
		"dictname":"A",
		"dictvalue":"2",
		"default":10
	},
	{
		"dictname":"A-",
		"dictvalue":"3",
		"default":20
	},
	{
		"dictname":"B+",
		"dictvalue":"4",
		"default":40
	},
	{
		"dictname":"B",
		"dictvalue":"5",
		"default":60
	},
	{
		"dictname":"B-",
		"dictvalue":"6",
		"default":80
	},
	{
		"dictname":"C",
		"dictvalue":"7",
		"default":90
	},
	{
		"dictname":"D",
		"dictvalue":"8",
		"default":100
	}
];

const ORDER_GRADE_SCORE = [
	{
		"dictname":"A+",
		"dictvalue":"1",
		"default":95
	},
	{
		"dictname":"A",
		"dictvalue":"2",
		"default":90
	},
	{
		"dictname":"A-",
		"dictvalue":"3",
		"default":80
	},
	{
		"dictname":"B+",
		"dictvalue":"4",
		"default":60
	},
	{
		"dictname":"B",
		"dictvalue":"5",
		"default":40
	},
	{
		"dictname":"B-",
		"dictvalue":"6",
		"default":20
	},
	{
		"dictname":"C",
		"dictvalue":"7",
		"default":10
	},
	{
		"dictname":"D",
		"dictvalue":"8",
		"default":5
	}
];

const GOODNESS_GRADE = [
	{
		"dictname":"优秀率",
		"dictvalue":"1"
	},
	{
		"dictname":"良好率",
		"dictvalue":"2"
	},
	{
		"dictname":"合格率",
		"dictvalue":"4"
	},
	{
		"dictname":"低分率",
		"dictvalue":"5"
	}
];

const EXAM_QUESTION_VOLUME = [
	{
		"dictname":"A卷",
		"dictvalue":"1"
	},
	{
		"dictname":"B卷",
		"dictvalue":"2"
	},
	{
		"dictname":"C卷",
		"dictvalue":"3"
	},
	{
		"dictname":"D卷",
		"dictvalue":"4"
	},
	{
		"dictname":"E卷",
		"dictvalue":"5"
	},
	{
		"dictname":"F卷",
		"dictvalue":"6"
	},
	{
		"dictname":"G卷",
		"dictvalue":"7"
	},
	{
		"dictname":"H卷",
		"dictvalue":"8"
	}
];

const BEFORE_OF_YEAR = [
	10, 20, 50, 80, 100, 150, 200, 250, 300, 350, 400, 450, 500
];

const AFTER_OF_YEAR = [
	10, 20, 50, 80, 100
];

const CLASS_TYPE = {
	NORMAL : '1',
	SPECIAL: '2'
};

const SYNC_STATUS = {
	MANUAL: '1',
	SYNCED: '2',
	CLOSED: '4'
};

export { SCORE_GRADE, ORDER_GRADE, ORDER_GRADE_SCORE, GOODNESS_GRADE, BEFORE_OF_YEAR, AFTER_OF_YEAR, EXAM_QUESTION_VOLUME, CLASS_TYPE, SYNC_STATUS };