import axios from 'axios';
import util from '../common/js/util'

let openapi_server = axios.create({
        baseURL: OPENAPI_SERVER,
        headers: {
            'Content-Type':'application/json'
        }
    });
const getConfig = params => { return { headers: { 'token':sms_store('sms-token') } }; };
const getMultipartConfig = params => { return { headers: { 'Content-Type':'multipart/form-data;charset=UTF-8', 'token':sms_store('sms-token') } }; };

export const requestLogin = params => { return openapi_server.post(`login`, params); };
export const ssoLogin = params => { return openapi_server.post(`login/sso`, params); };
export const requestCaptcha = force => { return openapi_server.get(`captcha/` + force); };

export const getStudentList = params => { return util.checkToken(openapi_server.post(`base/getStudentList`, params, getConfig())); };
export const syncBase = params => { return util.checkToken(openapi_server.post(`base/sync`, params, getConfig())); };

export const getExamYearTermList = params => { return util.checkToken(openapi_server.post(`exam/getTermList`, params, getConfig())); };
export const getExamExamTypeList = params => { return util.checkToken(openapi_server.post(`exam/getTypeList`, params, getConfig())); };
export const getExamGradeList = params => { return util.checkToken(openapi_server.post(`exam/getGradeList`, params, getConfig())); };
export const getExamSubjectList = params => { return util.checkToken(openapi_server.post(`exam/getSubjectList`, params, getConfig())); };
export const getExamClassList = params => { return util.checkToken(openapi_server.post(`exam/getClassList`, params, getConfig())); }

export const searchExam = params => { return util.checkToken(openapi_server.post(`exam/search`, params, getConfig())); };
export const getSimpleExamList = params => { return util.checkToken(openapi_server.post(`exam/getSimpleList`, params, getConfig())); };
export const getRecentExams = (pages, params) => { return util.checkToken(openapi_server.post(`exam/recent/` + pages, params, getConfig())); };
export const addExam = params => { return util.checkToken(openapi_server.post(`exam/add`, params, getConfig())); };
export const updateExam = params => { return util.checkToken(openapi_server.post(`exam/update`, params, getConfig())); };
export const syncExam = params => { return util.checkToken(openapi_server.post(`exam/sync`, params, getConfig())); };
export const closeExam = examid => { return util.checkToken(openapi_server.get(`exam/close/` + examid, getConfig())); };
export const getExamInfo = examid => { return util.checkToken(openapi_server.get(`exam/` + examid, getConfig())); };
export const deleteExam = examid => { return util.checkToken(openapi_server.get(`exam/delete/` + examid, getConfig())); };

export const getAnalysisConfig = params => { return util.checkToken(openapi_server.post(`sys/analysis-config/search`, params, getConfig())); };
export const getAnalysisScoreLevelConfig = params => { return util.checkToken(openapi_server.post(`sys/analysis-score-level/search`, params, getConfig())); };
export const setAnalysisConfig = params => { return util.checkToken(openapi_server.post(`sys/analysis-config/addUpdate`, params, getConfig())); };
export const setAnalysisScoreLevelConfig = (examid, gradeid, subjecttype, subjectid, volumeid, params) => { return util.checkToken(openapi_server.post(`sys/analysis-score-level/batchAdd/` + examid + `/` + gradeid + `/` + subjecttype + `/` + subjectid + `/` + volumeid, params, getConfig())); };

export const getExamSubjectScoreList = params => { return util.checkToken(openapi_server.post(`exam-subject-score/search`, params, getConfig())); };
export const setExamSubjectScore = params => { return util.checkToken(openapi_server.post(`exam-subject-score/save`, params, getConfig())); };
export const getPubStatusList = params => { return util.checkToken(openapi_server.post(`exam-subject-score/getPubStatusList`, params, getConfig())); };
export const publishExamSubjectScore = params => { return util.checkToken(openapi_server.post(`exam-subject-score/publish`, params, getConfig())); };
export const unPublishExamSubjectScore = params => { return util.checkToken(openapi_server.post(`exam-subject-score/unpublish`, params, getConfig())); };

