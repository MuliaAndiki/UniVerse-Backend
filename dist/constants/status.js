"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusApproved = void 0;
var StatusApproved;
(function (StatusApproved) {
    StatusApproved[StatusApproved["pending"] = 0] = "pending";
    StatusApproved[StatusApproved["approved"] = 1] = "approved";
    StatusApproved[StatusApproved["rejected"] = 2] = "rejected";
})(StatusApproved || (exports.StatusApproved = StatusApproved = {}));
