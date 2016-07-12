var labArray = null;

$(function() {
	makeLabArray();
});

function resetTimeTable(){
	if($(".TimetableContent").hasClass("highlight")){
		$(".TimetableContent").removeClass("highlight");
	}
	if($(".tile").hasClass("highlight")){
		$(".tile").removeClass("highlight");
	}
}

/**
 * Code to generate a custom course list through #slot-sel-area, manage the
 * list and to mark the added slots to the timetable.
 */

(function() {
	function CourseRecord(slots, title, fac, credits, $li) {
		this.slots = slots;
		this.title = title;
		this.fac = fac;
		this.credits = credits;
		this.$li = $li;
		this.isClashing = false;
	}

	function isSlotValid(slot) {
		var labSlotPattern = /^L\d{1,2}$/;
		var slotNum;
		if(labSlotPattern.test(slot)) {
			if(!labArray) makeLabArray();
			slotNum = Number(slot.substring(1));
			if(slotNum >= 15 && slotNum <= 18)
				return false;
		}
		else if(!$("." + slot).length) {
			return false;
		}

		return true;
	}

	var CRM = {
		courses: [],
		add: function(slots, title, fac, credits, $li) {
			slots = this.expandSlots(slots);
			var record = new CourseRecord(slots, title, fac, credits, $li);
			var clashes = this.getClashingSlots(record);
			if(clashes.length()) {
				record.isClashing = true;
			}

			this.mark(record, clashes);
			this.courses.push(record);

		},

		getClashingSlots: function(newRecord) {
			var clashes = {
				arr: [],
				get: function(index) {
					return this.arr[index];
				},

				length: function() {
					return this.arr.length;
				},

				add: function(slot, rec1, rec2) {
					var isAdded = false;
					if(this.arr.length === 0) {
						this.arr.push({
							slot: slot,
							records: [rec1, rec2]
						});
						return;
					}

					this.arr.forEach(function(clash) {
						if(slot === clash.slot) {
							isAdded = true;
							if(clash.records.indexOf(rec1) === -1) {
								clash.records.push(rec1);
							}
							if(clash.records.indexOf(rec2) === -1 ) {
								clash.records.push(rec2);
							}
						}
					});

					if(!isAdded) {
						this.arr.push({
							slot: slot,
							records: [rec1, rec2]
						});
					}

				}
			};

			this.courses.forEach(function(otherRecord) {
				newRecord.slots.forEach(function(newSlot) {
					if(otherRecord.slots.indexOf(newSlot) >= 0) {
						clashes.add(newSlot, newRecord, otherRecord);
					}
				});
			});

			return clashes;
		},
		mark: function(record, clashes) {
			var i, loopSlot;
			if(!record.isClashing) {
				record.slots.forEach(function(slot) {
					this.highlight(slot);
				}, this);
			} else {

				for(i = 0; i < clashes.length(); ++i) {
					clashes.get(i).records.forEach(function(record) {
						record.$li.addClass("list-group-item-danger");
					});
					loopSlot = clashes.get(i).slot;
					this.highlight(loopSlot);
					this.clashSlot(loopSlot);
				}

				record.slots.forEach(function(slot) {
					this.highlight(slot);
				}, this);

			}
		},

		highlight: function(slot) {
			if(slot.match(/^L/)) {
				labArray[Number(slot.substring(1)) - 1].addClass("highlight");
			} else {
				$("." + slot).addClass("highlight");
			}
		},

		clashSlot: function(slot) {
			if(slot.match(/^L/)) {
				labArray[Number(slot.substring(1)) - 1].addClass("slot-clash");
			} else {
				$("." + slot).addClass("slot-clash");
			}
		}
	};

	CRM.expandSlots = function(slots) {
		var i, length = slots.length;
		for(i = 0; i < length; ++i) {
			if(this.getSlotType(slots[i]) === "lab") continue;
			else {
				slots = slots.concat(this.convertToLab(slots[i]));
			}
		}
		return slots;
	};

	CRM.getSlotType = function(slot) {
		return /^L/.test(slot) ? "lab" : "theory";
	};

	CRM.convertToLab = function(slot) {
		var arr = [];
		$("." + slot).each(function() {
			arr.push($(this).text().replace(/^.*(L\d{1,2}).*$/, "$1"));
		});
		return arr;
	};

	CRM.listenForRemove = function() {
		var self = this;
		$("#slot-sel-area ul").on("click", "span.close", function() {
			var $li = $(this).parents().filter("li.list-group-item");
			var liDom = $li.get(0);
			var i;
			for(i = 0; i < self.courses.length; ++i) {
				if(self.courses[i].$li.get(0) === liDom) {
					self.courses.splice(i, 1);
					$(".TimetableContent").removeClass("highlight slot-clash");
					$("#slot-sel-area .list-group li").removeClass("list-group-item-danger");
					break;
				}
			}

			var backupCourses = self.courses;
			self.courses = [];

			backupCourses.forEach(function(record) {
				var clashes = self.getClashingSlots(record);
				if(clashes.length()) {
					record.isClashing = true;
				}

				self.mark(record, clashes);
				self.courses.push(record);

			});

			totalCredits -= Number($li.find(".badge").text());

			totalSpan.text(totalCredits);

			$li.detach();

		});
	};

	CRM.listenForRemove();

	var totalCredits = 0;

	var facultyInput = $("#inputFaculty");
	var courseInput = $("#inputCourseTitle");
	var creditsInput = $("#inputCourseCredits");
	var slotInput = $("#inputSlotString");
	var totalContainer = $("#slot-sel-area .list-group li.total");
	var totalSpan = totalContainer.find(".badge");

	function submitSlotData() {
		var slot, slotArray, i, normSlotString, li;
    slot = slotInput.val().trim();
    if (!slot) {
        $("#slot-sel-area .form-group").eq(1).addClass("has-error");
        return;
    }

    faculty = facultyInput.val().trim();
    course = courseInput.val().trim();
    credits = Number(creditsInput.val());

    slotArray = slot.split(/\s*\+\s*/);


    normSlotString = slotArray.join(" + ");
    li = $('<li class="list-group-item">' +
        '<div class="row">' +
        '<span class="slots col-sm-3">' + normSlotString + '</span>' +
        '<span class="course col-sm-5">' + course + '</span>' +
        '<span class="faculty col-sm-4">' + faculty + '</span>' +
        '<span class= col-sm-1 text-right">' +
        '<span class="badge">' + (credits ? credits : 0) + '</span>' +
        '</span>' +
				'<span class= col-sm-1 text-right">' +
				'<span class="close">&times;</span>' +
				'</span>' +
        '</div>' +
        '</li>');

    totalContainer.before(li);

		totalCredits += credits;

		totalSpan.text(totalCredits);

		for (i = 0; i < slotArray.length; ++i) {
			slotArray[i] = slotArray[i].toUpperCase();
			if(!isSlotValid(slotArray[i])) {
				return false;
			}
		}

		facultyInput.val("");
		courseInput.val("");
		slotInput.val("");
		creditsInput.val("");

		CRM.add(slotArray, course, faculty, credits, li);
	}

  $("#slot-sel-area .panel-body #markBtn").click(submitSlotData);
	$("#slot-sel-area .panel-body input").on("keypress", function(event) {
		if(event.which === 13) {
			event.preventDefault();
			submitSlotData();
		}
	});

})();