export const getExamQuestionScoreList = params => { return util.checkToken(openapi_server.post(`exam-part-score/search`, params, getConfig())); };
export const setExamQuestionScore = (examsubjectscoreid, params) => { return util.checkToken(openapi_server.post(`exam-part-score/batchAdd/` + examsubjectscoreid, params, getConfig())); };
export const importExamQuestionScore = (examid, params) => { return util.checkToken(openapi_server.post(`exam-part-score/import/` + examid, params, getMultipartConfig())); };
export const exportExamQuestionScore = params => { return util.checkToken(openapi_server.post(`exam-part-score/export`, params, getConfig())); };

export const importStudentTotalScore = (fullscoreid, params) => { return util.checkToken(openapi_server.post(`student-subject-score/import/` + fullscoreid, params, getMultipartConfig())); };
export const getSubjectIndividualList = params => { return util.checkToken(openapi_server.post(`student-subject-score/getIndividualList`, params, getConfig())); };
export const getStudentTotalScoreList = params => { return util.checkToken(openapi_server.post(`student-subject-score/search`, params, getConfig())) };
export const setStudentTotalScore = params => { return util.checkToken(openapi_server.post(`student-subject-score/save`, params, getConfig())) };
export const getEnteredStudentList = params => { return util.checkToken(openapi_server.post(`student-subject-score/getScoreEnteredList`, params, getConfig())) };
export const getUnenteredStudentList = params => { return util.checkToken(openapi_server.post(`student-subject-score/getScoreUnenteredList`, params, getConfig())) };
export const getExamMissedStudentList = params => { return util.checkToken(openapi_server.post(`student-subject-score/getExamMissedList`, params, getConfig())) };
export const exportPersonalExamTotalScore = params => { return util.checkToken(openapi_server.post(`student-subject-score/export/book/word`, params, getConfig())) };

export const getUpdateScoreProposalList = params => { return util.checkToken(openapi_server.post(`student-subject-score/review/search`, params, getConfig())) };
export const requestUpdateScoreProposal = params => { return util.checkToken(openapi_server.post(`student-subject-score/review/request`, params, getConfig())) };
export const deleteUpdateScoreProposal = params => { return util.checkToken(openapi_server.post(`student-subject-score/review/batchDelete`, params, getConfig())) };
export const acceptUpdateScoreProposal = params => { return util.checkToken(openapi_server.post(`student-subject-score/review/batchAccept`, params, getConfig())) };
export const rejectUpdateScoreProposal = params => { return util.checkToken(openapi_server.post(`student-subject-score/review/batchReject`, params, getConfig())) };
export const getReviewStudentList = params => { return util.checkToken(openapi_server.post(`student-subject-score/review/getStudentList`, params, getConfig())) };

export const getStudentPartScoreList = params => { return util.checkToken(openapi_server.post(`student-part-score/search`, params, getConfig())) };
export const importQuestionScore = (examid, params) => { return util.checkToken(openapi_server.post(`student-part-score/import/` + examid, params, getMultipartConfig())); };

export const getScoreRankStat = (params) => { return util.checkToken(openapi_server.post(`rank-stats/getList`, params, getConfig())); };
export const exportScoreRankStat = (params) => { return util.checkToken(openapi_server.post(`rank-stats/export`, params, getConfig())); };
export const exportScoreRankStatForCompare = (params) => { return util.checkToken(openapi_server.post(`rank-stats/export/compare`, params, getConfig())); };

export const getSubjectAvgScoreList = params => { return util.checkToken(openapi_server.post(`subject-average-score/getList`, params, getConfig())); };
export const exportSubjectAvgScore = params => { return util.checkToken(openapi_server.post(`subject-average-score/export`, params, getConfig())); };
export const exportSubjectAvgScoreByClass = params => { return util.checkToken(openapi_server.post(`subject-average-score/export/class`, params, getConfig())); };

export const getStudentTopCountStatList = params => { return util.checkToken(openapi_server.post(`class-top-count-stats/getList`, params, getConfig())); };
export const exportStudentTopCountStat = params => { return util.checkToken(openapi_server.post(`class-top-count-stats/export`, params, getConfig())); };
export const exportStudentTopCountStatForCompare = params => { return util.checkToken(openapi_server.post(`class-top-count-stats/export/compare`, params, getConfig())); };

export const getRankZoneStatList = params => { return util.checkToken(openapi_server.post(`rank-zone-stats/getList`, params, getConfig())); };
export const exportRankZoneStat = params => { return util.checkToken(openapi_server.post(`rank-zone-stats/export`, params, getConfig())); };

