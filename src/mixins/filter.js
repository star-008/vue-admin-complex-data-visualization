import SMSUtil from '../common/js/util';
import { queryTermList, queryDictItemList } from '../api/api';

let filter = {
    data() {
        return {
            url: {
                termid: '',
                examid: ''
            }
        };
    },
    created: function () {
        if (this.$router.param != null) {
            this.url.termid = this.$router.param.termid;
            this.url.examid = this.$router.param.examid;
        }
        
        this.getExamYearTerms();
    },
    methods: {
        getExamYearTerms() {
            let params = {
                pageNo:1,
                numPerPage:1000,
                orgId: SMSUtil.getUser().orgId
            };
            this.terms = [];
            queryTermList(params, this.$message).then((res) => {
                if (res.data.serverResult.resultCode == "200") {
                    this.terms = res.data.pageInfo.list;
                    if (this.terms.length > 0) {
                        if (this.url.termid != '') {
                            this.filters.termid = this.url.termid;
                            this.url.termid = '';
                            this.$router.param.termid = '';
                        } else {
                            if (this.type == 'review') {
                                this.onChangeYearTerm();
                            } else {
                                this.checkYearTerm();
                            }
                        }
                    }
                } else {
                    this.terms = [];
                }
            }).catch((err) => {
                console.log(err);
                this.terms = [];
            });
        },
        checkYearTerm() {
            for (var i=0; i<this.terms.length; i++) {
                let startdate = new Date(this.terms[i].startDate);
                let enddate = new Date(this.terms[i].endDate);
                let now = new Date();
                if (now > startdate && now < enddate) {
                    this.filters.termid = this.terms[i].termId;
                    return;
                }
            }

            this.filters.termid = this.terms[0].termId;
        },
        getExamTypes() {
            this.examtypes = [];
            this.filters.examtypeid = '';

            let params = {
                pageNo:1,
                numPerPage:1000,
                dictTypeId:"EVALUATIONTYP",
                lang:"zh_CN"
            };

            this.examtypes = [];
            queryDictItemList(params, this.$message).then((res) => {
                if (res.data.serverResult.resultCode == "200") {
                    this.examtypes = res.data.pageInfo.list.map(item => SMSUtil.composeSysDict(item));
                    this.onChangeExamType();
                } else {
                    this.examtypes = [];
                }
            }).catch((err) => {
                console.log(err);
                this.examtypes = [];
            });
        },
        onChangeYearTerm() {
            this.getExamTypes();
        }
    }
};

export { filter };