/**
 * Toggles slot highlighting of passed slot in the table.
 * @param  {string} slot individual slot obtained from passed input.
 * @return {undefined}
 */
function markSlot(slot) {
	var labSlotPattern = /^L\d{1,2}$/;
	var slotNum;
	if(labSlotPattern.test(slot)) {
		if(!labArray) makeLabArray();
		slotNum = Number(slot.substring(1));
		if(!(slotNum >= 15 && slotNum <= 18))
			labArray.eq(slotNum - 1)
							.toggleClass("highlight");
	}
	else if($("." + slot)) {
		$("." + slot).toggleClass("highlight");
	}
}

/**
 * Prepares a $ collection of all the slots in the table in ascending order
 * and pads 3 null objects to compensate for missing slots. The result is
 * stored in labArray.
 * @return {undefined}
 */
function makeLabArray() {
	var left = $(),
			right = $();
	var slots = $(".TimetableContent");
	slots.splice(26, 0, null, null, null);
	var length = slots.length;
	var i;
	for(i = 0; i < 60; ++i) {
		if(i % 12 < 6) left.push(slots.eq(i));
		else right.push(slots.eq(i));
	}

	labArray = left.add(right);
}

$(".alert-dismissible .close").click(function() {
	$(this).parent()
		.toggleClass("hide");
});

