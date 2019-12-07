import Mock from 'mockjs';

const Exams = [
	{
		"examid":"EX0000000024",
		"examname":"2018-2019上学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"上学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":0,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000025",
		"examname":"2018-2019下学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"下学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":1,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000024",
		"examname":"2018-2019上学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"上学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":0,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000025",
		"examname":"2018-2019下学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"下学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":1,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000024",
		"examname":"2018-2019上学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"上学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":0,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000025",
		"examname":"2018-2019下学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"下学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":1,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000024",
		"examname":"2018-2019上学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"上学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":0,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000025",
		"examname":"2018-2019下学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"下学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":1,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000024",
		"examname":"2018-2019上学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"上学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":0,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000025",
		"examname":"2018-2019下学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"下学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":1,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000024",
		"examname":"2018-2019上学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"上学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":0,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	},
	{
		"examid":"EX0000000025",
		"examname":"2018-2019下学期期末考试",
		"examyear":"2018",
		"examterm":{
			dictvalue:"Second Half",
			dictname:"下学期"
		},
		"examtype":{
			dictvalue:"Writing",
			dictname:"期末考试"
		},
		"schoolsection":"Middle School",
		"examstartday":"2018-11-20 00:00:01",
		"examendday":"2018-11-30 23:59:59",
		"examnumber":null,
		"status":1,
		"schoolid":"SCH000000003",
		"createtime":null,
		"lastmodifytime":null,
		"creatorid":null,
		"examclasslist":null
	}
];

export { Exams };