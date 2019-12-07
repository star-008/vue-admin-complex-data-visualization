import SMSUtil from '../common/js/util';
import { getExamSubjectList } from '../api/api';

let iframe = {
    created: function () {
        if (SMSUtil.isIFrame()) {
            //this.readyForIFrame();
        }
    },
    methods: {
        readyForIFrame() {
            let termid = window.ParameterMap.termid;
            let examtypeid = window.ParameterMap.examtypeid;
            let examid = window.ParameterMap.examid;
            let examname = window.ParameterMap.examname;
            let compareexamid1 = window.ParameterMap.compareexamid1;
            let compareexamname1 = window.ParameterMap.compareexamname1;
            let compareexamid2 = window.ParameterMap.compareexamid2;
            let compareexamname2 = window.ParameterMap.compareexamname2;
            let gradeid = window.ParameterMap.gradeid;
            let gradename = window.ParameterMap.gradename;
            let classid = window.ParameterMap.classid;
            let classtype = window.ParameterMap.classtype;
            let studentid = window.ParameterMap.studentid;
            let studentids = window.ParameterMap.studentids;
            let sex = window.ParameterMap.sex;
            let total = window.ParameterMap.total;
            let subjectid = window.ParameterMap.subjectid;
            let subjectname = window.ParameterMap.subjectname;
            let subjectids = window.ParameterMap.subjectids;
            let showmodes = window.ParameterMap.showmodes;
            let showmode = window.ParameterMap.showmode;

            if (termid == undefined) termid = '';
            if (examtypeid == undefined) examtypeid = '';
            if (examid == undefined) examid = '';
            if (examname == undefined) examname = '';
            if (compareexamid1 == undefined) compareexamid1 = '';
            if (compareexamname1 == undefined) compareexamname1 = '';
            if (compareexamid2 == undefined) compareexamid2 = '';
            if (compareexamname2 == undefined) compareexamname2 = '';
            if (gradeid == undefined) gradeid = '';
            if (gradename == undefined) gradename = '';
            if (classid == undefined) classid = '';
            if (classtype == undefined) classtype = '';
            if (studentid == undefined) studentid = '';
            if (studentids == undefined) studentids = '';
            if (sex == undefined) sex = '';
            if (total == undefined) total = 0;
            if (subjectid == undefined) subjectid = '';
            if (subjectname == undefined) subjectname = '';
            if (subjectids == undefined) subjectids = '';
            if (showmodes == undefined) showmodes = '';
            if (showmode == undefined) showmode = '';

            showmodes = showmodes.split(',');
            studentids = studentids.split(',');
            total = parseInt(total) == 1;

            if (subjectids == '') {
                let subjects = [];
                this.call(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode);
            } else {
                getExamSubjectList({ subjectids: subjectids.split(',') }).then((res) => {
                    if (res.data.serverResult.resultCode == "200") {
                        let subjects = res.data.pageInfo.list;
                        this.call(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode);
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        call(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode) {
            if (this.iFrameMixinReady) {
                this.iFrameMixinReady(termid, examtypeid, examid, examname, compareexamid1, compareexamname1, compareexamid2, compareexamname2, gradeid, gradename, classid, classtype, studentid, studentids, sex, total, subjectids, subjectname, subjects, showmodes, showmode);
            }
        }
    }
};

export { iframe };