$(".TimetableContent").click(function () {
	$(this).toggleClass("highlight");
});
$(".A1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".A1").removeClass("highlight");
	}
	else{
		$(".A1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".A1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".A1-tile").removeClass("highlight");
	}
});

$(".B1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".B1").removeClass("highlight");
	}
	else{
		$(".B1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".B1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".B1-tile").removeClass("highlight");
	}
});

$(".C1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".C1").removeClass("highlight");
	}
	else{
		$(".C1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".C1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".C1-tile").removeClass("highlight");
	}
});

$(".D1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".D1").removeClass("highlight");
	}
	else{
		$(".D1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".D1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".D1-tile").removeClass("highlight");
	}
});

$(".E1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".E1").removeClass("highlight");
	}
	else{
		$(".E1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".E1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".E1-tile").removeClass("highlight");
	}
});

$(".F1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".F1").removeClass("highlight");
	}
	else{
		$(".F1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".F1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".F1-tile").removeClass("highlight");
	}
});

$(".G1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".G1").removeClass("highlight");
	}
	else{
		$(".G1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".G1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".G1-tile").removeClass("highlight");
	}
});

$(".A2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".A2").removeClass("highlight");
	}
	else{
		$(".A2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".A2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".A2-tile").removeClass("highlight");
	}
});

$(".B2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".B2").removeClass("highlight");
	}
	else{
		$(".B2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".B2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".B2-tile").removeClass("highlight");
	}
});

$(".C2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".C2").removeClass("highlight");
	}
	else{
		$(".C2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".C2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".C2-tile").removeClass("highlight");
	}
});

$(".D2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".D2").removeClass("highlight");
	}
	else{
		$(".D2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".D2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".D2-tile").removeClass("highlight");
	}
});

$(".E2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".E2").removeClass("highlight");
	}
	else{
		$(".E2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".E2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".E2-tile").removeClass("highlight");
	}
});

$(".F2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".F2").removeClass("highlight");
	}
	else{
		$(".F2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".F2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".F2-tile").removeClass("highlight");
	}
});

$(".G2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".G2").removeClass("highlight");
	}
	else{
		$(".G2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".G2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".G2-tile").removeClass("highlight");
	}
});

$(".TA1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TA1").removeClass("highlight");
	}
	else{
		$(".TA1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TA1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TA1-tile").removeClass("highlight");
	}
});

$(".TB1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TB1").removeClass("highlight");
	}
	else{
		$(".TB1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TB1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TB1-tile").removeClass("highlight");
	}
});

$(".TC1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TC1").removeClass("highlight");
	}
	else{
		$(".TC1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TC1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TC1-tile").removeClass("highlight");
	}
});

$(".TD1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TD1").removeClass("highlight");
	}
	else{
		$(".TD1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TD1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TD1-tile").removeClass("highlight");
	}
});

$(".TE1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TE1").removeClass("highlight");
	}
	else{
		$(".TE1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TE1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TE1-tile").removeClass("highlight");
	}
});

$(".TF1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TF1").removeClass("highlight");
	}
	else{
		$(".TF1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TF1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TF1-tile").removeClass("highlight");
	}
});

$(".TG1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TG1").removeClass("highlight");
	}
	else{
		$(".TG1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TG1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TG1-tile").removeClass("highlight");
	}
});

$(".TA2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TA2").removeClass("highlight");
	}
	else{
		$(".TA2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TA2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TA2-tile").removeClass("highlight");
	}
});

$(".TB2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TB2").removeClass("highlight");
	}
	else{
		$(".TB2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TB2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TB2-tile").removeClass("highlight");
	}
});