export const getLevelZoneStatList = params => { return util.checkToken(openapi_server.post(`level-zone-stats/getList`, params, getConfig())); };
export const exportLevelZoneStat = params => { return util.checkToken(openapi_server.post(`level-zone-stats/export`, params, getConfig())) };

export const getEqualityStatList = params => { return util.checkToken(openapi_server.post(`equality-stats/getList`, params, getConfig())) };
export const exportExqualityStat = params => { return util.checkToken(openapi_server.post(`equality-stats/export`, params, getConfig())) };
export const exportExqualityStatForCompare = params => { return util.checkToken(openapi_server.post(`equality-stats/export/compare`, params, getConfig())) };
export const exportExqualityStatByClass = params => { return util.checkToken(openapi_server.post(`equality-stats/export/class`, params, getConfig())) };

export const getScoreZoneStatList = params => { return util.checkToken(openapi_server.post(`score-zone-stats/getList`, params, getConfig())); };
export const exportScoreZoneStat = params => { return util.checkToken(openapi_server.post(`score-zone-stats/export`, params, getConfig())); };

export const getPartRateStatList = params => { return util.checkToken(openapi_server.post(`part-gain-rate-stats/getList`, params, getConfig())); };
export const exportPartRateStat = params => { return util.checkToken(openapi_server.post(`part-gain-rate-stats/export`, params, getConfig())); };

export const getSubjectDifficultyStatList = params => { return util.checkToken(openapi_server.post(`difficulty-stats/getList`, params, getConfig())); };
export const exportSubjectDifficultyStat = params => { return util.checkToken(openapi_server.post(`difficulty-stats/export`, params, getConfig())); };

export const getQuestionDifficultyStatList = params => { return util.checkToken(openapi_server.post(`part-difficulty-stats/getList`, params, getConfig())); };
export const exportQuestionDifficultyStat = params => { return util.checkToken(openapi_server.post(`part-difficulty-stats/export`, params, getConfig())); };

export const getStudentStatList = params => { return util.checkToken(openapi_server.post(`student-stats/getList`, params, getConfig())); };

// ECO API
const getEcoBaseAPIConfig = params => {
	return {
			baseURL: ECOAPI_SERVER + 'openapi-base',
			headers: {
				'access-token':sms_store('sms-token'),
				'Content-Type':'application/json',
				'Tenant-Id':TENANT_ID
			}
		};
};

const getEcoScoreAPIConfig = params => {
	return {
			baseURL: ECOAPI_SERVER + 'openapi-score',
			headers: {
				'access-token':sms_store('sms-token'),
				'Content-Type':'application/json',
				'Tenant-Id':TENANT_ID
			}
		};
};

const getEcoUCAPIConfig = params => {
	return {
			baseURL: ECOAPI_SERVER + 'openapi-uc',
			headers: {
				'access-token':sms_store('sms-token'),
				'Content-Type':'application/json'
			}
		};
};

export const updatePwdECO = (params, message) => { return util.checkECOToken(openapi_server.post(`/uc/updatePwd`, params, getEcoUCAPIConfig()), message); };
export const joinSearchClasses = (params, message) => { return util.checkECOToken(openapi_server.post(`/base/joinSearchClasses`, params, getEcoBaseAPIConfig()), message); };
export const joinSearchSchools = (params, message) => { return util.checkECOToken(openapi_server.post(`/base/joinSearchSchools`, params, getEcoBaseAPIConfig()), message); };
export const queryTeachs = (params, message) => { return util.checkECOToken(openapi_server.post(`/base/queryTeachs`, params, getEcoBaseAPIConfig()), message); };
export const queryDictItemList = (params, message) => { return util.checkECOToken(openapi_server.post(`/base/queryDictItemList`, params, getEcoBaseAPIConfig()), message); };
export const queryTermList = (params, message) => { return util.checkECOToken(openapi_server.post(`/base/queryTermList`, params, getEcoBaseAPIConfig()), message); };
export const queryExamInfoList = (params, message) => { return util.checkECOToken(openapi_server.post(`/exam/queryExamInfoList`, params, getEcoScoreAPIConfig()), message); };
export const queryExamInfo = (examid, message) => { return util.checkECOToken(openapi_server.get(`/exam/queryExamInfo/` + examid, getEcoScoreAPIConfig()), message); };