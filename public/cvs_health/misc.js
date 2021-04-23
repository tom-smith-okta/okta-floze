
function update_ui_panel(auth_state) {
	if (auth_state != "authenticated") {
		return
	}

	$("#ui_panel").show()
}

function sign_up() {
	$("#hta_button_div").hide()
	$("#hta_form").show()
}

function evaluate_prefs() {

	var id_token = localStorage.getItem('okta-token-storage')

	id_token = JSON.parse(id_token)

	var claims = id_token.id_token.claims

	var age = $("#age").val()

	var gender = $("#gender").val()

	var gender = $("input[name='gender']:checked").val()

	var weight = $("#weight").val()

	var hta_consent

	if ($("#hta_consent").is(":checked")) {
		hta_consent = true
	}
	else {
		hta_consent = false
	}

	var obj = {
		age: age,
		gender: gender,
		weight: weight,
		hta_consent: hta_consent,
		user_id: claims.sub,
		email: claims.email
	}

	// var url = "https://cvsciam20.workflows.oktapreview.com/api/flo/2ea225b63570346ed4406b0f0169fecb/invoke"

	var url = "https://cvsciam20.workflows.oktapreview.com/api/flo/30f13e23440e7b6b5152a194b6f864cc/invoke"

	$.post(url, obj)
	.done(function( data ) {

		var html = "thank you for signing up for the Health Tracking App!<br>&nbsp;"

		html = claims.given_name + ", " + html

		html += "<button>Click here to get started!</button>"

		html += "<br>&nbsp;"

		$("#ui_panel").html(html)
	});

	return
}