$(".TC2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TC2").removeClass("highlight");
	}
	else{
		$(".TC2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TC2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TC2-tile").removeClass("highlight");
	}
});

$(".TD2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TD2").removeClass("highlight");
	}
	else{
		$(".TD2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TD2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TD2-tile").removeClass("highlight");
	}
});

$(".TE2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TE2").removeClass("highlight");
	}
	else{
		$(".TE2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TE2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TE2-tile").removeClass("highlight");
	}
});

$(".TF2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TF2").removeClass("highlight");
	}
	else{
		$(".TF2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TF2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TF2-tile").removeClass("highlight");
	}
});

$(".TG2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TG2").removeClass("highlight");
	}
	else{
		$(".TG2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TG2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TG2-tile").removeClass("highlight");
	}
});

$(".TAA1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TAA1").removeClass("highlight");
	}
	else{
		$(".TAA1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TAA1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TAA1-tile").removeClass("highlight");
	}
});

$(".TCC1-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TCC1").removeClass("highlight");
	}
	else{
		$(".TCC1").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TCC1").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TCC1-tile").removeClass("highlight");
	}
});

$(".TAA2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TAA2").removeClass("highlight");
	}
	else{
		$(".TAA2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TAA2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TAA2-tile").removeClass("highlight");
	}
});

$(".TBB2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TBB2").removeClass("highlight");
	}
	else{
		$(".TBB2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TBB2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TBB2-tile").removeClass("highlight");
	}
});

$(".TCC2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TCC2").removeClass("highlight");
	}
	else{
		$(".TCC2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TCC2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TCC2-tile").removeClass("highlight");
	}
});

$(".TDD2-tile").click(function(){
	if($(this).hasClass("highlight")){
		$(".TDD2").removeClass("highlight");
	}
	else{
		$(".TDD2").addClass("highlight");
	}
	$(this).toggleClass("highlight");
});
$(".TDD2").click(function(){
	if(!$(this).hasClass("highlight")){
		$(".TDD2-tile").removeClass("highlight");
	}
});

