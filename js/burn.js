const PRINTER_NAME = "Generic / Text Only"

function qzReady() {
	console.log("QZ Ready");
	updateDownloadButtonState();
	$('#qz_div').css('visibility', 'hidden');
}

function qzDonePrinting() {
	console.log("QZ Done Printing");
	setTimeout(changeBurnIconFire, 1000);
}

function ConfirmQZ() {
	var qz = document.getElementById('qz');
	if (qz) {
		try {
			console.log(qz.getVersion());
		}
		catch (e) {
			console.error(e);
			return false;
		}
		return true;
	}
	return false;
}

function BurnFile(id) {
	var type = '';
	var keymaps = [];
	var fn_actions = [];
	var leds = [];

	if (id == 'burn_eep') {
		type = 'eep';
		keymaps = tkg.getKeymapsHex();
		fn_actions = tkg.getFnActionsHex();
		leds = tkg.getLedsHex();
	}

	var post_data = {
		"matrix_rows": _keyboard["matrix_rows"],
		"matrix_cols": _keyboard["matrix_cols"],
		"matrix_size": _keyboard["matrix_size"],
		"max_layers": _keyboard["max_layers"],
		"max_fns": _keyboard["max_fns"],
		"eep_size": _keyboard["eep_size"],
		"eep_start": _keyboard["eep_start"],
		"keymaps": JSON.stringify(keymaps),
		"fn_actions": JSON.stringify(fn_actions)
	};

	var has_additional = false;
	if (id == 'burn_eep' && _keyboard['led_count']) {
		_keyboard["additional"][_keyboard["led_additional_index"]]["data"] = leds;
		has_additional = true;
	}
	if (has_additional) {
		post_data["additional"] = _keyboard["additional"];
	}

	$.post("download.php?file=" + type, post_data, function(data) {
		console.log(data);
		if ($('#qz').length) {
			var qz = $('#qz').get(0);
			qz.findPrinter(PRINTER_NAME);
			window['qzDoneFinding'] = function() {
				if (qz.getPrinter()) {
					changeBurnIconRefresh();
					qz.append(data);
					qz.print();
				}
				else {
					alert('"' + PRINTER_NAME + '" not found.');
				}
				window['qzDoneFinding'] = null;
			};
		}
	}).fail(function(d, textStatus, error) {
		console.error("post failed, status: " + textStatus + ", error: "+error)
	});
}

function changeBurnIconRefresh() {
	$('#burn_icon').removeAttr("class").addClass("glyphicon glyphicon-refresh spin");
}

function changeBurnIconFire() {
	$('#burn_icon').removeAttr("class").addClass("glyphicon glyphicon-fire");
}

function appendBurnButton() {
	if ($('#burn_eep').length == 0) {
		$('#dl_eep').parent().prepend(
			$('<button>').attr({
				"id": "burn_eep",
				"type": "button",
				"class": "dl-btn btn btn-default",
			}).append(
				$('<span>').attr({ "id": "burn_icon", "class": "glyphicon glyphicon-fire" }),
				" ",
				$('<span>').attr({ "lang": "en" }).text("Burn"),
				" .eep ",
				$('<span>').attr({ "lang": "en" }).text("file")
			)
		).append(
			$('<div>').attr({ "id": "qz_div" }).append(
				$('<applet>').attr({
					"id": "qz",
					"name": "QZ Print Plugin",
					"code": "qz.PrintApplet.class",
					"archive": "./qz-print.jar",
					"width": "14",
					"height": "16"
				}).append(
					$('<param>').attr({ "name": "jnlp_href", "value": "qz-print_jnlp.jnlp" }),
					$('<param>').attr({ "name": "printer", "value": PRINTER_NAME })
				)
			)
		).on('click', '#burn_eep', function() {
			BurnFile($(this).attr('id'));
		});
		$('#qz_div').offset($('#burn_icon').offset());
	}
}

function removeBurnButton() {
	if ($('#burn_eep').length) {
		$('#burn_eep').remove();
		$('#qz_div').remove();
	}
}

