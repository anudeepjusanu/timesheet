db.timesheets.find().forEach(function (sheet) { var userObj = db.users.findOne({ _id: sheet.userId }); if (userObj !== null && userObj.practice) { sheet.practice = userObj.practice; db.timesheets.save(sheet); print("User Name : " + userObj.name); } });


db.timesheets.find({ week: /^2021-W/ }).forEach(function (sheet) {
    var userObj = db.users.findOne({ _id: sheet.userId });
    if (userObj !== null && userObj.projects) {
        userObj.projects.forEach(function (projectObj) {
            if (projectObj.billDates) {
                projectObj.billDates.forEach(function (billDateObj) {
                    if (billDateObj.practice) {
                        var startDate = billDateObj.start ? new Date(billDateObj.start) : null;
                        var endDate = billDateObj.end ? new Date(billDateObj.end) : null;
                        var weekDate = new Date(sheet.weekDate);
                        sheet.projects.forEach(function (prjObj, index) {
                            if (prjObj.projectId == projectObj.projectId) {
                                if (startDate && endDate && startDate >= weekDate && weekDate <= endDate) {
                                    prjObj.practice = billDateObj.practice;
                                } else if (startDate && startDate >= weekDate) {
                                    prjObj.practice = billDateObj.practice;
                                } else if (endDate && weekDate <= endDate) {
                                    prjObj.practice = billDateObj.practice;
                                }
                            }
                            if (prjObj.practice) {
                                db.timesheets.save(sheet);
                                print("Practice : " + prjObj.practice);
                            }
                        });
                    }
                });
            }
        });
    }
});