$("#toggleClickToSelect").click(function() {
	if($(this).attr("data-state") === "enabled") {
		$(this).text("Enable clicking on slots");
		$(this).attr("data-state", "disabled");
		$(".TimetableContent").off();		
	} else {
		$(this).text("Disable clicking on slots");
		$(this).attr("data-state", "enabled");
		$(".TimetableContent").on( "click", function() {
		  $(this).toggleClass("highlight");
		});

		$(".A1-tile").on( "click", function() {
			if($(this).hasClass("highlight")){
				$(".A1").removeClass("highlight");
			}
			else{
				$(".A1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".A1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".A1-tile").removeClass("highlight");
			}
		});

		$(".B1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".B1").removeClass("highlight");
			}
			else{
				$(".B1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".B1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".B1-tile").removeClass("highlight");
			}
		});

		$(".C1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".C1").removeClass("highlight");
			}
			else{
				$(".C1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".C1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".C1-tile").removeClass("highlight");
			}
		});

		$(".D1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".D1").removeClass("highlight");
			}
			else{
				$(".D1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".D1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".D1-tile").removeClass("highlight");
			}
		});

		$(".E1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".E1").removeClass("highlight");
			}
			else{
				$(".E1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".E1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".E1-tile").removeClass("highlight");
			}
		});

		$(".F1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".F1").removeClass("highlight");
			}
			else{
				$(".F1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".F1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".F1-tile").removeClass("highlight");
			}
		});

		$(".G1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".G1").removeClass("highlight");
			}
			else{
				$(".G1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".G1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".G1-tile").removeClass("highlight");
			}
		});

		$(".A2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".A2").removeClass("highlight");
			}
			else{
				$(".A2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".A2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".A2-tile").removeClass("highlight");
			}
		});

		$(".B2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".B2").removeClass("highlight");
			}
			else{
				$(".B2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".B2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".B2-tile").removeClass("highlight");
			}
		});

		$(".C2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".C2").removeClass("highlight");
			}
			else{
				$(".C2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".C2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".C2-tile").removeClass("highlight");
			}
		});

		$(".D2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".D2").removeClass("highlight");
			}
			else{
				$(".D2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".D2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".D2-tile").removeClass("highlight");
			}
		});

		$(".E2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".E2").removeClass("highlight");
			}
			else{
				$(".E2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".E2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".E2-tile").removeClass("highlight");
			}
		});

		$(".F2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".F2").removeClass("highlight");
			}
			else{
				$(".F2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".F2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".F2-tile").removeClass("highlight");
			}
		});

		$(".G2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".G2").removeClass("highlight");
			}
			else{
				$(".G2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".G2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".G2-tile").removeClass("highlight");
			}
		});

		$(".TA1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TA1").removeClass("highlight");
			}
			else{
				$(".TA1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TA1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TA1-tile").removeClass("highlight");
			}
		});

		$(".TB1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TB1").removeClass("highlight");
			}
			else{
				$(".TB1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TB1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TB1-tile").removeClass("highlight");
			}
		});

		$(".TC1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TC1").removeClass("highlight");
			}
			else{
				$(".TC1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TC1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TC1-tile").removeClass("highlight");
			}
		});

		$(".TD1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TD1").removeClass("highlight");
			}
			else{
				$(".TD1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TD1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TD1-tile").removeClass("highlight");
			}
		});

		$(".TE1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TE1").removeClass("highlight");
			}
			else{
				$(".TE1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TE1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TE1-tile").removeClass("highlight");
			}
		});

		$(".TF1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TF1").removeClass("highlight");
			}
			else{
				$(".TF1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TF1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TF1-tile").removeClass("highlight");
			}
		});

		$(".TG1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TG1").removeClass("highlight");
			}
			else{
				$(".TG1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TG1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TG1-tile").removeClass("highlight");
			}
		});

		$(".TA2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TA2").removeClass("highlight");
			}
			else{
				$(".TA2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TA2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TA2-tile").removeClass("highlight");
			}
		});

		$(".TB2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TB2").removeClass("highlight");
			}
			else{
				$(".TB2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TB2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TB2-tile").removeClass("highlight");
			}
		});

		$(".TC2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TC2").removeClass("highlight");
			}
			else{
				$(".TC2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TC2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TC2-tile").removeClass("highlight");
			}
		});

		$(".TD2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TD2").removeClass("highlight");
			}
			else{
				$(".TD2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TD2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TD2-tile").removeClass("highlight");
			}
		});

		$(".TE2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TE2").removeClass("highlight");
			}
			else{
				$(".TE2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TE2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TE2-tile").removeClass("highlight");
			}
		});

		$(".TF2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TF2").removeClass("highlight");
			}
			else{
				$(".TF2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TF2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TF2-tile").removeClass("highlight");
			}
		});

		$(".TG2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TG2").removeClass("highlight");
			}
			else{
				$(".TG2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TG2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TG2-tile").removeClass("highlight");
			}
		});

		$(".TAA1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TAA1").removeClass("highlight");
			}
			else{
				$(".TAA1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TAA1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TAA1-tile").removeClass("highlight");
			}
		});

		$(".TCC1-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TCC1").removeClass("highlight");
			}
			else{
				$(".TCC1").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TCC1").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TCC1-tile").removeClass("highlight");
			}
		});

		$(".TAA2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TAA2").removeClass("highlight");
			}
			else{
				$(".TAA2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TAA2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TAA2-tile").removeClass("highlight");
			}
		});

		$(".TBB2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TBB2").removeClass("highlight");
			}
			else{
				$(".TBB2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TBB2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TBB2-tile").removeClass("highlight");
			}
		});

		$(".TCC2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TCC2").removeClass("highlight");
			}
			else{
				$(".TCC2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TCC2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TCC2-tile").removeClass("highlight");
			}
		});

		$(".TDD2-tile").on("click",function(){
			if($(this).hasClass("highlight")){
				$(".TDD2").removeClass("highlight");
			}
			else{
				$(".TDD2").addClass("highlight");
			}
			$(this).toggleClass("highlight");
		});
		$(".TDD2").on("click",function(){
			if(!$(this).hasClass("highlight")){
				$(".TDD2-tile").removeClass("highlight");
			}
		});
	}
});